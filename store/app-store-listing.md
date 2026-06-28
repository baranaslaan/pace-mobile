# Pace — App Store Listing Paketi

App Store Connect'e girilecek tüm metinler + görsel planı. TR birincil (tr-TR),
EN ikincil (en-US). Apple gönderiminde alan başlıkları birebir bunlar.

> ⚠️ Karakter limitleri Apple'a göre: App Name **30**, Subtitle **30**,
> Promotional Text **170**, Keywords **100** (virgülle ayrık, boşluk sayılır),
> Description **4000**. Aşağıdaki sayılar kontrol edilmiştir.

---

## 1. Kategori & temel ayarlar

| Alan | Değer |
|---|---|
| Primary Category | Finance |
| Secondary Category | Productivity |
| Age Rating | 4+ |
| Price | Free (Pro: IAP) |
| Bundle ID | com.baranaslan.pace-mobile |

---

## 2. Türkçe (tr-TR) — birincil

### App Name (≤30)
**Pace: Günlük Bütçe & Harcama**  · (28)

### Subtitle (≤30)
**Bütçeni güne böl, taşma**  · (23)

### Promotional Text (≤170) — yayın sonrası değiştirilebilir, inceleme gerektirmez
Lansman fiyatı: Pace Pro ömür boyu ₺499 yerine ₺399. İlklere özel, kısa süreliğine. Bütçeni bir kez gir, her gün ne kadar harcayabileceğini pace söylesin.

### Keywords (≤100, virgülle ayrık, boşluk YOK)
`bütçe,harcama,takibi,para,gider,tasarruf,bütçe takip,harcama takip,günlük,limit,abonelik,finans,cüzdan`
· (99)

### Description (≤4000)
```
Bütçeni ve sabit giderlerini bir kez gir; pace her gün ne kadar
harcayabileceğini senin için hesaplasın. Karmaşık tablo yok, banka
bağlama yok, hesap açma yok. Sadece sen ve günlük temponu.

NASIL ÇALIŞIR
• Aylık bütçeni gir.
• Kira, abonelik, kredi gibi sabit giderlerini bir kez ekle — peşin
  ayrılır.
• Kalan para, ayın günlerine bölünür: bugünkü harcanabilir limitin.
• Az harcadığın gün, fazlası yarına devreder. Aştığın gün, limit
  kendini sıkar. Tempon her gün kendini ayarlar.

NEDEN PACE
• Ferah ve sakin tasarım — tek bakışta bugünkü durumun.
• Tek dokunuşla harcama ekle, kategorile.
• Verin telefonunda kalır. Hesap yok, reklam yok, takip yok.
• Türkçe ve İngilizce. Birden çok para birimi.

ÜCRETSİZ
• Günlük limit + akıllı devir
• Sınırsız harcama girişi
• 3 sabit gidere kadar
• Hızlı ekleme şablonları
• Yedekle & geri yükle (verini tek dosyaya al, kaybetme)

PACE PRO
• Ay sonu öngörüsü & tempo trendleri
• Kategori dağılımı & geçmiş ay dökümü
• Zamanlanmış otomatik harcamalar
• Sınırsız sabit gider + CSV dışa aktarma
• Gelecekteki tüm Pro özellikleri

Ömür boyu tek ödeme ya da yıllık — sana uygun olanı seç. Lansmana
özel kurucu fiyatıyla.

Tempona hâkim ol. Pace.
```

### What's New (sürüm notu — ilk sürüm)
```
Pace ile tanış. Bütçeni bir kez gir, her gün ne kadar
harcayabileceğini pace hesaplasın.

• Günlük limit + akıllı devir
• Tek dokunuşla harcama
• Sabit giderler & tekrarlayanlar
• Yedekle & geri yükle
• Türkçe/İngilizce, çoklu para birimi
```

---

## 3. English (en-US) — ikincil

### App Name (≤30)
**Pace: Daily Budget & Spending** · (29)

### Subtitle (≤30)
**Split your budget by day** · (25)

### Promotional Text (≤170)
Launch price: Pace Pro lifetime ₺399 instead of ₺499 — for the first few, for a little while. Set your budget once and let pace tell you what you can spend today.

### Keywords (≤100)
`budget,expense,tracker,spending,money,save,daily,limit,subscription,finance,wallet,manual,no bank`
· (96)

