// Sayt tillari: barcha turkiy davlatlar tillari
export const LANGS = {
  uz: "O‘zbekcha",
  tr: "Türkçe",
  az: "Azərbaycanca",
  kk: "Қазақша",
  ky: "Кыргызча",
  tk: "Türkmençe",
};

export const COUNTRIES = ["uz", "tr", "kz", "az", "kg", "tm"];
export const FLAGS = { uz: "🇺🇿", tr: "🇹🇷", kz: "🇰🇿", az: "🇦🇿", kg: "🇰🇬", tm: "🇹🇲" };

export const CATEGORIES = [
  { id: "food", icon: "🌾" },
  { id: "metal", icon: "⚒️" },
  { id: "discovery", icon: "🔭" },
  { id: "tech", icon: "💻" },
  { id: "agri", icon: "🚜" },
  { id: "medicine", icon: "🩺" },
  { id: "energy", icon: "⚡" },
  { id: "textile", icon: "🧵" },
  { id: "culture", icon: "🏛️" },
];

// Davlat → til
export const COUNTRY_LANG = { uz: "uz", tr: "tr", kz: "kk", az: "az", kg: "ky", tm: "tk" };

// Maqollar: har biri barcha 6 tilda (c — qaysi xalqdan olingani)
export const PROVERBS = [
  { c: "kz", t: { uz: "Bilagi zo‘r birni yiqar, bilimi zo‘r mingni yiqar.", tr: "Bileği güçlü birini yener, bilgisi güçlü binini yener.", az: "Qolu güclü birini yıxar, biliyi güclü minini yıxar.", kk: "Білекті бірді жығар, білімді мыңды жығар.", ky: "Билектүү бирди жыгат, билимдүү миңди жыгат.", tk: "Bilekli birini ýykar, bilimli müňüni ýykar." } },
  { c: "tr", t: { uz: "Tomchi-tomchi ko‘l bo‘lur.", tr: "Damlaya damlaya göl olur.", az: "Damla-damla göl olar.", kk: "Тамшы тамып көл болар.", ky: "Тамчы тамып көл болот.", tk: "Damja-damja köl bolar." } },
  { c: "az", t: { uz: "Ilm — aql chirog‘i.", tr: "İlim aklın ışığıdır.", az: "Elm ağlın çırağıdır.", kk: "Білім — ақылдың шырағы.", ky: "Билим — акылдын чырагы.", tk: "Ylym — aklyň çyrasy." } },
  { c: "uz", t: { uz: "Birlik bor joyda tiriklik bor.", tr: "Birlikten kuvvet doğar.", az: "Birlik olan yerdə dirilik olar.", kk: "Бірлік бар жерде тірлік бар.", ky: "Биримдик бар жерде тирилик бар.", tk: "Agzybirlik bar ýerde abadançylyk bar." } },
  { c: "kg", t: { uz: "Bilim — tuganmas xazina.", tr: "Bilgi tükenmez bir hazinedir.", az: "Bilik tükənməz xəzinədir.", kk: "Білім — таусылмас қазына.", ky: "Билим — түгөнгүс казына.", tk: "Bilim — tükenmez hazyna." } },
  { c: "tm", t: { uz: "Ko‘p yashagan emas, ko‘p yurgan bilar.", tr: "Çok yaşayan değil, çok gezen bilir.", az: "Çox yaşayan yox, çox gəzən bilər.", kk: "Көп жасаған емес, көп жүрген біледі.", ky: "Көп жашаган эмес, көп жүргөн билет.", tk: "Köp ýaşan däl, köp gezen biler." } },
];

