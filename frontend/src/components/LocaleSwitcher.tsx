"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Globe, ChevronDown } from "lucide-react";

const LABELS: Record<Locale, string> = { tr: "TR", es: "ES", it: "IT", pt: "PT" };
const NAMES: Record<Locale, string> = { tr: "Türkçe", es: "Español", it: "Italiano", pt: "Português" };

/**
 * Uygulama içi dil değiştirici (navbar). Aynı sayfanın seçilen dildeki
 * sürümüne geçer ve tercihi NEXT_LOCALE çerezine yazar.
 *
 * KOMPAKT açılır menü: sadece aktif dili + globe gösterir, tıklayınca listeyi
 * açar. Eskiden 4 dil yan yana pastille duruyordu ve mobil header'ı taşırıyordu.
 *
 * `@/i18n/navigation`'dan gelen usePathname dil prefix'ini İÇERMEZ; router.replace
 * hedef dile göre doğru prefix'i ekler.
 */
export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca / Esc ile kapat.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Dil / Language"
      >
        <Globe className="h-3.5 w-3.5 text-slate-400" />
        {LABELS[locale]}
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[8.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => {
                  setOpen(false);
                  router.replace(pathname, { locale: l });
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  l === locale
                    ? "bg-indigo-50 font-semibold text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="w-6 shrink-0 font-semibold">{LABELS[l]}</span>
                <span className="text-slate-400">{NAMES[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
