(function () {
  "use strict";

  function abs(p) { return new URL(p, location.href).href; }
  var LIBS = { tesseract: "lib/tesseract.min.js", tf: "lib/tf.min.js", coco: "lib/coco-ssd.min.js" };

  var video = document.getElementById("video");
  var canvas = document.getElementById("canvas");
  var overlay = document.getElementById("overlay");
  var camOff = document.getElementById("cam-off");
  var busyEl = document.getElementById("busy");
  var resultEl = document.getElementById("result");
  var micBtn = document.getElementById("btn-mic");
  var navBtn = document.getElementById("btn-nav");
  var navBadge = document.getElementById("nav-badge");
  var stream = null, busy = false, ocrWorker = null, cocoModel = null;
  var last = { ids: null, text: resultEl.textContent };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (document.querySelector('script[src="' + src + '"]')) return res();
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function setBusy(on) {
    busy = on; busyEl.hidden = !on;
    document.querySelectorAll(".act[data-mode]").forEach(function (b) { b.disabled = on; });
  }
  function show(text) { resultEl.textContent = text; }

  /* =====================================================================
     OVOZ 1: oldindan yozib olingan ravon oʻzbekcha iboralar (Madina ovozi)
     ===================================================================== */
  var PHRASES = {};
  fetch("audio/phrases.json").then(function (r) { return r.json(); }).then(function (j) { PHRASES = j; }).catch(function () {});
  var clipCache = {};
  var queue = [], playing = null, onQueueEnd = null, speakingUntil = 0;

  function clip(id) {
    if (!clipCache[id]) { var a = new Audio("audio/" + id + ".mp3"); a.preload = "auto"; clipCache[id] = a; }
    return clipCache[id];
  }
  function textOf(ids) {
    return ids.map(function (id) { return PHRASES[id] || ""; }).join(" ").replace(/\s+/g, " ").replace(/ ([.,!?])/g, "$1").trim();
  }
  function stopAll() {
    queue = [];
    if (playing) { playing.pause(); playing.onended = playing.onerror = null; playing = null; }
    if (synth) synth.cancel();
    var cb = onQueueEnd; onQueueEnd = null; speakingUntil = 0;
    return cb;
  }
  function playNext() {
    if (!queue.length) {
      playing = null; speakingUntil = 0;
      var cb = onQueueEnd; onQueueEnd = null; if (cb) cb();
      return;
    }
    var id = queue.shift(), a = clip(id);
    playing = a;
    try { a.currentTime = 0; } catch (e) {}
    a.onended = playNext;
    a.onerror = function () { speakTTS(PHRASES[id] || "", playNext); };
    var p = a.play();
    if (p && p.catch) p.catch(function () { speakTTS(PHRASES[id] || "", playNext); });
  }
  // ids — iboralar roʻyxati; opts.text — ekranga chiqadigan matn; opts.onend — tugaganda
  function play(ids, opts) {
    opts = opts || {};
    stopAll();
    var text = opts.text || textOf(ids);
    show(text);
    if (!opts.noRepeat) last = { ids: ids.slice(), text: text };
    queue = ids.slice(); onQueueEnd = opts.onend || null;
    speakingUntil = Date.now() + 60000;
    playNext();
  }
  // oldindan yuklab qoʻyish
  ["d0","d1","d2","d3","d4","d5","s_center","s_left","s_right","a_stop","a_go_left","a_go_right","a_clear","a_careful","o_person","o_car","o_bicycle","o_chair"].forEach(clip);

  /* =====================================================================
     OVOZ 2: oʻqilgan matn uchun qurilma ovozi (oʻzbekcha boʻlmasa — turkcha
     ovoz bilan oʻzbekcha talaffuzga yaqinlashtirib oʻqiladi)
     ===================================================================== */
  var synth = window.speechSynthesis, voices = [];
  function loadVoices() { voices = synth ? synth.getVoices() : []; }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function findVoice(prefs) {
    for (var i = 0; i < prefs.length; i++)
      for (var j = 0; j < voices.length; j++)
        if ((voices[j].lang || "").toLowerCase().replace("_", "-").indexOf(prefs[i]) === 0) return voices[j];
    return null;
  }
  var CYR = { "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"j","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"x","ц":"ts","ч":"ch","ш":"sh","щ":"sh","ъ":"ʼ","ы":"i","ь":"","э":"e","ю":"yu","я":"ya","ў":"oʻ","қ":"q","ғ":"gʻ","ҳ":"h" };
  function cyrToLat(t) {
    return t.replace(/[А-яЁёЎўҚқҒғҲҳ]/g, function (ch) {
      var lo = ch.toLowerCase(), r = CYR[lo]; if (r === undefined) return ch;
      return ch === lo ? r : r.charAt(0).toUpperCase() + r.slice(1);
    });
  }
  // Oʻzbek lotin yozuvini turkcha ovoz toʻgʻri talaffuz qiladigan shaklga keltirish
  function uzForTurkish(t) {
    return cyrToLat(t)
      .replace(/([OoGg])[ʻ‘'`ʼ’]/g, "$1")
      .replace(/sh/g, "ş").replace(/Sh|SH/g, "Ş")
      .replace(/ch/g, "ç").replace(/Ch|CH/g, "Ç")
      .replace(/ng/g, "ng")
      .replace(/x/g, "h").replace(/X/g, "H")
      .replace(/q/g, "k").replace(/Q/g, "K")
      .replace(/j/g, "c").replace(/J/g, "C")
      .replace(/[ʻʼ‘’`']/g, "");
  }
  function speakTTS(text, onend) {
    if (!synth || !text) { if (onend) setTimeout(onend, 50); return; }
    var v = findVoice(["uz"]), t = text;
    if (!v) { var tr = findVoice(["tr"]); if (tr) { v = tr; t = uzForTurkish(text); } else v = findVoice(["kk", "az", "ru"]); }
    var u = new SpeechSynthesisUtterance(t.replace(/[ʻʼ‘’`]/g, "'"));
    u.lang = v ? v.lang : "uz-UZ"; if (v) u.voice = v;
    u.rate = 0.92;
    u.onend = u.onerror = function () { if (onend) onend(); };
    synth.speak(u);
  }
  function sayText(text) {
    stopAll(); show(text); last = { ids: null, text: text };
    speakingUntil = Date.now() + 60000;
    speakTTS(text, function () { speakingUntil = 0; });
  }
  function repeat() { if (last.ids) play(last.ids, { text: last.text }); else sayText(last.text); }

  /* ========================== Kamera ========================== */
  function startCamera() {
    if (stream) return Promise.resolve();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error("nocam"));
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false
    }).then(function (s) {
      stream = s; video.srcObject = s; camOff.classList.add("hidden");
      return video.play();
    }).then(function () {
      return new Promise(function (r) { if (video.videoWidth) r(); else video.onloadedmetadata = function () { r(); }; });
    }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); });
  }
  function grab(maxW) {
    var w = video.videoWidth, h = video.videoHeight, k = Math.min(1, (maxW || 1600) / w);
    canvas.width = Math.round(w * k); canvas.height = Math.round(h * k);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  function loadCoco() {
    if (cocoModel) return Promise.resolve(cocoModel);
    play(["load_obj"], { noRepeat: true });
    return loadScript(LIBS.tf).then(function () { return loadScript(LIBS.coco); }).then(function () {
      return cocoSsd.load({ base: "lite_mobilenet_v2", modelUrl: abs("lib/coco/model.json") });
    }).then(function (m) { cocoModel = m; return m; });
  }
  function objId(cls) { return "o_" + cls.replace(/ /g, "_"); }

  /* ===================== 1. Matnni oʻqish ===================== */
  function readText() {
    var p = ocrWorker ? Promise.resolve() : loadScript(LIBS.tesseract).then(function () {
      play(["load_ocr"], { noRepeat: true });
      return Tesseract.createWorker(["uzb", "uzb_cyrl"], 1, {
        workerPath: abs("lib/worker.min.js"), corePath: abs("lib/core"), langPath: abs("lib/lang"), gzip: true
      });
    }).then(function (w) { ocrWorker = w; });
    return p.then(function () {
      if (!playing) play(["reading"], { noRepeat: true });
      return ocrWorker.recognize(grab(1800));
    }).then(function (r) {
      var lines = (r.data.lines || [])
        .filter(function (l) { return l.confidence > 45 && /[A-Za-zА-яЁёЎўҚқҒғҲҳ]{2,}/.test(l.text); })
        .map(function (l) { return l.text.trim(); });
      var text = lines.join(" ").replace(/\s+/g, " ").trim();
      if (text.length < 3) return play(["no_text"]);
      vibrate(80);
      sayText(text);
    });
  }

  /* ===================== 2. Bu nima? ===================== */
  var NUM = { 2: "n2", 3: "n3", 4: "n4" };
  function sideOf(cx) { return cx < 0.36 ? "s_left" : cx > 0.64 ? "s_right" : "s_center"; }
  function describeObjects() {
    return loadCoco().then(function (m) { return m.detect(grab(640), 15, 0.5); }).then(function (preds) {
      if (!preds.length) return play(["no_obj"]);
      var W = canvas.width, groups = {}, order = [];
      preds.forEach(function (p) {
        var side = sideOf((p.bbox[0] + p.bbox[2] / 2) / W), key = p.class + "|" + side;
        if (!groups[key]) { groups[key] = { cls: p.class, side: side, n: 0, score: 0 }; order.push(key); }
        groups[key].n++; groups[key].score = Math.max(groups[key].score, p.score);
      });
      var list = order.map(function (k) { return groups[k]; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 4);
      var ids = [];
      list.forEach(function (g) {
        if (g.n > 1) ids.push(NUM[g.n] || "n5");
        ids.push(objId(g.cls), g.side);
      });
      vibrate(80);
      play(ids);
    });
  }

  /* ===================== 3. Rang ===================== */
  function colorIds(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min, h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    if (l < 0.12) return ["c_black"];
    if (s < 0.14) return l > 0.85 ? ["c_white"] : l > 0.6 ? ["c_light", "c_gray"] : l > 0.3 ? ["c_gray"] : ["c_dark", "c_gray"];
    var c;
    if (h < 12 || h >= 345) c = l > 0.7 ? "c_pink" : "c_red";
    else if (h < 40) c = l < 0.4 ? "c_brown" : "c_orange";
    else if (h < 68) c = l < 0.35 ? "c_olive" : "c_yellow";
    else if (h < 160) c = "c_green";
    else if (h < 195) c = "c_cyan";
    else if (h < 250) c = "c_blue";
    else if (h < 290) c = "c_purple";
    else c = "c_pink";
    var pre = l > 0.72 ? ["c_light"] : (l < 0.28 && c !== "c_brown" && c !== "c_olive") ? ["c_dark"] : [];
    return pre.concat([c]);
  }
  function detectColor() {
    var c = grab(400), ctx = c.getContext("2d");
    var sz = Math.round(Math.min(c.width, c.height) * 0.16);
    var d = ctx.getImageData((c.width - sz) >> 1, (c.height - sz) >> 1, sz, sz).data;
    var r = 0, g = 0, b = 0, n = d.length / 4;
    for (var i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    vibrate(60);
    play(["c_prefix"].concat(colorIds(r / n, g / n, b / n)));
    return Promise.resolve();
  }

  /* =====================================================================
     4. YOʻLDA YORDAM — yurib ketayotganda toʻsiqlarni aytish
     ===================================================================== */
  // Taxminiy haqiqiy balandlik (metr) — masofani hisoblash uchun
  var HEIGHT = { person: 1.65, bicycle: 1.0, car: 1.5, motorcycle: 1.1, bus: 3.0, truck: 3.0, train: 3.5,
    "traffic light": 0.9, "fire hydrant": 0.7, "stop sign": 0.75, "parking meter": 1.3, bench: 0.85,
    dog: 0.55, cat: 0.3, horse: 1.6, cow: 1.4, sheep: 0.8, chair: 0.9, couch: 0.85, bed: 0.6,
    "dining table": 0.75, "potted plant": 0.6, suitcase: 0.65, backpack: 0.5, umbrella: 0.9,
    toilet: 0.75, refrigerator: 1.7, tv: 0.6, sink: 0.85, oven: 0.85 };
  // Yoʻlda ahamiyatsiz kichik buyumlar
  var IGNORE = { fork: 1, knife: 1, spoon: 1, cup: 1, "wine glass": 1, "cell phone": 1, mouse: 1, remote: 1,
    toothbrush: 1, "hair drier": 1, scissors: 1, book: 1, banana: 1, apple: 1, orange: 1, sandwich: 1,
    broccoli: 1, carrot: 1, "hot dog": 1, pizza: 1, donut: 1, cake: 1, tie: 1, clock: 1, vase: 1, keyboard: 1, laptop: 1 };

  var nav = { on: false, timer: null, lastKey: "", lastAt: 0, lastObstacleAt: 0, saidClear: true, wake: null, frames: {} };

  function estimateMeters(p, W, H) {
    var hFrac = p.bbox[3] / H, wFrac = p.bbox[2] / W;
    var bottomCut = (p.bbox[1] + p.bbox[3]) > H * 0.97;            // pastki chetga tegib turibdi
    if (hFrac > 0.75 || wFrac > 0.7 || (bottomCut && hFrac > 0.55)) return 0.7;
    var realH = HEIGHT[p.class] || 0.8;
    var vfov = (H >= W ? 64 : 48) * Math.PI / 180;               // telefon kamerasining taxminiy koʻrish burchagi
    var f = (H / 2) / Math.tan(vfov / 2);
    return realH * f / Math.max(p.bbox[3], 1);
  }
  function distId(m) { return m < 1 ? "d0" : m < 1.6 ? "d1" : m < 2.6 ? "d2" : m < 3.6 ? "d3" : m < 4.8 ? "d4" : "d5"; }

  function drawBoxes(list, W, H) {
    var r = overlay.getBoundingClientRect();
    overlay.width = r.width; overlay.height = r.height;
    var ctx = overlay.getContext("2d"); ctx.clearRect(0, 0, r.width, r.height);
    // video object-fit: cover — koordinatalarni moslash
    var k = Math.max(r.width / W, r.height / H), ox = (r.width - W * k) / 2, oy = (r.height - H * k) / 2;
    list.forEach(function (o) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = o.m < 1.6 ? "#ff3b4e" : o.inPath ? "#ffe14d" : "#7dff9b";
      ctx.strokeRect(ox + o.p.bbox[0] * k, oy + o.p.bbox[1] * k, o.p.bbox[2] * k, o.p.bbox[3] * k);
    });
  }

  function navTick() {
    if (!nav.on) return;
    if (!cocoModel || video.readyState < 2) { nav.timer = setTimeout(navTick, 300); return; }
    var c = grab(480), W = c.width, H = c.height;
    cocoModel.detect(c, 20, 0.45).then(function (preds) {
      if (!nav.on) return;
      var now = Date.now();
      var objs = preds.filter(function (p) { return !IGNORE[p.class]; }).map(function (p) {
        var cx = (p.bbox[0] + p.bbox[2] / 2) / W;
        var x0 = p.bbox[0] / W, x1 = (p.bbox[0] + p.bbox[2]) / W;
        var inPath = x1 > 0.3 && x0 < 0.7;                            // yurish yoʻlagi — markaziy qism
        return { p: p, cx: cx, inPath: inPath, side: sideOf(cx), m: estimateMeters(p, W, H) };
      });
      drawBoxes(objs, W, H);

      // Barqarorlik: buyum ketma-ket 2 kadrda koʻrinsa hisobga olinadi
      var seen = {};
      objs.forEach(function (o) { var k = o.p.class + "|" + o.side; seen[k] = (nav.frames[k] || 0) + 1; });
      nav.frames = seen;
      var stable = objs.filter(function (o) { return seen[o.p.class + "|" + o.side] >= 2 || o.m < 1.2; });

      var path = stable.filter(function (o) { return o.inPath && o.m < 5; }).sort(function (a, b) { return a.m - b.m; });
      var main = path[0];

      // Tebranish: toʻsiq yaqinlashgan sari tezroq va kuchliroq
      if (main) {
        nav.lastObstacleAt = now;
        if (main.m < 1) vibrate([300, 80, 300]);
        else if (main.m < 1.6) vibrate(180);
        else if (main.m < 2.6 && (nav.tick = (nav.tick || 0) + 1) % 3 === 0) vibrate(70);
      }

      if (main) {
        var dId = distId(main.m);
        var key = main.p.class + "|" + main.side + "|" + dId;
        var urgent = dId === "d0" || dId === "d1";
        var repeatAfter = urgent ? 2500 : 6000;
        var changed = key !== nav.lastKey;
        var idle = Date.now() > speakingUntil;
        if ((changed && (idle || urgent)) || (idle && now - nav.lastAt > repeatAfter)) {
          var ids = [];
          if (dId === "d0") ids.push("a_stop");
          ids.push(objId(main.p.class), main.side, dId);
          if (urgent) {
            // qaysi tomon boʻshroq?
            var leftBusy = stable.some(function (o) { return o.cx < 0.45 && o.m < 2.6 && o !== main; });
            var rightBusy = stable.some(function (o) { return o.cx > 0.55 && o.m < 2.6 && o !== main; });
            if (main.cx >= 0.5 && !leftBusy) ids.push("a_go_left");
            else if (main.cx < 0.5 && !rightBusy) ids.push("a_go_right");
            else if (!leftBusy) ids.push("a_go_left");
            else if (!rightBusy) ids.push("a_go_right");
            else ids.push("a_careful");
          }
          nav.lastKey = key; nav.lastAt = now; nav.saidClear = false;
          play(ids, { noRepeat: false });
        }
      } else if (!nav.saidClear && now - nav.lastObstacleAt > 2500 && Date.now() > speakingUntil) {
        nav.saidClear = true; nav.lastKey = "";
        play(["a_clear"]);
      }
      nav.timer = setTimeout(navTick, 250);
    }).catch(function (e) { console.error(e); nav.timer = setTimeout(navTick, 800); });
  }

  function navStart() {
    if (busy) return;
    nav.on = true; nav.lastKey = ""; nav.lastAt = 0; nav.saidClear = true; nav.frames = {};
    navBtn.setAttribute("aria-pressed", "true");
    navBtn.querySelector(".nav-lbl").textContent = "Toʻxtatish";
    navBadge.hidden = false;
    document.querySelectorAll(".act[data-mode]").forEach(function (b) { b.disabled = true; });
    vibrate([100, 60, 100]);
    if (navigator.wakeLock) navigator.wakeLock.request("screen").then(function (w) { nav.wake = w; }).catch(function () {});
    var firstTime = !store("kz-nav-note");
    startCamera().then(loadCoco).then(function () {
      if (!nav.on) return;
      var ids = ["nav_on"]; if (firstTime) { ids.push("nav_note"); store("kz-nav-note", "1"); }
      play(ids, { onend: function () { speakingUntil = 0; } });
      navTick();
    }).catch(function (e) { navStop(true); handleError(e); });
  }
  function navStop(silent) {
    nav.on = false; clearTimeout(nav.timer);
    navBtn.setAttribute("aria-pressed", "false");
    navBtn.querySelector(".nav-lbl").textContent = "Yoʻlda yordam";
    navBadge.hidden = true;
    overlay.getContext("2d").clearRect(0, 0, overlay.width, overlay.height);
    document.querySelectorAll(".act[data-mode]").forEach(function (b) { b.disabled = false; });
    if (nav.wake) { nav.wake.release().catch(function () {}); nav.wake = null; }
    if (!silent) { vibrate(100); play(["nav_off"]); }
  }
  navBtn.addEventListener("click", function () { nav.on ? navStop() : navStart(); });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && nav.on && !nav.wake && navigator.wakeLock)
      navigator.wakeLock.request("screen").then(function (w) { nav.wake = w; }).catch(function () {});
  });

  /* ===================== Rejimlarni ishga tushirish ===================== */
  function handleError(e) {
    console.error(e);
    if (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) play(["cam_denied"]);
    else if (e && (e.message === "nocam" || e.name === "NotFoundError")) play(["no_cam"]);
    else if (e && /load /.test(e.message || "")) play(["load_fail"]);
    else play(["error"]);
  }
  var MODES = { read: readText, object: describeObjects, color: detectColor };
  function run(mode) {
    if (busy) return;
    if (nav.on) navStop(true);
    setBusy(true);
    startCamera().then(function () { return MODES[mode](); }).catch(handleError).then(function () { setBusy(false); });
  }
  document.querySelectorAll(".act[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () { run(b.getAttribute("data-mode")); });
  });
  document.getElementById("btn-repeat").addEventListener("click", repeat);

  /* ===================== Ovozli buyruqlar ===================== */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
  function handleCommand(t) {
    t = t.toLowerCase().replace(/[ʻʼ‘’`']/g, "");
    if (/(yol|йўл|йул|yur|юр|toxta|тўхта|navig)/.test(t)) return nav.on ? navStop() : navStart();
    if (/(oqi|ўқи|уқи|matn|матн)/.test(t)) return run("read");
    if (/(rang|ранг)/.test(t)) return run("color");
    if (/(nima|нима|kim|ким|oldim|олдим)/.test(t)) return run("object");
    if (/(takror|такрор|qayta|қайта)/.test(t)) return repeat();
    if (/(yordam|ёрдам)/.test(t)) return play(["help"]);
    play(["not_understood"]);
  }
  micBtn.addEventListener("click", function () {
    if (!SR) return play(["no_sr"]);
    if (rec) { rec.stop(); return; }
    stopAll();
    rec = new SR();
    rec.lang = "uz-UZ"; rec.interimResults = false; rec.maxAlternatives = 3;
    rec.onstart = function () { micBtn.setAttribute("aria-pressed", "true"); vibrate(40); show("Gapiring…"); };
    rec.onresult = function (e) {
      var alts = e.results[0], all = [];
      for (var i = 0; i < alts.length; i++) all.push(alts[i].transcript);
      handleCommand(all.join(" "));
    };
    rec.onerror = function (e) {
      if (e.error === "not-allowed") play(["mic_denied"]);
      else if (e.error === "no-speech") play(["no_speech"]);
    };
    rec.onend = function () { micBtn.setAttribute("aria-pressed", "false"); rec = null; };
    rec.start();
  });

  /* ===================== Yordam va boshlash ===================== */
  var helpDlg = document.getElementById("help");
  document.getElementById("btn-help").addEventListener("click", function () {
    if (helpDlg.showModal) helpDlg.showModal();
    play(["help"]);
  });
  helpDlg.addEventListener("close", function () { stopAll(); });

  // Birinchi ochilishda: butun ekran — bitta katta tugma, bosilganda tanishtiruv eshittiriladi
  var startBtn = document.getElementById("start");
  if (!store("kz-welcomed")) {
    startBtn.hidden = false;
    startBtn.focus();
    startBtn.addEventListener("click", function () {
      startBtn.hidden = true; store("kz-welcomed", "1");
      play(["welcome"]);
    });
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  // Sinov uchun
  window.__kz = { uzForTurkish: uzForTurkish, colorIds: colorIds, estimateMeters: estimateMeters, nav: nav };
})();