// Namuna maqolalar (TürkBilim jamoasi), barcha tillarda
export const SAMPLES = [
  { id: "s1", category: "food", country: "uz", proverb: 1, ago: 1,
    title: { uz: "Quritilgan meva: qadimiy usul, zamonaviy eksport", tr: "Kuru meyve: kadim yöntem, modern ihracat", az: "Quru meyvə: qədim üsul, müasir ixrac", kk: "Кептірілген жеміс: ежелгі әдіс, заманауи экспорт", ky: "Кургатылган жемиш: байыркы ыкма, заманбап экспорт", tk: "Guradylan miweler: gadymy usul, döwrebap eksport" },
    body: { uz: "Farg‘ona vodiysida o‘rik va mayizni quyoshda quritish asrlar davomida rivojlangan. Bugun bu usul zamonaviy quritgichlar bilan uyg‘unlashib, eksportga chiqmoqda.", tr: "Fergana Vadisi'nde kayısı ve kuru üzümü güneşte kurutma yöntemi yüzyıllardır gelişmiştir. Bugün bu yöntem modern kurutucularla birleşerek ihracata açılıyor.", az: "Fərqanə vadisində ərik və kişmişi günəşdə qurutma üsulu əsrlər boyu inkişaf edib. Bu gün bu üsul müasir quruducularla birləşərək ixraca çıxır.", kk: "Ферғана алқабында өрік пен мейізді күнге кептіру әдісі ғасырлар бойы дамыған. Бүгін бұл әдіс заманауи кептіргіштермен ұштасып, экспортқа шығуда.", ky: "Фергана өрөөнүндө өрүк менен мейизди күнгө кургатуу ыкмасы кылымдар бою өнүккөн. Бүгүн бул ыкма заманбап кургаткычтар менен айкалышып, экспортко чыгууда.", tk: "Fergana jülgesinde erik we kişmişi güne guratmak usuly asyrlarboýy ösüpdir. Häzir bu usul döwrebap guradyjylar bilen utgaşyp, eksporta çykýar." } },
  { id: "s2", category: "metal", country: "kz", proverb: 0, ago: 2,
    title: { uz: "Buyuk dashtdagi qadimiy metallurgiya", tr: "Büyük Bozkır'da kadim metalurji", az: "Böyük Bozqırda qədim metallurgiya", kk: "Ұлы даладағы ежелгі металлургия", ky: "Улуу талаадагы байыркы металлургия", tk: "Beýik sähradaky gadymy metallurgiýa" },
    body: { uz: "Saklar davrida bronza va temir eritish san’ati yuksak darajada bo‘lgan. Bugungi Qozog‘iston metallurgiyasi shu an’ananing davomidir.", tr: "Sakalar döneminde bronz ve demir eritme sanatı çok gelişmişti. Bugünkü Kazakistan metalurjisi bu geleneğin devamıdır.", az: "Saklar dövründə tunc və dəmir əritmə sənəti yüksək səviyyədə olub. Bugünkü Qazaxıstan metallurgiyası bu ənənənin davamıdır.", kk: "Сақтар дәуірінде қола мен темір балқыту өнері жоғары деңгейде болған. Бүгінгі Қазақстан металлургиясы осы дәстүрдің жалғасы.", ky: "Сактар доорунда коло жана темир эритүү өнөрү жогорку деңгээлде болгон. Бүгүнкү Казакстандын металлургиясы ушул салттын уландысы.", tk: "Saklar döwründe bürünç we demir eretmek sungaty ýokary derejede bolupdyr. Häzirki Gazagystanyň metallurgiýasy şol däbiň dowamydyr." } },
  { id: "s3", category: "discovery", country: "tr", proverb: 2, ago: 3,
    title: { uz: "Go‘beklitepa: tarixni qayta yozgan kashfiyot", tr: "Göbeklitepe: tarihi yeniden yazan keşif", az: "Göbəklitəpə: tarixi yenidən yazan kəşf", kk: "Гөбеклитепе: тарихты қайта жазған ашылу", ky: "Гөбеклитепе: тарыхты кайра жазган ачылыш", tk: "Göbeklitepe: taryhy täzeden ýazan açyş" },
    body: { uz: "Taxminan 12 ming yillik Go‘beklitepa insoniyatning ilk monumental inshootlaridan biri sifatida arxeologiyadagi buyuk kashfiyot hisoblanadi.", tr: "Yaklaşık 12 bin yıllık Göbeklitepe, insanlığın ilk anıtsal yapılarından biri olarak arkeolojinin en büyük keşiflerinden sayılır.", az: "Təxminən 12 min illik Göbəklitəpə bəşəriyyətin ilk monumental tikililərindən biri kimi arxeologiyanın böyük kəşfi sayılır.", kk: "Шамамен 12 мың жылдық Гөбеклитепе адамзаттың алғашқы монументалды құрылыстарының бірі ретінде археологиядағы ұлы ашылу саналады.", ky: "Болжол менен 12 миң жылдык Гөбеклитепе адамзаттын алгачкы монументалдык курулуштарынын бири катары археологиядагы улуу ачылыш болуп эсептелет.", tk: "Takmynan 12 müň ýyllyk Göbeklitepe adamzadyň ilkinji monumental binalarynyň biri hökmünde arheologiýanyň beýik açyşy hasaplanýar." } },
];

