# Pace — ekran PNG'leri (store görselleri için kaynak)

Her uygulama ekranının yüksek çözünürlüklü PNG'si. Gerçek bileşenlerden
(LimitBoard, Ring, ExpenseInput, BottomSheet, AnalyticsSheet, RecurringSheet,
SubscriptionsSheet) yeniden çizildi — gerçek tema tokenları, Outfit fontu,
renkli-nokta kategoriler, gerçek i18n metinleri.

- **Boyut:** 1872×3912 px (uygulamanın gerçek ekran oranı, @2x). Çentik/yuvarlak
  köşe yok — gerçek bir iOS ekran görüntüsü gibi tam dikdörtgen.
- **Diller:** `tr` (birincil) + `en`.

| Dosya | Ekran |
|---|---|
| `pace-{tr,en}-1_ev.png` | Ana ekran — ring + günlük limit + giriş çubuğu |
| `pace-{tr,en}-2_harcama-ekle.png` | Harcama girişi (tutar + kategori chip'leri) |
| `pace-{tr,en}-3_butce-giderler.png` | Bütçe & sabit giderler sheet'i |
| `pace-{tr,en}-4_tempo-analiz.png` | Tempo / analiz (Pro) — öngörü + trend |
| `pace-{tr,en}-5_tekrarlayanlar.png` | Tekrarlayanlar sheet'i |
| `pace-{tr,en}-6_gizlilik.png` | Gizlilik vurgusu |

## Yeniden üretmek

Kaynak: `../export.html` (ekranları hash ile çizer: `#tr-1` … `#en-6`).
Chrome headless ile:

```bash
cd store/screenshots
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# bkz. üretim döngüsü — tr+en × 6 ekran, --force-device-scale-factor=2 --window-size=936,1956
```

## Not

Bunlar gerçek bileşenlere sadık **render**'lar — gerçek cihaz yakalaması değil.
Apple gerçek ekran görüntüsü tercih eder; mümkünse simülatörden çek. Bu PNG'ler
store karelerini (`../index.html` şablonu) tasarlarken kaynak/taslak olarak kullanılır.
