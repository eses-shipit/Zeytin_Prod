import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { Fraunces, Inter } from "next/font/google";
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
  Mail,
} from "lucide-react";
import { INDEXABLE, localizedAlternates } from "@/lib/seo";
import { isLocale, localeToOpenGraph, routing } from "@/i18n/routing";
import { ContactForm } from "@/components/landing/ContactForm";
import { LocaleSwitcher } from "@/components/landing/LocaleSwitcher";

/**
 * Herkese açık pazarlama / landing sayfası (`/`).
 *
 * Görsel tasarım "sıcak" bir yönde (Fraunces serif + krem/zeytin/zümrüt paleti,
 * grain dokusu, madalyon ikonlar). Bu bilinçli tek bir marka görünümüdür; app'in
 * geri kalanının slate/indigo temasını etkilememesi için bütün stiller
 * `.zeytin-landing` altında kapsanır.
 *
 * Fontlar next/font ile self-host edilir (harici CDN yok). Türkçe/İspanyolca/
 * İtalyanca/Portekizce karakterler için "latin-ext" alt kümesi de yüklenir.
 *
 * İçerik i18n'dir (mevcut `landing` namespace). Taslakta bulunan uydurma
 * kullanım istatistikleri, "140+ değirmen" ve sahte e-posta/telefon bilinçli
 * olarak ELENDİ: tek tenant'lı yeni bir üründe bunlar ziyaretçiyi yanıltırdı.
 */

const display = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

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

