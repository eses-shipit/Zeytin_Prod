"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/cn";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100]",
      "bg-orange-500 text-white px-4 py-2",
      "flex items-center justify-center gap-2",
      "shadow-md animate-in slide-in-from-top duration-300"
    )}>
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">
        Çevrimdışı Mod - Veriler cihazınıza kaydediliyor. İnternet bağlantısı geldiğinde otomatik gönderilecek.
      </span>
    </div>
  );
}

