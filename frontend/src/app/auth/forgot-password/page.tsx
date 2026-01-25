"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, KeyRound, ArrowRight, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    licenseCode: "",
  });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecoveredPassword(null);

    try {
      const res = await axios.post(`${apiBase}/auth/recover-password`, formData);
      if (res.data.success) {
          setRecoveredPassword(res.data.password);
          toast.success("Bilgiler doğrulandı.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bilgiler doğrulanamadı.");
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
          <p className="mt-2 text-slate-500 font-medium">Şifre Kurtarma</p>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
        {!recoveredPassword ? (
            <>
                <div className="mb-8 text-center">
                <h2 className="text-xl font-semibold text-slate-900">Hesabınızı Doğrulayın</h2>
                <p className="text-sm text-slate-500 mt-1">Güvenlik için e-posta ve lisans kodunuzu girin.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    E-posta Adresi
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="admin@ornek.com"
                        required
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Lisans Kodu
                    </label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                        name="licenseCode"
                        type="text"
                        value={formData.licenseCode}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 font-mono uppercase focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="XXXX-XXXX-XXXX"
                        required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Doğrula ve Şifreyi Göster"}
                </button>
                </form>
            </>
        ) : (
            <div className="text-center space-y-6 animate-in fade-in">
                <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                    <ShieldCheck className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Kimlik Doğrulandı!</h2>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Mevcut Şifreniz:</p>
                    <p className="text-lg font-mono font-bold text-slate-900 select-all">{recoveredPassword}</p>
                </div>

                <Link 
                    href="/auth/login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                    Giriş Yap
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-slate-500">
        <Link href="/auth/login" className="flex items-center justify-center gap-2 font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Giriş Ekranına Dön
        </Link>
      </div>
    </div>
  );
}
