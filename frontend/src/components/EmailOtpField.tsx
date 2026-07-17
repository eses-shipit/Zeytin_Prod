"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";

type Purpose = "REGISTER" | "CONTACT";

/**
 * E-posta OTP doğrulama alanı (kayıt + iletişim formu ortak kullanır).
 *
 * Akış: "Kod gönder" → e-postaya 6 haneli kod → kodu gir → "Doğrula".
 * Doğrulanınca `onVerifiedChange(true)` çağrılır; ebeveyn gönderimi buna göre
 * açar. E-posta değişirse doğrulama sıfırlanır.
 *
 * "Zaten doğrulanmış" kısayolu: e-posta geçerli olunca /status sorulur; son 7
 * gün içinde (ör. iletişim formunda) doğrulanmışsa OTP adımı atlanır — kullanıcı
 * tekrar kod girmez.
 */
export function EmailOtpField({
  email,
  purpose,
  verified,
  onVerifiedChange,
  className,
}: {
  email: string;
  purpose: Purpose;
  verified: boolean;
  onVerifiedChange: (v: boolean) => void;
  className?: string;
}) {
  const t = useTranslations("otp");
  const locale = useLocale();
  const [phase, setPhase] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const trackedEmail = useRef(email);

  const trimmed = email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  const reset = useCallback(() => {
    setPhase("idle");
    setCode("");
    setError("");
    setCooldown(0);
  }, []);

  // E-posta değişince doğrulamayı sıfırla (başka adres = yeniden doğrula).
  useEffect(() => {
    if (email !== trackedEmail.current) {
      trackedEmail.current = email;
      if (verified) onVerifiedChange(false);
      reset();
    }
  }, [email, verified, onVerifiedChange, reset]);

  // Geçerli e-posta için "zaten doğrulanmış mı?" kontrolü (debounce'lu).
  useEffect(() => {
    if (!emailValid || verified) return;
    const id = setTimeout(async () => {
      try {
        const res = await api.post("/verification/email/status", { email: trimmed });
        if (res.data?.verified) onVerifiedChange(true);
      } catch {
        /* sessiz: kontrol başarısızsa normal OTP akışı devam eder */
      }
    }, 600);
    return () => clearTimeout(id);
  }, [emailValid, trimmed, verified, onVerifiedChange]);

  // Yeniden gönderme sayacı.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function sendCode() {
    if (!emailValid || sending || cooldown > 0) return;
    setSending(true);
    setError("");
    try {
      await api.post("/verification/email/request", { email: trimmed, purpose, locale });
      setPhase("sent");
      setCooldown(60);
    } catch {
      setError(t("requestFailed"));
    } finally {
      setSending(false);
    }
  }

  async function verify() {
    if (code.length !== 6 || verifying) return;
    setVerifying(true);
    setError("");
    try {
      await api.post("/verification/email/verify", { email: trimmed, purpose, code });
      onVerifiedChange(true);
    } catch {
      setError(t("wrongCode"));
    } finally {
      setVerifying(false);
    }
  }

  // Doğrulanmış durum — sade yeşil onay.
  if (verified) {
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ${className ?? ""}`}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        {t("verified")}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50/70 p-4 ${className ?? ""}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <ShieldCheck className="h-4 w-4 text-slate-400" />
        {t("title")}
      </div>

      {phase === "idle" ? (
        <>
          <p className="mb-3 text-xs text-slate-500">{emailValid ? t("hint") : t("enterEmailFirst")}</p>
          <button
            type="button"
            onClick={sendCode}
            disabled={!emailValid || sending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            {sending ? t("sending") : t("sendCode")}
          </button>
        </>
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-500">{t("codeSent")}</p>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">{t("codeLabel")}</label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-lg tracking-[0.3em] text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="button"
              onClick={verify}
              disabled={code.length !== 6 || verifying}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
              {verifying ? t("verifying") : t("verify")}
            </button>
            <button
              type="button"
              onClick={sendCode}
              disabled={cooldown > 0 || sending}
              className="text-xs font-medium text-emerald-700 underline underline-offset-2 disabled:text-slate-400 disabled:no-underline"
            >
              {cooldown > 0 ? t("resendIn", { sec: cooldown }) : t("resend")}
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
