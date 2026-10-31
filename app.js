import { LANGS, COUNTRIES, FLAGS, CATEGORIES, PROVERBS, SAMPLES, COUNTRY_LANG, T } from "./i18n.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = { lang: "uz", user: null, posts: [], cat: "all", country: "all", q: "", proverb: 0 };
let store; // ma'lumotlar qatlami: Firebase yoki namuna rejimi

/* ---------- Kichik yordamchilar ---------- */
const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const t = (k) => T[state.lang][k] ?? T.uz[k];

function toast(msg) {
  const el = $("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 3200);
}

function countUp(el, n) {
  const from = +el.textContent || 0;
  if (reduced || from === n) { el.textContent = n; return; }
  const t0 = performance.now(), dur = 900;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(from + (n - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Ko'rinish paydo bo'lishi (scroll animatsiya) ---------- */
const revealIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
}), { threshold: 0.12 });
const observeReveals = (root = document) => root.querySelectorAll(".reveal:not(.in)").forEach((el) => revealIO.observe(el));

/* ---------- Avtomatik tarjima (foydalanuvchi maqolalari uchun) ---------- */
const trCache = lsGet("tb-tr", {});
let trSaveT;
const queue = []; let active = 0;
function limit(fn) {
  return new Promise((res, rej) => {
    const run = async () => { active++; try { res(await fn()); } catch (e) { rej(e); } finally { active--; queue.length && queue.shift()(); } };
    active < 4 ? run() : queue.push(run);
  });
}
async function translate(text, tl) {
  if (!text) return text;
  const key = tl + "|" + text;
  if (trCache[key]) return trCache[key];
  const out = await limit(async () => {
    const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
    if (!r.ok) throw new Error("tr " + r.status);
    const j = await r.json();
    return j[2] === tl ? text : j[0].map((s) => s[0]).join("");
  });
  trCache[key] = out;
  clearTimeout(trSaveT);
  trSaveT = setTimeout(() => {
    const keys = Object.keys(trCache);
    if (keys.length > 600) keys.slice(0, keys.length - 600).forEach((k) => delete trCache[k]);
    lsSet("tb-tr", trCache);
  }, 500);
  return out;
}

/* ---------- Til ---------- */
function detectLang() {
  const s = lsGet("lang", null);
  if (s && T[s]) return s;
  const n = (navigator.language || "uz").slice(0, 2);
  return T[n] ? n : "uz";
}

async function setLang(l, animate = true) {
  if (!T[l]) return;
  if (animate && !reduced && l !== state.lang) { document.body.classList.add("switching"); await sleep(260); }
  state.lang = l; lsSet("lang", l);
  applyLang();
  requestAnimationFrame(() => document.body.classList.remove("switching"));
}

function applyLang() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  $("lang").value = state.lang;
  document.querySelectorAll("#gateLangs button").forEach((b) => b.classList.toggle("on", b.dataset.l === state.lang));
  const ctry = (c) => `${FLAGS[c]} ${t("country")[c]}`;
  fillSelect($("fCategory"), CATEGORIES.map((c) => [c.id, `${c.icon} ${t("cat")[c.id]}`]));
  fillSelect($("fCountry"), COUNTRIES.map((c) => [c, ctry(c)]));
  fillSelect($("countryFilter"), [["all", `🌍 ${t("allCountries")}`], ...COUNTRIES.map((c) => [c, ctry(c)])], state.country);
  $("flags").innerHTML = COUNTRIES.map((c, i) => `<span style="--i:${i}" title="${t("country")[c]}">${FLAGS[c]}</span>`).join("");
  renderProverb(); renderCats(); renderPosts();
}

function fillSelect(sel, items, value) {
  const keep = value ?? sel.value;
  sel.innerHTML = "";
  for (const [v, label] of items) sel.add(new Option(label, v));
  if (keep && [...sel.options].some((o) => o.value === keep)) sel.value = keep;
}

