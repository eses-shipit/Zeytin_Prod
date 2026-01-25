"use client";

import { useEffect, useState } from "react";
import { LogOut, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImpersonateBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if we are impersonating
    // We can check if 'superAdminSession' exists AND current user has 'isImpersonated' flag
    const checkStatus = () => {
        const superAdminSession = localStorage.getItem("superAdminSession");
        const currentUserStr = localStorage.getItem("user");

        if (superAdminSession && currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            if (currentUser.isImpersonated) {
                setIsImpersonating(true);
                setTenantName(currentUser.tenant?.name || "Bilinmeyen Fabrika");
            }
        }
    };

    checkStatus();
    // Optional: Listen for storage events if tabs sync is needed
  }, []);

  const handleStopImpersonating = () => {
      const superAdminSession = localStorage.getItem("superAdminSession");
      const superAdminToken = localStorage.getItem("superAdminToken");

      if (superAdminSession && superAdminToken) {
          // Restore Super Admin
          localStorage.setItem("user", superAdminSession);
          localStorage.setItem("token", superAdminToken);
          
          localStorage.removeItem("superAdminSession");
          localStorage.removeItem("superAdminToken");
          
          // Redirect to Admin Panel
          window.location.href = "/admin/tenants";
      } else {
          // Fallback: Logout
          localStorage.clear();
          window.location.href = "/auth/login";
      }
  };

  if (!isImpersonating) return null;

  return (
    <div className="bg-orange-600 text-white px-4 py-3 shadow-md relative z-[100]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
                <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="font-bold text-sm md:text-base">
                    Dikkat: Şu an &apos;{tenantName}&apos; adına işlem yapıyorsunuz.
                </p>
                <p className="text-xs text-orange-100 hidden md:block">
                    Yaptığınız işlemler bu fabrikanın veritabanına kaydedilecektir.
                </p>
            </div>
        </div>
        
        <button
            onClick={handleStopImpersonating}
            className="flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
        >
            <LogOut className="h-4 w-4" />
            Yöneticiye Dön
        </button>
      </div>
    </div>
  );
}
