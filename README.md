# pace · mobile

> Günlük harcama **tempona** hâkim ol. Aylık bütçeni ve sabit giderlerini bir kez gir; pace her gün ne kadar harcayabileceğini senin için hesaplasın.

**pace**, kalan harcanabilir paranı ayın kalan günlerine bölerek sana tek bir sayı veren bir günlük bütçe uygulamasıdır: _bugün ne kadar harcayabilirsin._ Az harcadığın gün pay yarına büyür, çok harcadığın gün sıkışır — ekran rengi tempona göre maviden kırmızıya döner.

Bu repo, [Next.js ile yazılmış web sürümünün](https://github.com/baranaslaan/pace-app) **React Native (Expo)** portudur. Aynı ürün, native cihaz deneyimi.

---

## 📱 Özellikler

- **Onboarding akışı** — karşılama → bütçe → sabit giderler → özet, adım adım.
- **Limit halkası** — kalan günlük tutarı animasyonlu bir ring ile gösterir; tempo durumuna göre renk değiştirir (iyi · dikkat · kritik · aşıldı).
- **Hızlı harcama girişi** — tek dokunuşla tutar + opsiyonel not.
- **Geçmiş** — günün kalemlerini düzenle, sil, bugünü sıfırla.
- **Bütçe & Sabit Giderler** — kira/abonelik gibi giderleri peşin rezerve et.
- **Tempo (Analytics)** — harcama dağılımı ve aylık projeksiyon.
- **Tam rollover motoru** — günlük limit türetilen bir değerdir; her gün yeniden hesaplanır.

## 🧮 Çekirdek mantık

Hesap motoru ([`src/shared/lib/engine.ts`](src/shared/lib/engine.ts)) store'dan bağımsız, saf ve test edilebilir:

```
harcanabilir = aylık bütçe − sabit giderler − bu ay şimdiye dek harcanan
günlük limit = harcanabilir ÷ ayın kalan günü (bugün dahil)
```

Dün az harcandıysa pay büyür (ödül), aşıldıysa küçülür (sıkılaşma).

## 🛠 Teknoloji

| Katman | Araç |
|---|---|
| Framework | Expo SDK 56 · React Native 0.85 · React 19 |
| Yönlendirme | expo-router (file-based) |
| Animasyon | Reanimated 4 · Moti |
| State | Zustand + persist |
| Kalıcılık | react-native-mmkv |
| Grafik | react-native-svg |
| Tipografi | Outfit (`@expo-google-fonts`) |

## 🏗 Mimari

Feature-based klasör yapısı:

```
src/
├── app/              # expo-router ekranları (index, _layout)
├── features/         # her özellik kendi components/hooks/ ile
│   ├── onboarding/
│   ├── limit-board/
│   ├── expense-input/
│   ├── expense-history/
│   ├── subscriptions/
│   ├── analytics/
│   ├── menu/
│   ├── splash/
│   └── pro/
└── shared/           # ortak çekirdek
    ├── lib/          # engine, tone, date — saf mantık
    ├── store/        # zustand + mmkv
    ├── styles/       # design tokens (theme.ts)
    ├── typography/   # Outfit ağırlık eşlemeli Text, Logo
    └── ui/           # BottomSheet, icons
```

`shared/styles/theme.ts` tek doğruluk kaynağı: renkler, boşluk ölçeği, köşe yarıçapları ve Outfit ağırlıkları.

## 🚀 Çalıştırma

```bash
npm install
npx expo prebuild        # native ios/android klasörlerini üretir (repoda yok)
npx expo run:ios         # veya: npx expo run:android
```

Geliştirme için Metro yeterli:

```bash
npx expo start
```

> Native klasörler (`ios/`, `android/`) Expo CNG yaklaşımıyla repoda tutulmaz; `app.json`'dan `prebuild` ile yeniden üretilir.

## 📄 Lisans

© 2026 Baran Aslan — **Tüm hakları saklıdır.** Bu repo yalnızca portfolyo/gösterim
amacıyla herkese açıktır. Kod görüntülenebilir ancak izinsiz kullanılamaz,
kopyalanamaz veya türev çalışma oluşturulamaz. Ayrıntılar için [LICENSE](LICENSE).