/* ---------- Kun maqoli ---------- */
function renderProverb() {
  const p = PROVERBS[state.proverb];
  const native = COUNTRY_LANG[p.c];
  const q = $("proverb");
  q.classList.remove("pop"); void q.offsetWidth; q.classList.add("pop");
  q.textContent = `«${p.t[state.lang]}»`;
  $("proverbFrom").textContent = `${FLAGS[p.c]} ${t("country")[p.c]}`;
  $("proverbOrig").textContent = native !== state.lang ? `${t("origLabel")}: «${p.t[native]}»` : "";
  $("proverbDots").innerHTML = PROVERBS.map((_, i) => `<i class="${i === state.proverb ? "on" : ""}"></i>`).join("");
}

/* ---------- Bo'limlar ---------- */
function renderCats() {
  const counts = {};
  state.posts.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
  const items = [{ id: "all", icon: "✨" }, ...CATEGORIES];
  $("cats").innerHTML = "";
  items.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "cat reveal" + (state.cat === c.id ? " on" : "");
    b.style.setProperty("--d", i * 40 + "ms");
    const n = c.id === "all" ? state.posts.length : counts[c.id] || 0;
    b.innerHTML = `<i>${c.icon}</i><span></span><em>${n}</em>`;
    b.querySelector("span").textContent = c.id === "all" ? t("all") : t("cat")[c.id];
    b.onclick = () => { state.cat = c.id; renderCats(); renderPosts(); $("feed").scrollIntoView({ behavior: "smooth" }); };
    $("cats").append(b);
  });
  observeReveals($("cats"));
}

/* ---------- Maqolalar ---------- */
function postText(p) {
  if (p.i18n) return { title: p.title[state.lang], body: p.body[state.lang], proverb: PROVERBS[p.proverb].t[state.lang], native: true };
  return { title: p.title, body: p.body, proverb: p.proverb, native: p.lang === state.lang };
}

function renderPosts() {
  const q = state.q.toLowerCase();
  const list = state.posts.filter((p) => {
    if (state.cat !== "all" && p.category !== state.cat) return false;
    if (state.country !== "all" && p.country !== state.country) return false;
    if (!q) return true;
    const x = postText(p);
    return [x.title, x.body, x.proverb, p.authorName].join(" ").toLowerCase().includes(q);
  });
  const box = $("posts");
  box.innerHTML = "";
  $("empty").hidden = list.length > 0;
  const icon = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.icon]));
  list.forEach((p, i) => {
    const x = postText(p);
    const el = document.createElement("article");
    el.className = "post reveal";
    el.style.setProperty("--d", Math.min(i, 8) * 70 + "ms");
    el.innerHTML = `
      <div class="meta"><span class="chip"></span><span class="flag"></span></div>
      <h3></h3><p class="body"></p>
      <blockquote><small></small><span class="pv"></span></blockquote>
      <div class="trbar" hidden><span>🌐 <i></i></span><button type="button"></button></div>
      <div class="author"><img alt=""><div><b></b><time></time></div></div>`;
    el.querySelector(".chip").textContent = `${icon[p.category] || "📌"} ${t("cat")[p.category] || ""}`;
    el.querySelector(".flag").textContent = `${FLAGS[p.country] || ""} ${t("country")[p.country] || ""}`;
    el.querySelector("blockquote small").textContent = t("proverbLabel");
    const set = (v) => {
      el.querySelector("h3").textContent = v.title;
      el.querySelector(".body").textContent = v.body;
      el.querySelector(".pv").textContent = `«${v.proverb}»`;
    };
    set(x);
    el.querySelector(".author b").textContent = p.i18n ? t("team") : p.authorName || "—";
    el.querySelector("time").textContent = p.createdAt ? new Date(p.createdAt).toLocaleDateString(state.lang) : "";
    const img = el.querySelector(".author img");
    if (p.authorPhoto) { img.src = p.authorPhoto; img.referrerPolicy = "no-referrer"; }
    else img.replaceWith(Object.assign(document.createElement("span"), { className: "ava", textContent: p.i18n ? "🐺" : (p.authorName || "?")[0] }));
    if (state.user && state.user.uid === p.uid) {
      const d = document.createElement("button");
      d.className = "del"; d.textContent = t("deleteBtn");
      d.onclick = async () => { if (confirm(t("deleteBtn") + "?")) await store.remove(p.id); };
      el.querySelector(".author").append(d);
    }
    if (!x.native) translatePost(el, x, set);
    box.append(el);
  });
  observeReveals(box);
  countUp($("sPosts"), state.posts.length);
  countUp($("sCountries"), new Set(state.posts.map((p) => p.country)).size || 6);
}

