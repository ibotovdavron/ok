import { LANGS, COUNTRIES, FLAGS, CATEGORIES, PROVERBS, T } from "./i18n.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";

const state = { lang: "uz", user: null, posts: [], cat: "all", country: "all", q: "" };
let store; // ma'lumotlar qatlami: Firebase yoki namuna (localStorage)

/* ---------- Til ---------- */
function detectLang() {
  try { const s = localStorage.getItem("lang"); if (s && T[s]) return s; } catch {}
  const n = (navigator.language || "uz").slice(0, 2);
  return T[n] ? n : "uz";
}
const t = (k) => T[state.lang][k] ?? T.uz[k];

function applyLang() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  fillSelect($("fCategory"), CATEGORIES.map((c) => [c.id, `${c.icon} ${t("cat")[c.id]}`]));
  fillSelect($("fCountry"), COUNTRIES.map((c) => [c, `${FLAGS[c]} ${t("country")[c]}`]));
  fillSelect($("countryFilter"), [["all", `🌍 ${t("allCountries")}`], ...COUNTRIES.map((c) => [c, `${FLAGS[c]} ${t("country")[c]}`])], state.country);
  $("flags").innerHTML = COUNTRIES.map((c) => `<span title="${t("country")[c]}">${FLAGS[c]}</span>`).join("");
  renderCats();
  renderPosts();
}

function fillSelect(sel, items, value) {
  const keep = value ?? sel.value;
  sel.innerHTML = "";
  for (const [v, label] of items) sel.add(new Option(label, v));
  if (keep && [...sel.options].some((o) => o.value === keep)) sel.value = keep;
}

/* ---------- Ko'rinish ---------- */
function renderCats() {
  const counts = {};
  state.posts.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
  const items = [{ id: "all", icon: "✨" }, ...CATEGORIES];
  $("cats").innerHTML = "";
  for (const c of items) {
    const b = document.createElement("button");
    b.className = "cat" + (state.cat === c.id ? " on" : "");
    const n = c.id === "all" ? state.posts.length : counts[c.id] || 0;
    b.innerHTML = `<i>${c.icon}</i><span></span><em>${n}</em>`;
    b.querySelector("span").textContent = c.id === "all" ? t("all") : t("cat")[c.id];
    b.onclick = () => { state.cat = c.id; renderCats(); renderPosts(); $("feed").scrollIntoView({ behavior: "smooth" }); };
    $("cats").append(b);
  }
}

function renderPosts() {
  const q = state.q.toLowerCase();
  const list = state.posts.filter((p) =>
    (state.cat === "all" || p.category === state.cat) &&
    (state.country === "all" || p.country === state.country) &&
    (!q || [p.title, p.body, p.proverb, p.authorName].join(" ").toLowerCase().includes(q)));
  const box = $("posts");
  box.innerHTML = "";
  $("empty").hidden = list.length > 0;
  const cat = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.icon]));
  for (const p of list) {
    const el = document.createElement("article");
    el.className = "post";
    el.innerHTML = `
      <div class="meta"><span class="chip"></span><span class="flag"></span></div>
      <h3></h3><p class="body"></p>
      <blockquote><small></small><span></span></blockquote>
      <div class="author"><img alt=""><div><b></b><time></time></div></div>`;
    el.querySelector(".chip").textContent = `${cat[p.category] || "📌"} ${t("cat")[p.category] || ""}`;
    el.querySelector(".flag").textContent = `${FLAGS[p.country] || ""} ${t("country")[p.country] || ""}`;
    el.querySelector("h3").textContent = p.title;
    el.querySelector(".body").textContent = p.body;
    el.querySelector("blockquote small").textContent = t("proverbLabel");
    el.querySelector("blockquote span").textContent = `«${p.proverb}»`;
    el.querySelector(".author b").textContent = p.authorName || "—";
    el.querySelector("time").textContent = p.createdAt ? new Date(p.createdAt).toLocaleDateString(state.lang) : "";
    const img = el.querySelector(".author img");
    if (p.authorPhoto) img.src = p.authorPhoto; else img.replaceWith(Object.assign(document.createElement("span"), { className: "ava", textContent: (p.authorName || "?")[0] }));
    if (state.user && state.user.uid === p.uid) {
      const d = document.createElement("button");
      d.className = "del"; d.textContent = t("deleteBtn");
      d.onclick = async () => { if (confirm(t("deleteBtn") + "?")) await store.remove(p.id); };
      el.querySelector(".author").append(d);
    }
    box.append(el);
  }
  $("sPosts").textContent = state.posts.length;
}

function renderUser() {
  const u = state.user;
  $("login").hidden = !!u;
  $("user").hidden = !u;
  if (u) {
    $("avatar").src = u.photo || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#0ea5c6"/><text x="20" y="27" font-size="18" text-anchor="middle" fill="#fff" font-family="sans-serif">${(u.name || "?")[0].replace(/[<&>"]/g, "")}</text></svg>`)}`;
    $("avatar").title = u.name;
  }
  renderPosts();
}

