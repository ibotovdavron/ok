# KoʻzMadad AI

Koʻzi ojiz va zaif koʻruvchilar uchun atrofni oʻzbek tilida “gapirib beradigan” sunʼiy intellekt yordamchi — loyiha sayti.

Muallif: Oltinsoy tuman 68-umumtaʼlim maktabi oʻquvchisi **Sayfullayeva Madina**.

## Sayt boʻlimlari
Muammo · Yechim · Qanday ishlaydi · Innovatsiya · Taqqoslash · Prototip (interaktiv namoyish) · Moliyaviy reja · Tatbiq etish rejasi · Kutilayotgan natijalar · Jamoa va xavflar · Xulosa

## Qulaylik (accessibility)
- **Sahifani ovoz bilan oʻqish** tugmasi (yoki `Alt + R`), `Esc` — toʻxtatish
- Matnni kattalashtirish / kichraytirish (A+ / A−)
- Yuqori kontrast va qorongʻi rejim
- Ekran oʻqish dasturlari uchun toʻgʻri belgilangan sarlavhalar, jadvallar va tugmalar; “Asosiy mazmunga oʻtish” havolasi
- Klaviatura bilan toʻliq boshqarish

## Fayllar
| Fayl | Vazifasi |
|---|---|
| `index.html` | Sahifa mazmuni |
| `style.css` | Dizayn |
| `app.js` | Ovozli oʻqish, prototip namoyishi, sozlamalar, animatsiyalar |
| `.github/workflows/static.yml` | GitHub Pages'ga avtomatik joylash |

## 📱 Mobil ilova (`app/`)
Telefonga oʻrnatiladigan ilova (PWA): **https://ibotovdavron.github.io/ok/app/**
- **🦯 Yoʻlda yordam** — yurib ketayotganda oldingizdagi toʻsiqlarni (odam, mashina, velosiped, stul, skameyka va h.k.), **yuqoriga zinapoya** va **pastlikni** (chuqur, pastga tushadigan zinapoya) taxminiy masofasi bilan aytadi (MiDaS chuqurlik modeli, `app/depth.js`), qaysi tomondan oʻtishni maslahat beradi; yaqinlashgan sari kuchliroq tebranadi; ekran oʻchmaydi
- **Ravon oʻzbekcha ovoz** — barcha xabarlar oldindan yozib olingan oʻzbekcha ovozda (`app/audio/`, NeuronAI “Madina” ovozi). Kameradan oʻqilgan matnni qurilma ovozi oʻqiydi (oʻzbekcha ovoz boʻlmasa — turkcha ovoz oʻzbekcha talaffuzga moslab)
- **Matnni oʻqi** — kamera orqali lotin va kirill matnini oʻqib, ovoz bilan aytadi (Tesseract OCR)
- **Bu nima?** — buyum va odamlarni, qaysi tomonda ekanini aytadi; juda yaqin boʻlsa tebranadi (COCO-SSD)
- **Rangi qanday?** — markazdagi narsaning rangini aytadi
- **Gapiring** — ovozli buyruqlar: “yoʻl”, “oʻqi”, “bu nima”, “rang”, “takrorla”
- Rasmlar faqat telefonda qayta ishlanadi, serverga yuborilmaydi; birinchi ishlatishdan keyin internetsiz ishlaydi

Oʻrnatish: telefonda havolani Chrome'da oching → menyu → **“Bosh ekranga qoʻshish”** / **“Ilovani oʻrnatish”**.
