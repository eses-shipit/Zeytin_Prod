"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
  Plus,
  Loader2,
  Copy,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

type License = {
  id: string;
  code: string;
  status: "UNUSED" | "USED";
  planDurationDays: number;
  tenant?: { 
    name: string;
    subscriptionEndDate?: string;
  };
  createdAt: string;
};

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  
  // License Create State
  const [licenseDays, setLicenseDays] = useState(365);
  const [creatingLicense, setCreatingLicense] = useState(false);

  const fetchLicenses = async () => {
    try {
      const res = await axios.get("/admin/licenses");
      setLicenses(res.data);
    } catch (err: any) {
      console.error("Fetch licenses error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Lisanslar yüklenemedi.";
      toast.error(errorMessage);
      
      // Eğer unauthorized hatası ise, login sayfasına yönlendir
      if (err.response?.status === 401) {
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleCreateLicense = async () => {
    setCreatingLicense(true);
    try {
      await axios.post("/admin/licenses", { days: licenseDays });
      toast.success("Yeni lisans oluşturuldu");
      fetchLicenses();
    } catch (err: any) {
      console.error("License creation error:", err);
      toast.error(err.response?.data?.message || err.message || "Lisans oluşturulamadı");
    } finally {
      setCreatingLicense(false);
    }
  };

  const handleDeleteLicense = async (id: string) => {
    if (!confirm("Bu lisansı silmek istediğinize emin misiniz?")) return;
    try {
        await axios.delete(`/admin/licenses/${id}`);
        toast.success("Lisans silindi.");
        fetchLicenses();
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Lisans silinemedi.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopyalandı");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl p-6">
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lisans Yönetimi</h1>
                    <p className="text-slate-500 text-sm">Yeni lisans anahtarları oluşturun ve takibini yapın.</p>
                </div>
            </div>

            {/* Create Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Lisans Süresi (Gün)</label>
                <input
                  type="number"
                  value={licenseDays}
                  onChange={(e) => setLicenseDays(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={handleCreateLicense}
                disabled={creatingLicense}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creatingLicense ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Lisans Oluştur
              </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Lisans Kodu</th>
                    <th className="px-6 py-4">Kullanım Durumu</th>
                    <th className="px-6 py-4">Tahmini Bitiş</th>
                    <th className="px-6 py-4">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {licenses.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 text-xs tracking-wide">
                          {l.code}
                      </td>
                      <td className="px-6 py-4">
                        {l.status === "USED" ? (
                            <div className="flex flex-col">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                    <CheckCircle2 className="h-3 w-3" />
                                    KULLANILDI
                                </span>
                                <span className="text-xs text-slate-500 mt-0.5">
                                    {l.tenant?.name || "Bilinmeyen Fabrika"}
                                </span>
                            </div>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                BOŞTA ({l.planDurationDays} Gün)
                            </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {l.status === "USED" && l.tenant?.subscriptionEndDate ? (
                            <span className="font-medium text-slate-900">
                                {new Date(l.tenant.subscriptionEndDate).toLocaleDateString()}
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">
                                Aktif edilirse +{l.planDurationDays} gün
                            </span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-3">
                        {l.status === "UNUSED" ? (
                          <>
                            <button
                                onClick={() => copyToClipboard(l.code)}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                title="Kopyala"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteLicense(l.id)}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                title="Sil"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                            <span className="text-slate-300 text-xs italic">Değiştirilemez</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {licenses.length === 0 && (
                      <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                              Henüz oluşturulmuş lisans yok.
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </main>
    </div>
  );
}
