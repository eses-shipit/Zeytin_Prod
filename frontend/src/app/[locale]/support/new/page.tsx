"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

export default function NewTicketPage() {
  const t = useTranslations("support");
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const tenantId = "tenant_demo";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(
        `${apiBase}/support`, 
        { subject, priority, message },
        { headers: { "X-Tenant-ID": tenantId } }
      );
      toast.success(t("new.success"));
      router.push("/support");
    } catch (err) {
      toast.error(t("new.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Link href="/support" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Taleplere Dön
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Yeni Destek Talebi</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Konu</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sorunu kısaca özetleyin"
              className="w-full rounded-none border-2 border-black px-4 py-3 text-slate-900 focus:border-black focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Öncelik Seviyesi</label>
            <div className="grid grid-cols-3 gap-3">
              {["LOW", "NORMAL", "URGENT"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium border transition-all",
                    priority === p 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  )}
                >
                  {p === "LOW" ? "Düşük" : p === "NORMAL" ? "Normal" : "Acil"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mesajınız</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detayları buraya yazın..."
              className="w-full rounded-none border-2 border-black px-4 py-3 text-slate-900 focus:border-black focus:ring-0"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white rounded-lg py-3 font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Gönderiliyor..." : (
                <>
                  <Send className="w-4 h-4" />
                  Talebi Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

