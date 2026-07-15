# Super Admin Kullanıcısı Oluşturma

Platform sahibi (SUPER_ADMIN) yalnızca sunucuya erişimi olan biri tarafından,
komut satırından oluşturulur.

```bash
cd backend
SUPER_ADMIN_EMAIL="admin@ornek.com" \
SUPER_ADMIN_PASSWORD="güçlü-bir-parola" \
npm run seed:super-admin
```

İsteğe bağlı: `SUPER_ADMIN_NAME="Ad Soyad"`.

Script, sistemde zaten bir SUPER_ADMIN varsa çalışmayı reddeder. Parola bcrypt
(cost 12) ile hash'lenir ve hiçbir yere yazdırılmaz.

## Neden HTTP endpoint'i yok?

Eskiden aynı iş `POST /auth/create-super-admin` ile yapılıyordu. Bu route kimlik
doğrulaması istemiyordu ve tek koruması "henüz hiç super admin yok" kontrolüydü
— yani kurulum penceresinde ilk davranan platformun sahibi oluyordu. Route
kaldırıldı; buradaki yöntem tek yoldur.

## Parolamı unuttum

`POST /auth/recover-password` kaldırıldı: kullanıcının saklanan parolasını HTTP
yanıtında döndürüyordu ve tek koşulu, fabrikadaki herkesin bildiği lisans kodunu
bilmekti. Parolalar artık hash'lendiği için zaten geri döndürülemez.

Yerine imzalı, tek kullanımlık, kısa ömürlü sıfırlama token'ı akışı gelecek
(Faz 5). Frontend'deki `/auth/forgot-password` sayfası o akış yazılana kadar
çalışmaz. O zamana dek parola sıfırlama super admin panelinden yapılır.
