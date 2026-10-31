# 🐺 TürkBilim — Turkiy dunyoda bilim almashaylik

Turkiy davlatlar (🇺🇿 🇹🇷 🇰🇿 🇦🇿 🇰🇬 🇹🇲) yoshlari o‘z sohalaridagi bilim, tajriba va kashfiyotlarni
**maqollar bilan** ulashadigan zamonaviy sayt.

- **Tillar:** o‘zbek, turk, ozarbayjon, qozoq, qirg‘iz, turkman (yuqoridagi tanlagichdan almashtiriladi)
- **Bo‘limlar:** oziq-ovqat sanoati, metallurgiya, kashfiyotlar, IT, qishloq xo‘jaligi, tibbiyot, energetika, to‘qimachilik, madaniyat va tarix
- **Boshida Google orqali ro‘yxatdan o‘tish** oynasi (Firebase Authentication)
- **Til almashganda butun sayt almashadi:** menyu, bo‘limlar, kun maqoli va namuna maqolalar 6 tilda yozilgan; foydalanuvchilar yozgan maqolalar avtomatik tarjima qilinadi ("Asl nusxani ko‘rish" tugmasi bilan)
- Zamonaviy animatsiyalar: harakatlanuvchi fon, scroll paytida paydo bo‘lish, silliq til almashuvi
- Har bir maqola: yo‘nalish, davlat, matn va mavzuga mos maqol
- Bo‘lim, davlat va qidiruv bo‘yicha saralash, kun maqoli

## Fayllar
| Fayl | Vazifasi |
|---|---|
| `index.html` | Sahifa tuzilishi |
| `style.css` | Dizayn (yorug‘/qorong‘i rejim) |
| `app.js` | Sayt mantiqi, Google kirish, maqolalar |
| `i18n.js` | Barcha tillardagi matnlar, bo‘limlar, maqollar |
| `firebase-config.js` | Firebase kalitlari (siz to‘ldirasiz) |
| `firestore.rules` | Ma’lumotlar bazasi xavfsizlik qoidalari |

## Google orqali kirishni yoqish (bepul)
Kalitlarsiz sayt **namuna rejimida** ishlaydi (ma’lumotlar faqat brauzerda saqlanadi).
Haqiqiy Google kirish va umumiy baza uchun:

1. <https://console.firebase.google.com> → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable**.
3. **Authentication → Settings → Authorized domains** ga `ibotovdavron.github.io` ni qo‘shing.
4. **Build → Firestore Database → Create database**. **Rules** bo‘limiga `firestore.rules` faylidagi matnni qo‘yib, **Publish** bosing.
5. **Project settings → Your apps → Web (</>)** → ilova yarating va chiqqan `firebaseConfig` qiymatlarini `firebase-config.js` ga ko‘chiring.

## Saytni ochish (GitHub Pages)
Repo → **Settings → Pages → Source: GitHub Actions**. `main` ga push qilinganda sayt avtomatik joylanadi:
`https://ibotovdavron.github.io/ok/`

Lokal sinash: `python3 -m http.server` va <http://localhost:8000>.
