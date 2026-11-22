/* KoʻzMadad AI — zinapoya, chuqur (pastlik) va devorni aniqlash.
   MiDaS small modeli har bir nuqtaning nisbiy yaqinligini (disparity) beradi.
   Oldingizdagi "yoʻlak" (kadr markazi) boʻylab pastdan yuqoriga:
   - tekis polda yaqinlik bir maromda kamayadi;
   - pastlik (chuqur, pastga zinapoya) chetida yaqinlik KESKIN sakraydi;
   - tik sirt (yuqoriga zinapoya, devor) qatorlar boʻylab deyarli oʻzgarmaydi;
     unda takrorlanuvchi gorizontal chiziqlar boʻlsa — zinapoya. */
(function () {
  "use strict";
  var S = 256, C0 = Math.round(S * 0.3), C1 = Math.round(S * 0.7);
  var MEAN = [0.485, 0.456, 0.406], STD = [0.229, 0.224, 0.225];
  var session = null, loading = null, cv = null, ctx = null;
  var CAM_H = 1.3, VFOV = 62;   // telefon balandligi (m) va kameraning vertikal koʻrish burchagi

  function abs(p) { return new URL(p, location.href).href; }

  function load() {
    if (session) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (res, rej) {
      if (window.ort) return res();
      var s = document.createElement("script");
      s.src = "lib/ort/ort.wasm.min.js"; s.onload = res;
      s.onerror = function () { rej(new Error("load ort")); };
      document.head.appendChild(s);
    }).then(function () {
      ort.env.wasm.wasmPaths = abs("lib/ort/");
      ort.env.wasm.numThreads = window.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 2) : 1;
      return ort.InferenceSession.create(abs("lib/depth/midas-small-u8.onnx"), {
        executionProviders: ["wasm"], graphOptimizationLevel: "all"
      });
    }).then(function (s) { session = s; })
      .catch(function (e) { loading = null; throw e; });
    return loading;
  }

  function median(arr) {
    var a = Array.prototype.slice.call(arr).sort(function (x, y) { return x - y; });
    var m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  // qator (0..S) → taxminiy masofa (metr), kamera qiyaligini hisobga olib
  function rowToMeters(row, pitch) {
    var a = pitch + Math.atan((row / S - 0.5) * 2 * Math.tan(VFOV / 2 * Math.PI / 180)) * 180 / Math.PI;
    return CAM_H / Math.tan(Math.max(a, 3) * Math.PI / 180);
  }

  // disp — S*S yaqinlik xaritasi, gray — S*S kulrang tasvir
  function analyze(disp, gray, pitch) {
    var y, x, p = new Float32Array(S), row = new Float32Array(C1 - C0), pmax = 0;
    for (y = 0; y < S; y++) {
      for (x = C0; x < C1; x++) row[x - C0] = disp[y * S + x];
      p[y] = median(row); if (p[y] > pmax) pmax = p[y];
    }
    // qatorlar boʻyicha oʻzgarish (gradient), 5 qatorli silliqlash
    var n = S - 1, dif = new Float32Array(n), g = new Float32Array(n);
    for (y = 0; y < n; y++) dif[y] = p[y + 1] - p[y];
    for (y = 0; y < n; y++) {
      var s = 0, c = 0;
      for (var k = -2; k <= 2; k++) { var j = y + k; if (j >= 0 && j < n) { s += dif[j]; c++; } }
      g[y] = s / 5;
    }
    var ref = median(g.subarray(Math.round(S * 0.78), Math.round(S * 0.97)));
    if (!(ref > 0)) return { type: "unknown" };
    var r = new Float32Array(n);
    for (y = 0; y < n; y++) r[y] = g[y] / ref;

    // 1) Pastlik: keskin sakrash (r > 2.5), tepasida osmon emas, pol boʻlishi kerak
    for (y = 8; y < Math.round(S * 0.8); y++) {
      if (r[y] <= 2.5) continue;
      var isMax = true;
      for (k = -3; k <= 3; k++) if (y + k >= 0 && y + k < n && r[y + k] > r[y]) isMax = false;
      if (!isMax) continue;
      var a0 = Math.max(0, y - 14), a1 = y - 3, am = 0, ac = 0;
      for (k = a0; k < a1; k++) { am += r[k]; ac++; }
      if (!ac || am / ac <= 0.15) continue;
      var e = y + 3;
      while (e < S - 6) {
        var ok = true;
        for (k = 0; k < 5; k++) if (r[e + k] <= 0.7) { ok = false; break; }
        if (ok) break; e++;
      }
      return { type: "drop", row: e, meters: rowToMeters(e, pitch), r: r };
    }

    // 2) Tik sirt: uzoq qatorlar davomida r < 0.15 va osmon emas (yaqinlik katta)
    var start = -1, minRun = Math.round(S * 0.08);
    for (y = 0; y < Math.round(S * 0.85); y++) {
      if (r[y] < 0.15) { if (start < 0) start = y; continue; }
      if (start >= 0 && y - start >= minRun) {
        var pm = 0; for (k = start; k < y; k++) pm += p[k]; pm /= (y - start);
        if (pm > pmax * 0.06) {
          // gorizontal chiziqlar soni (zinapoya pogʻonalari)
          var ey = [], sum = 0, sq = 0;
          for (k = start; k < y - 1; k++) {
            var t = 0;
            for (x = C0; x < C1; x++) t += Math.abs(gray[(k + 1) * S + x] - gray[k * S + x]);
            t /= (C1 - C0); ey.push(t); sum += t; sq += t * t;
          }
          var mean = sum / ey.length, sd = Math.sqrt(Math.max(0, sq / ey.length - mean * mean)), thr = mean + sd;
          var peaks = [];
          for (k = 1; k < ey.length - 1; k++)
            if (ey[k] > thr && ey[k] >= ey[k - 1] && ey[k] >= ey[k + 1] && (!peaks.length || k - peaks[peaks.length - 1] > 3)) peaks.push(k);
          return { type: peaks.length >= 3 ? "stairs_up" : "wall", row: y, meters: rowToMeters(y, pitch), steps: peaks.length, r: r };
        }
      }
      start = -1;
    }
    return { type: "clear", r: r };
  }

  // source — video yoki canvas
  function run(source, pitch) {
    if (!session) return Promise.reject(new Error("depth not loaded"));
    if (!cv) { cv = document.createElement("canvas"); cv.width = cv.height = S; ctx = cv.getContext("2d", { willReadFrequently: true }); }
    ctx.drawImage(source, 0, 0, S, S);
    var px = ctx.getImageData(0, 0, S, S).data, N = S * S;
    var input = new Float32Array(3 * N), gray = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var R = px[i * 4] / 255, G = px[i * 4 + 1] / 255, B = px[i * 4 + 2] / 255;
      input[i] = (R - MEAN[0]) / STD[0];
      input[N + i] = (G - MEAN[1]) / STD[1];
      input[2 * N + i] = (B - MEAN[2]) / STD[2];
      gray[i] = (0.299 * R + 0.587 * G + 0.114 * B) * 255;
    }
    var feeds = {}; feeds[session.inputNames[0]] = new ort.Tensor("float32", input, [1, 3, S, S]);
    return session.run(feeds).then(function (out) {
      var disp = out[session.outputNames[0]].data;
      return analyze(disp, gray, pitch == null ? 30 : pitch);
    });
  }

  window.KZDepth = { load: load, run: run, analyze: analyze, rowToMeters: rowToMeters };
})();
