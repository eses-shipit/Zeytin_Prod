"use client";

import axios from "@/lib/axios";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Droplet,
  History,
  TrendingDown,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Coins,
  Edit,
  Phone,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { PaymentModal } from "@/components/PaymentModal";
import { CustomerFormModal } from "@/components/CustomerFormModal";

// Basit Modal Bileşeni
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type Customer = {
  id: string;
  name: string;
  phone?: string;
  tckn?: string;
  oliveOilBalance: number;
  balanceTL: number;
  createdAt?: string;
  updatedAt?: string;
};

type Transaction = {
  id: string;
  type: "OIL_IN" | "OIL_OUT" | "LIQUIDATION" | "PAYMENT" | "SERVICE_FEE";
  amountKg: number | null;
  amountTL: number | null;
  description: string | null;
  createdAt: string;
};

type Tank = {
  id: string;
  name: string;
  capacity: number;
  currentLevel: number;
};

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOliveKg, setTotalOliveKg] = useState<number>(0);
  
  // Modal State
  const [isDeliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [isLiquidationModalOpen, setLiquidationModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  // Form State
  const [amountKg, setAmountKg] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [selectedTankId, setSelectedTankId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchCustomerData = async () => {
    try {
      const [custRes, transRes, tanksRes, summaryRes] = await Promise.all([
        axios.get(`/customers/${params.id}`),
        axios.get(`/transactions/${params.id}/history`),
        axios.get(`/stock/tanks`),
        axios.get(`/customers/${params.id}/summary`),
      ]);
      
      setCustomer(custRes.data);
      setTransactions(transRes.data);
      setTanks(tanksRes.data);
      setTotalOliveKg(summaryRes.data?.totalOliveKg || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [params.id]);

  const handleDelivery = async () => {
    setStatus(null);
    setIsSubmitting(true);
    try {
      await axios.post(
        `/transactions/${params.id}/delivery`,
        { amountKg, description: "Elden teslim", tankId: selectedTankId || undefined }
      );
      setStatus({ type: "success", message: "Teslimat başarılı!" });
      fetchCustomerData();
      setTimeout(() => {
         setDeliveryModalOpen(false);
         setStatus(null);
         setAmountKg(0);
         setSelectedTankId("");
      }, 1500);
    } catch (error) {
      setStatus({ type: "error", message: "İşlem başarısız." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLiquidation = async () => {
    setStatus(null);
    setIsSubmitting(true);
    try {
      await axios.post(
        `/transactions/${params.id}/liquidation`,
        { amountKg, unitPrice, description: "Yağ bozdurma" }
      );
      setStatus({ type: "success", message: "Bozdurma başarılı!" });
      fetchCustomerData();
      setTimeout(() => {
         setLiquidationModalOpen(false);
         setStatus(null);
         setAmountKg(0);
         setUnitPrice(0);
      }, 1500);
    } catch (error) {
      setStatus({ type: "error", message: "İşlem başarısız." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (!customer) return <div className="p-8 text-center text-slate-500">Müşteri bulunamadı.</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">Müşteri Detayı ve Cari Hareketler</p>
          </div>
        </div>
        <button
          onClick={() => setEditModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          <Edit className="h-4 w-4" />
          Düzenle
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Kişisel Bilgiler</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ad Soyad</div>
              <div className="mt-1 text-base font-semibold text-slate-900">{customer.name}</div>
            </div>
          </div>
          {customer.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Telefon</div>
                <div className="mt-1 text-base text-slate-900">{customer.phone}</div>
              </div>
            </div>
          )}
          {customer.tckn && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">TCKN / Vergi No</div>
                <div className="mt-1 text-base text-slate-900">{customer.tckn}</div>
              </div>
            </div>
          )}
          {customer.createdAt && (
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kayıt Tarihi</div>
                <div className="mt-1 text-sm text-slate-600">
                  {new Date(customer.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Yağ Bakiyesi Kartı */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Emanet Yağ Stoğu</h3>
            <Droplet className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-6">
            {customer.oliveOilBalance.toFixed(2)} <span className="text-xl font-medium text-slate-400">kg</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setDeliveryModalOpen(true)}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Yağ Teslim Et
            </button>
            <button 
               onClick={() => setLiquidationModalOpen(true)}
               className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Bozdur (TL)
            </button>
          </div>
        </div>

        {/* TL Bakiyesi Kartı */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Cari Bakiye (TL)</h3>
            <Banknote className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-6">
            ₺{customer.balanceTL.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </div>
          <div className="flex justify-between items-end">
            <div className="text-sm text-slate-500">
               {customer.balanceTL > 0 ? "Müşteri Alacaklı" : customer.balanceTL < 0 ? "Müşteri Borçlu" : "Bakiye Sıfır"}
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition flex items-center gap-2"
            >
               <Coins className="h-4 w-4" />
               Ödeme Al
            </button>
          </div>
        </div>

        {/* Toplam Getirdiği Zeytin */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Toplam Getirdiği Zeytin</h3>
            <History className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-2">
            {(totalOliveKg / 1000).toFixed(2)} <span className="text-xl font-medium text-slate-400">ton</span>
          </div>
          <p className="text-xs text-slate-500">Müşterinin teslim ettiği zeytin toplamı.</p>
        </div>
      </div>

      {/* Transactions History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <History className="h-5 w-5 text-slate-400" />
          Hesap Ekstresi
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">İşlem Türü</th>
                <th className="px-4 py-3 font-medium">Açıklama</th>
                <th className="px-4 py-3 font-medium text-right">Miktar (kg)</th>
                <th className="px-4 py-3 font-medium text-right">Tutar (TL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-8 text-center text-slate-400">Henüz işlem yok.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{new Date(t.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3 font-medium">
                      {t.type === "OIL_IN" && <span className="inline-flex items-center gap-1 text-emerald-600"><ArrowDownLeft className="h-3 w-3" /> Giriş</span>}
                      {t.type === "OIL_OUT" && <span className="inline-flex items-center gap-1 text-amber-600"><ArrowUpRight className="h-3 w-3" /> Çıkış</span>}
                      {t.type === "LIQUIDATION" && <span className="inline-flex items-center gap-1 text-indigo-600"><TrendingDown className="h-3 w-3" /> Bozdurma</span>}
                      {t.type === "PAYMENT" && <span className="inline-flex items-center gap-1 text-emerald-600"><Coins className="h-3 w-3" /> Tahsilat</span>}
                      {t.type === "SERVICE_FEE" && <span className="inline-flex items-center gap-1 text-rose-600"><Banknote className="h-3 w-3" /> Hizmet Bedeli</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {t.amountKg ? `${t.amountKg} kg` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {t.amountTL ? `₺${t.amountTL.toLocaleString("tr-TR")}` : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Modal */}
      <Modal isOpen={isDeliveryModalOpen} onClose={() => setDeliveryModalOpen(false)} title="Yağ Teslim Et">
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Miktar (kg)</label>
             <input 
               type="number" 
               className="w-full rounded-lg border border-slate-300 px-3 py-2"
               value={amountKg}
               onChange={(e) => setAmountKg(Number(e.target.value))}
             />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Hangi Tanktan?</label>
             <select
               value={selectedTankId}
               onChange={(e) => setSelectedTankId(e.target.value)}
               className="w-full rounded-lg border border-slate-300 px-3 py-2"
             >
               <option value="">Seçiniz (Opsiyonel)</option>
               {tanks.map((tank) => (
                 <option key={tank.id} value={tank.id}>
                   {tank.name} ({tank.currentLevel} kg)
                 </option>
               ))}
             </select>
          </div>
          {status && <div className={cn("text-sm", status.type==="error" ? "text-red-600" : "text-green-600")}>{status.message}</div>}
          <button 
             onClick={handleDelivery}
             disabled={isSubmitting || amountKg <= 0}
             className="w-full rounded-lg bg-emerald-600 py-2 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
           >
             {isSubmitting ? "İşleniyor..." : "Teslim Et"}
          </button>
        </div>
      </Modal>

      {/* Liquidation Modal */}
      <Modal isOpen={isLiquidationModalOpen} onClose={() => setLiquidationModalOpen(false)} title="Yağ Bozdur">
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Satılacak Miktar (kg)</label>
             <input 
               type="number" 
               className="w-full rounded-lg border border-slate-300 px-3 py-2"
               value={amountKg}
               onChange={(e) => setAmountKg(Number(e.target.value))}
             />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Birim Fiyat (TL/kg)</label>
             <input 
               type="number" 
               className="w-full rounded-lg border border-slate-300 px-3 py-2"
               value={unitPrice}
               onChange={(e) => setUnitPrice(Number(e.target.value))}
             />
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-sm flex justify-between">
             <span>Toplam Tutar:</span>
             <span className="font-bold">₺{(amountKg * unitPrice).toLocaleString("tr-TR")}</span>
          </div>
          {status && <div className={cn("text-sm", status.type==="error" ? "text-red-600" : "text-green-600")}>{status.message}</div>}
          <button 
             onClick={handleLiquidation}
             disabled={isSubmitting || amountKg <= 0 || unitPrice <= 0}
             className="w-full rounded-lg bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
             {isSubmitting ? "İşleniyor..." : "Bozdur ve TL'ye Çevir"}
          </button>
        </div>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        customerId={customer.id}
        customerName={customer.name}
        onSuccess={fetchCustomerData}
      />

      {/* Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        customer={customer}
        onSuccess={(updatedCustomer) => {
          setCustomer(updatedCustomer);
          setEditModalOpen(false);
        }}
      />

    </div>
  );
}
