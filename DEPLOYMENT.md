# Canlıya Alma (Deployment) Rehberi

ZeytinSaaS iki parçadan oluşur: **backend** (NestJS API) ve **frontend**
(Next.js). Aşağıdaki adımlar ikisini de canlıya almak içindir.

> Veritabanı zaten kuruldu ve migration'lar uygulandı (Neon Postgres). Bkz.
> "Veritabanı" bölümü.

---

## 1. Ortam Değişkenleri (Environment Variables)

### Backend (`backend/.env` — bkz. `backend/.env.example`)

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres bağlantı adresi |
| `JWT_SECRET` | ✅ | **En az 32 karakter.** Boot'ta doğrulanır; yoksa/zayıfsa uygulama başlamaz. Üret: `openssl rand -base64 48` |
| `FRONTEND_URL` | ✅ | CORS izin listesi. Virgülle ayrılmış olabilir. Canlıda localhost otomatik elenir. Örn: `https://zeytinsaas.com` |
| `NODE_ENV` | — | Canlıda `production` (trust proxy + localhost CORS engeli için) |
| `PORT` | — | Hosting sağlamıyorsa 3001 |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | — | Yalnızca ilk süper admin'i oluştururken (aşağıya bakın) |

> **Kritik:** `JWT_SECRET` kaynak koddan kaldırıldı ve artık zorunlu. Eski
> `super-secret-key-change-in-prod` değeri kabul edilmez. Her ortam için ayrı,
> güçlü bir secret üretin ve GİZLİ tutun.

### Frontend (`frontend/.env` — bkz. `frontend/.env.example`)

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | Backend'in canlı adresi. Örn: `https://api.zeytinsaas.com` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Sitenin kendi adresi (SEO canonical/OG/sitemap). Örn: `https://zeytinsaas.com` |

---

## 2. Backend Deploy

Backend uzun süre çalışan bir Node sürecidir; **Vercel'e uygun değildir**
(serverless). Önerilen: Render, Railway, Fly.io veya bir VPS.

```bash
cd backend
npm ci
npx prisma generate
npm run build          # dist/ üretir
# Migration'lar zaten uygulandı; yeni migration eklerseniz:
# npx prisma migrate deploy
node dist/main.js       # veya hosting'in start komutu
```

- Health check: `GET /` veya bilinen bir public route.
- Hosting'de env değişkenlerini panelden girin (yukarıdaki tablo).
- Bir reverse proxy/CDN arkasındaysanız `NODE_ENV=production` olduğundan emin
  olun; `trust proxy` yalnızca o zaman etkinleşir (hız limiti doğru IP'yi görür).

### İlk süper admin'i oluşturma (tek sefer)

HTTP üzerinden süper admin oluşturma endpoint'i güvenlik nedeniyle kaldırıldı.
Yerine CLI seed:

```bash
cd backend
SUPER_ADMIN_EMAIL="siz@ornek.com" SUPER_ADMIN_PASSWORD="güçlü-bir-parola" \
  npm run seed:super-admin
```

Zaten bir süper admin varsa script çalışmaz (bilinçli).

---

## 3. Frontend Deploy (Vercel)

```bash
cd frontend
# Vercel projesine bağlayın; env değişkenlerini Vercel panelinden girin:
#   NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_SITE_URL
# Build komutu: npm run build   (Vercel otomatik algılar)
```

- Vercel alan adınızı `NEXT_PUBLIC_SITE_URL` ile aynı yapın.
- Backend `FRONTEND_URL`'ine bu Vercel/alan adını EKLEYİN (CORS).
- Dil yönlendirmesi (`/es`, `/it`, `/pt`) ve auth cookie middleware'i Vercel
  Edge'de çalışır (`src/middleware.ts`).

---

## 4. Veritabanı (durum: HAZIR)

Prod Neon veritabanı baseline'landı ve tüm migration'lar uygulandı:

- İlk 8 migration `migrate resolve --applied` ile işaretlendi (şema `db push`
  ile kurulmuştu, geçmişi yoktu).
- Kalan 5 migration (Decimal para, emanet, politika+bidon, günlük fiyat, lead)
  `migrate deploy` ile uygulandı.
- Mevcut veri korundu; para kolonları `Decimal`'e taşındı; mevcut fabrikaya
  politika v1 ve varsayılan bidon otomatik oluşturuldu.

Bundan sonra yeni migration eklerseniz sadece `npx prisma migrate deploy`.

---

## 5. Canlı Öncesi Kontrol Listesi

- [ ] `JWT_SECRET` üretildi (`openssl rand -base64 48`), her ortamda farklı, gizli.
- [ ] `backend/.env` ve `frontend/.env` **git'e commit'lenMEdi** (`.gitignore` kapsıyor).
- [ ] `NODE_ENV=production` (backend).
- [ ] `FRONTEND_URL` gerçek alan adını içeriyor, localhost yok.
- [ ] `NEXT_PUBLIC_SITE_URL` ve `NEXT_PUBLIC_API_BASE_URL` gerçek adresler.
- [ ] İlk süper admin `seed:super-admin` ile oluşturuldu.
- [ ] Backend bir reverse proxy arkasındaysa `trust proxy` için `NODE_ENV=production`.
- [ ] (Opsiyonel) Lead e-posta bildirimi: şu an talepler `/admin/leads`
      ekranından görülüyor. Gerçek e-posta isterseniz bir SMTP/Resend servisi
      bağlanmalı (`leads.service.ts` içinde tek nokta hazır: `LEAD_NOTIFY_EMAIL`).

---

## 6. Henüz Yapılmayanlar (bilinçli)

- **Legal sayfalar** (`/legal/privacy`, `/legal/terms`) Türkçe ve KVKK'ya özgü.
  ES/IT/PT pazarları için GDPR'a göre her ülkede ayrı bir **hukukçu** tarafından
  yazılmalı — çeviri değil. Canlıya almadan önce bu metinleri güncelleyin.
- **Ödeme entegrasyonu yok** (bilinçli): lisans satışı iletişim formu + havale
  ile. Online ödeme isterseniz iyzico/PayTR (TR) veya Stripe (AB) eklenebilir.
