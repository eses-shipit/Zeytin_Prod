import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { Link } from "@/i18n/navigation";
import {
  Scale,
  Factory,
  Vault,
  Droplets,
  SlidersHorizontal,
  Languages,
  Check,
  ArrowRight,
} from "lucide-react";
import { INDEXABLE, localizedAlternates } from "@/lib/seo";
import { isLocale, localeToOpenGraph, routing } from "@/i18n/routing";
import { ContactForm } from "@/components/landing/ContactForm";
import { LocaleSwitcher } from "@/components/landing/LocaleSwitcher";

/**
 * Herkese açık pazarlama / landing sayfası (`/`).
 *
 * Uygulamanın geri kalanı `noindex` iken bu sayfa indekslenmesi İSTENEN tek
 * asıl sayfadır (bkz. seo.ts PUBLIC_PATHS). İçerik SSR edilir ki arama motoru
 * ve sosyal önizleme gerçek metni görsün. İnteraktif kısımlar (form, dil
 * seçici) ayrı client component'lerde.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const activeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: activeLocale, namespace: "landing" });
  const alternates = localizedAlternates("/");

  return {
    title: t("hero.title"),
    description: t("hero.subtitle"),
    alternates,
    robots: INDEXABLE,
    openGraph: {
      type: "website",
      locale: localeToOpenGraph[activeLocale],
      siteName: "ZeytinSaaS",
      url: alternates.languages[activeLocale],
      title: `${t("nav.product")} — ${t("hero.title")}`,
      description: t("hero.subtitle"),
    },
  };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const isAuthed = Boolean(cookies().get("token")?.value);

  const features = [
    { icon: Scale, key: "weighing" },
    { icon: Factory, key: "production" },
    { icon: Vault, key: "escrow" },
    { icon: Droplets, key: "fee" },
    { icon: SlidersHorizontal, key: "policy" },
    { icon: Languages, key: "multilang" },
  ] as const;

  const plans = [
    { key: "demo", interest: "DEMO", highlight: false, cta: "demoCta", href: "#contact" },
    { key: "standard", interest: "STANDARD", highlight: false, cta: "cta", href: "#contact" },
    { key: "pro", interest: "PRO", highlight: true, cta: "cta", href: "#contact" },
  ] as const;

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white">
              <Droplets className="h-5 w-5" />
            </span>
            <span>{t("nav.product")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            {isAuthed ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {t("footer.toApp")} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {t("nav.login")}
                </Link>
                <a
                  href="#contact"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  {t("nav.getStarted")}
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/30" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            {t("hero.badge")}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t("hero.ctaPrimary")} <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t("features.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{t("features.subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{t(`features.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t(`features.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">{t("pricing.title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{t("pricing.subtitle")}</p>
          </div>
          <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const featureList = t.raw(`pricing.${plan.key}.features`) as string[];
              return (
                <div
                  key={plan.key}
                  className={`relative rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900 ${
                    plan.highlight
                      ? "border-emerald-500 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                      {t("pricing.popular")}
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{t(`pricing.${plan.key}.name`)}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(`pricing.${plan.key}.tagline`)}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{t(`pricing.${plan.key}.price`)}</span>
                    {plan.key !== "demo" && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">{t("pricing.perYear")}</span>
                    )}
                    {plan.key === "demo" && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        · {t("pricing.demo.period")}
                      </span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {featureList.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.href}
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      plan.highlight
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t(`pricing.${plan.cta}`)}
                  </a>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-slate-500 dark:text-slate-400">
            {t("pricing.note")}
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-3xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t("contact.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">{t("contact.subtitle")}</p>
        </div>
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <Droplets className="h-5 w-5 text-emerald-600" />
            {t("nav.product")}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("footer.tagline")}</p>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} · {t("footer.rights")}
          </p>
        </div>
      </footer>
    </main>
  );
}
