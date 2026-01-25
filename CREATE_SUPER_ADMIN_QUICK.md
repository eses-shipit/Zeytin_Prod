# Super Admin Hızlı Oluşturma

Super Admin kullanıcısı database'de yok. Hızlıca oluşturmak için:

## Yöntem 1: API Endpoint (En Hızlı - Backend çalışıyorsa)

Browser Console'da (F12) şunu çalıştırın:

```javascript
fetch('http://localhost:3001/auth/create-super-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@zeytinsaas.com',
    password: 'admin123',
    name: 'Super Admin'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Super Admin oluşturuldu:', data);
  alert('Super Admin oluşturuldu! Şimdi login yapabilirsiniz.');
})
.catch(err => {
  console.error('❌ Hata:', err);
  alert('Hata: ' + (err.message || 'Bilinmeyen hata'));
});
```

## Yöntem 2: Seed Script

Terminal'de:

```bash
cd /Users/emresmac/Desktop/zeytin/backend
npm run prisma:seed
```

## Yöntem 3: Direkt SQL (PostgreSQL)

PostgreSQL'e bağlanıp:

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

## Login

Oluşturduktan sonra:
- Email: `admin@zeytinsaas.com`
- Şifre: `admin123`
