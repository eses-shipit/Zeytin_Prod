"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        // Token ve user bilgilerini kaydet
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        
        // Debug: Token'ın kaydedildiğini kontrol et
        console.log("✅ Login successful. Token saved:", res.data.token ? "Yes" : "No");
        console.log("✅ User saved:", res.data.user);
        
        toast.success("Giriş başarılı");
        
        // Kısa bir gecikme ile yönlendir (token'ın kaydedilmesi için)
        setTimeout(() => {
          if (res.data.user.role === "SUPER_ADMIN") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }, 100);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      {/* Header / Logo */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200">
              <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ZeytinSaaS</h1>
          <p className="mt-2 text-slate-500 font-medium">Zeytinyağı Fabrika Otomasyonu</p>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Hoş Geldiniz</h2>
          <p className="text-sm text-slate-500 mt-1">Hesabınıza giriş yapın.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              E-posta Adresi
            </label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  placeholder="admin@ornek.com"
                  required
                />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Şifre</label>
                <Link href="/auth/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Şifremi Unuttum</Link>
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  placeholder="••••••"
                  required
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Giriş Yap"}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-sm text-slate-500">
        Henüz hesabınız yok mu?{" "}
        <Link href="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4">
          Hemen Kayıt Olun
        </Link>
      </div>
    </div>
  );
}