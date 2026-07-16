import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import type { Section } from "@/content/legal/types";

/**
 * Hukuki dokümanları (Kullanım Koşulları / Gizlilik Politikası) tek tip biçimde
 * render eden sunucu bileşeni. Tüm dokümanların en üstünde, gizlenemez ve
 * belirgin bir TASLAK uyarı bandı gösterir.
 *
 * NOT: Buradaki metinler taslaktır; yayınlanmadan önce bir hukukçu tarafından
 * incelenmelidir. Uyarı bandının kaldırılmaması gerekir.
 */
export function LegalDocument({
  title,
  lastUpdated,
  lastUpdatedLabel,
  draftDisclaimer,
  sections,
  backHref,
  backLabel,
}: {
  title: string;
  lastUpdated: string;
  lastUpdatedLabel: string;
  draftDisclaimer: string;
  sections: Section[];
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        {/* TASLAK uyarı bandı — belirgin, stillendirilmiş ve her zaman görünür. */}
        <div
          role="note"
          aria-label={draftDisclaimer}
          className="mb-8 flex items-start gap-3 rounded-xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-900 shadow-sm"
        >
          <AlertTriangle
            className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold leading-relaxed">
            {draftDisclaimer}
          </p>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {lastUpdatedLabel}: {lastUpdated}
          </p>
        </header>

        <article className="space-y-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="max-w-prose text-[15px] leading-relaxed text-slate-700"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
