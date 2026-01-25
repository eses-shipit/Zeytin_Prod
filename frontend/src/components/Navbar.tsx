"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Factory, LayoutDashboard, Users, Scale, Cylinder, Settings, MessageSquare, ShieldCheck, CreditCard, LogOut, Package } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInitial, setUserInitial] = useState("U");
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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

  // Show nothing on auth pages or print pages
  if (pathname.startsWith("/auth") || pathname.startsWith("/print")) {
      return null;
  }

  // Define Links based on Role
  const tenantLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/", label: "Kantar", icon: Scale },
    { href: "/production", label: "Üretim", icon: Factory },
    { href: "/inventory", label: "Envanter", icon: Package },
    { href: "/customers", label: "Müşteriler", icon: Users },
    { href: "/support", label: "Destek", icon: MessageSquare },
    { href: "/settings", label: "Ayarlar", icon: Settings },
  ];

  const adminLinks = [
    { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
    { href: "/admin/tenants", label: "Fabrikalar", icon: Factory },
    { href: "/admin/licenses", label: "Lisanslar", icon: CreditCard },
    { href: "/admin/tickets", label: "Destek Merkezi", icon: MessageSquare },
  ];
  
  const isSuperAdminPage = pathname.startsWith("/admin");
  
  const links = isSuperAdminPage ? adminLinks : tenantLinks;

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
            <Link href={isSuperAdminPage ? "/admin" : "/dashboard"} className="flex items-center gap-2 font-bold text-xl text-slate-900 hover:opacity-80 transition-opacity">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white", isSuperAdminPage ? "bg-indigo-900" : "bg-black")}>
                {isSuperAdminPage ? <ShieldCheck className="h-5 w-5" /> : "Z"}
            </div>
            <div className="flex flex-col">
                {isSuperAdminPage ? (
                    <span>ZeytinSaaS <span className="text-slate-400 font-normal text-sm ml-1">Admin</span></span>
                ) : (
                    <span>ZeytinSaaS</span>
                )}
                {/* Fabrika adını göster (sadece tenant sayfalarında ve fabrika adı varsa) */}
                {/* mounted kontrolü hydration hatasını önler */}
                {mounted && !isSuperAdminPage && tenantName && (
                    <span className="text-xs font-normal text-slate-500 mt-0.5">{tenantName}</span>
                )}
            </div>
            </Link>

            <div className="flex items-center gap-1">
            {links.map((link) => {
                // Simple active check or partial match for sub-pages
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;
                
                return (
                <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    <Icon className="h-4 w-4" />
                    {link.label}
                </Link>
                );
            })}
            </div>
        </div>

        <div className="flex items-center gap-4">
            {/* Sadece Super Admin (impersonate modunda değil) ve admin sayfasında değilken göster */}
            {/* mounted kontrolü hydration hatasını önler */}
            {mounted && isAdmin && !isSuperAdminPage && (
                <Link 
                    href="/admin" 
                    className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                    title="Admin paneline dön"
                >
                    Admin Paneli
                </Link>
            )}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                    {userInitial}
                </div>
                <button 
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    title="Çıkış Yap"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </div>
      </div>
    </nav>
  );
}
