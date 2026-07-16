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
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">{t("successTitle")}</h3>
        <p className="text-emerald-700 dark:text-emerald-300">{t("successMsg")}</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("name")} <span className="text-red-500">*</span>
        </label>
        <input name="name" required maxLength={120} className={inputClass} />
      </div>
      <div className="sm:col-span-1">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("email")} <span className="text-red-500">*</span>
        </label>
        <input name="email" type="email" required maxLength={160} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("phone")}</label>
        <input name="phone" type="tel" maxLength={30} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("factory")}</label>
        <input name="factoryName" maxLength={160} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("city")}</label>
        <input name="city" maxLength={80} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("interest")}</label>
        <select name="interest" defaultValue={defaultInterest ?? "DEMO"} className={inputClass}>
          <option value="DEMO">{t("interestDemo")}</option>
          <option value="STANDARD">{t("interestStandard")}</option>
          <option value="PRO">{t("interestPro")}</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("message")}</label>
        <textarea name="message" rows={3} maxLength={2000} className={inputClass} />
      </div>

      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-red-600">{t("error")}</p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "submitting" ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
