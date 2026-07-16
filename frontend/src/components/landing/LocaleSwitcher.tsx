"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Globe } from "lucide-react";

const LABELS: Record<Locale, string> = { tr: "TR", es: "ES", it: "IT", pt: "PT" };

/** Landing page dil seçici. Aynı sayfanın diğer dildeki sürümüne geçer. */
export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[color:var(--line)] bg-white/60 px-1.5 py-1">
      <Globe className="h-3.5 w-3.5 text-[color:var(--olive)]" />
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded-full px-1.5 py-0.5 text-xs font-medium transition ${
            l === locale
              ? "bg-[color:var(--emerald)] text-[color:var(--cream)]"
              : "text-[color:var(--ink)]/60 hover:bg-[color:var(--cream-2)]"
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
