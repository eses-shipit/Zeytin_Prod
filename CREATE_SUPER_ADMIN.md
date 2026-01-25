# Super Admin Kullanıcısı Oluşturma

Super Admin kullanıcısını oluşturmak için 3 yöntem var:

## Yöntem 1: Seed Script (Önerilen)

```bash
cd /Users/emresmac/Desktop/zeytin/backend
npm run prisma:seed
```

Veya direkt:

```bash
cd /Users/emresmac/Desktop/zeytin/backend
npx ts-node prisma/seed.ts
```

Bu komut şu Super Admin'i oluşturur:
- **Email:** `admin@zeytinsaas.com`
- **Şifre:** `admin123`
- **Rol:** `SUPER_ADMIN`

## Yöntem 2: API Endpoint (Backend çalışıyorsa)

Backend çalışıyorsa, Postman veya curl ile:

```bash
curl -X POST http://localhost:3001/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zeytinsaas.com",
    "password": "admin123",
    "name": "Super Admin"
  }'
```

**Not:** Bu endpoint sadece hiç Super Admin yoksa çalışır.

## Yöntem 3: Direkt Database (PostgreSQL)

PostgreSQL'e bağlanıp direkt SQL ile:

```sql
INSERT INTO "User" (id, email, name, password, role, "tenantId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@zeytinsaas.com',
  'Super Admin',
  'admin123',
  'SUPER_ADMIN',
  NULL,
  NOW(),
  NOW()
);
```

## Giriş Yapma

1. Frontend'i açın: `http://localhost:3000/auth/login`
2. Şu bilgilerle giriş yapın:
   - **Email:** `admin@zeytinsaas.com`
   - **Şifre:** `admin123`
3. Otomatik olarak `/admin` sayfasına yönlendirileceksiniz.

## Önemli Notlar

- Production ortamında mutlaka şifreyi değiştirin!
- Seed script'i mevcut Super Admin'i günceller (email unique olduğu için)
- Backend çalışıyor olmalı (PostgreSQL bağlantısı gerekli)