async function translatePost(el, orig, set) {
  const lang = state.lang;
  el.classList.add("translating");
  try {
    const [title, body, proverb] = await Promise.all([translate(orig.title, lang), translate(orig.body, lang), translate(orig.proverb, lang)]);
    if (lang !== state.lang || !el.isConnected) return;
    const tr = { title, body, proverb };
    if (title === orig.title && body === orig.body) return;
    set(tr);
    const bar = el.querySelector(".trbar"), btn = bar.querySelector("button");
    bar.querySelector("i").textContent = t("translated");
    bar.hidden = false;
    let showingOrig = false;
    btn.textContent = t("original");
    btn.onclick = () => { showingOrig = !showingOrig; set(showingOrig ? orig : tr); btn.textContent = showingOrig ? t("showTr") : t("original"); };
  } catch { /* tarjima ishlamasa asl matn qoladi */ }
  finally { el.classList.remove("translating"); }
}

/* ---------- Foydalanuvchi va ro'yxatdan o'tish oynasi ---------- */
function renderUser() {
  const u = state.user;
  document.body.classList.remove("loading");
  $("gate").hidden = !!u;
  document.body.classList.toggle("locked", !u);
  $("user").hidden = !u;
  $("fab").hidden = !u;
  if (u) {
    const initial = (u.name || "?")[0].replace(/[<&>"']/g, "");
    $("avatar").referrerPolicy = "no-referrer";
    $("avatar").src = u.photo || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#14b8d4"/><text x="20" y="27" font-size="18" text-anchor="middle" fill="#fff" font-family="sans-serif">${initial}</text></svg>`)}`;
    $("avatar").title = u.name;
    $("hello").textContent = (u.name || "").split(" ")[0];
    observeReveals();
  }
  renderPosts();
}

function setupGate() {
  const box = $("gateLangs");
  for (const [k, v] of Object.entries(LANGS)) {
    const b = document.createElement("button");
    b.type = "button"; b.dataset.l = k; b.textContent = v;
    b.onclick = () => setLang(k);
    box.append(b);
  }
  // Shior barcha turkiy tillarda navbat bilan almashadi
  const codes = Object.keys(LANGS);
  let i = 0;
  const el = $("gateSlogan");
  const show = () => { el.textContent = T[codes[i]].slogan; el.classList.remove("fadein"); void el.offsetWidth; el.classList.add("fadein"); };
  show();
  setInterval(() => { if (!$("gate").hidden) { i = (i + 1) % codes.length; show(); } }, 2600);
}

/* ---------- Ma'lumotlar qatlami: Firebase ---------- */
async function firebaseStore() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(FB + "firebase-app.js"), import(FB + "firebase-auth.js"), import(FB + "firebase-firestore.js"),
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  const provider = new A.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const refreshMembers = () => F.getCountFromServer(F.collection(db, "users"))
    .then((s) => countUp($("sMembers"), s.data().count)).catch(() => {});

  A.getRedirectResult(auth).catch((e) => toast(e.message));
  A.onAuthStateChanged(auth, async (u) => {
    state.user = u ? { uid: u.uid, name: u.displayName, photo: u.photoURL } : null;
    if (u) {
      await F.setDoc(F.doc(db, "users", u.uid), { name: u.displayName || "", lang: state.lang, joinedAt: F.serverTimestamp() }, { merge: true }).catch(() => {});
      refreshMembers();
    }
    renderUser();
  });

  F.onSnapshot(F.query(F.collection(db, "posts"), F.orderBy("createdAt", "desc"), F.limit(200)), (snap) => {
    const live = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toMillis?.() || Date.now() }));
    state.posts = [...live, ...samplePosts()];
    renderCats(); renderPosts();
  }, () => {});
  refreshMembers();

  return {
    login: async () => {
      try { await A.signInWithPopup(auth, provider); }
      catch (e) {
        if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(e.code)) return A.signInWithRedirect(auth, provider);
        if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") toast(e.message);
      }
    },
    logout: () => A.signOut(auth),
    add: (p) => F.addDoc(F.collection(db, "posts"), {
      ...p, uid: state.user.uid, authorName: state.user.name || "", authorPhoto: state.user.photo || "", createdAt: F.serverTimestamp(),
    }),
    remove: (id) => F.deleteDoc(F.doc(db, "posts", id)),
  };
}

