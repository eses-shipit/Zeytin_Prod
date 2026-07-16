import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing, isLocale, type Locale } from "@/i18n/routing";

/**
 * İKİ middleware'in birleşimi: auth guard + next-intl dil yönlendirmesi.
 *
 * SIRA ÖNEMLİ ve şu şekilde kurgulandı:
 *
 *   1) Statik dosyalar   -> ikisini de atla (NextResponse.next())
 *   2) Pathname'den dil prefix'ini SOY ("/es/dashboard" -> "/dashboard")
 *   3) Auth kararını SOYULMUŞ path üzerinde ver
 *   4) Auth geçerse -> intlMiddleware'e devret (rewrite/redirect onun işi)
 *
 * Auth'un intl'den ÖNCE çalışmasının sebebi: intlMiddleware bir rewrite
 * response'u üretir; onun üzerine sonradan redirect bindirmek response
 * header'larını (Link, Vary, NEXT_LOCALE cookie) bozar. Redirect kararını
 * önce verip intl'i hiç çalıştırmamak daha temiz.
 *
 * Dil prefix'ini soymanın sebebi: PROTECTED_PATHS listesi prefix'siz yazılı.
 * Soymasaydık "/es/dashboard" hiçbir korumalı path ile eşleşmez, isProtected
 * false döner ve sayfa AUTH'SUZ AÇILIRDI. Bu, bu dosyadaki en kritik nokta.
 */

const intlMiddleware = createIntlMiddleware(routing);

// "/" artık PUBLIC landing page. Kantar terminali "/terminal"e taşındı.
const PROTECTED_PATHS = [
  "/terminal",
  "/dashboard",
  "/inventory",
  "/production",
  "/customers",
  "/stock",
  "/tickets",
  "/support",
  "/settings",
  "/admin",
  "/drums",
  "/print",
];

/**
 * Ne auth ne de i18n ile ilgisi olan yollar. intlMiddleware'e verilirlerse
 * "/images/logo.png" -> "/tr/images/logo.png" gibi saçma redirect'ler üretir.
 */
function isAssetPath(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/images")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  // Next'in üreteceği metadata rotaları (uzantısız hâlleri dâhil).
  // Eski middleware bunları isPublicPath içinde eliyordu; davranışı koruyoruz.
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/icon") || pathname.startsWith("/apple-icon"))
    return true;
  if (pathname === "/manifest.webmanifest" || pathname === "/manifest")
    return true;
  // Uzantısı olan her şey (.png, .ico, .svg, .json ...) dosyadır, sayfa değil.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

/**
 * Dil prefix'ini ayırır. DİKKAT: bu fonksiyon auth kararının temeli.
 *   "/es/dashboard" -> { locale: "es", pathname: "/dashboard" }
 *   "/es"           -> { locale: "es", pathname: "/" }
 *   "/dashboard"    -> { locale: null, pathname: "/dashboard" }  (varsayılan tr)
 */
function splitLocale(pathname: string): {
  locale: Locale | null;
  pathname: string;
} {
  const segments = pathname.split("/");
  // segments[0] her zaman "" (leading slash), segments[1] ilk gerçek segment.
  if (!isLocale(segments[1])) {
    return { locale: null, pathname };
  }
  const rest = segments.slice(2).join("/");
  return { locale: segments[1], pathname: rest === "" ? "/" : `/${rest}` };
}

/** Kimlik doğrulaması gerektirmeyen sayfalar (dil prefix'i SOYULMUŞ path bekler). */
function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/auth/")) return true;
  if (pathname === "/login" || pathname === "/register") return true;
  if (pathname.startsWith("/legal")) return true;
  return false;
}

/** Korumalı sayfalar (dil prefix'i SOYULMUŞ path bekler). */
function isProtectedPath(pathname: string): boolean {
  // "/" (landing) artık korumalı DEĞİL. Eskiden burada `pathname === "/"`
  // koşulu vardı; kaldırıldı ki ziyaretçiler landing'i görebilsin.
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const rawPathname = request.nextUrl.pathname;

  // 1) Statik dosyalar: her iki middleware'i de atla.
  if (isAssetPath(rawPathname)) {
    return NextResponse.next();
  }

  // 2) Dil prefix'ini soy — auth kararı bunun üzerinden verilecek.
  const { locale, pathname } = splitLocale(rawPathname);

  // 3) Auth kararı.
  const needsAuth = !isPublicPath(pathname) && isProtectedPath(pathname);

  if (needsAuth) {
    const token = request.cookies.get("token")?.value;

    if (!token || token.length === 0) {
      // Kullanıcıyı bulunduğu dilde login'e gönder. Varsayılan dil (tr)
      // prefix almadığı için `localePrefix: "as-needed"` ile uyumlu olacak
      // şekilde prefix'i sadece tr DIŞINDAKİ diller için ekliyoruz.
      const loginPath =
        locale && locale !== routing.defaultLocale
          ? `/${locale}/auth/login`
          : "/auth/login";

      const loginUrl = new URL(loginPath, request.url);
      // Not: login sayfası şu an `from`'u OKUMUYOR (giriş sonrası sabit olarak
      // /dashboard veya /admin'e gidiyor). Mevcut davranışı korumak için
      // parametreyi yine de set ediyoruz; ileride geri-dönüş için kullanılabilir.
      loginUrl.searchParams.set("from", rawPathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4) Auth geçildi (veya gerekmiyordu) -> dil yönlendirmesini next-intl yapsın.
  //    Bu, prefix'siz path'i içeride /tr/... olarak rewrite eder ve
  //    Accept-Language'a göre gerekirse /es/... 'e redirect eder.
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Tüm path'ler; erken çıkışlar isAssetPath() içinde yapılıyor.
     * _next/static, _next/image ve favicon.ico burada da eleniyor ki
     * middleware hiç uyanmasın (performans).
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
