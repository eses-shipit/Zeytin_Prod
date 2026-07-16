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
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white/70 px-1.5 py-1 dark:border-slate-700 dark:bg-slate-900/70">
      <Globe className="h-3.5 w-3.5 text-slate-400" />
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded px-1.5 py-0.5 text-xs font-medium transition ${
            l === locale
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
