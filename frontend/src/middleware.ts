import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Korumalı rotalar: token veya auth cookie yoksa /auth/login'e yönlendir.
 * Login sayfası, giriş başarılı olunca token'ı hem localStorage hem de
 * `token` cookie'sine yazar; middleware sadece cookie'leri okuyabilir.
 */
const PROTECTED_PATHS = [
  "/",
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

function isPublicPath(pathname: string): boolean {
  // Auth sayfaları
  if (pathname.startsWith("/auth/")) return true;
  // Eski/alternatif login, register
  if (pathname === "/login" || pathname === "/register") return true;
  // Yasal sayfalar
  if (pathname.startsWith("/legal")) return true;
  // Next.js statik ve özel
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon") || pathname === "/favicon.ico") return true;
  if (pathname.startsWith("/icon") || pathname.startsWith("/apple-icon")) return true;
  if (pathname === "/manifest.webmanifest" || pathname === "/manifest") return true;
  if (pathname.startsWith("/images")) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")))
    return true;
  return false;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Korumalı rota: cookie'de token veya auth var mı?
  const token = request.cookies.get("token")?.value;

  if (!token || token.length === 0) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Tüm path'ler; static, _next, favicon vb. dahil.
     * isPublicPath ile erken çıkış yapıyoruz.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
