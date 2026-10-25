/**
 * Legal texts (Turkish). DRAFTS prepared for review by a Turkish lawyer before
 * launch. Bracketed fields ([ŞİRKET UNVANI] …) must be filled in.
 *
 * Model: the platform is an intermediary service provider (6563 sayılı Kanun)
 * and a hosting provider (5651 sayılı Kanun). The service contract is formed
 * directly between Customer and Tasker; the platform is not a party, employer,
 * agent or guarantor. Limits that Turkish law makes mandatory (TBK m.115 —
 * intent and gross negligence; 6502 sayılı Kanun consumer rules) are preserved
 * on purpose: a clause that ignores them is void and weakens the whole text.
 *
 * Bump LEGAL_VERSION whenever a text changes: onboarding records the version
 * each person accepted (profiles.legal_version).
 */
export const LEGAL_VERSION = '2026-10-25';

export type LegalDocId = 'terms' | 'privacy' | 'consent' | 'policy' | 'tasker' | 'community';

export interface LegalSection {
  h: string;
  p: string[];
}

export interface LegalDoc {
  id: LegalDocId;
  title: string;
  intro?: string;
  sections: LegalSection[];
}

const company = '[ŞİRKET UNVANI] (MERSİS: [MERSİS NO], Adres: [ADRES], E-posta: [DESTEK E-POSTASI], KEP: [KEP ADRESİ])';