function samplePosts() {
  return SAMPLES.map((s) => ({ ...s, i18n: true, uid: "team", createdAt: Date.now() - s.ago * 864e5 }));
}

/* ---------- Ma'lumotlar qatlami: namuna rejimi ---------- */
function demoStore() {
  $("demo").hidden = false;
  const KEY = "tb-posts-v2", UKEY = "tb-user";
  let posts = lsGet(KEY, []);
  const sync = () => {
    lsSet(KEY, posts);
    state.posts = [...posts.sort((a, b) => b.createdAt - a.createdAt), ...samplePosts()];
    renderCats(); renderPosts();
  };
  state.user = lsGet(UKEY, null);
  $("sMembers").textContent = state.user ? 1 : 0;
  sync(); renderUser();
  return {
    login: () => {
      toast(t("demoLogin"));
      state.user = { uid: "demo", name: "Mehmon", photo: "" };
      lsSet(UKEY, state.user); countUp($("sMembers"), 1); renderUser();
    },
    logout: () => { state.user = null; lsSet(UKEY, null); renderUser(); },
    add: async (p) => { posts.push({ ...p, id: "p" + Date.now(), uid: state.user.uid, authorName: state.user.name, createdAt: Date.now() }); sync(); },
    remove: async (id) => { posts = posts.filter((p) => p.id !== id); sync(); },
  };
}

/* ---------- Ishga tushirish ---------- */
async function init() {
  state.lang = detectLang();
  state.proverb = Math.floor(Date.now() / 864e5) % PROVERBS.length;
  const sel = $("lang");
  for (const [k, v] of Object.entries(LANGS)) sel.add(new Option(v, k));
  sel.onchange = () => setLang(sel.value);
  setupGate();
  applyLang();
  observeReveals();

  $("proverbCard").onclick = () => { state.proverb = (state.proverb + 1) % PROVERBS.length; renderProverb(); };
  $("q").oninput = (e) => { state.q = e.target.value; renderPosts(); };
  $("countryFilter").onchange = (e) => { state.country = e.target.value; renderPosts(); };

  try { store = firebaseConfig.apiKey ? await firebaseStore() : demoStore(); }
  catch (e) { console.error(e); store = demoStore(); }

  $("gateLogin").onclick = () => store.login();
  $("logout").onclick = () => store.logout();
  const openForm = () => { $("fCountry").value = Object.keys(COUNTRY_LANG).find((c) => COUNTRY_LANG[c] === state.lang) || "uz"; $("dlg").showModal(); };
  $("shareBtn").onclick = openForm;
  $("fab").onclick = openForm;
  $("cancel").onclick = () => $("dlg").close();
  $("form").onsubmit = async (e) => {
    e.preventDefault();
    const p = {
      title: $("fTitle").value.trim(), body: $("fBody").value.trim(), proverb: $("fProverb").value.trim(),
      category: $("fCategory").value, country: $("fCountry").value, lang: state.lang,
    };
    if (!p.title || !p.body || !p.proverb) return toast(t("fill"));
    try { await store.add(p); $("form").reset(); $("dlg").close(); toast("✅ " + t("done")); }
    catch (err) { toast(err.message); }
  };
}

init();
