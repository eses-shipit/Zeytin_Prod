"use client";

import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { Factory, LayoutDashboard, Users, Scale, Menu, X, Settings, MessageSquare, ShieldCheck, CreditCard, LogOut, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function Navbar() {
  // usePathname/useRouter/Link @/i18n/navigation'dan: pathname dil prefix'i
  // İÇERMEZ ("/dashboard"), Link ve router.push hedef dile göre prefix ekler.
  // Böylece ES'teyken bir menü linkine tıklamak Türkçe'ye düşürmez.
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInitial, setUserInitial] = useState("U");
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is Super Admin from localStorage
    const checkUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              // Super Admin kontrolü - impersonate modunda değilse
              if (user.role === 'SUPER_ADMIN' && !user.isImpersonated) {
                  setIsAdmin(true);
              } else {
                  setIsAdmin(false);
              }
              if (user.name) {
                  setUserInitial(user.name.charAt(0).toUpperCase());
              }
              // Fabrika adını al (tenant bilgisi varsa)
              if (user.tenant?.name) {
                  setTenantName(user.tenant.name);
              } else if (user.tenantName) {
                  // Fallback: direkt tenantName field'ı varsa
                  setTenantName(user.tenantName);
              } else {
                  setTenantName(null);
              }
          } catch (e) {
              console.error("User parse error", e);
              setIsAdmin(false);
              setTenantName(null);
          }
      } else {
          setIsAdmin(false);
          setTenantName(null);
      }
    };
    
    checkUser();
    setMounted(true); // Mark as mounted after first check
    
    // Storage değişikliklerini dinle (diğer tab'lardan giriş/çıkış yapıldığında)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        checkUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  // Mobil menüyü rota değişince kapat
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Middleware için token cookie'sini de sil
      document.cookie = "token=; path=/; max-age=0";
      // Impersonate verilerini de temizle
      localStorage.removeItem("superAdminSession");
      localStorage.removeItem("superAdminToken");
      
      router.push("/auth/login");
  };

  // Uygulama navbar'ının GÖSTERİLMEYECEĞİ sayfalar: giriş/kayıt, yazdırma,
  // hukuki metinler ve herkese açık landing ("/"). pathname artık prefix'siz
  // (@/i18n/navigation), o yüzden elle soyma gerekmiyor.
  const isPublicShell =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/print") ||
    pathname.startsWith("/legal");

  if (isPublicShell) {
    return null;
  }

  // Define Links based on Role
  const tenantLinks = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/terminal", label: t("weighing"), icon: Scale },
    { href: "/production", label: t("production"), icon: Factory },
    { href: "/inventory", label: t("inventory"), icon: Package },
    { href: "/customers", label: t("customers"), icon: Users },
    { href: "/support", label: t("support"), icon: MessageSquare },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  const adminLinks = [
    { href: "/admin", label: t("overview"), icon: LayoutDashboard },
    { href: "/admin/tenants", label: t("factories"), icon: Factory },
    { href: "/admin/licenses", label: t("licenses"), icon: CreditCard },
    { href: "/admin/tickets", label: t("supportCenter"), icon: MessageSquare },
  ];
  
  const isSuperAdminPage = pathname.startsWith("/admin");
  
  const links = isSuperAdminPage ? adminLinks : tenantLinks;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 min-w-0 max-w-7xl items-center justify-between gap-4 overflow-x-hidden px-4 md:px-6">
        {/* Logo */}
        <Link
          href={isSuperAdminPage ? "/admin" : "/dashboard"}
          className="flex min-w-0 shrink-0 items-center gap-2 font-bold text-slate-900 transition-opacity hover:opacity-80 md:text-xl"
        >
          <Image
            src="/logo-192.png"
            alt="ZeytinSaaS"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
          />
          <div className="hidden min-w-0 flex-col sm:flex">
            {isSuperAdminPage ? (
              <span className="truncate">ZeytinSaaS <span className="ml-1 text-sm font-normal text-slate-400">Admin</span></span>
            ) : (
              <span className="truncate">ZeytinSaaS</span>
            )}
            {mounted && !isSuperAdminPage && tenantName && (
              <span className="mt-0.5 truncate text-xs font-normal text-slate-500">{tenantName}</span>
            )}
          </div>
          <span className="truncate sm:hidden">ZeytinSaaS</span>
        </Link>

        {/* Masaüstü: Linkler (md ve üzeri) */}
        <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Masaüstü: Admin + Kullanıcı + Çıkış (md ve üzeri) */}
        <div className="hidden items-center gap-4 md:flex">
          {mounted && isAdmin && !isSuperAdminPage && (
            <Link
              href="/admin"
              className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
              title={t("backToAdmin")}
            >
              {t("adminPanel")}
            </Link>
          )}
          <LocaleSwitcher />
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
              {userInitial}
            </div>
            <button
              onClick={handleLogout}
              className="rounded p-1 text-slate-400 transition-colors hover:text-red-600"
              title={t("logout")}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobil: Hamburger butonu (sadece ikon, yer tasarrufu) */}
        <div className="flex shrink-0 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobil menü (slide-down) */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-slate-200 bg-white shadow-lg md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-slate-800 transition-colors",
                    isActive ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0 text-slate-500" />
                  {link.label}
                </Link>
              );
            })}
            {mounted && isAdmin && !isSuperAdminPage && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
              {t("adminPanel")}
            </Link>
            )}
            {/* Mobil menü: Dil değiştirici */}
            <div className="mt-3 flex justify-center border-t border-slate-200 pt-4">
              <LocaleSwitcher />
            </div>
            {/* Mobil menü: Kullanıcı + Çıkış */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                {userInitial}
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