function toast(msg) {
  const el = $("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 2800);
}

function showProverb() {
  const day = Math.floor(Date.now() / 864e5);
  let i = day % PROVERBS.length;
  const show = () => {
    const p = PROVERBS[i];
    $("proverb").textContent = `«${p.text}»`;
    $("proverbFrom").textContent = `${FLAGS[p.c]} ${t("country")[p.c]}`;
  };
  show();
  $("proverb").parentElement.onclick = () => { i = (i + 1) % PROVERBS.length; show(); };
  return show;
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

  const refreshMembers = () => F.getCountFromServer(F.collection(db, "users"))
    .then((s) => ($("sMembers").textContent = s.data().count)).catch(() => {});

  A.onAuthStateChanged(auth, async (u) => {
    state.user = u ? { uid: u.uid, name: u.displayName, photo: u.photoURL } : null;
    if (u) {
      await F.setDoc(F.doc(db, "users", u.uid), { name: u.displayName || "", joinedAt: F.serverTimestamp() }, { merge: true }).catch(() => {});
      refreshMembers();
    }
    renderUser();
  });

  F.onSnapshot(F.query(F.collection(db, "posts"), F.orderBy("createdAt", "desc"), F.limit(200)), (snap) => {
    state.posts = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toMillis?.() || Date.now() }));
    renderCats(); renderPosts();
  });
  refreshMembers();

  return {
    login: () => A.signInWithPopup(auth, provider).catch((e) => toast(e.message)),
    logout: () => A.signOut(auth),
    add: (p) => F.addDoc(F.collection(db, "posts"), {
      ...p, uid: state.user.uid, authorName: state.user.name || "", authorPhoto: state.user.photo || "", createdAt: F.serverTimestamp(),
    }),
    remove: (id) => F.deleteDoc(F.doc(db, "posts", id)),
  };
}

/* ---------- Ma'lumotlar qatlami: namuna rejimi ---------- */
function demoStore() {
  $("demo").hidden = false;
  const KEY = "turkbilim-posts", UKEY = "turkbilim-user";
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const sample = [
    { id: "s1", category: "food", country: "uz", authorName: "Namuna", createdAt: Date.now() - 864e5,
      title: "Quritilgan mevalarni saqlashning an’anaviy usuli", proverb: "Bilimli ming yashar, bilimsiz bir yashar.",
      body: "Farg‘ona vodiysida o‘rik va mayizni quyoshda quritish usuli asrlar davomida rivojlangan. Bugun bu usul zamonaviy quritgichlar bilan uyg‘unlashib, eksportga chiqmoqda." },
    { id: "s2", category: "metal", country: "kz", authorName: "Үлгі", createdAt: Date.now() - 2 * 864e5,
      title: "Ұлы даладағы ежелгі металлургия", proverb: "Білімді мыңды жығар, білекті бірді жығар.",
      body: "Сақтар дәуірінде қола мен темір балқыту өнері жоғары деңгейде болған. Бүгінгі қазақстандық металлургия осы дәстүрдің жалғасы." },
    { id: "s3", category: "discovery", country: "tr", authorName: "Örnek", createdAt: Date.now() - 3 * 864e5,
      title: "Göbeklitepe: tarihi yeniden yazan keşif", proverb: "Damlaya damlaya göl olur.",
      body: "Yaklaşık 12 bin yıllık Göbeklitepe, insanlığın ilk anıtsal yapılarından biri olarak arkeoloji dünyasında büyük bir keşif sayılır." },
  ];
  let posts = read(KEY, null) || sample;
  const sync = () => { write(KEY, posts); state.posts = [...posts].sort((a, b) => b.createdAt - a.createdAt); renderCats(); renderPosts(); };
  state.user = read(UKEY, null);
  $("sMembers").textContent = state.user ? 1 : 0;
  sync(); renderUser();
  return {
    login: () => {
      toast("Google: firebase-config.js → README.md");
      state.user = { uid: "demo", name: "Mehmon", photo: "" };
      write(UKEY, state.user); $("sMembers").textContent = 1; renderUser();
    },
    logout: () => { state.user = null; write(UKEY, null); renderUser(); },
    add: async (p) => { posts.push({ ...p, id: "p" + Date.now(), uid: state.user.uid, authorName: state.user.name, createdAt: Date.now() }); sync(); },
    remove: async (id) => { posts = posts.filter((p) => p.id !== id); sync(); },
  };
}

/* ---------- Ishga tushirish ---------- */
async function init() {
  state.lang = detectLang();
  const sel = $("lang");
  for (const [k, v] of Object.entries(LANGS)) sel.add(new Option(v, k));
  sel.value = state.lang;
  const showP = showProverb();
  sel.onchange = () => { state.lang = sel.value; try { localStorage.setItem("lang", state.lang); } catch {} applyLang(); showP(); };
  applyLang();

  $("q").oninput = (e) => { state.q = e.target.value; renderPosts(); };
  $("countryFilter").onchange = (e) => { state.country = e.target.value; renderPosts(); };

  try { store = firebaseConfig.apiKey ? await firebaseStore() : demoStore(); }
  catch (e) { console.error(e); store = demoStore(); }

  $("login").onclick = () => store.login();
  $("logout").onclick = () => store.logout();
  $("shareBtn").onclick = () => {
    if (!state.user) { toast(t("loginFirst")); store.login(); return; }
    $("dlg").showModal();
  };
  $("cancel").onclick = () => $("dlg").close();
  $("form").onsubmit = async (e) => {
    e.preventDefault();
    const p = {
      title: $("fTitle").value.trim(), body: $("fBody").value.trim(), proverb: $("fProverb").value.trim(),
      category: $("fCategory").value, country: $("fCountry").value,
    };
    if (!p.title || !p.body || !p.proverb) return toast(t("fill"));
    try { await store.add(p); $("form").reset(); $("dlg").close(); toast(t("done")); }
    catch (err) { toast(err.message); }
  };
}

init();
