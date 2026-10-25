# Hukuki yapı — özet ve yapılacaklar

> Bu dosya ve `src/features/legal/documents.ts` içindeki metinler **taslaktır**.
> Yayından önce bir Türk avukatına (tercihen bilişim ve tüketici hukuku alanında) okutulmalıdır.

## Model: aracı platform (letgo / sahibinden / Armut yaklaşımı)

- Platform, 6563 sayılı Kanun’a göre **aracı hizmet sağlayıcı**, 5651 sayılı Kanun’a göre
  **yer sağlayıcıdır**. Hizmetin tarafı değildir.
- Hizmet sözleşmesi **doğrudan müşteri ile görevli arasında** kurulur.
- Görevli **bağımsız hizmet sağlayıcıdır**: işçi, alt işveren, temsilci değildir; vergi, SGK
  ve sigorta yükümlülükleri kendisine aittir.
- Kullanıcıların birbirine verdiği zararlardan (hasar, hırsızlık, yağma/gasp, yaralanma,
  dolandırıcılık vb.) **fiili işleyen kişi** sorumludur.
- Platform kullanıcı içeriğini kontrol etmekle yükümlü değildir (6563 m.9); hukuka aykırı
  içerikten haberdar olunca kaldırır.
- Güvenlik araçları (PIN, adres gizliliği, Güvendeyim, Sorun var, 112) **destekleyici araçtır**;
  güvenlik garantisi, sigorta veya koruma hizmeti değildir. Metinlerin hiçbir yerinde
  “güvenli”, “güvenilir” vaadi yoktur (uygulama metinleri için testler bunu denetler).
- Kullanıcı, kendi kusurlu davranışı yüzünden platformun uğradığı zararı **tazmin eder**.
- Platformun kendi kusuruna dayanan sorumluluğu son 12 ayda ödenen hizmet bedeliyle sınırlıdır.

### Neden “her şeyden sorumlu değiliz” diye mutlak yazılmadı?

Türk Borçlar Kanunu m.115 kast ve ağır kusurdan doğan sorumluluğu önceden kaldıran
anlaşmaları **kesin hükümsüz** sayar; 6502 sayılı Kanun da tüketici aleyhine haksız şartları
geçersiz kılar. Bu sınırları yok sayan bir madde mahkemede tamamen düşer ve metnin geri
kalanını da zayıflatır. Bu yüzden metin, sorumluluğu **kanunun izin verdiği en geniş ölçüde**
sınırlar ve emredici hükümleri açıkça saklı tutar. Koruyan şey kelime sertliği değil,
geçerli kalan maddelerdir.

### Seni gerçekte koruyan ürün kararları

- Hizmet sözleşmesinin taraflar arasında kurulduğunu her kullanıcı, sürüm numarasıyla
  birlikte onaylar (`profiles.legal_version`, onay zamanları).
- Görevlinin bağımsızlığı üründe de gerçek: iş kabul etme zorunluluğu yok, çevrimdışı olmak
  serbest, fiyatı müşteri önerir, ödeme platformdan geçmez.
- Her adım kayıtlı (`task_events`, `audit_log`): kim, ne zaman, nerede. Bir olayda adli
  mercilere hızla somut kayıt verebilmek sorumluluk tartışmasında en güçlü savunmadır.
- Görevliler için telefon ve kimlik kontrolü; şikayet, engelleme, askıya alma.

## Yayından önce yapılacaklar (hukuki)

- ☐ Şirket kuruluşu (şahıs şirketi veya Ltd. Şti.) ve metinlerdeki [ŞİRKET UNVANI], MERSİS,
  adres, KEP alanlarının doldurulması.
- ☐ **ETBİS** (Elektronik Ticaret Bilgi Sistemi) kaydı — aracı hizmet sağlayıcılar için zorunlu.
- ☐ KVKK: **VERBİS** kaydı gerekip gerekmediğinin kontrolü (çalışan/bilanço eşiği).
- ☐ KVKK m.9: yurt dışına aktarım (Supabase AB, Twilio, Expo, Apple, Google) için **standart
  sözleşmelerin** imzalanması ve imzadan sonra **5 iş günü içinde** Kurul’a bildirim.
- ☐ Pazarlama iletisi gönderilecekse **İYS** (İleti Yönetim Sistemi) kaydı.
- ☐ Görevli olarak çalışanların vergi mükellefiyeti konusunda bilgilendirme metni.
- ☐ Sorumluluk sigortası (platform için mesleki sorumluluk / siber sigorta) — metinler zararı
  kullanıcılara bırakır ama dava açılmasını engellemez; sigorta savunma masraflarını karşılar.
- ☐ Avukat incelemesi ve `LEGAL_VERSION` güncellemesi.
