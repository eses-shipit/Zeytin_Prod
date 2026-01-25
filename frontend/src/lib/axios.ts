import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    // 1. Authorization Header
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Token yoksa ve public endpoint değilse, backend 401 döndürecek
    // Public endpoint'ler: /auth/login, /auth/register, /auth/create-super-admin

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Super Admin Logic:
        // Eğer Super Admin ise (Role), ve Impersonate modundaysa (isImpersonated) header gönder.
        // Ama Token zaten o Tenant için üretilmişse (Impersonate durumunda token da değişiyor), header şart mı?
        // EVET şart, çünkü Middleware header'a bakıyor (Super Admin rolü için).
        // ANCAK: Biz Token'ı da değiştirdiğimiz için, artık Token'ın içindeki rol ADMIN (Target User).
        // Yani Middleware'deki "if (user.role === 'SUPER_ADMIN')" bloğuna girmez!
        // "else { if (user.tenantId) contextTenantId = user.tenantId }" bloğuna girer.
        // VE Token'da tenantId var.
        
        // Sonuç: Token değiştirdiğimiz için X-Tenant-ID header'ına gerek kalmadı!
        // Çünkü artık Super Admin rolünde değiliz, o fabrikanın Admini rolündeyiz (Token bazında).
        
        // Sadece "Gerçek" Super Admin (Token değiştirmemiş, kendi panelinde) header göndermemeli.
        
        // Eğer hala eski mantık (Header ile Impersonate) kullanmak istiyorsak, Token değiştirmemeliydik.
        // Ama Token değiştirmek daha güvenli ve temiz.
        
        // Bu yüzden interceptor'ı basitleştirebiliriz.
        // Ama geriye dönük uyumluluk için (veya Token'ın süresi dolarsa vs.) kalsın.
        // Zaten Token'daki rol ADMIN ise, Middleware header'a bakmaz.
        
        // Sadece bir Edge Case var:
        // Super Admin kendi panelinde (Token: SUPER_ADMIN).
        // Eğer yanlışlıkla header gönderirse? Frontend göndermiyor. Sorun yok.

        // Kodumuz şu an güvenli.
        
        // Super Admin kendi panelinde olduğunda X-Tenant-ID header'ı göndermemeli
        // Çünkü Super Admin global işlemler yapıyor (tenant scope'u yok)
        if (user.role === 'SUPER_ADMIN') {
            // Super Admin impersonate modunda değilse header gönderme
            // (Impersonate modunda token zaten değişmiş olacak, rol ADMIN olacak)
            if (user.isImpersonated && user.tenantId) {
                config.headers["x-tenant-id"] = user.tenantId;
            }
            // Normal Super Admin modunda header göndermiyoruz
        } 
        else if (user.tenantId) {
          // Normal kullanıcılar için tenant ID gönder
          config.headers["x-tenant-id"] = user.tenantId;
        }

      } catch (e) {
        console.error("User parse error in axios interceptor", e);
      }
    }
  }
  return config;
});

export default api;
