(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var srStatus = document.getElementById("sr-status");
  function announce(msg) { srStatus.textContent = ""; setTimeout(function () { srStatus.textContent = msg; }, 50); }

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ---------- Mobil menyu ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navList = document.getElementById("nav-list");
  navToggle.addEventListener("click", function () {
    var open = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open);
  });
  navList.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { navList.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); }
  });

  /* ---------- Shrift oʻlchami ---------- */
  var fs = parseInt(store("kz-fs"), 10) || 100;
  function applyFs() { root.style.setProperty("--fs", fs + "%"); store("kz-fs", fs); }
  applyFs();
  document.getElementById("font-up").addEventListener("click", function () {
    fs = Math.min(fs + 10, 160); applyFs(); announce("Matn kattalashtirildi: " + fs + " foiz");
  });
  document.getElementById("font-down").addEventListener("click", function () {
    fs = Math.max(fs - 10, 80); applyFs(); announce("Matn kichraytirildi: " + fs + " foiz");
  });

  /* ---------- Kontrast va mavzu ---------- */
  var contrastBtn = document.getElementById("contrast");
  function setContrast(on) {
    root.classList.toggle("hc", on);
    contrastBtn.setAttribute("aria-pressed", on);
    store("kz-hc", on ? "1" : "0");
  }
  setContrast(store("kz-hc") === "1");
  contrastBtn.addEventListener("click", function () {
    var on = !root.classList.contains("hc");
    setContrast(on); announce(on ? "Yuqori kontrast yoqildi" : "Yuqori kontrast oʻchirildi");
  });

  var themeBtn = document.getElementById("theme");
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : mq.matches; }
  function syncTheme() { themeBtn.setAttribute("aria-pressed", isDark()); }
  var savedTheme = store("kz-theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  syncTheme();
  mq.addEventListener && mq.addEventListener("change", syncTheme);
  themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next); store("kz-theme", next); syncTheme();
    announce(next === "dark" ? "Qorongʻi rejim yoqildi" : "Yorugʻ rejim yoqildi");
  });

  /* ---------- Nutq sintezi ---------- */
  var synth = window.speechSynthesis;
  var voice = null;
  function pickVoice() {
    if (!synth) return;
    var vs = synth.getVoices();
    var prefs = ["uz", "tr", "kk", "ru"];
    for (var i = 0; i < prefs.length && !voice; i++) {
      for (var j = 0; j < vs.length; j++) {
        if (vs[j].lang && vs[j].lang.toLowerCase().indexOf(prefs[i]) === 0) { voice = vs[j]; break; }
      }
    }
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

  function speak(text, onEnd) {
    if (!synth) { if (onEnd) onEnd(); return; }
    var u = new SpeechSynthesisUtterance(text.replace(/[ʻʼ‘’]/g, "'"));
    u.lang = voice ? voice.lang : "uz-UZ";
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = u.onerror = function () { if (onEnd) onEnd(); };
    synth.speak(u);
  }

  /* ---------- Sahifani ovoz bilan oʻqish ---------- */
  var readBtn = document.getElementById("read-page");
  var readLbl = readBtn.querySelector(".lbl");
  var reading = false, queue = [], current = null;

  function sectionText(el) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll("[aria-hidden='true'], .sr-only + .legend, script").forEach(function (n) { n.remove(); });
    return clone.textContent.replace(/\s+/g, " ").trim();
  }
  function stopReading() {
    reading = false; queue = [];
    if (synth) synth.cancel();
    if (current) current.classList.remove("reading");
    current = null;
    readBtn.setAttribute("aria-pressed", "false");
    readLbl.textContent = "Sahifani ovoz bilan oʻqish";
  }
  function next() {
    if (current) current.classList.remove("reading");
    if (!reading || !queue.length) { stopReading(); return; }
    current = queue.shift();
    current.classList.add("reading");
    current.scrollIntoView({ behavior: "smooth", block: "start" });
    speak(sectionText(current), next);
  }
  function startReading() {
    if (!synth) { announce("Brauzeringiz ovozli oʻqishni qoʻllab-quvvatlamaydi"); alert("Brauzeringiz ovozli oʻqishni qoʻllab-quvvatlamaydi."); return; }
    synth.cancel();
    reading = true;
    queue = Array.prototype.slice.call(document.querySelectorAll("[data-read]"));
    readBtn.setAttribute("aria-pressed", "true");
    readLbl.textContent = "Oʻqishni toʻxtatish";
    next();
  }
  readBtn.addEventListener("click", function () { reading ? stopReading() : startReading(); });
  document.addEventListener("keydown", function (e) {
    if (e.altKey && (e.key === "r" || e.key === "R")) { e.preventDefault(); reading ? stopReading() : startReading(); }
    if (e.key === "Escape" && reading) stopReading();
  });

  /* ---------- Prototip namoyishi ---------- */
  var chat = document.getElementById("chat");
  var demos = {
    pul:  { q: "🎙 “Bu qancha pul?”", a: [["ai", "🔊 <strong>Yuz ming soʻm</strong>, bitta banknota. Yana bittasi — <strong>besh ming soʻm</strong>. Jami: bir yuz besh ming soʻm."]] },
    oqi:  { q: "🎙 “Oʻqib ber”", a: [["ai", "🔊 Sut, 1 litr. Yogʻliligi 3,2 foiz. Yaroqlilik muddati: 28-noyabrgacha."]] },
    yol:  { q: "🎙 “Oldimda nima bor?”", a: [["ai", "🔊 Oldingizda ochiq eshik, oʻng tomonda stul."], ["warn", "📳 Diqqat: 1 metr oldinda zinapoya, 5 ta pogʻona pastga"]] },
    rang: { q: "🎙 “Bu qanday rang?”", a: [["ai", "🔊 Toʻq koʻk rang. Ustida oq chiziqlar bor."]] }
  };
  var busy = false;
  function add(cls, html) {
    var d = document.createElement("div");
    d.className = "msg " + cls; d.innerHTML = html;
    chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
    return d;
  }
  function plain(html) { var t = document.createElement("div"); t.innerHTML = html; return t.textContent.replace(/^[^\wА-яЁёA-Za-zʻʼ]+/, "").trim(); }

  document.querySelectorAll("[data-demo]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (busy) return;
      var d = demos[btn.getAttribute("data-demo")];
      if (!d) return;
      busy = true;
      if (reading) stopReading();
      add("me", d.q);
      var typing = add("typing", "•••");
      typing.setAttribute("aria-hidden", "true");
      setTimeout(function () {
        typing.remove();
        var i = 0;
        (function step() {
          if (i >= d.a.length) { busy = false; return; }
          var m = d.a[i++];
          add(m[0], m[1]);
          if (m[0] === "warn" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
          speak(plain(m[1]), step);
          if (!synth) setTimeout(step, 600);
        })();
      }, 900);
    });
  });

  /* ---------- Paydo boʻlish va hisoblagichlar ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce) return;
    var t0 = null, dur = 1400;
    function f(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + "ms";
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }
})();
