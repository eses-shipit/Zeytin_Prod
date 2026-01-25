"use client";

import axios from "@/lib/axios";
import {
  CheckCircle2,
  PlugZap,
  Scale,
  TriangleAlert,
  UserRound,
  History,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useScale } from "../hooks/useScale";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { OfflineStorageService } from "../services/offline-storage";
import { CustomerFormModal } from "./CustomerFormModal";
import { Plus } from "lucide-react";

type CustomerOption = {
  id: string;
  name: string;
};

type ProductOption = {
  id: string;
  name: string;
};

type TicketPayload = {
  customerId: string;
  grossKg: number;
  tareKg: number;
  netKg: number;
  scaleWeightKg: number | null;
  origin?: string;
  productId?: string;
  variety?: string; // Legacy support
  quality?: "TREE" | "GROUND" | "MIXED";
  note?: string; // New Field
};

type RecentTicket = {
  id: string;
  publicId?: string;
  customerId: string;
  grossKg: number;
  tareKg: number;
  netKg: number;
  createdAt: string;
  customer: {
    name: string;
  };
};

export function WeighingTerminal() {
  const { weightKg, isConnected, error, connect, disconnect } = useScale();
  const { isOnline } = useNetworkStatus();
  const [grossKg, setGrossKg] = useState<number>(0);
  const [tareKg, setTareKg] = useState<number>(0);
  const [customerId, setCustomerId] = useState<string>("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);

  // Master Data State
  const [origin, setOrigin] = useState("");
  const [productId, setProductId] = useState("");
  const [quality, setQuality] = useState<"TREE" | "GROUND" | "MIXED">("TREE");
  const [note, setNote] = useState(""); // New State
  const [showDetails, setShowDetails] = useState(true);

  const netKg = useMemo(() => Math.max(grossKg - tareKg, 0), [grossKg, tareKg]);

  // Verileri çek
  const fetchData = async () => {
    try {
      const [custRes, recentRes, prodRes] = await Promise.all([
        axios.get('/customers'),
        axios.get('/tickets/recent'),
        axios.get('/products'),
      ]);
      setCustomers(custRes.data);
      setRecentTickets(recentRes.data);
      setProducts(prodRes.data);
      
      // İlk müşteriyi seçili yap (liste doluysa)
      if (custRes.data.length > 0 && !customerId) {
        setCustomerId(custRes.data[0].id);
      }
      
      // İlk ürünü seçili yap
      if (prodRes.data.length > 0 && !productId) {
        setProductId(prodRes.data[0].id);
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    setStatus(null);
    setIsSubmitting(true);

    const payload: TicketPayload = {
      customerId,
      grossKg,
      tareKg,
      netKg,
      scaleWeightKg: weightKg,
      origin: origin || undefined,
      productId: productId || undefined,
      quality: quality || undefined,
      note: note || undefined,
    };

    if (!isOnline) {
      // Store relative URL for offline sync
      OfflineStorageService.addToQueue({
        url: '/tickets',
        method: 'POST',
        data: payload
      });
      
      setStatus({ type: "success", message: "Fiş cihazınıza kaydedildi. İnternet bağlantısı geldiğinde otomatik gönderilecek." });
      setGrossKg(0);
      setTareKg(0);
      setNote("");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('/tickets', payload);
      setStatus({ type: "success", message: "Kantar fişi başarıyla oluşturuldu." });
      // Reset form after success
      setGrossKg(0);
      setTareKg(0);
      setNote(""); // Reset note
      // Listeyi güncelle
      fetchData();
    } catch {
      setStatus({ type: "error", message: "Fiş kaydedilirken bir hata oluştu." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const useLiveWeightAsGross = () => {
    if (weightKg !== null) setGrossKg(weightKg);
  };

  const useLiveWeightAsTare = () => {
    if (weightKg !== null) setTareKg(weightKg);
  };

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Scale className="h-7 w-7 text-indigo-600" />
            Kantar Terminali
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Zeytin kabul ve tartım işlemleri
          </p>
        </div>
        <button
          type="button"
          onClick={isConnected ? disconnect : connect}
          className={cn(
            "group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
            isConnected
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500"
              : "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:ring-indigo-500",
          )}
        >
          <PlugZap className={cn("h-4 w-4 transition-colors", isConnected ? "text-slate-500" : "text-indigo-200")} />
          {isConnected ? "Bağlantıyı Kes" : "Kantar Bağlan"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column: Weighing Display & Inputs */}
        <div className="min-w-0 w-full space-y-6">
          {/* Live Weight Display */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="absolute right-0 top-0 p-4">
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
                isConnected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
              )}>
                <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                {isConnected ? "Canlı" : "Çevrimdışı"}
              </span>
            </div>
            
            <div className="text-center">
              <div className="mb-2 text-sm font-medium text-slate-500 uppercase tracking-wider">Anlık Ağırlık</div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {weightKg ?? 0}
                </span>
                <span className="text-2xl font-medium text-slate-400">kg</span>
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
                <TriangleAlert className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {/* Weighing Inputs */}
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Brüt Ağırlık</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    value={grossKg}
                    onChange={(e) => setGrossKg(Number(e.target.value))}
                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">kg</span>
                </div>
                <button
                  onClick={useLiveWeightAsGross}
                  className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:bg-indigo-100"
                  title="Kantardan Al"
                >
                  <History className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dara Ağırlık</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    value={tareKg}
                    onChange={(e) => setTareKg(Number(e.target.value))}
                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">kg</span>
                </div>
                <button
                  onClick={useLiveWeightAsTare}
                  className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:bg-indigo-100"
                  title="Kantardan Al"
                >
                  <History className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="col-span-full pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between rounded-xl bg-slate-900 px-6 py-4 text-white">
                <span className="text-sm font-medium text-slate-300">Net Zeytin</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">{netKg}</span>
                  <span className="text-lg text-slate-400">kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Action */}
        <div className="min-w-0 w-full flex flex-col gap-6">
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <UserRound className="h-5 w-5 text-indigo-600" />
              Fiş Detayları
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Müşteri</label>
                <div className="flex gap-2">
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Seçiniz...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setCustomerModalOpen(true)}
                    className="flex aspect-square items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="Yeni Müşteri Ekle"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Master Data Inputs - Accordion */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex w-full items-center justify-between p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                  <span>Ürün Detayları</span>
                  <span className="text-lg text-slate-400">{showDetails ? "−" : "+"}</span>
                </button>
                
                {showDetails && (
                  <div className="p-4 pt-0 grid gap-4 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Mevkii / Köy</label>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="Örn: Taşlık"
                        className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Cins</label>
                        <select
                          value={productId}
                          onChange={(e) => setProductId(e.target.value)}
                          className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm bg-white"
                        >
                          <option value="" disabled>Seçiniz...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Kalite</label>
                        <select
                          value={quality}
                          onChange={(e) => setQuality(e.target.value as any)}
                          className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm bg-white"
                        >
                          <option value="TREE">Üst (Sırık)</option>
                          <option value="GROUND">Dip</option>
                          <option value="MIXED">Karışık</option>
                        </select>
                      </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Not</label>
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Örn: Çuval iadesi yapılacak..."
                          className="w-full rounded-lg border-slate-200 px-3 py-2 text-sm bg-white"
                        />
                    </div>
                  </div>
                )}
              </div>

              {status && (
                <div className={cn(
                  "flex items-start gap-3 rounded-lg p-4 text-sm",
                  status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                )}>
                  {status.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  )}
                  <p>{status.message}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || netKg <= 0 || !customerId}
                className={cn(
                  "w-full rounded-xl py-4 text-base font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                  isSubmitting || netKg <= 0 || !customerId
                    ? "bg-slate-100 text-slate-400"
                    : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md focus:ring-indigo-500"
                )}
              >
                {isSubmitting ? "Kaydediliyor..." : "Fişi Kaydet"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Tickets Table */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 flex items-center gap-2">
          <History className="h-5 w-5 text-slate-500" />
          Son İşlemler
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-l-lg">Fiş No</th>
                <th className="px-4 py-3 font-semibold">Tarih</th>
                <th className="px-4 py-3 font-semibold">Müşteri</th>
                <th className="px-4 py-3 font-semibold">Brüt</th>
                <th className="px-4 py-3 font-semibold">Dara</th>
                <th className="px-4 py-3 font-semibold text-right rounded-r-lg">Net (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Henüz kayıt bulunmuyor.
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">
                       {ticket.publicId || ticket.id.slice(-6)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {ticket.customer.name}
                    </td>
                    <td className="px-4 py-3">{ticket.grossKg}</td>
                    <td className="px-4 py-3">{ticket.tareKg}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {ticket.netKg}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerFormModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setCustomerModalOpen(false)} 
        onSuccess={(newCustomer) => {
          setCustomers(prev => [...prev, newCustomer]);
          setCustomerId(newCustomer.id);
        }}
      />
    </div>
  );
}
