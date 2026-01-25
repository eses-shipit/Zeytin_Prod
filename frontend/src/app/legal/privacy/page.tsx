"use client";

import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
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
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Gizlilik Politikası ve Aydınlatma Metni</h1>
          </div>
          <p className="text-slate-600">Son Güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">1. Veri Sorumlusu</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">
              ZeytinSaaS olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla, 
              kişisel verilerinizin işlenmesi ve korunması konusunda aşağıdaki bilgileri sizlere sunmaktayız.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">2. İşlenen Kişisel Veriler</h2>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              Hizmetlerimizi sağlamak amacıyla aşağıdaki kişisel verileriniz işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, unvan</li>
              <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres bilgileri</li>
              <li><strong>İşletme Bilgileri:</strong> Fabrika adı, vergi numarası, resmi unvan</li>
              <li><strong>Üretim Verileri:</strong> Zeytin ve zeytinyağı üretim kayıtları, müşteri bilgileri, stok verileri</li>
              <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı bilgileri, oturum bilgileri</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900">3. Veri İşleme Amaçları</h2>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Zeytinyağı fabrika otomasyon hizmetlerinin sağlanması</li>
              <li>Müşteri kayıtlarının yönetimi ve takibi</li>
              <li>Üretim süreçlerinin kayıt altına alınması</li>
              <li>Fatura ve muhasebe işlemlerinin gerçekleştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Güvenlik ve hizmet kalitesinin sağlanması</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Veri Paylaşımı</h2>
            <p className="text-slate-700 leading-relaxed">
              Kişisel verileriniz, yukarıda belirtilen amaçlar dışında <strong>üçüncü kişilerle paylaşılmamaktadır</strong>. 
              Verileriniz sadece hizmet sağlama amacıyla işlenmekte ve yasal zorunluluklar haricinde üçüncü taraflara aktarılmamaktadır.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Veri Güvenliği</h2>
            <p className="text-slate-700 leading-relaxed">
              Kişisel verilerinizin güvenliği için teknik ve idari tedbirler alınmıştır. Verileriniz şifreli olarak saklanmakta 
              ve yetkisiz erişimlere karşı korunmaktadır. Ancak, internet üzerinden veri aktarımında %100 güvenlik garantisi 
              verilemeyeceği unutulmamalıdır.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Haklarınız</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
              <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. İletişim</h2>
            <p className="text-slate-700 leading-relaxed">
              KVKK kapsamındaki haklarınızı kullanmak veya sorularınız için bizimle iletişime geçebilirsiniz. 
              Talepleriniz, kimlik tespiti yapıldıktan sonra en geç 30 gün içinde değerlendirilecektir.
            </p>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              Bu aydınlatma metni, KVKK'nın 10. maddesi gereğince hazırlanmıştır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