// Marka renkleri ve dekorasyonları — yalnızca landing kapsamında.
const LANDING_CSS = `
.zeytin-landing{
  --ink:#1a2418; --cream:#f5efe0; --cream-2:#ece3cd; --emerald:#0f5f43;
  --emerald-deep:#0a3d2c; --olive:#6b6b2a; --ochre:#b8860b; --line:#d9cfb4;
  background:var(--cream); color:var(--ink);
  font-family:var(--font-body), system-ui, sans-serif;
}
.zeytin-landing .font-display{ font-family:var(--font-display), Georgia, serif; }
.zeytin-landing .grain{
  background-image:
    radial-gradient(rgba(26,36,24,0.05) 1px, transparent 1px),
    radial-gradient(rgba(26,36,24,0.04) 1px, transparent 1px);
  background-size:22px 22px, 37px 37px; background-position:0 0, 11px 11px;
}
.zeytin-landing .squiggle{
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 12'><path d='M2 8 Q 25 0 50 6 T 100 6 T 150 6 T 198 6' stroke='%230f5f43' stroke-width='3' fill='none' stroke-linecap='round'/></svg>");
  background-repeat:no-repeat; background-position:0 100%; background-size:100% 10px; padding-bottom:14px;
}
.zeytin-landing .chip{ background:linear-gradient(180deg,#fff8e7,#f1e6c3); border:1px solid var(--line); }
.zeytin-landing .medallion{
  background:radial-gradient(circle at 30% 20%, #1a7a57, #0a3d2c 70%); color:var(--cream);
  box-shadow:inset 0 0 0 2px rgba(255,255,255,0.08), 0 6px 14px -6px rgba(10,61,44,0.5);
}
.zeytin-landing .card{
  background:#fffdf6; border:1px solid var(--line);
  box-shadow:0 1px 0 rgba(255,255,255,0.8) inset, 0 18px 40px -30px rgba(26,36,24,0.25);
}
.zeytin-landing .pro-card{
  background:linear-gradient(180deg,#0a3d2c 0%, #0f5f43 100%); color:var(--cream); border:1px solid #0a3d2c;
  box-shadow:0 30px 60px -30px rgba(10,61,44,0.55), inset 0 1px 0 rgba(255,255,255,0.08);
}
.zeytin-landing .btn-primary{
  background:var(--emerald); color:var(--cream);
  box-shadow:0 1px 0 rgba(255,255,255,0.15) inset, 0 8px 20px -10px rgba(15,95,67,0.6);
  transition:transform .2s ease, background .2s ease, box-shadow .2s ease;
}
.zeytin-landing .btn-primary:hover{ background:var(--emerald-deep); transform:translateY(-1px); }
.zeytin-landing .btn-ghost{ border:1px solid var(--ink); color:var(--ink); transition:all .2s ease; }
.zeytin-landing .btn-ghost:hover{ background:var(--ink); color:var(--cream); }
.zeytin-landing .paper{ background:linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0)), var(--cream); }
.zeytin-landing .ticker{ animation:zl-slide 40s linear infinite; }
@keyframes zl-slide{ from{transform:translateX(0);} to{transform:translateX(-50%);} }
@media (prefers-reduced-motion: reduce){ .zeytin-landing .ticker{ animation:none; } }
`;

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

  // Görsel sıra: Deneme (sol), Pro (orta, vurgulu), Standart (sağ) — taslaktaki düzen.
  const plans = [
    { key: "demo", highlight: false, cta: "demoCta" },
    { key: "pro", highlight: true, cta: "cta" },
    { key: "standard", highlight: false, cta: "cta" },
  ] as const;

  // Zeytin bölge/çeşit adları — dekoratif şerit. Müşteri iddiası DEĞİL, coğrafi renk.
  const regions = ["Ayvalık", "Edremit", "Urla", "Milas", "Didim", "Memecik", "Gemlik", "Jaén", "Puglia", "Alentejo", "Kalamata"];

  return (
    <div className={`zeytin-landing ${display.variable} ${body.variable} min-h-screen`}>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--cream)]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a href="#" className="flex items-center gap-2">
            <span className="medallion flex h-9 w-9 items-center justify-center rounded-full">
              <Droplets className="h-5 w-5" />
            </span>
            <span className="font-display text-xl tracking-tight">
              Zeytin<span className="italic text-[color:var(--emerald)]">SaaS</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#features" className="transition hover:text-[color:var(--emerald)]">{t("features.title")}</a>
            <a href="#pricing" className="transition hover:text-[color:var(--emerald)]">{t("pricing.title")}</a>
            <a href="#contact" className="transition hover:text-[color:var(--emerald)]">{t("contact.title")}</a>
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            {isAuthed ? (
              <Link href="/dashboard" className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium">
                {t("footer.toApp")} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="hidden px-3 py-2 text-sm transition hover:text-[color:var(--emerald)] sm:inline-flex">
                  {t("nav.login")}
                </Link>
                <a href="#contact" className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium">
                  {t("nav.getStarted")} <ArrowRight className="h-4 w-4" />
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="paper relative overflow-hidden pb-16 pt-20 md:pb-24 md:pt-28">
        <div className="grain pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-7">
            <div className="chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--emerald)]" />
              {t("hero.badge")}
            </div>

            <h1 className="font-display mt-6 text-[42px] leading-[1.03] tracking-tight sm:text-6xl lg:text-[72px]">
              {t("hero.title")}
            </h1>
            <div className="squiggle mt-1 h-2 w-56 max-w-full" />

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[color:var(--ink)]/75">
              {t("hero.subtitle")}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#contact" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-medium">
                {t("hero.ctaPrimary")} <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/auth/login" className="btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-medium">
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>

          {/* Ürün önizleme kartı (örnek veri — illüstratif) */}
          <div className="relative lg:col-span-5">
            <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-[color:var(--emerald)]/10 to-[color:var(--ochre)]/10 blur-2xl" />
            <div className="card relative rotate-[1.2deg] rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-display text-sm italic text-[color:var(--ink)]/50">{t("nav.product")}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[color:var(--cream-2)]/70 p-4">
                  <div className="flex items-center gap-1.5 text-[color:var(--ink)]/55"><Scale className="h-4 w-4" /></div>
                  <div className="font-display mt-1 text-3xl">14.820 <span className="text-sm italic text-[color:var(--ink)]/60">kg</span></div>
                </div>
                <div className="medallion rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 opacity-80"><Droplets className="h-4 w-4" /></div>
                  <div className="font-display mt-1 text-3xl">21.4<span className="text-lg">%</span></div>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-[color:var(--line)] p-4">
                <ul className="divide-y divide-[color:var(--line)]/60 text-sm">
                  {[
                    { n: "M. Yılmaz", kg: "2.340 kg", c: "bg-amber-500" },
                    { n: "Urla Kooperatifi", kg: "5.110 kg", c: "bg-emerald-600" },
                    { n: "H. Kaya", kg: "1.020 kg", c: "bg-indigo-500" },
                  ].map((r) => (
                    <li key={r.n} className="flex items-center justify-between py-2.5">
                      <div>
                        <div className="font-medium">{r.n}</div>
                        <div className="text-xs text-[color:var(--ink)]/55">{r.kg}</div>
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${r.c}`} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Dekoratif bölge şeridi (müşteri iddiası değil) */}
        <div className="relative mt-16 border-y border-[color:var(--line)] bg-[color:var(--cream-2)]/50">
          <div className="mx-auto max-w-7xl overflow-hidden px-6 py-5 lg:px-10">
            <div className="ticker flex gap-10 whitespace-nowrap font-display text-lg italic text-[color:var(--ink)]/60">
              {[...regions, ...regions].map((r, i) => (
                <span key={i} className="flex items-center gap-10">{r} <span className="text-[color:var(--olive)]">·</span></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 max-w-3xl">
            <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--olive)]">— {t("nav.product")}</span>
            <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-5xl">{t("features.title")}</h2>
            <p className="mt-4 text-lg text-[color:var(--ink)]/70">{t("features.subtitle")}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, key }, i) => (
              <article key={key} className="card rounded-3xl p-7 transition hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="medallion flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-lg italic text-[color:var(--olive)]">0{i + 1}</span>
                </div>
                <h3 className="font-display mt-6 text-2xl">{t(`features.${key}.title`)}</h3>
                <p className="mt-3 leading-relaxed text-[color:var(--ink)]/70">{t(`features.${key}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-y border-[color:var(--line)] bg-[color:var(--cream-2)]/60 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--olive)]">— {t("pricing.title")}</span>
            <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-5xl">{t("pricing.subtitle")}</h2>
          </div>
          <div className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const featureList = t.raw(`pricing.${plan.key}.features`) as string[];
              const pro = plan.highlight;
              return (
                <div
                  key={plan.key}
                  className={`relative flex flex-col rounded-3xl p-8 ${pro ? "pro-card lg:-translate-y-4" : "card"}`}
                >
                  {pro && (
                    <div className="absolute -top-3 left-8 rounded-full bg-[color:var(--ochre)] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[color:var(--ink)]">
                      {t("pricing.popular")}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl">{t(`pricing.${plan.key}.name`)}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wider ${pro ? "border border-white/20 bg-white/10" : "chip"}`}>
                      {plan.key === "demo" ? t("pricing.demo.period") : t("pricing.perYear").replace("/", "").trim()}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${pro ? "opacity-80" : "text-[color:var(--ink)]/60"}`}>
                    {t(`pricing.${plan.key}.tagline`)}
                  </p>
                  <div className="mt-8">
                    <div className="font-display text-5xl">
                      {t(`pricing.${plan.key}.price`)}
                      {plan.key !== "demo" && <span className={`text-lg ${pro ? "opacity-70" : "text-[color:var(--ink)]/60"}`}>{t("pricing.perYear")}</span>}
                    </div>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3 text-sm">
                    {featureList.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${pro ? "text-[color:var(--cream)]" : "text-[color:var(--emerald)]"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`mt-8 rounded-full px-5 py-3 text-center font-medium transition ${
                      pro ? "bg-[color:var(--cream)] text-[color:var(--emerald-deep)] hover:bg-white" : "btn-ghost"
                    }`}
                  >
                    {t(`pricing.${plan.cta}`)}
                  </a>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-[color:var(--ink)]/55">{t("pricing.note")}</p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-5">
            <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--olive)]">— {t("nav.getStarted")}</span>
            <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-5xl">{t("contact.title")}</h2>
            <p className="mt-6 text-lg leading-relaxed text-[color:var(--ink)]/70">{t("contact.subtitle")}</p>

            <div className="mt-10 space-y-5 text-sm">
              {[
                { icon: SlidersHorizontal, text: t("features.policy.title") },
                { icon: Languages, text: t("features.multilang.title") },
                { icon: Mail, text: t("footer.tagline") },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="medallion flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="pt-2 text-[color:var(--ink)]/75">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card rounded-3xl p-8 md:p-10 lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-[color:var(--emerald-deep)] text-[color:var(--cream)]">
        <div className="grain pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-12 lg:flex-row lg:px-10">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--cream)] text-[color:var(--emerald-deep)]">
              <Droplets className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl">Zeytin<span className="italic">SaaS</span></span>
          </div>
          <p className="max-w-sm text-center text-sm opacity-75 lg:text-left">{t("footer.tagline")}</p>
          <p className="text-sm opacity-60">© {new Date().getFullYear()} · {t("footer.rights")}</p>
        </div>
      </footer>
    </div>
  );
}
