(function () {
  "use strict";

  function abs(p) { return new URL(p, location.href).href; }
  var LIBS = {
    tesseract: "lib/tesseract.min.js",
    tf: "lib/tf.min.js",
    coco: "lib/coco-ssd.min.js"
  };

  var video = document.getElementById("video");
  var canvas = document.getElementById("canvas");
  var camOff = document.getElementById("cam-off");
  var busyEl = document.getElementById("busy");
  var resultEl = document.getElementById("result");
  var micBtn = document.getElementById("btn-mic");
  var lastText = resultEl.textContent;
  var stream = null, busy = false, ocrWorker = null, cocoModel = null;

  /* ---------- Yordamchi funksiyalar ---------- */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (document.querySelector('script[src="' + src + '"]')) return res();
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function vibrate(p) { if (navigator.vibrate) navigator.vibrate(p); }
  function setBusy(on) { busy = on; busyEl.hidden = !on; document.querySelectorAll(".act[data-mode]").forEach(function (b) { b.disabled = on; }); }

  /* ---------- Ovoz (nutq sintezi) ---------- */
  var synth = window.speechSynthesis, voices = [];
  function loadVoices() { voices = synth ? synth.getVoices() : []; }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function findVoice(prefs) {
    for (var i = 0; i < prefs.length; i++)
      for (var j = 0; j < voices.length; j++)
        if ((voices[j].lang || "").toLowerCase().indexOf(prefs[i]) === 0) return voices[j];
    return null;
  }
  function say(text, opts) {
    opts = opts || {};
    lastText = text;
    resultEl.textContent = text;
    if (!synth) return;
    synth.cancel();
    var cyr = (text.match(/[А-яЁёЎўҚқҒғҲҳ]/g) || []).length > text.length / 3;
    var v = cyr ? findVoice(["uz", "ru"]) : findVoice(["uz", "tr", "kk", "az", "ru"]);
    var u = new SpeechSynthesisUtterance(text.replace(/[ʻʼ‘’`]/g, "'"));
    u.lang = v ? v.lang : "uz-UZ";
    if (v) u.voice = v;
    u.rate = opts.rate || 0.95;
    if (opts.onend) u.onend = opts.onend;
    synth.speak(u);
  }

  /* ---------- Kamera ---------- */
  function startCamera() {
    if (stream) return Promise.resolve();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
      return Promise.reject(new Error("nocam"));
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false
    }).then(function (s) {
      stream = s; video.srcObject = s;
      camOff.classList.add("hidden");
      return video.play();
    }).then(function () {
      return new Promise(function (r) { if (video.videoWidth) r(); else video.onloadedmetadata = function () { r(); }; });
    });
  }
  function grab(maxW) {
    var w = video.videoWidth, h = video.videoHeight, k = Math.min(1, (maxW || 1600) / w);
    canvas.width = Math.round(w * k); canvas.height = Math.round(h * k);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  /* ---------- 1. Matnni oʻqish (OCR) ---------- */
  function readText() {
    var p = ocrWorker ? Promise.resolve() : loadScript(LIBS.tesseract).then(function () {
      say("Matn oʻqish modeli yuklanmoqda. Biroz kuting.");
      return Tesseract.createWorker(["uzb", "uzb_cyrl"], 1, {
        workerPath: abs("lib/worker.min.js"),
        corePath: abs("lib/core"),
        langPath: abs("lib/lang"),
        gzip: true
      });
    }).then(function (w) { if (w) ocrWorker = w; });
    return p.then(function () {
      return ocrWorker.recognize(grab(1800));
    }).then(function (r) {
      var lines = (r.data.lines || [])
        .filter(function (l) { return l.confidence > 45 && /[A-Za-zА-яЁёЎўҚқҒғҲҳ]{2,}/.test(l.text); })
        .map(function (l) { return l.text.trim(); });
      var text = lines.join(" ").replace(/\s+/g, " ").trim();
      if (text.length < 3) return say("Matn topilmadi yoki aniq emas. Telefonni yaqinroq va toʻgʻri tuting, qayta urinib koʻring.");
      vibrate(80);
      say(text, { rate: 0.9 });
    });
  }

  /* ---------- 2. Buyumni tanish ---------- */
  var UZ = {
    person: "odam", bicycle: "velosiped", car: "mashina", motorcycle: "mototsikl", airplane: "samolyot",
    bus: "avtobus", train: "poyezd", truck: "yuk mashinasi", boat: "qayiq", "traffic light": "svetofor",
    "fire hydrant": "yongʻin gidranti", "stop sign": "toʻxtash belgisi", "parking meter": "parkovka hisoblagichi",
    bench: "skameyka", bird: "qush", cat: "mushuk", dog: "it", horse: "ot", sheep: "qoʻy", cow: "sigir",
    elephant: "fil", bear: "ayiq", zebra: "zebra", giraffe: "jirafa", backpack: "ryukzak", umbrella: "soyabon",
    handbag: "sumka", tie: "galstuk", suitcase: "chamadon", frisbee: "frisbi", skis: "chang‘i", snowboard: "snoubord",
    "sports ball": "toʻp", kite: "varrak", "baseball bat": "beysbol tayogʻi", "baseball glove": "beysbol qoʻlqopi",
    skateboard: "skeytbord", surfboard: "serf taxtasi", "tennis racket": "tennis raketkasi", bottle: "shisha idish",
    "wine glass": "qadah", cup: "piyola", fork: "sanchqi", knife: "pichoq", spoon: "qoshiq", bowl: "kosa",
    banana: "banan", apple: "olma", sandwich: "buterbrod", orange: "apelsin", broccoli: "brokkoli", carrot: "sabzi",
    "hot dog": "hot-dog", pizza: "pitsa", donut: "pishiriq", cake: "tort", chair: "stul", couch: "divan",
    "potted plant": "tuvakdagi gul", bed: "karavot", "dining table": "stol", toilet: "hojatxona", tv: "televizor",
    laptop: "noutbuk", mouse: "sichqoncha", remote: "pult", keyboard: "klaviatura", "cell phone": "telefon",
    microwave: "mikrotoʻlqinli pech", oven: "pech", toaster: "toster", sink: "rakovina", refrigerator: "muzlatgich",
    book: "kitob", clock: "soat", vase: "guldon", scissors: "qaychi", "teddy bear": "oʻyinchoq ayiq",
    "hair drier": "fen", toothbrush: "tish choʻtkasi"
  };
  var NUM = ["", "bitta", "ikkita", "uchta", "toʻrtta", "beshta", "oltita", "yettita", "sakkizta", "toʻqqizta"];

  function describeObjects() {
    var p = cocoModel ? Promise.resolve() : loadScript(LIBS.tf).then(function () {
      return loadScript(LIBS.coco);
    }).then(function () {
      say("Buyumlarni tanish modeli yuklanmoqda. Biroz kuting.");
      return cocoSsd.load({ base: "lite_mobilenet_v2", modelUrl: abs("lib/coco/model.json") });
    }).then(function (m) { cocoModel = m; });
    return p.then(function () {
      return cocoModel.detect(grab(640), 12, 0.5);
    }).then(function (preds) {
      if (!preds.length) return say("Hech narsa aniq tanilmadi. Telefonni sekin aylantirib, qayta urinib koʻring.");
      var W = canvas.width, H = canvas.height, groups = {};
      preds.forEach(function (p) {
        var cx = (p.bbox[0] + p.bbox[2] / 2) / W;
        var side = cx < 0.36 ? "chap tomonda" : cx > 0.64 ? "oʻng tomonda" : "roʻparangizda";
        var near = (p.bbox[2] * p.bbox[3]) / (W * H) > 0.35;
        var key = (UZ[p.class] || p.class) + "|" + side;
        if (!groups[key]) groups[key] = { name: UZ[p.class] || p.class, side: side, n: 0, near: false, score: 0 };
        groups[key].n++; groups[key].near = groups[key].near || near;
        groups[key].score = Math.max(groups[key].score, p.score);
      });
      var list = Object.keys(groups).map(function (k) { return groups[k]; })
        .sort(function (a, b) { return b.score - a.score; }).slice(0, 4);
      var parts = list.map(function (g) {
        var cnt = g.n > 1 ? (NUM[g.n] || g.n + " ta") + " " : "";
        return cnt + g.name + " " + g.side + (g.near ? ", juda yaqin" : "");
      });
      var text = parts.join(". ") + ".";
      text = text.charAt(0).toUpperCase() + text.slice(1);
      if (list.some(function (g) { return g.near; })) vibrate([200, 100, 200]); else vibrate(80);
      say(text);
    });
  }

  /* ---------- 3. Rangni aniqlash ---------- */
  function colorName(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min, h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    if (l < 0.12) return "qora";
    if (s < 0.14) return l > 0.85 ? "oq" : l > 0.6 ? "och kulrang" : l > 0.3 ? "kulrang" : "toʻq kulrang";
    var name;
    if (h < 12 || h >= 345) name = "qizil";
    else if (h < 40) name = l < 0.4 ? "jigarrang" : "toʻq sariq";
    else if (h < 68) name = l < 0.35 ? "zaytun rang" : "sariq";
    else if (h < 160) name = "yashil";
    else if (h < 195) name = "moviy";
    else if (h < 250) name = "koʻk";
    else if (h < 290) name = "binafsha";
    else name = "pushti";
    if (name === "qizil" && l > 0.7) name = "pushti";
    var prefix = l > 0.72 ? "och " : l < 0.28 ? "toʻq " : "";
    return prefix + name;
  }
  function detectColor() {
    var c = grab(400), ctx = c.getContext("2d");
    var sz = Math.round(Math.min(c.width, c.height) * 0.16);
    var d = ctx.getImageData((c.width - sz) >> 1, (c.height - sz) >> 1, sz, sz).data;
    var r = 0, g = 0, b = 0, n = d.length / 4;
    for (var i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    vibrate(60);
    say("Rangi: " + colorName(r / n, g / n, b / n) + ".");
    return Promise.resolve();
  }

  /* ---------- Rejimlarni ishga tushirish ---------- */
  var MODES = { read: readText, object: describeObjects, color: detectColor };
  function run(mode) {
    if (busy) return;
    setBusy(true);
    startCamera()
      .then(function () { return new Promise(function (r) { setTimeout(r, stream && video.currentTime > 0.5 ? 0 : 600); }); })
      .then(function () { return MODES[mode](); })
      .catch(function (e) {
        console.error(e);
        if (e && (e.name === "NotAllowedError" || e.name === "SecurityError"))
          say("Kameraga ruxsat berilmadi. Brauzer sozlamalarida kameraga ruxsat bering.");
        else if (e && e.message === "nocam")
          say("Bu qurilmada kamera topilmadi.");
        else if (e && /load /.test(e.message))
          say("Modelni yuklab boʻlmadi. Birinchi marta ishlatish uchun internet kerak.");
        else say("Xatolik yuz berdi. Qayta urinib koʻring.");
      })
      .then(function () { setBusy(false); });
  }
  document.querySelectorAll(".act[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () { run(b.getAttribute("data-mode")); });
  });
  document.getElementById("btn-repeat").addEventListener("click", function () { say(lastText); });

  /* ---------- Ovozli buyruqlar ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
  function handleCommand(t) {
    t = t.toLowerCase().replace(/[ʻʼ‘’`']/g, "");
    if (/(oqi|ўқи|уқи|matn|матн|read)/.test(t)) return run("read");
    if (/(rang|ранг|color)/.test(t)) return run("color");
    if (/(nima|нима|kim|ким|oldim|олдим|what)/.test(t)) return run("object");
    if (/(takror|такрор|qayta|қайта|repeat)/.test(t)) return say(lastText);
    if (/(yordam|ёрдам|help)/.test(t)) return say(helpText);
    say("Tushunmadim. “Oʻqi”, “Bu nima”, “Rang” yoki “Takrorla” deng.");
  }
  micBtn.addEventListener("click", function () {
    if (!SR) return say("Bu brauzer ovozli buyruqni qoʻllab-quvvatlamaydi. Pastdagi tugmalardan foydalaning.");
    if (rec) { rec.stop(); return; }
    if (synth) synth.cancel();
    rec = new SR();
    rec.lang = "uz-UZ"; rec.interimResults = false; rec.maxAlternatives = 3;
    rec.onstart = function () { micBtn.setAttribute("aria-pressed", "true"); vibrate(40); };
    rec.onresult = function (e) {
      var alts = e.results[0], all = [];
      for (var i = 0; i < alts.length; i++) all.push(alts[i].transcript);
      handleCommand(all.join(" "));
    };
    rec.onerror = function (e) {
      if (e.error === "not-allowed") say("Mikrofonga ruxsat berilmadi.");
      else if (e.error === "no-speech") say("Ovoz eshitilmadi. Qayta bosib gapiring.");
    };
    rec.onend = function () { micBtn.setAttribute("aria-pressed", "false"); rec = null; };
    rec.start();
  });

  /* ---------- Yordam oynasi ---------- */
  var helpDlg = document.getElementById("help");
  var helpText = "Matnni oʻqish uchun chap yuqoridagi tugmani, buyumlarni bilish uchun oʻng yuqoridagi tugmani, rang uchun chap pastdagi tugmani bosing. Oʻng pastdagi tugma — ovozli buyruq: oʻqi, bu nima, rang yoki takrorla deng.";
  document.getElementById("btn-help").addEventListener("click", function () {
    if (helpDlg.showModal) helpDlg.showModal();
    say(helpText);
  });

  /* ---------- Oflayn ishlash (service worker) ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