export const T = {
  uz: {
    slogan: "Turkiy dunyoda bilim almashaylik",
    heroText: "Turkiy davlatlar yoshlari o‘z sohalaridagi bilim, tajriba va kashfiyotlarni maqollar bilan ulashadigan maydon.",
    join: "Google orqali kirish", logout: "Chiqish", share: "Bilim ulashish", explore: "Maqolalarni ko‘rish",
    sections: "Bo‘limlar", latest: "So‘nggi ulashilganlar", all: "Barchasi", allCountries: "Barcha davlatlar",
    search: "Qidirish...", proverbDay: "Kun maqoli", formTitle: "Yangi bilim ulashish",
    fTitle: "Sarlavha", fCategory: "Yo‘nalish", fCountry: "Davlatingiz",
    fBody: "Bilim, tajriba yoki kashfiyot haqida yozing", fProverb: "Mavzuga mos maqol",
    fProverbHint: "Masalan: Bilim — bitmas xazina.", publish: "Ulashish", cancel: "Bekor qilish",
    loginFirst: "Ulashish uchun Google orqali kiring", empty: "Hozircha bu yerda hech narsa yo‘q. Birinchi bo‘lib ulashing!",
    statPosts: "ulashilgan bilim", statMembers: "a’zo", statCountries: "davlat",
    demoNote: "Namuna rejimi: ma’lumotlar faqat brauzeringizda saqlanadi.",
    footer: "Turkiy xalqlar yoshlari uchun ochiq bilim maydoni", deleteBtn: "O‘chirish",
    fill: "Barcha maydonlarni to‘ldiring", done: "Bilimingiz ulashildi!", proverbLabel: "Maqol",
    cat: { food: "Oziq-ovqat sanoati", metal: "Metallurgiya", discovery: "Kashfiyotlar", tech: "IT va texnologiya", agri: "Qishloq xo‘jaligi", medicine: "Tibbiyot", energy: "Energetika", textile: "To‘qimachilik", culture: "Madaniyat va tarix" },
    country: { uz: "O‘zbekiston", tr: "Turkiya", kz: "Qozog‘iston", az: "Ozarbayjon", kg: "Qirg‘iziston", tm: "Turkmaniston" },
  },
  tr: {
    slogan: "Türk dünyasında bilgi paylaşalım",
    heroText: "Türk devletlerinin gençlerinin kendi alanlarındaki bilgi, deneyim ve keşiflerini atasözleriyle paylaştığı platform.",
    join: "Google ile giriş yap", logout: "Çıkış", share: "Bilgi paylaş", explore: "Yazıları keşfet",
    sections: "Bölümler", latest: "Son paylaşımlar", all: "Tümü", allCountries: "Tüm ülkeler",
    search: "Ara...", proverbDay: "Günün atasözü", formTitle: "Yeni bilgi paylaş",
    fTitle: "Başlık", fCategory: "Alan", fCountry: "Ülkeniz",
    fBody: "Bilgi, deneyim veya keşif hakkında yazın", fProverb: "Konuya uygun atasözü",
    fProverbHint: "Örneğin: İlim öğrenmek iğne ile kuyu kazmaktır.", publish: "Paylaş", cancel: "Vazgeç",
    loginFirst: "Paylaşmak için Google ile giriş yapın", empty: "Burada henüz bir şey yok. İlk paylaşan siz olun!",
    statPosts: "paylaşım", statMembers: "üye", statCountries: "ülke",
    demoNote: "Deneme modu: veriler yalnızca tarayıcınızda saklanır.",
    footer: "Türk halklarının gençleri için açık bilgi platformu", deleteBtn: "Sil",
    fill: "Lütfen tüm alanları doldurun", done: "Bilginiz paylaşıldı!", proverbLabel: "Atasözü",
    cat: { food: "Gıda sanayii", metal: "Metalurji", discovery: "Keşifler", tech: "Bilişim ve teknoloji", agri: "Tarım", medicine: "Tıp", energy: "Enerji", textile: "Tekstil", culture: "Kültür ve tarih" },
    country: { uz: "Özbekistan", tr: "Türkiye", kz: "Kazakistan", az: "Azerbaycan", kg: "Kırgızistan", tm: "Türkmenistan" },
  },
  az: {
    slogan: "Türk dünyasında bilik paylaşaq",
    heroText: "Türk dövlətlərinin gənclərinin öz sahələrindəki bilik, təcrübə və kəşflərini atalar sözləri ilə paylaşdığı məkan.",
    join: "Google ilə daxil ol", logout: "Çıxış", share: "Bilik paylaş", explore: "Yazılara bax",
    sections: "Bölmələr", latest: "Son paylaşımlar", all: "Hamısı", allCountries: "Bütün ölkələr",
    search: "Axtar...", proverbDay: "Günün atalar sözü", formTitle: "Yeni bilik paylaş",
    fTitle: "Başlıq", fCategory: "Sahə", fCountry: "Ölkəniz",
    fBody: "Bilik, təcrübə və ya kəşf haqqında yazın", fProverb: "Mövzuya uyğun atalar sözü",
    fProverbHint: "Məsələn: Elm ağlın çırağıdır.", publish: "Paylaş", cancel: "Ləğv et",
    loginFirst: "Paylaşmaq üçün Google ilə daxil olun", empty: "Hələ burada heç nə yoxdur. İlk paylaşan siz olun!",
    statPosts: "paylaşım", statMembers: "üzv", statCountries: "ölkə",
    demoNote: "Sınaq rejimi: məlumatlar yalnız brauzerinizdə saxlanılır.",
    footer: "Türk xalqlarının gəncləri üçün açıq bilik məkanı", deleteBtn: "Sil",
    fill: "Zəhmət olmasa, bütün xanaları doldurun", done: "Biliyiniz paylaşıldı!", proverbLabel: "Atalar sözü",
    cat: { food: "Qida sənayesi", metal: "Metallurgiya", discovery: "Kəşflər", tech: "İT və texnologiya", agri: "Kənd təsərrüfatı", medicine: "Tibb", energy: "Energetika", textile: "Toxuculuq", culture: "Mədəniyyət və tarix" },
    country: { uz: "Özbəkistan", tr: "Türkiyə", kz: "Qazaxıstan", az: "Azərbaycan", kg: "Qırğızıstan", tm: "Türkmənistan" },
  },
  kk: {
    slogan: "Түркі әлемінде білім бөлісейік",
    heroText: "Түркі мемлекеттерінің жастары өз салаларындағы білімін, тәжірибесі мен жаңалықтарын мақал-мәтелдермен бөлісетін алаң.",
    join: "Google арқылы кіру", logout: "Шығу", share: "Білім бөлісу", explore: "Мақалаларды қарау",
    sections: "Бөлімдер", latest: "Соңғы жазбалар", all: "Барлығы", allCountries: "Барлық елдер",
    search: "Іздеу...", proverbDay: "Күннің мақалы", formTitle: "Жаңа білім бөлісу",
    fTitle: "Тақырып", fCategory: "Сала", fCountry: "Еліңіз",
    fBody: "Білім, тәжірибе немесе жаңалық туралы жазыңыз", fProverb: "Тақырыпқа сай мақал",
    fProverbHint: "Мысалы: Оқу — білім бұлағы, білім — өмір шырағы.", publish: "Бөлісу", cancel: "Бас тарту",
    loginFirst: "Бөлісу үшін Google арқылы кіріңіз", empty: "Мұнда әзірге ештеңе жоқ. Бірінші болып бөлісіңіз!",
    statPosts: "жазба", statMembers: "мүше", statCountries: "ел",
    demoNote: "Сынақ режимі: деректер тек браузеріңізде сақталады.",
    footer: "Түркі халықтарының жастарына арналған ашық білім алаңы", deleteBtn: "Жою",
    fill: "Барлық өрістерді толтырыңыз", done: "Біліміңіз бөлісілді!", proverbLabel: "Мақал",
    cat: { food: "Тамақ өнеркәсібі", metal: "Металлургия", discovery: "Ашылулар", tech: "IT және технология", agri: "Ауыл шаруашылығы", medicine: "Медицина", energy: "Энергетика", textile: "Тоқыма өнеркәсібі", culture: "Мәдениет және тарих" },
    country: { uz: "Өзбекстан", tr: "Түркия", kz: "Қазақстан", az: "Әзербайжан", kg: "Қырғызстан", tm: "Түрікменстан" },
  },
  ky: {
    slogan: "Түрк дүйнөсүндө билим бөлүшөлү",
    heroText: "Түрк мамлекеттеринин жаштары өз тармактарындагы билимин, тажрыйбасын жана ачылыштарын макал-лакаптар менен бөлүшкөн аянт.",
    join: "Google аркылуу кирүү", logout: "Чыгуу", share: "Билим бөлүшүү", explore: "Макалаларды көрүү",
    sections: "Бөлүмдөр", latest: "Акыркы жазуулар", all: "Баары", allCountries: "Бардык өлкөлөр",
    search: "Издөө...", proverbDay: "Күндүн макалы", formTitle: "Жаңы билим бөлүшүү",
    fTitle: "Аталышы", fCategory: "Тармак", fCountry: "Өлкөңүз",
    fBody: "Билим, тажрыйба же ачылыш жөнүндө жазыңыз", fProverb: "Темага ылайык макал",
    fProverbHint: "Мисалы: Билим — түгөнгүс байлык.", publish: "Бөлүшүү", cancel: "Жокко чыгаруу",
    loginFirst: "Бөлүшүү үчүн Google аркылуу кириңиз", empty: "Азырынча бул жерде эч нерсе жок. Биринчи болуп бөлүшүңүз!",
    statPosts: "жазуу", statMembers: "мүчө", statCountries: "өлкө",
    demoNote: "Сыноо режими: маалыматтар браузериңизде гана сакталат.",
    footer: "Түрк элдеринин жаштары үчүн ачык билим аянты", deleteBtn: "Өчүрүү",
    fill: "Бардык талааларды толтуруңуз", done: "Билимиңиз бөлүшүлдү!", proverbLabel: "Макал",
    cat: { food: "Тамак-аш өнөр жайы", metal: "Металлургия", discovery: "Ачылыштар", tech: "IT жана технология", agri: "Айыл чарбасы", medicine: "Медицина", energy: "Энергетика", textile: "Токуу өнөр жайы", culture: "Маданият жана тарых" },
    country: { uz: "Өзбекстан", tr: "Түркия", kz: "Казакстан", az: "Азербайжан", kg: "Кыргызстан", tm: "Түркмөнстан" },
  },
  tk: {
    slogan: "Türki dünýäsinde bilim paýlaşalyň",
    heroText: "Türki döwletleriniň ýaşlarynyň öz pudaklaryndaky bilimlerini, tejribelerini we açyşlaryny nakyllar bilen paýlaşýan meýdançasy.",
    join: "Google arkaly gir", logout: "Çyk", share: "Bilim paýlaş", explore: "Makalalary gör",
    sections: "Bölümler", latest: "Soňky paýlaşylanlar", all: "Hemmesi", allCountries: "Ähli ýurtlar",
    search: "Gözle...", proverbDay: "Günüň nakyly", formTitle: "Täze bilim paýlaş",
    fTitle: "Sözbaşy", fCategory: "Ugur", fCountry: "Ýurduňyz",
    fBody: "Bilim, tejribe ýa-da açyş barada ýazyň", fProverb: "Temä laýyk nakyl",
    fProverbHint: "Mysal üçin: Bilim — tükenmez hazyna.", publish: "Paýlaş", cancel: "Ýatyr",
    loginFirst: "Paýlaşmak üçin Google arkaly giriň", empty: "Häzirlikçe bu ýerde hiç zat ýok. Ilkinji bolup paýlaşyň!",
    statPosts: "paýlaşym", statMembers: "agza", statCountries: "ýurt",
    demoNote: "Synag tertibi: maglumatlar diňe brauzeriňizde saklanýar.",
    footer: "Türki halklaryň ýaşlary üçin açyk bilim meýdançasy", deleteBtn: "Poz",
    fill: "Ähli meýdançalary dolduryň", done: "Bilimiňiz paýlaşyldy!", proverbLabel: "Nakyl",
    cat: { food: "Azyk senagaty", metal: "Metallurgiýa", discovery: "Açyşlar", tech: "IT we tehnologiýa", agri: "Oba hojalygy", medicine: "Lukmançylyk", energy: "Energetika", textile: "Dokma senagaty", culture: "Medeniýet we taryh" },
    country: { uz: "Özbegistan", tr: "Türkiýe", kz: "Gazagystan", az: "Azerbaýjan", kg: "Gyrgyzystan", tm: "Türkmenistan" },
  },
};

