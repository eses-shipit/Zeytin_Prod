import type { Section } from "./types";

/**
 * TÜRKÇE (tr) hukuki içerik — TASLAK.
 *
 * Bu metin bir şablondur ve hukuki tavsiye niteliği taşımaz. Yayınlanmadan önce
 * yetkili bir hukukçu tarafından incelenmeli ve kuruluşunuza göre uyarlanmalıdır.
 * Şirkete özgü tüm alanlar [KÖŞELİ PARANTEZ] içinde yer tutucudur.
 */

export const lastUpdated = "16 Temmuz 2026";

export const draftDisclaimer =
  "TASLAK — Bu metin bir şablondur. Yayınlamadan önce yetkili bir hukukçu tarafından incelenmeli ve kuruluşunuza göre uyarlanmalıdır.";

export const terms: Section[] = [
  {
    heading: "1. Taraflar ve Tanımlar",
    paragraphs: [
      "İşbu Kullanım Koşulları (\"Koşullar\"), [ŞİRKET ADI / COMPANY NAME] ([ADRES], [VERGİ NO / VAT]) tarafından işletilen ZeytinSaaS yazılım hizmeti (\"Hizmet\") ile bu Hizmete kayıt olan zeytinyağı fabrikası/işletmesi (\"Kullanıcı\" veya \"Kiracı\") arasındaki hak ve yükümlülükleri düzenler.",
      "\"Hizmet Sağlayıcı\": ZeytinSaaS'ı sunan [ŞİRKET ADI / COMPANY NAME]. \"Kiracı Verisi\": Kullanıcı'nın Hizmet üzerinde oluşturduğu, sakladığı veya işlediği tüm veriler (kendi müşterilerine, üretimine ve muhasebesine ait kayıtlar dahil). \"Son Kullanıcı\": Kullanıcı adına Hizmete erişen fabrika personeli.",
      "Hizmete kayıt olarak veya Hizmeti kullanarak bu Koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Koşulları kabul etmiyorsanız Hizmeti kullanmamalısınız.",
    ],
  },
  {
    heading: "2. Hizmet Tanımı",
    paragraphs: [
      "ZeytinSaaS, zeytinyağı fabrikaları için tasarlanmış, çok kiracılı (multi-tenant) bir müşteri ilişkileri yönetimi (CRM) ve fabrika otomasyon platformudur. Hizmet; zeytin kantar/tartım kayıtları, üretim partisi (batch) takibi, müşteri ve cari hesap yönetimi, stok/bidon takibi ile raporlama gibi işlevleri sağlar.",
      "Hizmet, bulut tabanlı olarak \"olduğu gibi\" ve \"mevcut haliyle\" sunulur. Hizmet Sağlayıcı, işlevleri geliştirmek, değiştirmek veya kaldırmak hakkını saklı tutar; önemli değişiklikler makul süre önceden bildirilmeye çalışılır.",
      "Hizmet, yalnızca bir veri kayıt ve hesaplama aracıdır. Resmi laboratuvar sonuçlarının, ıslak imzalı kantar fişlerinin veya yasal defterlerin yerini tutmaz.",
    ],
  },
  {
    heading: "3. Hesap ve Lisans Koşulları",
    paragraphs: [
      "Kullanıcı, geçerli bir lisans (abonelik) karşılığında Hizmeti kullanma yönünde münhasır olmayan, devredilemez ve alt lisansı verilemez bir kullanım hakkı elde eder. Lisans, [LİSANS SÜRESİ / ör. yıllık] boyunca geçerlidir.",
      "Hesap kimlik bilgilerinin (kullanıcı adı, parola) gizliliğini korumak Kullanıcı'nın sorumluluğundadır. Hesap üzerinden yapılan tüm işlemlerden Kullanıcı sorumludur. Yetkisiz erişim şüphesi derhal [E-POSTA] adresine bildirilmelidir.",
      "Lisans süresi dolduğunda yeni veri girişi durdurulabilir. Kullanıcı, geçmiş verilerine belirli bir süre (ör. [X GÜN]) salt-okunur olarak erişebilir. Sürenin sonunda verilerin arşivlenmesi veya silinmesi Bölüm 8'e tabidir.",
    ],
  },
  {
    heading: "4. Kabul Edilebilir Kullanım",
    paragraphs: [
      "Kullanıcı Hizmeti yalnızca hukuka uygun amaçlarla ve bu Koşullara uygun olarak kullanmayı taahhüt eder. Kullanıcı; Hizmete tersine mühendislik uygulamamayı, güvenlik önlemlerini atlatmamayı, otomatik yollarla aşırı yük bindirmemeyi ve üçüncü kişilerin haklarını ihlal eden içerik yüklememeyi kabul eder.",
      "Kullanıcı, Hizmete girdiği tüm verilerin doğruluğundan tek başına sorumludur. Hatalı veri girişinden (ör. ağırlık, asit oranı, sıcaklık) kaynaklanan yanlış hesaplama, randıman farkı veya üçüncü kişilerle uyuşmazlıklardan Hizmet Sağlayıcı sorumlu tutulamaz.",
      "Kullanıcı, kendi müşterilerinin (çiftçi/müstahsil) kişisel verilerini Hizmete girerken, ilgili kişileri aydınlatmak ve gerekli hukuki sebebi (rıza dahil) temin etmekle yükümlüdür. Bu konuda veri sorumlusu Kullanıcı'dır (bkz. Gizlilik Politikası).",
    ],
  },
  {
    heading: "5. Ödeme ve Ücretlendirme",
    paragraphs: [
      "Hizmet, yıllık lisans bedeli karşılığında sunulur. Güncel fiyatlandırma [FİYATLANDIRMA SAYFASI / TEKLİF] üzerinden belirlenir ve aksi belirtilmedikçe ilgili vergiler (KDV vb.) hariçtir.",
      "Ödemeler şu anda yalnızca banka havalesi/EFT yoluyla yapılır; sistem üzerinden çevrimiçi (kredi kartı) ödeme alınmamaktadır. Fatura ve ödeme talimatları [E-POSTA] üzerinden iletilir. Ödeme, faturada belirtilen vade içinde yapılmalıdır.",
      "Lisans bedelinin vadesinde ödenmemesi halinde Hizmet Sağlayıcı, makul bir bildirimin ardından hesabı askıya alabilir. Peşin ödenen bedeller, yasal olarak zorunlu haller dışında iade edilmez.",
    ],
  },
  {
    heading: "6. Kiracı Verisi ve Veri İşleyen Rolü",
    paragraphs: [
      "Kullanıcı'nın Hizmete girdiği tüm Kiracı Verisi Kullanıcı'ya aittir. Hizmet Sağlayıcı, bu veriler bakımından yalnızca bir veri işleyen (data processor) sıfatıyla, Kullanıcı'nın talimatları doğrultusunda ve Hizmeti sunmak amacıyla hareket eder.",
      "Hizmet Sağlayıcı, Kiracı Verisini yasal zorunluluklar veya Hizmetin sunulması dışında kendi amaçları için kullanmaz, satmaz ve üçüncü kişilere pazarlamaz. Alt işleyenler ve güvenlik önlemleri Gizlilik Politikası'nda açıklanmıştır.",
      "Kiracılar arası veri yalıtımı (tenant isolation), Hizmetin temel güvenlik ilkesidir; bir Kiracı'nın verisine başka bir Kiracı erişemez.",
    ],
  },
  {
    heading: "7. Sorumluluğun Sınırlandırılması",
    paragraphs: [
      "Hizmet \"olduğu gibi\" sunulur ve kesintisiz ya da hatasız çalışacağı garanti edilmez. Yürürlükteki hukukun izin verdiği azami ölçüde, Hizmet Sağlayıcı; kâr kaybı, veri kaybı, iş kesintisi gibi dolaylı, arızi veya sonuç niteliğindeki zararlardan sorumlu değildir.",
      "Hizmet Sağlayıcı'nın toplam sorumluluğu, her halükârda ilgili talebe konu olaydan önceki [12] ay içinde Kullanıcı tarafından ödenen lisans bedeli ile sınırlıdır.",
      "Fiziksel depolama, tank sızıntısı, hırsızlık, doğal afet veya fire gibi Hizmet dışı olaylardan; ayrıca üçüncü taraf altyapı (barındırma, internet) kaynaklı kesintilerden Hizmet Sağlayıcı sorumlu tutulamaz.",
    ],
  },
  {
    heading: "8. Fesih ve Askıya Alma",
    paragraphs: [
      "Taraflardan her biri, [FESİH BİLDİRİM SÜRESİ] önceden yazılı bildirimde bulunarak sözleşmeyi feshedebilir. Hizmet Sağlayıcı, bu Koşulların esaslı ihlali veya ödeme temerrüdü halinde hesabı askıya alabilir veya feshedebilir.",
      "Fesih halinde Kullanıcı, makul bir süre (ör. [X GÜN]) içinde Kiracı Verisini dışa aktarma (export) imkânı bulur. Bu sürenin sonunda Hizmet Sağlayıcı, yasal saklama yükümlülükleri saklı kalmak kaydıyla verileri silebilir veya arşivleyebilir.",
      "Niteliği gereği fesihten sonra da geçerliğini koruması gereken hükümler (ödeme, sorumluluk sınırı, fikri mülkiyet, uygulanacak hukuk) fesihten sonra da yürürlükte kalır.",
    ],
  },
  {
    heading: "9. Fikri Mülkiyet",
    paragraphs: [
      "ZeytinSaaS yazılımı, kaynak kodu, tasarımı, markaları ve tüm içeriği üzerindeki fikri mülkiyet hakları Hizmet Sağlayıcı'ya veya lisans verenlerine aittir. Bu Koşullar, Hizmeti kullanma hakkı dışında herhangi bir hak devretmez.",
      "Kullanıcı; Hizmeti kopyalayamaz, çoğaltamaz, kiralayamaz, satamaz veya türev çalışmalar oluşturamaz. Kiracı Verisi üzerindeki haklar Kullanıcı'da kalır.",
    ],
  },
  {
    heading: "10. Uygulanacak Hukuk ve Yetki",
    paragraphs: [
      "İşbu Koşullar [UYGULANACAK HUKUK / ör. Türkiye Cumhuriyeti hukuku] uyarınca yorumlanır ve uygulanır. Kullanıcı Avrupa Birliği'nde yerleşikse, tüketici koruma mevzuatının emredici hükümleri saklıdır.",
      "Bu Koşullardan doğabilecek uyuşmazlıklarda [YETKİLİ MAHKEME/TAHKİM / ör. [ŞEHİR/ÜLKE] mahkemeleri ve icra daireleri] yetkilidir. Bu hüküm, tüketicilerin kendi yerleşim yerindeki mahkemelere başvurma hakkını sınırlamaz.",
    ],
  },
  {
    heading: "11. Koşullarda Değişiklik",
    paragraphs: [
      "Hizmet Sağlayıcı, bu Koşulları zaman zaman güncelleyebilir. Esaslı değişiklikler, yürürlüğe girmeden makul süre önce Hizmet içinde veya [E-POSTA] yoluyla bildirilir.",
      "Değişikliklerin yürürlüğe girmesinden sonra Hizmeti kullanmaya devam etmek, güncellenmiş Koşulların kabulü anlamına gelir. Kabul etmeyen Kullanıcı, Bölüm 8 uyarınca sözleşmeyi feshedebilir.",
    ],
  },
  {
    heading: "12. İletişim",
    paragraphs: [
      "Bu Koşullarla ilgili sorularınız için: [ŞİRKET ADI / COMPANY NAME], [ADRES], E-posta: [E-POSTA].",
    ],
  },
];

