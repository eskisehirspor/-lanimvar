# App Store / Google Play yayın kontrol listesi

Bu liste, Apple’ın en sık reddettiği konulara göre hazırlandı. Kodda yapılmış olanlar ✅,
senin hesaplarında yapman gerekenler ☐ ile işaretli.

## 1. Kodda hazır olanlar

| Konu | Apple kuralı | Durum |
|---|---|---|
| Uygulama içinden hesap silme | 5.1.1(v) | ✅ Profil › Hesabımı sil (Edge Function `delete-account`) |
| Google girişi varsa Apple ile giriş de olmalı | 4.8 | ✅ iOS’ta yerel Apple düğmesi (HIG uyumlu) |
| Kullanıcı içeriği: şikayet et + engelle + moderasyon | 1.2 | ✅ Her görev ekranında ⋯ menüsü, yönetim panelinde vaka kuyruğu |
| Kullanım koşulları ve gizlilik politikası | 5.1.1 | ✅ Giriş ekranında ve profilde, `/legal/*` |
| İzin metinleri açık ve Türkçe | 5.1.1 | ✅ Konum (yalnızca uygulama açıkken), kamera, galeri |
| Arka plan konum yok | 2.5.4 | ✅ Hiçbir yerde istenmiyor; Android’de izin engellendi |
| Mikrofon izni istenmiyor | 5.1.1 | ✅ Kapalı |
| Privacy manifest (PrivacyInfo.xcprivacy) | — | ✅ `app.config.ts › ios.privacyManifests`, izleme yok |
| Şifreleme beyanı | Export compliance | ✅ `ITSAppUsesNonExemptEncryption: false` |
| Fiziksel hizmet: uygulama içi satın alma gerekmez | 3.1.3(e) | ✅ Ödeme elden, uygulama dışında |
| Tasarım laboratuvarı ve demo düğmeleri üretimde yok | 2.1 / 2.3 | ✅ Lab yalnızca geliştirme derlemesinde |
| Sadece iPhone (iPad ekran görüntüsü gerekmez) | — | ✅ `supportsTablet: false` |
| Acil durum: 112’yi ara | — | ✅ Telefonun kendi aramasıyla |

## 2. Senin yapman gerekenler

- ☐ Apple Developer Program üyeliği (yıllık 99 USD) — mümkünse **şirket** hesabı (D-U-N-S numarası gerekir). Bireysel hesapla açılırsa mağazada satıcı olarak kendi adın görünür.
- ☐ App Store Connect’te uygulamayı oluştur: Bundle ID `app.ilanimvar`, birincil dil Türkçe, kategori **Yaşam Tarzı** (ikincil: Yardımcı Programlar), yaş sınırı 17+ değil, **4+** (anket cevaplarına göre).
- ☐ Sign in with Apple: Apple Developer › Identifiers’da “Sign in with Apple” yeteneğini aç; web/Android için bir **Services ID** ve anahtar oluşturup Supabase › Auth › Providers › Apple’a gir.
- ☐ Google Cloud’da OAuth istemcileri (Web, iOS, Android) oluşturup Supabase › Auth › Providers › Google’a gir.
- ☐ SMS sağlayıcısı (Twilio, Vonage veya MessageBird) hesabı açıp Supabase › Auth › Phone’a gir. Türkiye’ye SMS için gönderici adı (alfanumerik) onayı gerekebilir.
- ☐ Supabase › Auth › Phone › **Test OTP**: `905550000001=123456` (müşteri), `905550000002=123456` (görevli) ekle. Apple inceleme ekibi bu numaralarla girer.
- ☐ `npx eas-cli@latest init` ile EAS projesi oluştur, çıkan `projectId`’yi `EAS_PROJECT_ID` olarak ayarla (push bildirimleri için şart).
- ☐ Destek e-postası ve web sitesinde barınan gizlilik politikası URL’si (yönetim paneli web’de yayınlanınca `https://<alan-adın>/legal/policy` olarak hazır).
- ☐ Ekran görüntüleri: 6.9" iPhone için en az 3 adet (1320×2868). Google Play için telefon ekran görüntüleri + 1024×500 tanıtım görseli.
- ☐ Marka kararı kesinleşince uygulama ikonu (1024×1024, saydamlık yok).

## 3. App Privacy (“Gizlilik Etiketleri”) cevapları

| Veri | Toplanıyor mu | Kullanıcıya bağlı | İzleme |
|---|---|---|---|
| Ad | Evet (Uygulama işlevi) | Evet | Hayır |
| Telefon numarası | Evet (Uygulama işlevi, hesap) | Evet | Hayır |
| E-posta (Apple/Google girişi) | Evet (hesap) | Evet | Hayır |
| Hassas olmayan konum (yaklaşık) | Evet (Uygulama işlevi) | Evet | Hayır |
| Kesin konum | Evet (görevli varış kaydı, ilan adresi) | Evet | Hayır |
| Fotoğraflar | Evet (teslim kanıtı) | Evet | Hayır |
| Kullanıcı içeriği (ilan metni, değerlendirme, şikayet) | Evet | Evet | Hayır |
| Tanımlayıcılar (cihaz/bildirim belirteci) | Evet (Uygulama işlevi) | Evet | Hayır |
| Reklam verisi, satın almalar, sağlık, kişiler | Hayır | — | — |

## 4. İnceleme notu (App Review Information › Notes)

```
İlanım Var, Eskişehir'de günlük işler (eşya taşıma, montaj, alışveriş) için
müşterileri yakındaki görevlilerle eşleştiren bir aracı platformdur. Hizmet
fiziksel olarak, uygulama dışında verilir ve ödeme iş bitince elden yapılır
(Guideline 3.1.3(e)).

Demo hesaplar (SMS kodu her zaman 123456):
  Müşteri: +90 555 000 00 01
  Görevli: +90 555 000 00 02 (onaylı)

Deneme akışı: Görevli hesabıyla "İş almaya başla"yı açın; ikinci bir cihazda
müşteri hesabıyla "Ne yaptırmak istiyorsun?" ile iş verin. Teklif görevliye
düşer, kaydırarak kabul edilir; müşteri kapıda söylemesi gereken 6 haneli kodu
görür, görevli kodu girince iş başlar.

Hesap silme: Profil > Hesabımı sil. Şikayet/engelleme: görev ekranındaki ⋯ menüsü.
Konum yalnızca uygulama açıkken kullanılır; arka plan konumu istenmez.
```

## 5. Derleme ve gönderim

```bash
npx eas-cli@latest build --profile production --platform ios
npx eas-cli@latest submit --profile production --platform ios
# Android
npx eas-cli@latest build --profile production --platform android
```

Gönderimden önce: `npm run typecheck && npm run lint && npm test && npm run db:check`.
