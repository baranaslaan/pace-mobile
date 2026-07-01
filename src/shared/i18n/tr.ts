/* Türkçe metin kataloğu. Anahtar yapısı en.ts ile birebir aynı olmalı. */

export const tr = {
  common: {
    start: "Başla",
    continue: "Devam",
    finish: "Bitir",
    cancel: "Vazgeç",
    reset: "Sıfırla",
    // Yüzde biçimi — TR önek (%23), EN sonek (23%).
    pct: "%{n}",
  },

  tone: {
    good: "iyi gidiyor",
    warn: "dikkatli ol",
    crit: "kritik",
    over: "limit aşıldı",
    neutral: "kurulum gerekli",
  },

  error: {
    title: "Bir şeyler ters gitti",
    body: "Beklenmedik bir hata oluştu. Tekrar deneyebilirsin.",
    retry: "Tekrar dene",
  },

  menu: {
    today: "Bugünün harcamaları",
    budget: "Bütçe & Giderler",
    pace: "Tempo",
    recurring: "Tekrarlayanlar",
    settings: "Ayarlar",
    proSub: "Tempo + dışa aktarma",
  },

  recurring: {
    title: "Tekrarlayanlar",
    quickSection: "Hızlı ekleme",
    quickHint: "Tek dokunuşla eklemek için sık harcamalarını kaydet.",
    quickEmpty: "Henüz şablon yok. Kahve, öğle yemeği, market…",
    scheduledSection: "Zamanlanmış",
    scheduledHint: "Vakti gelince o günün harcaması olarak eklenir — sabit gider gibi baştan düşülmez.",
    scheduledEmpty: "Henüz zamanlanmış harcama yok. Kira, spor salonu…",
    name: "Ne için?",
    weekly: "Haftalık",
    monthly: "Aylık",
    weeklySummary: "Haftalık · {day}",
    monthlySummary: "Aylık · {day}. gün",
    dayOfMonth: "Ayın günü",
    quickProTitle: "Sınırsız hızlı şablon Pace Pro'da",
    quickProText: "Ücretsiz planda en fazla {n} hızlı şablon. Pro ile sınırsızca ekle — tek seferlik, ömür boyu.",
    proTitle: "Otomatik harcamalar Pace Pro'da",
    proText: "Kira, abonelik, spor salonu… vadesi gelince kendiliğinden eklensin. Tek seferlik ödeme, ömür boyu.",
    goPro: "Pace Pro'ya geç",
  },

  welcome: {
    title: "Günlük harcama\ntempona hâkim ol.",
    subtitle:
      "Bütçeni ve sabit giderlerini bir kez gir; pace her gün ne kadar harcayabileceğini senin için hesaplasın.",
  },

  budgetStep: {
    title: "Bu ay ne kadar bütçen var?",
    hint: "Bu ay harcamak için ayırdığın net tutar.",
  },

  subsStep: {
    title: "Sabit giderlerin var mı?",
    hint: "Kira, abonelik, kredi… Bütçenden peşin ayrılır, boş da geçebilirsin.",
    whatFor: "Ne için?",
    limitNote: "Ücretsiz planda en fazla {n} sabit gider. Pro ile sınırsız.",
  },

  recap: {
    title: "Her şey hazır.",
    hint: "Bugünden itibaren günlük limitin:",
    perDay: "/gün",
    proratedNote: "Bu ay kalan {days} güne bölündü. Gelecek ay tüm aya yayılır.",
    point1: "Her gün ne kadar harcayabileceğini tek bakışta gör.",
    point2: "Harcadıkça düşer; az harcadığın gün yarına artar.",
    point3: "Sabit giderlerin baştan ayrıldı, günlük hesaba karışmaz.",
    point4: "Limiti aşarsan ekran kırmızıya döner ve seni uyarır.",
    point5: "Harcamalarını kategorilere ayır, dağılımı tempoda gör.",
    point6: "Sık ve düzenli harcamaları tek dokunuşla ya da otomatik ekle.",
  },

  features: {
    title: "Bir de şunlar var",
    subtitle: "Pace'i sana göre ayarlayan birkaç şey daha.",
    categoriesTitle: "Kategoriler",
    categoriesDesc: "Her harcamayı etiketle; nereye gittiğini tempoda gör.",
    recurringTitle: "Tekrarlayanlar",
    recurringDesc: "Sık harcamalar için şablon, düzenli olanlar için otomatik kayıt.",
    localeTitle: "Dil & para birimi",
    localeDesc: "Türkçe/İngilizce ve istediğin para birimi — istediğin an değiştir.",
  },

  board: {
    setupOverTitle: "Sabit giderlerin bütçeni aşıyor",
    setupBudgetTitle: "Aylık bütçeni belirle",
    setupOverText:
      "Giderlerin ({subs}) bütçenden ({budget}) fazla. Günlük limit hesaplanamıyor — bütçeni artır ya da gideri azalt.",
    setupBudgetText:
      "Bütçeni girince günlük harcama limitin otomatik hesaplanır.",
    hint: "••• → Bütçe & Giderler",
    spent: "harcanan",
    limit: "limit",
    rolloverTip:
      "Limitin her gün yeniden hesaplanır: az harcadığın gün artar, çok harcadığın gün kısılır. Dokun, anladım.",
    firstExpenseTip:
      "İlk harcamanı aşağıdaki kutudan ekle — tutarı yaz, bitti.",
  },

  ring: {
    left: "kalan",
    perDay: "/ gün",
  },

  input: {
    prompt: "Bugün ne harcadın?",
    notePlaceholder: "Not ekle (opsiyonel)",
  },

  history: {
    title: "Bugünün harcamaları",
    summaryTotal: "Bugün toplam",
    items: "{n} kalem",
    empty: "Bugün henüz harcama yok. Ana ekrandan tutar girince burada görünür.",
    resetToday: "Bugünü sıfırla",
    confirmReset: "Bugünün tüm kalemleri silinsin mi?",
  },

  entry: {
    notePlaceholder: "Not ekle",
  },

  subs: {
    title: "Bütçe & Giderler",
    daily: "Günlük limitin",
    reserved: "rezerve",
    listLabel: "Sabit giderler",
    empty: "Henüz sabit gider yok. Kira, abonelik, kredi…",
    proTitle: "Sınırsız sabit gider Pace Pro'da",
    proText: "Ücretsiz planda en fazla {n} sabit gider. Pro ile sınırsızca ekle — tek seferlik, ömür boyu.",
    goPro: "Pace Pro'ya geç",
    whatFor: "Ne için?",
  },

  budgetField: {
    label: "Aylık bütçe",
  },

  analytics: {
    title: "Tempo",
    spent: "harcanan",
    dailyAvg: "günlük ort.",
    pool: "havuz",
    weeklyPace: "Haftalık tempo",
    last7: "son 7 gün",
    trendNoData: "Geçen hafta veri yok — kıyas için bir hafta gerek.",
    trendDown: "Geçen haftaya göre %{pct} daha az harcadın. Tempon yavaşlıyor 👏",
    trendUp: "Geçen haftaya göre %{pct} daha fazla harcadın. Tempona dikkat.",
    forecastTitle: "Ay sonu öngörüsü",
    forecastNone: "Henüz harcama yok — tempon belirlenmedi.",
    forecastSurplus: "Bu hızla ay sonunda elinde {balance} kalır.",
    forecastDeficit: "Dikkat — bu hızla ayın {day}'inde bütçen biter.",
    forecastSub: "Tahmini ay sonu harcama {projected} / havuz {pool}",
    recentDays: "Son günler",
    today: "Bugün",
    weekdays: "Haftanın günleri",
    weekNote: "En çok {day} günleri harcıyorsun · ort {avg}",
    weekNoData: "Haftanın günü dağılımı için biraz daha veri gerek.",
    streak: "Disiplin serisi",
    streakCurrent: "şu an",
    streakBest: "en iyi",
    streakDaysLabel: "gün",
    streakNote: "Günlük {target} hedefinin altında kaldığın ardışık günler.",
    biggest: "En büyük harcamalar",
    categories: "Kategori dağılımı",
    pastMonths: "Geçmiş aylar",
    lockTitle: "Tempo analizi Pace Pro'da",
    lockText:
      "Ay sonu tahminini ve geçmiş harcama dökümünü gör. Tek seferlik ödeme, ömür boyu.",
    goPro: "Pace Pro'ya geç",
  },

  settings: {
    title: "Ayarlar",
    proActive: "Pace Pro aktif",
    proActiveSub: "Tüm özellikler açık · ömür boyu",
    proIdleSub: "Tempo analizi ve fazlası · tek seferlik",
    go: "Geç",
    notifications: "Bildirimler",
    dailyReminder: "Günlük hatırlatma",
    everyDayAt: "Her gün {time}",
    off: "Kapalı",
    permTitle: "Bildirim izni kapalı",
    permBody:
      "Hatırlatma için telefon Ayarlar → Bildirimler → pace'ten izin vermen gerekiyor.",
    budget: "Bütçe",
    budgetRow: "Bütçe & sabit giderler",
    budgetSub: "Aylık {budget} · {n} sabit gider",
    currency: "Para birimi",
    language: "Dil",
    data: "Veri",
    export: "Harcamaları dışa aktar",
    exportPreparing: "Hazırlanıyor…",
    exportSub: "CSV olarak paylaş (Excel, Numbers…)",
    noDataTitle: "Dışa aktarılacak veri yok",
    noDataBody: "Önce birkaç harcama gir.",
    exportFailTitle: "Dışa aktarma başarısız",
    exportFailBody: "Bir şeyler ters gitti, tekrar dene.",
    backup: "Yedek al",
    backupPreparing: "Hazırlanıyor…",
    backupSub: "Tüm verini tek dosyaya kaydet (.json)",
    backupNoDataTitle: "Yedeklenecek veri yok",
    backupNoDataBody: "Önce kurulumu tamamla.",
    backupFailTitle: "Yedekleme başarısız",
    backupFailBody: "Bir şeyler ters gitti, tekrar dene.",
    dataRestore: "Yedekten geri yükle",
    dataRestoreSub: "Önceki bir .json yedeğini içe aktar",
    restoreConfirmTitle: "Yedekten geri yükle?",
    restoreConfirmBody:
      "Şu anki tüm verinin (bütçe, harcamalar, sabit giderler) yerine yedekteki veri yüklenir. Bu işlem geri alınamaz.",
    restoreConfirmCta: "Geri yükle",
    restoreSuccessTitle: "Geri yüklendi",
    restoreSuccessBody: "Verin yedekten başarıyla yüklendi.",
    restoreFailTitle: "Geri yükleme başarısız",
    restoreFailBody: "Dosya okunamadı veya geçerli bir pace yedeği değil.",
    resetAll: "Tüm veriyi sıfırla",
    confirmResetText:
      "Bütçe, sabit giderler ve tüm harcamalar silinir; kurulum baştan başlar. Pro hakkın korunur.",
    dev: "Geliştirici",
    devPro: "Pace Pro (test)",
    devProSub: "Şu an: {state} — dokun değiştir",
    stateOn: "açık",
    stateOff: "kapalı",
    testNotif: "Test bildirimi gönder",
    testNotifSub: "5 sn sonra tek seferlik bildirim",
    testSentTitle: "Gönderildi",
    testSentBody:
      "5 saniye içinde bildirim gelecek (uygulamayı arka plana al).",
    testPermBody: "Önce bildirim izni ver.",
    account: "Hesap",
    restore: "Satın almaları geri yükle",
    restoreSub: "Daha önce Pro aldıysan buradan geri yükle",
    restoring: "Geri yükleniyor…",
    restoreNoneTitle: "Satın alma bulunamadı",
    restoreNoneBody:
      "Bu Apple kimliğinde geri yüklenecek bir Pace Pro satın alması yok.",
    restoredTitle: "Pace Pro geri yüklendi 🎉",
    restoredBody: "Tüm Pro özellikleri tekrar açık.",
    legal: "Yasal",
    privacy: "Gizlilik Politikası",
    terms: "Kullanım Şartları",
    version: "pace · sürüm {version}",
  },

  paywall: {
    title: "Pace Pro",
    activeTitle: "Pace Pro aktif 🎉",
    activeSub: "Tüm tempo özellikleri açık. İyi harcamalar.",
    headline: "Tempona hâkim ol",
    sub: "Ömür boyu tek ödeme ya da yıllık — sana uygun olanı seç.",
    benefit1: "Ay sonu öngörüsü & tempo trendleri",
    benefit2: "Kategori dağılımı & geçmiş ay dökümü",
    benefit3: "Zamanlanmış otomatik harcamalar",
    benefit4: "Sınırsız sabit gider + CSV dışa aktarma",
    benefit5: "Gelecekteki tüm Pro özellikleri",
    lifetime: "Ömür boyu",
    lifetimeNote: "tek seferlik ödeme",
    annual: "Yıllık",
    annualNote: "yılda bir yenilenir",
    bestValue: "En avantajlı",
    founderBadge: "Kurucu fiyatı",
    launchNote: "İlklere özel — kısa süreliğine senin fiyatın",
    processing: "İşleniyor…",
    buy: "Pace Pro'yu aç · {price}",
    terms: "Kullanım Şartları",
    privacy: "Gizlilik",
    fine: "Yıllık plan, dönem bitmeden en az 24 saat önce kapatılmazsa otomatik yenilenir ve ücret App Store hesabından tahsil edilir. Ömür boyu plan tek seferlik ödemedir. İstediğin zaman App Store ayarlarından yönetebilir veya iptal edebilirsin.",
  },

  notif: {
    title: "pace",
    body: "Bugün ne harcadın? Günlük tempona bir bak.",
    testBody: "Test bildirimi — her şey çalışıyor 👍",
  },

  csv: {
    date: "Tarih",
    time: "Saat",
    category: "Kategori",
    amount: "Tutar",
    note: "Not",
  },

  currency: {
    TRY: "Türk Lirası",
    USD: "ABD Doları",
    EUR: "Euro",
    GBP: "Sterlin",
  },

  category: {
    market: "Market",
    yemek: "Yemek",
    ulasim: "Ulaşım",
    kahve: "Kahve",
    eglence: "Eğlence",
    fatura: "Fatura",
    saglik: "Sağlık",
    diger: "Diğer",
  },

  months: [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ],
  // JS getDay sırası: 0=Pazar … 6=Cumartesi
  weekdaysShort: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  weekdaysFull: [
    "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi",
  ],
};

export type Catalog = typeof tr;