export const privacy: Section[] = [
  {
    heading: "1. Veri Sorumlusunun Kimliği",
    paragraphs: [
      "İşbu Gizlilik Politikası ve Aydınlatma Metni; 6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") ve Avrupa Birliği Genel Veri Koruma Tüzüğü (\"GDPR\") kapsamında hazırlanmıştır. ZeytinSaaS çok bölgeli (Türkiye ve AB) olarak sunulur.",
      "Fabrika hesaplarına ilişkin (fabrika kullanıcılarının kendi hesap verileri) kişisel veriler bakımından veri sorumlusu (KVKK) / veri kontrolörü (GDPR): [VERİ SORUMLUSU / DATA CONTROLLER], [ADRES], [E-POSTA], [VERGİ NO / VAT].",
      "ÖNEMLİ AYRIM: Fabrikanın (Kiracı'nın) kendi müşterilerine (çiftçi/müstahsil) ait verilerde veri sorumlusu Kiracı'dır; ZeytinSaaS ise yalnızca veri işleyendir (data processor). Bu ayrım, Bölüm 2 ve 3'te açıklanmıştır.",
    ],
  },
  {
    heading: "2. İşlenen Kişisel Veri Kategorileri",
    paragraphs: [
      "A) Fabrika Kullanıcı Hesapları (ZeytinSaaS veri sorumlusudur): Ad-soyad, e-posta adresi, telefon numarası; hesap ve oturum bilgileri; işlem/denetim kayıtları (log); IP adresi ve tarayıcı bilgileri gibi teknik veriler.",
      "B) Kiracı'nın Kendi Müşterilerine Ait Veriler (ZeytinSaaS veri işleyendir): Çiftçi/müstahsil ad-soyadı, telefon numarası, T.C. Kimlik Numarası (TCKN), cari hesap bakiyeleri ve finansal kayıtlar, üretim/tartım kayıtları. Bu verileri sisteme Kiracı girer ve bunların hukuki dayanağından Kiracı sorumludur.",
      "Hizmet Sağlayıcı, (B) grubundaki verileri yalnızca Hizmeti sunmak ve Kiracı'nın talimatlarını yerine getirmek amacıyla işler.",
    ],
  },
  {
    heading: "3. TCKN ve Hassas Veriler Hakkında Özel Not",
    paragraphs: [
      "T.C. Kimlik Numarası (TCKN), KVKK kapsamında özel önem taşıyan bir kimlik verisidir ve Kişisel Verileri Koruma Kurulu kararları uyarınca ölçülülük ve ek güvenlik tedbirleri gerektirir. TCKN, yalnızca Kiracı'nın yasal/muhasebesel yükümlülükleri için gerekli olduğunda işlenmelidir.",
      "Kiracı, TCKN gibi verileri sisteme girmeden önce ilgili kişileri (çiftçileri) aydınlatmak ve gereken hukuki sebebi sağlamakla yükümlüdür. Hizmet Sağlayıcı bu verileri erişim kısıtlaması, yetkilendirme ve şifreleme gibi tedbirlerle korur; ancak verinin toplanmasına ilişkin hukuki sorumluluk Kiracı'ya aittir.",
      "GDPR anlamında TCKN \"özel nitelikli veri\" kategorisinde olmasa da ulusal kimlik numarası olarak ek koruma gerektirir; sağlık/biyometrik gibi özel nitelikli veriler Hizmette işlenmemelidir.",
    ],
  },
  {
    heading: "4. Kişisel Verilerin İşlenme Amaçları",
    paragraphs: [
      "Fabrika kullanıcı hesabının oluşturulması, kimlik doğrulama ve yetkilendirme; Hizmetin sunulması, sürdürülmesi ve iyileştirilmesi; destek taleplerinin karşılanması; faturalandırma ve tahsilat; güvenliğin sağlanması ve kötüye kullanımın önlenmesi; yasal yükümlülüklerin yerine getirilmesi.",
      "Kiracı Verisi bakımından işleme amacı, yalnızca Kiracı'nın belirlediği amaçlarla (üretim/müşteri/cari yönetimi) sınırlıdır; Hizmet Sağlayıcı bu verileri kendi pazarlama veya profilleme amaçlarıyla kullanmaz.",
    ],
  },
  {
    heading: "5. İşlemenin Hukuki Sebepleri",
    paragraphs: [
      "Sözleşmenin kurulması ve ifası (KVKK m.5/2-c; GDPR m.6/1-b): Hesap oluşturma, Hizmetin sunulması ve faturalandırma.",
      "Meşru menfaat (KVKK m.5/2-f; GDPR m.6/1-f): Güvenlik, dolandırıcılığın önlenmesi ve Hizmetin iyileştirilmesi; ilgili kişinin temel hak ve özgürlükleri gözetilerek.",
      "Hukuki yükümlülük (KVKK m.5/2-ç; GDPR m.6/1-c): Vergi, muhasebe ve resmi kurum bildirimleri. Gerekli hallerde açık rıza (KVKK m.5/1; GDPR m.6/1-a) alınır ve dilediğiniz zaman geri çekilebilir.",
    ],
  },
  {
    heading: "6. Alıcılar ve Alt İşleyenler (Sub-processors)",
    paragraphs: [
      "Kişisel veriler; yalnızca amaçla sınırlı olarak, bulut barındırma sağlayıcısı [BARINDIRMA SAĞLAYICISI], e-posta/bildirim sağlayıcısı [E-POSTA SAĞLAYICISI] ve (varsa) SMS sağlayıcısı [SMS SAĞLAYICISI] gibi alt işleyenlerle paylaşılabilir. Alt işleyenler, veri işleme sözleşmeleriyle bağlıdır.",
      "Yasal zorunluluk halinde veriler yetkili kamu kurumlarıyla (ör. vergi daireleri, Tarım ve Orman Bakanlığı) paylaşılabilir. Hizmet Sağlayıcı, Kiracı Verisini pazarlama amacıyla üçüncü kişilere satmaz veya devretmez.",
      "Güncel alt işleyen listesi talep üzerine [E-POSTA] adresinden temin edilebilir.",
    ],
  },
  {
    heading: "7. Yurt Dışına Aktarım",
    paragraphs: [
      "Hizmet çok bölgeli sunulduğundan, kişisel veriler [VERİ MERKEZİ BÖLGESİ / ör. AB veya Türkiye] içinde barındırılır. Verilerin bulunduğu bölge dışına aktarım gerektiğinde, KVKK m.9 ve GDPR Bölüm V uyarınca uygun güvenceler (yeterlilik kararı, Standart Sözleşme Hükümleri/SCC veya açık rıza) sağlanır.",
      "Türkiye'den yapılacak yurt dışı aktarımlarda KVKK'nın aktarım rejimi; AB'den yapılacak aktarımlarda GDPR'ın uluslararası aktarım kuralları uygulanır.",
    ],
  },
  {
    heading: "8. Saklama Süreleri",
    paragraphs: [
      "Kişisel veriler, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen yasal saklama süreleri (ör. vergi/ticaret hukuku kapsamında [SAKLAMA SÜRESİ]) boyunca saklanır.",
      "Amaç ortadan kalktığında veya yasal süre dolduğunda kişisel veriler silinir, yok edilir veya anonim hale getirilir. Kiracı Verisi bakımından saklama ve imha talimatı Kiracı tarafından belirlenir.",
    ],
  },
  {
    heading: "9. İlgili Kişinin / Veri Sahibinin Hakları",
    paragraphs: [
      "KVKK m.11 ve GDPR m.15-22 uyarınca; kişisel verilerinize erişme, düzeltme (rectification), silme (\"unutulma hakkı\"/erasure), işlemeyi kısıtlama, veri taşınabilirliği (portability) ve işlemeye itiraz (objection) haklarına sahipsiniz. Açık rızaya dayalı işlemede rızanızı geri çekebilirsiniz.",
      "Bu haklarınızı kullanmak için [DPO E-POSTA] veya [E-POSTA] adresine başvurabilirsiniz. Talepleriniz, kimlik doğrulamasının ardından KVKK kapsamında en geç 30 gün, GDPR kapsamında en geç bir ay içinde sonuçlandırılır.",
      "Ayrıca denetim makamına şikâyette bulunma hakkınız vardır: Türkiye'de Kişisel Verileri Koruma Kurumu (KVKK); Avrupa Birliği'nde ise yerleşik olduğunuz üye devletin yetkili veri koruma otoritesi (ör. İspanya'da AEPD, İtalya'da Garante, Portekiz'de CNPD).",
    ],
  },
  {
    heading: "10. Çerezler ve Yerel Depolama (localStorage)",
    paragraphs: [
      "Uygulama, oturum yönetimi ve kimlik doğrulama için tarayıcınızın localStorage alanını kullanır; bu, Hizmetin çalışması için zorunlu olan teknik bir depolamadır. Ayrıca çevrimdışı (offline) çalışma için bekleyen işlemleri geçici olarak tutan bir çevrimdışı kuyruk (offline queue) yerel olarak saklanır.",
      "Bu yerel depolama pazarlama veya izleme (tracking) amacı taşımaz. Tarayıcı verilerini temizlemeniz, oturumunuzu sonlandırır ve senkronize edilmemiş çevrimdışı kayıtların kaybolmasına yol açabilir.",
      "Üçüncü taraf reklam/izleme çerezleri kullanılmamaktadır. Kullanılması halinde bu politika güncellenecek ve gereken rıza mekanizmaları sağlanacaktır.",
    ],
  },
  {
    heading: "11. Veri Güvenliği Önlemleri",
    paragraphs: [
      "Hizmet Sağlayıcı; aktarımda şifreleme (TLS), erişim kontrolü ve rol bazlı yetkilendirme, kiracılar arası veri yalıtımı, kayıt/denetim izleri ve düzenli yedekleme gibi teknik ve idari tedbirleri uygular.",
      "İnternet üzerinden hiçbir aktarım yöntemi %100 güvenli değildir; mutlak güvenlik garanti edilemez. Kullanıcı, güçlü parola kullanmak ve hesap kimlik bilgilerini gizli tutmakla yükümlüdür.",
    ],
  },
  {
    heading: "12. Politikada Değişiklik",
    paragraphs: [
      "Bu Gizlilik Politikası zaman zaman güncellenebilir. Esaslı değişiklikler Hizmet içinde veya [E-POSTA] yoluyla duyurulur. Sayfanın üst kısmındaki \"son güncelleme\" tarihi geçerli sürümü gösterir.",
    ],
  },
  {
    heading: "13. İletişim",
    paragraphs: [
      "Veri sorumlusu: [VERİ SORUMLUSU / DATA CONTROLLER], [ADRES]. Veri koruma irtibatı (DPO): [DPO E-POSTA]. Genel iletişim: [E-POSTA]. Konum: [ŞEHİR/ÜLKE].",
    ],
  },
];
