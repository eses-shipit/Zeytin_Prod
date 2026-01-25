"use client";

import { FileText, AlertTriangle, Shield, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Kullanım Koşulları</h1>
          </div>
          <p className="text-slate-600">Son Güncelleme: 23.01.2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">1. Genel Hükümler</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">
              ZeytinSaaS, zeytinyağı fabrika otomasyonu için geliştirilmiş bir yazılım hizmetidir. 
              Bu kullanım koşulları, hizmetimizi kullanarak sisteme kayıt olan ve kullanan tüm kullanıcılar için geçerlidir. 
              Sisteme kayıt olmak ve kullanmakla, bu koşulları kabul etmiş sayılırsınız.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">2. Hizmet Kapsamı</h2>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              ZeytinSaaS sistemi aşağıdaki işlevleri sağlamaktadır:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Zeytin tartım ve fiş oluşturma</li>
              <li>Üretim batch yönetimi ve takibi</li>
              <li>Müşteri kayıt ve hesap ekstresi yönetimi</li>
              <li>Stok ve bidon takibi</li>
              <li>Raporlama ve analiz</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              <strong>Önemli:</strong> Sistem sadece zeytinyağı takibi içindir. Hatalı veri girişinden kullanıcı sorumludur.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Kullanıcı Sorumlulukları</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Kullanıcılar aşağıdaki sorumlulukları kabul eder:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Hesap bilgilerinin güvenliğini sağlamak ve şifreyi üçüncü kişilerle paylaşmamak</li>
              <li>Sisteme doğru ve güncel bilgiler girmek</li>
              <li>Hatalı veri girişinden kaynaklanan sorunlardan sorumlu olmak</li>
              <li>Sistemi yasalara aykırı amaçlarla kullanmamak</li>
              <li>Başkalarının haklarını ihlal edecek içerik paylaşmamak</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-semibold text-slate-900">4. Lisans ve Veri Erişimi</h2>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sistem, lisans bazlı çalışmaktadır. Lisans süresi bitince erişim kısıtlanır. 
              Lisans süresinin uzatılması için gerekli işlemlerin yapılması kullanıcının sorumluluğundadır.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Kullanıcı'nın lisans süresi dolduğunda, sisteme yeni veri girişi durdurulur. Kullanıcı, geçmiş verilerine (salt okunur olarak) 30 gün daha erişebilir. <strong>30 günün sonunda ödeme yapılmazsa, sistemdeki verilerin silinme veya arşivlenme hakkı ZeytinSaaS'a aittir.</strong>
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Veri Doğruluğu ve Operatör Sorumluluğu (Kritik Madde)</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              ZeytinSaaS, sadece veri girişine dayalı bir hesaplama aracıdır.{" "}
              <strong>Kullanıcı (Fabrika), sisteme girilen; zeytin ağırlığı (kantar verisi), asit oranı, sıcaklık ve sıkım şekli gibi verilerin doğruluğundan tek başına sorumludur.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Yazılım, hatalı girilen veriden (Örn: 500kg yerine 50kg yazılması) kaynaklanan randıman düşüklüğünden, yanlış hesaplamadan veya müşteri ile yaşanacak uyuşmazlıklardan sorumlu tutulamaz.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Sistem kayıtları, taraflar arasında bir "delil başlangıcı" niteliğindedir ancak resmi laboratuvar sonuçlarının veya ıslak imzalı kantar fişlerinin yerini tutmaz.
            </p>
          </section>

          {/* Section 5.1 - Emanet ve Stok Yönetimi */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5.1. Emanet (Consignment) ve Stok Yönetimi</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sistem üzerinde "Emanet" olarak işaretlenen ve fabrika tanklarına alınan yağların takibi Kullanıcı'nın sorumluluğundadır.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>ZeytinSaaS; fiziksel depolama koşulları, tank sızıntıları, hırsızlık, doğal afet (yangın, sel) veya zamanla oluşan fire (buharlaşma/tortu çökmesi) nedeniyle oluşabilecek miktar farklarından sorumlu değildir.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed">
              Sistemdeki "Sanal Bakiye" ile "Fiziksel Stok" arasındaki farkların mutabakatı Kullanıcı'nın yükümlülüğündedir.
            </p>
          </section>

          {/* Section 5.2 - Kalite ve Karışım Riski */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5.2. Kalite ve Karışım (Blending) Riski</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Fabrika tanklarına toplu olarak (Emanet) alınan yağların, diğer müşterilerin yağlarıyla karışması durumunda oluşabilecek <strong>asit veya kalite değişimleri</strong>, yazılımın konusu dışındadır.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Sistem, yağın o anki kimyasal özelliklerini değil, sisteme girilen sayısal değerlerini saklar.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Ödeme ve Hapis Hakkı (Lien)</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Sistem üzerinden hesaplanan Sıkım Bedeli (Hakkediş) veya diğer hizmet bedellerinin ödenmemesi durumunda; Fabrika'nın, müşterinin içerideki ürünü (yağı) üzerinde yasal <strong>Hapis Hakkı</strong> kullanıp kullanmayacağı, Fabrika ile Müstahsil arasındaki özel hukuka tabidir.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Yazılım sadece borç bakiyesini gösterir, tahsilat garantisi vermez.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Hizmet Kesintileri</h2>
            <p className="text-slate-700 leading-relaxed">
              ZeytinSaaS, teknik bakım, güncelleme veya zorunlu durumlarda hizmeti geçici olarak kesebilir. 
              Bu durumda kullanıcılara önceden bilgi verilmeye çalışılır, ancak acil durumlarda bu mümkün olmayabilir. 
              Hizmet kesintilerinden kaynaklanan zararlardan ZeytinSaaS sorumlu tutulamaz.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Resmi Kurumlarla Paylaşım (Zorunlu Madde)</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              İşlenen üretim verileri, zeytin ve zeytinyağı miktarları; Tarım ve Orman Bakanlığı, Vergi Daireleri ve (varsa) Zeytinyağı Borsası gibi <strong>resmi kurumların yasal talepleri doğrultusunda veya mevzuat gereği zorunlu bildirimlerde</strong> ilgili kurumlarla paylaşılabilir.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Bu paylaşım, KVKK'nın "Kanunlarda açıkça öngörülmesi" ve "Hukuki yükümlülüğün yerine getirilmesi" şartlarına dayanır.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Fikri Mülkiyet</h2>
            <p className="text-slate-700 leading-relaxed">
              ZeytinSaaS yazılımı ve tüm içeriği, telif hakkı ve diğer fikri mülkiyet hakları ile korunmaktadır. 
              Sistem içeriğinin kopyalanması, dağıtılması veya ticari amaçlarla kullanılması yasaktır.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Değişiklikler ve Güncellemeler</h2>
            <p className="text-slate-700 leading-relaxed">
              ZeytinSaaS, bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkını saklı tutar. 
              Önemli değişiklikler kullanıcılara bildirilecektir. Değişikliklerden sonra sistemi kullanmaya devam etmek, 
              yeni koşulları kabul etmek anlamına gelir.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Sorumluluk Reddi</h2>
            <p className="text-slate-700 leading-relaxed">
              ZeytinSaaS, sistemin kesintisiz çalışmasını garanti etmez. Sistem "olduğu gibi" sunulmaktadır. 
              Kullanıcılar, sistem kullanımından kaynaklanan doğrudan veya dolaylı zararlardan ZeytinSaaS'ı sorumlu tutamaz.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">12. İletişim ve Destek</h2>
            <p className="text-slate-700 leading-relaxed">
              Sistem kullanımı ile ilgili sorularınız ve destek talepleriniz için bizimle iletişime geçebilirsiniz. 
              Destek hizmetleri, lisans planınıza göre sağlanmaktadır.
            </p>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              Bu kullanım koşullarını kabul ederek, yukarıdaki tüm maddeleri okuduğunuzu ve kabul ettiğinizi beyan edersiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
