"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  CreditCard,
  User,
  Mail,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Loader2,
  Phone
} from "lucide-react";
import { cn } from "@/lib/cn";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tBrand = useTranslations("auth");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    licenseCode: "",
    factoryName: "",
    factoryShortCode: "",
    officialName: "",
    taxId: "",
    address: "",
    city: "",
    userName: "",
    phone: "",
    email: "",
    password: "",
    acceptedTerms: false,
  });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = async () => {
    // Basic validation per step
    if (step === 1 && !formData.licenseCode) {
      toast.error(t("licenseRequired"));
      return;
    }

    // Step 1: Backend License Check
    if (step === 1) {
        setLoading(true);
        try {
            const res = await axios.post(`${apiBase}/auth/check-license`, { code: formData.licenseCode });
            if (res.data.success) {
                // Optional: You could show plan duration or details here
                toast.success(t("licenseValidated", { days: res.data.planDurationDays }));
                setStep(step + 1);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || t("licenseInvalid"));
            return; // Stop here
        } finally {
            setLoading(false);
        }
        return;
    }

    if (step === 2 && (!formData.factoryName || !formData.factoryShortCode)) {
      toast.error(t("factoryRequired"));
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate short code format (e.g., must be 3-5 chars uppercase)
      if (formData.factoryShortCode.length < 3) {
          throw new Error(t("shortCodeMin"));
      }

      await axios.post(`${apiBase}/auth/register`, {
        ...formData,
        factoryShortCode: formData.factoryShortCode.toUpperCase(),
      });

      toast.success(t("success"));
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // 1. Duplicate Email Check
      if (err.response?.status === 400 && 
         (JSON.stringify(err.response?.data?.message).includes("e-posta adresi zaten kayıtlı") || 
          JSON.stringify(err.response?.data?.message).includes("email"))) {
          toast.error(
              <div className="flex flex-col gap-2">
                  <span>{t("emailExists")}</span>
                  <Link href="/auth/forgot-password" className="text-indigo-200 hover:text-white underline text-sm font-medium">
                      {t("forgotYourPassword")}
                  </Link>
              </div>,
              { duration: 5000 }
          );
          return;
      }

      // 2. Generic Error Handling (Array or String)
      let errorMessage = t("genericError");
      const responseMsg = err.response?.data?.message;

      if (Array.isArray(responseMsg)) {
          // Class-validator returns array of strings
          errorMessage = responseMsg.join(", ");
      } else if (typeof responseMsg === "string") {
          errorMessage = responseMsg;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        {/* Header / Logo */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                <Image src="/logo-512.png" alt="ZeytinSaaS" width={56} height={56} className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ZeytinSaaS</h1>
            <p className="mt-2 text-slate-500 font-medium">{tBrand("tagline")}</p>
        </div>

        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* Steps Indicator */}
            <div className="mb-8 flex items-center justify-between px-4 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
                
                {[1, 2, 3].map((s) => (
                    <div key={s} className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all border-2 z-10",
                        step >= s 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" 
                            : "bg-white border-slate-200 text-slate-400"
                    )}>
                        {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* STEP 1: License */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">{t("step1Title")}</h2>
                            <p className="text-sm text-slate-500 mt-1">{t("step1Subtitle")}</p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                {t("licenseCode")}
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="licenseCode"
                                    type="text"
                                    placeholder="XXXX-XXXX-XXXX"
                                    value={formData.licenseCode}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 transition-all font-mono uppercase tracking-wide"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Factory Info */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">{t("step2Title")}</h2>
                            <p className="text-sm text-slate-500 mt-1">{t("step2Subtitle")}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("factoryName")}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        name="factoryName"
                                        type="text"
                                        placeholder={t("factoryNamePlaceholder")}
                                        value={formData.factoryName}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("officialName")}</label>
                                <input
                                    name="officialName"
                                    type="text"
                                    placeholder={t("officialNamePlaceholder")}
                                    value={formData.officialName}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("shortCode")}</label>
                                <input
                                    name="factoryShortCode"
                                    type="text"
                                    placeholder="AYD"
                                    maxLength={5}
                                    value={formData.factoryShortCode}
                                    onChange={(e) => setFormData({...formData, factoryShortCode: e.target.value.toUpperCase()})}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 font-mono uppercase focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("taxId")}</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        name="taxId"
                                        type="text"
                                        placeholder="1234567890"
                                        value={formData.taxId}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("city")}</label>
                                <input
                                    name="city"
                                    type="text"
                                    placeholder={t("cityPlaceholder")}
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("address")}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        name="address"
                                        placeholder={t("addressPlaceholder")}
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: User Info */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">{t("step3Title")}</h2>
                            <p className="text-sm text-slate-500 mt-1">{t("step3Subtitle")}</p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("fullName")}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="userName"
                                    type="text"
                                    placeholder={t("fullNamePlaceholder")}
                                    value={formData.userName}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("phone")}</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder={t("phonePlaceholder")}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("email")}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder={t("emailPlaceholder")}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("password")}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="pt-4 border-t border-slate-200">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="acceptedTerms"
                                    checked={formData.acceptedTerms}
                                    onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    required
                                />
                                <span className="text-sm text-slate-700 leading-relaxed">
                                    {t.rich("terms", {
                                        terms: (chunks) => (
                                            <Link href="/legal/terms" target="_blank" className="text-indigo-600 hover:text-indigo-700 underline font-medium">
                                                {chunks}
                                            </Link>
                                        ),
                                        privacy: (chunks) => (
                                            <Link href="/legal/privacy" target="_blank" className="text-indigo-600 hover:text-indigo-700 underline font-medium">
                                                {chunks}
                                            </Link>
                                        ),
                                    })}
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t("back")}
                        </button>
                    )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={loading} // Disable while checking license
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("continue")}
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </button>
                        ) : (
                        <button
                            type="submit"
                            disabled={loading || !formData.acceptedTerms}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                            {t("complete")}
                        </button>
                    )}
                </div>
            </form>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
            {t("haveAccount")}{" "}
            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4">
                {t("login")}
            </Link>
        </div>
    </div>
  );
}