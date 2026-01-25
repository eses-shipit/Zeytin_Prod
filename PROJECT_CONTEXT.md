# PROJE BAĞLAMI: Zeytinyağı Fabrikası Yönetim Platformu (SaaS)

## 1. Proje Özeti
Bu proje, zeytinyağı fabrikaları için geliştirilen, donanım entegrasyonlu (IoT/Kantar), finansal hesaplamalar içeren, çok kiracılı (Multi-tenant) bir SaaS platformudur. Amaç, fabrikadaki fiziksel süreçleri (tartım, sıkım, depolama) dijitalleştirmektir.

## 2. Teknoloji Yığını (Stack)
- **Backend:** Node.js, NestJS (Modüler yapı), Prisma ORM.
- **Database:** PostgreSQL. Mimari: Schema-per-tenant (Her fabrika için ayrı şema).
- **Frontend:** React (Next.js), PWA (Offline-first capability), TailwindCSS.
- **Donanım:** Web Serial API (Tarayıcıdan kantar verisi okuma).
- **Queue:** BullMQ (Redis tabanlı SMS ve arkaplan işleri için).

## 3. Temel İş Mantığı (Domain Logic) - KRİTİK
Bu bir e-ticaret sitesi değildir. Aşağıdaki terimler ve mantık esastır:
1.  **Kantar (Weighing):** Araçlar dolu girer (Brüt), boş çıkar (Dara). Net = Brüt - Dara.
2.  **Hak Yağ (Payment in Kind):** Fabrika, hizmet bedeli olarak para yerine yağın %X'ini alır.
    - Formül: `Üretici Payı = Toplam Yağ - (Toplam Yağ * Hak Oranı)`
3.  **Randıman (Yield):** Verimlilik oranıdır. `(Elde Edilen Yağ / Net Zeytin Kg) * 100`.
4.  **Emanet (Escrow):** Çiftçi yağını hemen almaz, fabrikanın tankında bekletir. Sanal bir banka hesabı gibi yağ bakiyesi tutulur.
5.  **Bozdurma (Liquidation):** Emanetteki yağın o günkü kurdan TL'ye çevrilmesi.

## 4. MVP Hedefi (Faz 1)
Kullanıcı giriş yapabilmeli, tarayıcı üzerinden fiziksel kantara bağlanıp veri okuyabilmeli, zeytin kabul fişi oluşturabilmeli ve bu veriyi veritabanına (ilgili tenant şemasına) kaydedebilmelidir.