export const legalDocs: Record<LegalDocId, LegalDoc> = {
  terms: {
    id: 'terms',
    title: 'Kullanım Koşulları (Kullanıcı Sözleşmesi)',
    intro: `Bu sözleşme, ${company} (“Platform İşleteni”) ile mobil uygulamayı ve web sitesini (“Platform”) kullanan kişiler (“Kullanıcı”) arasındadır. Platform’a üye olarak ya da Platform’u kullanarak bu koşulları kabul etmiş olursun.`,
    sections: [
      {
        h: '1. Tanımlar',
        p: [
          'Müşteri: Platform’da iş ilanı veren Kullanıcı.',
          'Görevli: Platform’daki ilanları görüp kabul ederek hizmeti bizzat ve bağımsız olarak veren Kullanıcı.',
          'İlan / Görev: Müşterinin Platform’da yayımladığı, yapılmasını istediği işe ilişkin içerik.',
          'Hizmet: Görevlinin Müşteriye verdiği, ilanda tarif edilen iş. Hizmet, Platform İşleteni tarafından verilmez.',
          'Hizmet Sözleşmesi: Görevlinin ilanı kabul etmesiyle Müşteri ile Görevli arasında doğrudan kurulan sözleşme.',
        ],
      },
      {
        h: '2. Platform’un niteliği: aracı ve yer sağlayıcı',
        p: [
          'Platform İşleteni, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında “aracı hizmet sağlayıcı”, 5651 sayılı Kanun kapsamında “yer sağlayıcı” sıfatıyla yalnızca Müşteri ile Görevlinin birbirini bulmasını sağlayan teknik bir ortam sunar.',
          'Hizmet Sözleşmesi doğrudan Müşteri ile Görevli arasında kurulur. Platform İşleteni bu sözleşmenin tarafı, Hizmetin sağlayıcısı, Görevlinin işvereni, alt işvereni, vekili, temsilcisi, acentesi, kefili ya da garantörü değildir.',
          'Görevliler ile Platform İşleteni arasında hizmet akdi, iş akdi, ortaklık veya temsil ilişkisi bulunmamaktadır. Görevliler kendi nam ve hesaplarına, kendi iradeleriyle iş kabul eder.',
          'Platform İşleteni, 6563 sayılı Kanun’un 9. maddesi uyarınca Kullanıcıların oluşturduğu içerikleri (ilanlar, mesajlar, fotoğraflar, değerlendirmeler) kontrol etmek, bunlarla ilgili hukuka aykırı bir faaliyetin ya da durumun söz konusu olup olmadığını araştırmakla yükümlü değildir. Hukuka aykırı içerikten haberdar olduğunda içeriği yayından kaldırma hakkını saklı tutar.',
        ],
      },
      {
        h: '3. Üyelik ve doğrulama',
        p: [
          'Platform’u yalnızca 18 yaşını doldurmuş, ayırt etme gücüne sahip gerçek kişiler kullanabilir. Her kişi tek hesap açabilir.',
          'Kullanıcı verdiği bilgilerin doğru, güncel ve kendisine ait olduğunu kabul eder. Telefon numarası doğrulaması zorunludur.',
          'Platform İşleteni Görevliler için telefon ve kimlik kontrolü gibi sınırlı doğrulama adımları uygulayabilir. Bu adımlar; Kullanıcının kimliğinin, geçmişinin, sabıka durumunun, mesleki yeterliliğinin, dürüstlüğünün ya da güvenilirliğinin garanti edildiği anlamına gelmez. Platform İşleteni hiçbir Kullanıcı için “güvenli”, “güvenilir” veya “sorunsuz” olduğu yönünde taahhütte bulunmaz.',
          'Kullanıcı, hesabının ve cihazının güvenliğinden, doğrulama kodlarını ve görev kodlarını (PIN) üçüncü kişilerle paylaşmamaktan sorumludur.',
        ],
      },
      {
        h: '4. İlanlar ve yasaklı işler',
        p: [
          'İlanın içeriği, doğruluğu, işin yasallığı ve ilanda belirtilen bilgilerin eksiksizliği Müşterinin sorumluluğundadır.',
          'Şu işler ilan edilemez ve kabul edilemez: hukuka aykırı her türlü iş; silah, uyuşturucu, alkol, tütün, reçeteli ilaç taşıma veya teslimi; yetki belgesi, ustalık belgesi veya ehliyet gerektiren işler (elektrik ve doğalgaz tesisatı, araç kullanımı vb.); yüksekte çalışma, iskele, çatı ve tehlikeli kimyasal içeren işler; çocuk, yaşlı, hasta veya hayvan bakımı; cinsel içerikli veya kişisel mahremiyeti ihlal eden talepler; para, değerli eşya veya belge taşıma.',
          'Platform İşleteni, bu sözleşmeye veya mevzuata aykırı gördüğü ilanları önceden bildirmeksizin kaldırabilir, ilgili hesapları askıya alabilir.',
        ],
      },
      {
        h: '5. Ücret ve ödeme',
        p: [
          'İşin ücreti Müşteri ile Görevli arasında Platform’da gösterilen öneri üzerinden serbestçe belirlenir. Platform’un gösterdiği önerilen fiyatlar yalnızca bilgilendirme amaçlıdır.',
          'Ödeme, iş tamamlandığında doğrudan Müşteri tarafından Görevliye yapılır. Platform İşleteni ödeme aracısı, emanetçi veya tahsilat temsilcisi değildir; ödemenin yapılmaması, eksik yapılması veya ödeme sırasında doğan uyuşmazlıklardan sorumlu değildir.',
          'Hizmet bedeline ilişkin her türlü vergi, fatura, makbuz ve yasal bildirim yükümlülüğü Görevliye aittir.',
          'Platform İşleteni ileride Platform kullanımına ilişkin bir hizmet bedeli uygulamaya karar verirse bunu önceden duyurur; duyurudan önce verilmiş ilanlara geriye dönük uygulanmaz.',
        ],
      },
      {
        h: '6. Sorumluluğun sınırları',
        p: [
          'Hizmetin ifası, kalitesi, zamanında yapılıp yapılmaması, sonuçları ve Hizmet sırasında ya da Hizmet nedeniyle meydana gelen her türlü zarardan Hizmet Sözleşmesinin tarafları (Müşteri ve Görevli) birbirlerine ve üçüncü kişilere karşı bizzat sorumludur.',
          'Kullanıcıların birbirine veya üçüncü kişilere karşı gerçekleştirdiği eylemlerden; bunlarla sınırlı olmamak üzere eşya hasarı, kaybı veya hırsızlığı, mülke verilen zarar, yaralanma, sağlık sorunları, dolandırıcılık, tehdit, yağma (gasp), taciz, saldırı ve diğer suç teşkil eden fiillerden, fiili gerçekleştiren kişi bizzat ve münhasıran sorumludur. Platform İşleteni bu fiillerin tarafı, faili, iştirakçisi veya kefili değildir.',
          'Platform İşleteni; Kullanıcıların beyanlarının doğruluğunu, bir Görevlinin ilanı kabul edeceğini, belirli bir sürede görevli bulunacağını, Hizmetin belirli bir sonuca ulaşacağını taahhüt etmez. Platform “olduğu gibi” ve “mevcut olduğu ölçüde” sunulur; kesintisiz veya hatasız çalışacağı garanti edilmez.',
          'Platform İşleteninin, Platform’un işletilmesinden doğan ve kendi kusuruna dayanan sorumluluğu, kanunun izin verdiği en geniş ölçüde, ilgili Kullanıcının zarar tarihinden önceki 12 ay içinde Platform İşletenine ödediği hizmet bedelleri toplamı ile sınırlıdır. Dolaylı zararlar, kâr kaybı ve itibar kaybından sorumluluk kabul edilmez.',
          'Bu maddedeki sınırlamalar; Türk Borçlar Kanunu’nun 115. maddesi uyarınca kast ve ağır kusurdan doğan sorumluluğu ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun’un emredici hükümlerini ortadan kaldırmaz. Bu hallerde ilgili kanun hükümleri uygulanır.',
        ],
      },
      {
        h: '7. Güvenlik araçları ve acil durumlar',
        p: [
          'Platform; görev kodu (PIN), yaklaşık/açık adres ayrımı, “Güvendeyim”, “Sorun var”, “Görevi bırak” ve acil durum kısayolları gibi araçlar sunar. Bu araçlar riski azaltmaya yönelik destekleyici araçlardır; can ve mal güvenliğine ilişkin bir taahhüt, sigorta, koruma veya gözetim hizmeti değildir.',
          'Acil bir durumda Kullanıcı derhal 112 Acil Çağrı Merkezi’ni ve gerektiğinde kolluk kuvvetlerini aramalıdır. Platform İşleteni bir acil durum, kolluk veya kurtarma hizmeti değildir.',
          'Platform İşleteni, bildirilen olaylarla ilgili kayıtları mevzuat çerçevesinde saklar ve yetkili adli ve idari mercilerin talebi üzerine onlarla paylaşır.',
        ],
      },
      {
        h: '8. Kullanıcı yükümlülükleri ve tazmin',
        p: [
          'Kullanıcı; mevzuata, bu sözleşmeye, Topluluk ve Güvenlik Kuralları’na uygun davranmayı, diğer Kullanıcıların kişisel verilerini (adres, telefon, fotoğraf) yalnızca ilgili işin yapılması için ve iş süresince kullanmayı kabul eder.',
          'Kullanıcı, bu sözleşmeye veya mevzuata aykırı davranışı nedeniyle Platform İşleteninin maruz kalacağı her türlü zararı, idari para cezasını, üçüncü kişi taleplerini ve makul avukatlık ücreti dahil yargılama giderlerini ilk talepte tazmin etmeyi kabul eder.',
        ],
      },
      {
        h: '9. Uyuşmazlıklar ve destek',
        p: [
          'Müşteri ile Görevli arasındaki uyuşmazlıklar öncelikle taraflar arasında çözülür. Platform İşleteni, takdirine bağlı olarak kayıtları inceleyebilir, tarafları bilgilendirebilir veya hesaplar hakkında önlem alabilir; ancak taraflar arasında hakem, bilirkişi veya arabulucu sıfatı taşımaz ve bir ödeme yapma yükümlülüğü üstlenmez.',
          'Şikayet ve bildirimler uygulamadaki “Sorun var” ve “Şikayet et” araçlarıyla ya da [DESTEK E-POSTASI] adresine iletilebilir.',
        ],
      },
      {
        h: '10. Askıya alma ve fesih',
        p: [
          'Kullanıcı hesabını uygulamadaki “Hesabımı sil” seçeneğiyle dilediği zaman kapatabilir.',
          'Platform İşleteni; sözleşmeye aykırılık, şikayet, güvenlik riski, sahte bilgi veya mevzuata aykırılık şüphesi halinde hesabı geçici veya kalıcı olarak askıya alabilir ya da kapatabilir.',
        ],
      },
      {
        h: '11. Kayıtların delil niteliği',
        p: [
          'Taraflar, Platform İşleteninin elektronik kayıtlarının (görev olay kayıtları, konum kayıtları, mesajlar, fotoğraflar, sistem günlükleri) 6100 sayılı Hukuk Muhakemeleri Kanunu’nun 193. maddesi uyarınca delil niteliğinde olduğunu kabul eder. Tüketicinin karşı delil sunma hakkı saklıdır.',
        ],
      },
      {
        h: '12. Değişiklikler, uygulanacak hukuk ve yetki',
        p: [
          'Platform İşleteni bu koşulları değiştirebilir; esaslı değişiklikler uygulama içinde duyurulur ve yeniden onay istenir.',
          'Bu sözleşmeye Türk hukuku uygulanır. Uyuşmazlıklarda Eskişehir Mahkemeleri ve İcra Daireleri yetkilidir. Tüketici sıfatını taşıyan Kullanıcılar için 6502 sayılı Kanun uyarınca Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine başvuru hakkı saklıdır.',
        ],
      },
    ],
  },

  tasker: {
    id: 'tasker',
    title: 'Görevli Sözleşmesi',
    intro: `Bu sözleşme, ${company} (“Platform İşleteni”) ile Platform’da görevli olarak iş kabul eden Kullanıcı (“Görevli”) arasındadır ve Kullanım Koşulları’nın ayrılmaz parçasıdır.`,
    sections: [
      {
        h: '1. Bağımsız hizmet sağlayıcı',
        p: [
          'Görevli, Platform İşleteninin işçisi, alt işvereni, temsilcisi veya acentesi değildir; kendi nam ve hesabına çalışan bağımsız bir hizmet sağlayıcıdır. Taraflar arasında 4857 sayılı İş Kanunu kapsamında bir iş ilişkisi bulunmamaktadır.',
          'Görevli; çalışma zamanını, hangi ilanları kabul edeceğini, işi nasıl yapacağını ve kullanacağı ekipmanı kendisi belirler. Bir ilanı kabul etme zorunluluğu yoktur; çevrimdışı olmak hiçbir yaptırıma bağlı değildir.',
          'Görevli; vergi, sosyal güvenlik, ruhsat, sigorta ve benzeri tüm yasal yükümlülüklerini kendisi yerine getirir. Platform İşleteni Görevli adına prim, vergi veya sigorta ödemesi yapmaz.',
        ],
      },
      {
        h: '2. Hizmetin ifası ve sorumluluk',
        p: [
          'Görevli, kabul ettiği işi özenle, ilanda tarif edildiği şekilde ve mevzuata uygun olarak bizzat yapar; işi başkasına devredemez.',
          'İş sırasında Müşterinin veya üçüncü kişilerin eşyasına, mülküne veya kişiliğine verilen zararlardan, kendi iş güvenliği önlemlerinden ve kendi sağlığından Görevli sorumludur. Platform İşleteni bu zararların tarafı veya tazmin yükümlüsü değildir.',
          'Görevli, yetkisi veya ehliyeti olmadığı işleri (elektrik, doğalgaz, yüksekte çalışma vb.) kabul etmez. Bu tür işleri yapmasından doğan sonuçlardan kendisi sorumludur.',
        ],
      },
      {
        h: '3. Güvenlik ve işi bırakma hakkı',
        p: [
          'Görevli, kendini güvende hissetmediği her durumda “Görevi bırak” aracıyla işi derhal bırakabilir. Güvenlik gerekçesiyle bırakılan işler için Görevliye yaptırım uygulanmaz.',
          'Görevli, kapıda Müşteriden görev kodunu (PIN) almadan işe başlamaz. Müşteri kapıda bulunmazsa en az 10 dakika bekledikten sonra “Müşteri gelmedi” bildirimini yapabilir.',
          'Acil durumlarda Görevli derhal 112’yi arar.',
        ],
      },
      {
        h: '4. Gizlilik ve kişisel veriler',
        p: [
          'Kabulden sonra görülen açık adres, görev kodu, Müşteri adı ve fotoğraflar yalnızca ilgili işin yapılması için kullanılabilir. Görevli bu bilgileri kaydedemez, üçüncü kişilerle paylaşamaz, iş bittikten sonra Müşteriyle Platform dışında ticari amaçla iletişime geçemez.',
          'Görevli, iş sırasında öğrendiği kişisel verilere ilişkin 6698 sayılı Kişisel Verilerin Korunması Kanunu’ndan doğan yükümlülüklerine uymakla bizzat sorumludur.',
        ],
      },
      {
        h: '5. Doğrulama, puanlama ve hesap',
        p: [
          'Görevli hesabı, Platform İşleteninin yapacağı telefon ve kimlik kontrolünden sonra açılır. Görevli, adli sicil kaydına ilişkin talep edilen beyanların doğru olduğunu kabul eder.',
          'Müşteri değerlendirmeleri, şikayetler ve güvenlik bildirimleri dikkate alınarak hesap askıya alınabilir veya kapatılabilir.',
        ],
      },
      {
        h: '6. Ücret',
        p: [
          'Ücret, ilanda gösterilen bedeldir ve iş bitiminde doğrudan Müşteri tarafından Görevliye ödenir. Ödemeye ilişkin uyuşmazlıklar Görevli ile Müşteri arasındadır.',
          'Görevli, aldığı ücret için yasal belge düzenlemek ve vergisini beyan etmekle yükümlüdür.',
        ],
      },
      {
        h: '7. Tazmin',
        p: [
          'Görevli, bu sözleşmeye veya mevzuata aykırı davranışı nedeniyle Platform İşleteninin maruz kalacağı zararları ve üçüncü kişi taleplerini tazmin eder. Kast ve ağır kusura ilişkin kanuni sorumluluk hükümleri saklıdır.',
        ],
      },
    ],
  },

  privacy: {
    id: 'privacy',
    title: 'KVKK Aydınlatma Metni',
    intro: `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusu ${company} olarak kişisel verilerini aşağıda açıklanan şekilde işliyoruz.`,
    sections: [
      {
        h: '1. İşlenen kişisel veriler',
        p: [
          'Kimlik: ad, soyad; Görevliler için kimlik doğrulama bilgileri.',
          'İletişim: telefon numarası; Apple veya Google ile girişte e-posta adresi.',
          'Konum: ilan için seçilen yaklaşık ve açık adres; Görevlilerin çevrimiçi oldukları ve iş sırasında paylaştıkları konum; varış anındaki konum kaydı.',
          'Görsel: iş öncesi/sonrası ve olay fotoğrafları (fotoğraflardaki konum üst verisi yüklenirken silinir).',
          'Müşteri işlem: ilanlar, fiyatlar, görev durumları, değerlendirmeler.',
          'İşlem güvenliği: oturum kayıtları, IP adresi, cihaz ve bildirim belirteçleri, görev olay kayıtları.',
          'Güvenlik ve şikayet: “Sorun var”, “Görevi bırak”, acil durum ve şikayet bildirimleri.',
        ],
      },
      {
        h: '2. Amaçlar ve hukuki sebepler',
        p: [
          'Üyelik, ilanın yayımlanması, Görevli ile eşleştirme, görev kodu ve adres yönetimi: sözleşmenin kurulması ve ifası (KVKK m.5/2-c).',
          '5651 ve 6563 sayılı Kanunlar ile diğer mevzuattan doğan kayıt saklama ve yetkili mercilere bilgi verme: hukuki yükümlülük (m.5/2-ç).',
          'Güvenlik bildirimlerinin değerlendirilmesi, dolandırıcılığın ve kötüye kullanımın önlenmesi, uyuşmazlıklarda delil: bir hakkın tesisi, kullanılması veya korunması (m.5/2-e) ve meşru menfaat (m.5/2-f).',
          'Kampanya ve duyuru iletileri: yalnızca açık rızan (m.5/1) ile; dilediğin zaman geri alabilirsin.',
        ],
      },
      {
        h: '3. Aktarım',
        p: [
          'Eşleştiğin kullanıcıya: Görevliye işi kabul ettikten sonra açık adres ve adın; Müşteriye Görevlinin adı, puanı ve iş sırasında konumu, yalnızca işin ifası için.',
          'Hizmet sağlayıcılarımıza: barındırma ve veritabanı (Supabase, Avrupa Birliği), SMS doğrulama, Apple ve Google giriş hizmetleri, bildirim altyapısı (Expo). Bu sağlayıcıların bir kısmı yurt dışında bulunduğundan aktarım KVKK m.9 uyarınca standart sözleşmeler ve Kurul’a bildirim yoluyla yapılır.',
          'Yetkili kamu kurum ve kuruluşlarına ve yargı mercilerine: talep halinde ve mevzuatın gerektirdiği ölçüde.',
        ],
      },
      {
        h: '4. Saklama süreleri',
        p: [
          'Hesap bilgileri hesap açık olduğu sürece; hesap silindiğinde ad, telefon ve bildirim bilgileri silinir.',
          'Görev, olay ve güvenlik kayıtları; olası uyuşmazlıklar ve yasal yükümlülükler için anonimleştirilerek 10 yıla kadar; trafik kayıtları 5651 sayılı Kanun’da öngörülen süre boyunca saklanır.',
          'Görev kodu (PIN) şifreli olarak saklanır ve iş bittiğinde silinir.',
        ],
      },
      {
        h: '5. Hakların',
        p: [
          'KVKK m.11 uyarınca; verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı üçüncü kişileri bilme, düzeltilmesini, silinmesini veya yok edilmesini isteme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsin.',
          'Başvurularını [DESTEK E-POSTASI] adresine veya [ADRES] adresine yazılı olarak iletebilirsin. Başvurular en geç 30 gün içinde ücretsiz yanıtlanır.',
        ],
      },
    ],
  },

  consent: {
    id: 'consent',
    title: 'Açık Rıza Metni',
    intro: 'Bu metin yalnızca isteğe bağlı işlemler içindir. Rıza vermemen uygulamayı kullanmana engel olmaz.',
    sections: [
      {
        h: 'Kampanya ve duyuru iletileri',
        p: [
          'Ad ve telefon numaramın, kampanya, yenilik ve duyurular hakkında SMS ve bildirim gönderilmesi amacıyla işlenmesine ve İleti Yönetim Sistemi’ne kaydedilmesine açık rıza veriyorum. Bu rızayı profil ayarlarından veya [DESTEK E-POSTASI] adresine yazarak dilediğim zaman geri alabilirim.',
        ],
      },
    ],
  },

  policy: {
    id: 'policy',
    title: 'Gizlilik Politikası',
    intro: 'Kısaca: işin yapılması için gerekeni toplarız, satmayız, reklam için kullanmayız.',
    sections: [
      { h: 'Neyi topluyoruz', p: ['Ad, telefon, (Apple/Google ile girersen) e-posta, ilan bilgileri, konum (ilan adresi ve görevlinin iş sırasındaki konumu), fotoğraflar, değerlendirmeler ve güvenlik bildirimleri.'] },
      { h: 'Neden', p: ['Seni doğru görevliyle eşleştirmek, adresini yalnızca işi kabul eden kişiye göstermek, kapıda doğru kişinin geldiğini kodla doğrulamak, güvenlik bildirimlerini değerlendirmek ve yasal yükümlülükleri yerine getirmek için.'] },
      { h: 'Kimlerle paylaşıyoruz', p: ['Yalnızca eşleştiğin kullanıcıyla (iş için gereken kadarıyla), altyapı sağlayıcılarımızla ve yasal talep halinde yetkili makamlarla. Verilerini satmayız, reklam ağlarıyla paylaşmayız, seni uygulamalar arasında izlemeyiz.'] },
      { h: 'Konum', p: ['Konumun yalnızca uygulama açıkken ve görevliysen çevrimiçi olduğunda kullanılır. Görevlinin konumu müşteriye yalnızca iş sürerken gösterilir.'] },
      { h: 'Hesabını silmek', p: ['Profil > Hesabımı sil ile hesabını uygulama içinden silebilirsin. Ad, telefon ve bildirim bilgilerin silinir; güvenlik ve yasal yükümlülükler için iş kayıtları anonim olarak saklanır.'] },
      { h: 'İletişim', p: [`${company}. Ayrıntılar için KVKK Aydınlatma Metni’ne bak.`] },
    ],
  },

  community: {
    id: 'community',
    title: 'Topluluk ve Güvenlik Kuralları',
    sections: [
      {
        h: 'Herkes için',
        p: [
          'Saygılı ol. Taciz, hakaret, ayrımcılık ve tehdit hesabın kapatılmasıyla sonuçlanır.',
          'Görev kodunu (PIN) yalnızca kapıda, görevliyle yüz yüzeyken söyle. Telefonda veya mesajla kimseyle paylaşma.',
          'Ödemeyi iş bittikten sonra yap. Peşin para, kapora veya havale isteyenleri bildir.',
          'Kendini güvende hissetmediğin anda uygulamadaki “Sorun var” veya “Acil durum” düğmesini kullan; hayati tehlikede önce 112’yi ara.',
        ],
      },
      {
        h: 'Müşteriler için',
        p: [
          'İşi olduğu gibi anlat: ağırlık, kat, asansör durumu, evcil hayvan gibi bilgileri yaz.',
          'Değerli eşyalarını, nakit paranı ve belgelerini iş alanından kaldır.',
          'Gerekirse işin yapıldığı sırada evde başka biri bulunsun.',
        ],
      },
      {
        h: 'Görevliler için',
        p: [
          'Açık adres sana yalnızca kabulden sonra gösterilir; kaydetme, paylaşma.',
          'Kodu almadan işe başlama. Anlatılandan farklı veya tehlikeli bir işle karşılaşırsan “Görevi bırak” de; güvenlik gerekçesiyle bırakmak cezasızdır.',
          'Yetkin olmadığın işi (elektrik, gaz, yüksekte çalışma) kabul etme.',
        ],
      },
      {
        h: 'Yasak',
        p: ['Hukuka aykırı işler, silah, uyuşturucu, alkol veya ilaç taşıma, para ve değerli eşya taşıma, çocuk/hasta/hayvan bakımı, cinsel içerik, sahte hesap ve başkası adına iş alma.'],
      },
    ],
  },
};