### Description (≤4000)
```
Set your budget and fixed costs once; let pace work out how much you
can spend each day. No spreadsheets, no bank linking, no account.
Just you and your daily pace.

HOW IT WORKS
• Enter your monthly budget.
• Add fixed costs once — rent, subscriptions, loans. They're set
  aside up front.
• What's left is split across the days of the month: today's
  spendable limit.
• Spend less today and the surplus rolls to tomorrow. Go over and
  the limit tightens. Your pace adjusts itself every day.

WHY PACE
• Calm, spacious design — today's status at a glance.
• Add and categorize an expense in one tap.
• Your data stays on your phone. No account, no ads, no tracking.
• Turkish and English. Multiple currencies.

FREE
• Daily limit + smart rollover
• Unlimited expense entries
• Up to 3 fixed costs
• Quick-add templates
• Backup & restore (export your data to one file)

PACE PRO
• Month-end forecast & pace trends
• Category breakdown & past-month recaps
• Scheduled automatic expenses
• Unlimited fixed costs + CSV export
• All future Pro features

One-time lifetime or yearly — pick what fits. With a launch founder
price.

Master your pace. Pace.
```

### What's New
```
Meet Pace. Set your budget once and let pace work out what you can
spend each day.

• Daily limit + smart rollover
• One-tap expenses
• Fixed costs & recurring
• Backup & restore
• Turkish/English, multiple currencies
```

---

## 4. App Privacy (Nutrition Label) — KRİTİK

Mevcut sürümde (RevenueCat YOK): **Data Not Collected.**

Gerekçe: hesap yok, analytics SDK yok, crash raporlama yok. Tüm veri cihazda
(MMKV). Kur çekme API'si yalnızca FX oranı ister; kişisel veri göndermez →
Apple anlamında "veri toplama" değil.

App Store Connect → App Privacy → **"No, we do not collect data from this app."**

> ⚠️ RevenueCat eklenince GÜNCELLENECEK: Purchases + Identifiers (app user id)
> "toplanır" olur, "App Functionality" amacıyla, kullanıcıya **bağlı**. Yayından
> önce RevenueCat girerse privacy label'ı buna göre doldur. Bkz. monetizasyon notu.

---

## 5. URL'ler

| Alan | Değer |
|---|---|
| Privacy Policy URL | https://baranaslaan.github.io/pace-mobile/privacy.html |
| Support URL | https://baranaslaan.github.io/pace-mobile/support.html ✓ |
| Marketing URL (ops.) | https://baranaslaan.github.io/pace-mobile/ |

> ✓ **Support URL hazır** — `docs/support.html` eklendi (iletişim + SSS, çift
> dilli, privacy/terms ile aynı stil). index.html'e link de eklendi. Push'tan
> sonra GitHub Pages'te canlı olacak.

---

## 6. Ekran görüntüsü planı

Gerekli boyut: **6.9" (1320×2868)** zorunlu. İyi olur: 6.5" (1242×2688).
iPad göndermiyorsan iPhone-only yeterli. 5–7 kare, her birinde kısa başlık
(görselin üstüne bindirilmiş, telefon mockup içinde — design taste'e uygun:
sade, ferah, koyu zemin).

| # | Ekran | Üst başlık (TR) | Caption (EN) |
|---|---|---|---|
| 1 | Ring / ana ekran (sağlıklı yeşil) | "Bugün ne kadar harcayabilirsin?" | "How much can you spend today?" |
| 2 | Harcama girişi + kategoriler | "Tek dokunuşla ekle, kategorile" | "Add & categorize in one tap" |
| 3 | Bütçe + sabit gider kurulumu | "Bir kez gir, gerisini pace yapsın" | "Set it once, pace does the rest" |
| 4 | Analytics (Pro) — forecast/trend | "Ay sonunu önceden gör" | "See month-end before it comes" |
| 5 | Tekrarlayanlar | "Tekrarlayanları otomatikleştir" | "Automate the recurring stuff" |
| 6 | Gizlilik vurgusu | "Verin telefonunda. Hesap yok." | "Your data stays on device" |

> İpucu: kareleri gerçek cihazdan (sağlıklı veri girilmiş) çek; demo verisi
> doğal görünsün. 1. kare en önemli — mağazada ilk görünen o.

---

## 7. Gönderim öncesi kontrol listesi

- [x] Support URL hazır (docs/support.html) — push'tan sonra Pages'te canlı
- [ ] Privacy/Terms URL'leri canlı ve doğru (✓ GitHub Pages)
- [ ] App Privacy: Data Not Collected (RevenueCat yoksa)
- [ ] Ekran görüntüleri 6.9" + (ops.) 6.5"
- [ ] App ikonu 1024×1024 (alfa kanalsız)
- [ ] IAP ürünleri App Store Connect'te tanımlı (RevenueCat turu)
- [ ] Demo/inceleme notu: "Tamamen yerel, hesap gerektirmez" (App Review notu)
```
