"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/axios";

/**
 * Landing page iletişim/lisans talebi formu.
 *
 * Herkese açık `POST /leads` endpoint'ine gönderir (auth gerektirmez).
 * Kişinin e-postası sayfada AÇIK DEĞİL; talep süper admin paneline düşer.
 *
 * `defaultInterest`: fiyat kartındaki "Bilgi al" butonu hangi paketten
 * geldiyse form o pakete önceden ayarlanır.
 */
export function ContactForm({ defaultInterest }: { defaultInterest?: string }) {
  const t = useTranslations("landing.contact");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);

    // Boş opsiyonel alanları göndermiyoruz: backend DTO whitelist'i boş
    // string'i de kabul eder ama veriyi temiz tutmak daha iyi.
    const payload: Record<string, string> = { locale };
    for (const [key, value] of form.entries()) {
      const v = String(value).trim();
      if (v) payload[key] = v;
    }

    try {
      await api.post("/leads", payload);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[color:var(--emerald)]/30 bg-[color:var(--emerald)]/5 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-[color:var(--emerald)]" />
        <h3 className="font-display text-xl text-[color:var(--emerald-deep)]">{t("successTitle")}</h3>
        <p className="text-[color:var(--ink)]/70">{t("successMsg")}</p>
      </div>
    );
  }

  // Krem/zeytin paleti — landing kapsamındaki CSS değişkenlerini kullanır.
  const labelClass = "mb-2 block text-xs font-medium uppercase tracking-widest text-[color:var(--ink)]/60";
  const inputClass =
    "w-full rounded-xl border border-[color:var(--line)] bg-[#fffdf6] px-4 py-3 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--emerald)] focus:ring-2 focus:ring-[color:var(--emerald)]/15";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className={labelClass}>{t("name")} <span className="text-[color:var(--ochre)]">*</span></label>
        <input name="name" required maxLength={120} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("email")} <span className="text-[color:var(--ochre)]">*</span></label>
        <input name="email" type="email" required maxLength={160} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("phone")}</label>
        <input name="phone" type="tel" maxLength={30} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("factory")}</label>
        <input name="factoryName" maxLength={160} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("city")}</label>
        <input name="city" maxLength={80} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("interest")}</label>
        <select name="interest" defaultValue={defaultInterest ?? "DEMO"} className={inputClass}>
          <option value="DEMO">{t("interestDemo")}</option>
          <option value="STANDARD">{t("interestStandard")}</option>
          <option value="PRO">{t("interestPro")}</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass}>{t("message")}</label>
        <textarea name="message" rows={4} maxLength={2000} className={`${inputClass} resize-none`} />
      </div>

      {status === "error" && <p className="text-sm text-red-600 sm:col-span-2">{t("error")}</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-medium disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
