"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Lock, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

/**
 * Şifre sıfırlama (token'lı). Bağlantıdaki `token` query parametresini okur,
 * yeni parolayı /auth/reset-password'e gönderir. Token geçersiz/süresi dolmuşsa
 * backend hata döner. Bu sayfa noindex'tir (kök layout varsayılanı).
 */
function ResetPasswordForm() {
  const t = useTranslations("auth.reset");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t("missingToken"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("tooShort"));
      return;
    }
    if (newPassword !== confirm) {
      setError(t("mismatch"));
      return;
    }

    setStatus("saving");
    try {
      await axios.post(`${apiBase}/auth/reset-password`, { token, newPassword });
      setStatus("done");
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err: any) {
      setStatus("idle");
      setError(err?.response?.data?.message ?? t("missingToken"));
    }
  }

  const input =
    "w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <Image src="/logo-512.png" alt="ZeytinSaaS" width={56} height={56} className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">ZeytinSaaS</h1>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        {status === "done" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">{t("successTitle")}</h2>
            <p className="text-slate-600">{t("successMsg")}</p>
            <Link href="/auth/login" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
              <ArrowLeft className="h-4 w-4" /> {t("toLogin")}
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900">{t("title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("newPassword")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={input} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("confirmPassword")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={status === "saving"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === "saving" ? t("saving") : t("submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
