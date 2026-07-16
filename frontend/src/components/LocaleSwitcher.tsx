"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Globe } from "lucide-react";

const LABELS: Record<Locale, string> = { tr: "TR", es: "ES", it: "IT", pt: "PT" };

/**
 * Uygulama içi dil değiştirici (navbar). Aynı sayfanın seçilen dildeki
 * sürümüne geçer ve tercihi NEXT_LOCALE çerezine yazar.
 *
 * `@/i18n/navigation`'dan gelen usePathname dil prefix'ini İÇERMEZ; router.replace
 * hedef dile göre doğru prefix'i ekler. (Landing'deki switcher'ın uygulama
 * temasına uyarlanmış hâli.)
 */
export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1 py-0.5">
      <Globe className="mx-0.5 h-3.5 w-3.5 text-slate-400" />
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded px-1.5 py-0.5 text-xs font-semibold transition-colors ${
            l === locale
              ? "bg-indigo-600 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