// Qo'shimcha matnlar (ro'yxatdan o'tish oynasi, tarjima)
const EXTRA = {
  uz: { gateSub: "Boshlash uchun Google hisobingiz orqali ro‘yxatdan o‘ting", signup: "Google orqali ro‘yxatdan o‘tish", gateNote: "Bir bosishda — parolsiz va xavfsiz", f1: "6 tilda", f2: "9 yo‘nalish", f3: "Maqollar bilan", translated: "Avtomatik tarjima", original: "Asl nusxani ko‘rish", showTr: "Tarjimani ko‘rish", demoLogin: "Google kirish hali sozlanmagan — namuna rejimida kirdingiz", welcome: "Xush kelibsiz", origLabel: "Asli", team: "TürkBilim jamoasi" },
  tr: { gateSub: "Başlamak için Google hesabınızla kaydolun", signup: "Google ile kaydol", gateNote: "Tek tıkla — şifresiz ve güvenli", f1: "6 dilde", f2: "9 alan", f3: "Atasözleriyle", translated: "Otomatik çeviri", original: "Orijinalini gör", showTr: "Çeviriyi gör", demoLogin: "Google girişi henüz ayarlanmadı — deneme modunda girdiniz", welcome: "Hoş geldiniz", origLabel: "Aslı", team: "TürkBilim ekibi" },
  az: { gateSub: "Başlamaq üçün Google hesabınızla qeydiyyatdan keçin", signup: "Google ilə qeydiyyat", gateNote: "Bir kliklə — parolsuz və təhlükəsiz", f1: "6 dildə", f2: "9 sahə", f3: "Atalar sözləri ilə", translated: "Avtomatik tərcümə", original: "Orijinala bax", showTr: "Tərcüməyə bax", demoLogin: "Google girişi hələ qurulmayıb — sınaq rejimində daxil oldunuz", welcome: "Xoş gəlmisiniz", origLabel: "Əsli", team: "TürkBilim komandası" },
  kk: { gateSub: "Бастау үшін Google аккаунтыңыз арқылы тіркеліңіз", signup: "Google арқылы тіркелу", gateNote: "Бір басуда — құпиясөзсіз әрі қауіпсіз", f1: "6 тілде", f2: "9 сала", f3: "Мақалдармен", translated: "Автоматты аударма", original: "Түпнұсқаны көру", showTr: "Аударманы көру", demoLogin: "Google кіру әлі бапталмаған — сынақ режимінде кірдіңіз", welcome: "Қош келдіңіз", origLabel: "Түпнұсқасы", team: "TürkBilim командасы" },
  ky: { gateSub: "Баштоо үчүн Google аккаунтуңуз аркылуу катталыңыз", signup: "Google аркылуу катталуу", gateNote: "Бир басуу менен — сырсөзсүз жана коопсуз", f1: "6 тилде", f2: "9 тармак", f3: "Макалдар менен", translated: "Автоматтык котормо", original: "Түп нускасын көрүү", showTr: "Котормону көрүү", demoLogin: "Google кирүү азырынча жөндөлгөн эмес — сыноо режиминде кирдиңиз", welcome: "Кош келиңиз", origLabel: "Түп нускасы", team: "TürkBilim командасы" },
  tk: { gateSub: "Başlamak üçin Google hasabyňyz arkaly hasaba duruň", signup: "Google arkaly hasaba dur", gateNote: "Bir basyşda — açarsözsiz we howpsuz", f1: "6 dilde", f2: "9 ugur", f3: "Nakyllar bilen", translated: "Awtomatik terjime", original: "Aslyny gör", showTr: "Terjimäni gör", demoLogin: "Google girişi heniz sazlanmady — synag tertibinde girdiňiz", welcome: "Hoş geldiňiz", origLabel: "Asly", team: "TürkBilim topary" },
};
for (const [l, v] of Object.entries(EXTRA)) Object.assign(T[l], v);
