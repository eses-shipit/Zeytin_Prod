"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Şifre sıfırlama TALEBİ.
 *
 * Eski hâli güvensiz recover-password endpoint'ini çağırıp kullanıcının
 * mevcut parolasını EKRANDA gösteriyordu. Yeni akış: e-posta gönderilir,
 * kayıtlı olsun olmasın hep aynı genel mesaj döner (kullanıcı numaralandırmaya
 * karşı). Gerçek sıfırlama /auth/reset-password sayfasında yapılır.
 */
export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post(`${apiBase}/auth/forgot-password`, { email, locale });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <Image src="/logo-512.png" alt="ZeytinSaaS" width={56} height={56} className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">ZeytinSaaS</h1>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        {status === "sent" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">{t("sentTitle")}</h2>
            <p className="text-slate-600">{t("sentMsg")}</p>
            <Link href="/auth/login" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
              <ArrowLeft className="h-4 w-4" /> {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900">{t("title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {status === "error" && <p className="text-sm text-red-600">{t("error")}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "sending" ? t("sending") : t("submit")}
              </button>
            </form>

            <Link href="/auth/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-4 w-4" /> {t("backToLogin")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
