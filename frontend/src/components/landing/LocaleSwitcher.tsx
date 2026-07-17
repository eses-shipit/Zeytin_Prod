"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Globe, ChevronDown } from "lucide-react";

const LABELS: Record<Locale, string> = { tr: "TR", es: "ES", it: "IT", pt: "PT" };
const NAMES: Record<Locale, string> = { tr: "Türkçe", es: "Español", it: "Italiano", pt: "Português" };

/**
 * Landing page dil seçici — KOMPAKT açılır menü.
 *
 * Eskiden 4 dil yan yana pastille duruyordu ve mobil header'ı taşırıyordu.
 * Artık sadece aktif dil + globe gösterir, tıklayınca listeyi açar; hem mobil
 * hem masaüstünde tek satıra rahat sığar.
 */
export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-white/60 px-2.5 py-1.5 text-xs font-medium text-[color:var(--ink)]/80 transition hover:bg-[color:var(--cream-2)]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Dil / Language"
      >
        <Globe className="h-3.5 w-3.5 text-[color:var(--olive)]" />
        {LABELS[locale]}
        <ChevronDown className={`h-3 w-3 text-[color:var(--olive)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 min-w-[8.5rem] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--cream)] py-1 shadow-xl"
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
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                  l === locale
                    ? "bg-[color:var(--emerald)] text-[color:var(--cream)]"
                    : "text-[color:var(--ink)]/70 hover:bg-[color:var(--cream-2)]"
                }`}
              >
                <span className="w-6 shrink-0 font-semibold">{LABELS[l]}</span>
                <span className={l === locale ? "opacity-80" : "text-[color:var(--ink)]/50"}>{NAMES[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
