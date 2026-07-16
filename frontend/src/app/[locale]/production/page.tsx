"use client";

import axios from "@/lib/axios";
import {
  CheckCircle2,
  Factory,
  Scale,
  TriangleAlert,
  Droplets,
  Calculator,
  Loader2,
  XCircle,
  History,
  ListFilter,
  Eye,
  MessageSquare,
  Printer,
  Coins,
  FileSpreadsheet,
  Search,
  CalendarDays,
  User,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import { BatchDetailModal } from "@/components/BatchDetailModal";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency, formatKg, formatNumber, formatDate, formatDateTime } from "@/lib/format";
import { useTenantCurrency } from "@/hooks/useTenantCurrency";
import type { Locale } from "@/i18n/routing";
import { exportToExcel } from "@/lib/export";

// --- Types ---

type PendingTicket = {
  id: string;
  grossKg: number;
  tareKg: number;
  netKg: number;
  createdAt: string;
  customer: {
    name: string;
  };
};

type BatchResult = {
  yieldRatio: number;
  customerShareKg: number;
  factoryShareKg: number;
  totalOliveKg: number;
  totalOilKg: number;
};

type Tank = {
  id: string;
  name: string;
  type: string;
};

type CompletedBatch = {
  id: string;
  publicId?: string;
  createdAt: string;
  totalOliveKg: number;
  totalOilKg: number;
  acidRatio?: number;
  yieldRatio: number;
  status?: "PROCESSING" | "COMPLETED" | "DELIVERED";
  processTemp?: number;
  lineId?: number;
  filtration: boolean;
  tickets: Array<{
    origin?: string;
    variety?: string; // Legacy field
    quality?: string;
    netKg: number;
    customer?: {
      name: string;
    };
    product?: {
      name: string;
    };
  }>;
  tank?: {
    name: string;
  };
  drums?: Array<{
    id: string;
    code: string;
    capacity: number;
  }>;
};

type DeliveryReceipt = {
  productionId: string;
  deliveredAt: string | Date;
  drums: Array<{ code: string; capacity: number; type: string }>;
  customers: string[];
  isStoredOil?: boolean; // Emanete bırakılan yağ (bidon yok)
};

enum ServiceType {
  PERCENTAGE = "PERCENTAGE",
  CASH_PER_KG = "CASH_PER_KG",
}

// --- Sub-Components ---

function ReceiptModal({
  isOpen,
  onClose,
  receipt,
}: {
  isOpen: boolean;
  onClose: () => void;
  receipt: DeliveryReceipt | null;
}) {
  const t = useTranslations("production.receipt");
  const locale = useLocale() as Locale;
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{t("title")}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between">
              <span className="text-slate-600">{t("production")}</span>
              <span className="font-semibold text-slate-900">{receipt.productionId}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-slate-600">{t("deliveredAt")}</span>
              <span className="font-semibold text-slate-900">{formatDateTime(receipt.deliveredAt, locale)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t("customers")}</div>
            {receipt.customers?.length ? (
              <div className="flex flex-wrap gap-2">
                {receipt.customers.map((c) => (
                  <span key={c} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">-</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t("drums")}</div>
            {receipt.drums?.length ? (
              <div className="space-y-2">
                {receipt.drums.map((d) => (
                  <div key={d.code} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="font-semibold text-slate-900">{d.code}</span>
                    <span className="text-slate-600">
                      {formatKg(d.capacity, locale)} • {d.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : receipt.isStoredOil ? (
              <div className="rounded-lg bg-amber-50 px-3 py-2 border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">
                  {t("storedOil")}
                </p>
              </div>
            ) : (
              <p className="text-slate-500">-</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  isSubmitting,
  serviceType,
  serviceAmount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    totalOlive: number;
    totalOil: number;
    acidRatio: number;
    yieldRatio: number;
    factoryShare: number;
    customerShare: number;
    totalPrice: number;
  };
  isSubmitting: boolean;
  serviceType: ServiceType;
  serviceAmount: number;
}) {
  const t = useTranslations("production.confirm");
  const locale = useLocale() as Locale;
  const currency = useTenantCurrency();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{t("title")}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">{t("selectedOlive")}</span>
              <span className="font-semibold text-slate-900">{formatKg(data.totalOlive, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{t("oilOut")}</span>
              <span className="font-semibold text-slate-900">{formatKg(data.totalOil, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{t("yield")}</span>
              <span className="font-semibold text-indigo-600">1/{formatNumber(data.yieldRatio, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{t("acidRatio")}</span>
              <span className="font-semibold text-amber-600">{formatNumber(data.acidRatio, locale)}</span>
            </div>
            <div className="border-t border-slate-200 my-2"></div>

            {serviceType === ServiceType.PERCENTAGE ? (
              <div className="flex justify-between text-rose-700">
                <span>{t("factoryShare", { amount: serviceAmount })}</span>
                <span className="font-bold">{formatKg(data.factoryShare, locale, { digits: 1 })}</span>
              </div>
            ) : (
               <div className="flex justify-between text-rose-700">
                <span>{t("serviceFee", { amount: serviceAmount, currency })}</span>
                <span className="font-bold">{formatCurrency(data.totalPrice, currency, locale)}</span>
              </div>
            )}

            <div className="flex justify-between text-emerald-700 text-base font-bold">
              <span>{t("customerRemaining")}</span>
              <span>{formatKg(data.customerShare, locale, { digits: 1 })}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">
            {t("warning")}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Tickets Tab Component ---
type WeighingTicket = {
  id: string;
  createdAt: string;
  grossKg: number;
  tareKg: number;
  netKg: number;
  status: "PENDING" | "COMPLETED";
  origin?: string;
  variety?: string;
  quality?: string;
  customer: {
    name: string;
  };
};

function TicketsTab() {
  const t = useTranslations("production.ticketsTab");
  const locale = useLocale() as Locale;
  const [tickets, setTickets] = useState<WeighingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "COMPLETED" | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await axios.get(`/tickets?${params.toString()}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Fişler çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-slate-200 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <ListFilter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full appearance-none rounded-lg border-slate-200 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="PENDING">{t("pending")}</option>
            <option value="COMPLETED">{t("completed")}</option>
          </select>
        </div>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border-slate-200 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border-slate-200 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">{t("colDate")}</th>
                <th className="px-6 py-4">{t("colCustomer")}</th>
                <th className="px-6 py-4">{t("colOriginVarietyQuality")}</th>
                <th className="px-6 py-4">{t("colGross")}</th>
                <th className="px-6 py-4">{t("colTare")}</th>
                <th className="px-6 py-4 text-right">{t("colNet")}</th>
                <th className="px-6 py-4 text-center">{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Scale className="mx-auto h-12 w-12 opacity-20 mb-3" />
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {formatDate(ticket.createdAt, locale)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(ticket.createdAt, locale, { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {ticket.customer.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                         <span className="font-medium text-slate-700">{ticket.origin || "-"}</span>
                         <span className="text-slate-500">{ticket.variety}</span>
                         {ticket.quality && (
                           <span className={cn(
                             "inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                             ticket.quality === "TREE" ? "bg-green-50 text-green-700 ring-green-600/20" :
                               ticket.quality === "GROUND" ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
                               "bg-slate-50 text-slate-600 ring-slate-500/10"
                           )}>
                             {ticket.quality === "TREE" ? t("qualityTree") : ticket.quality === "GROUND" ? t("qualityGround") : t("qualityMixed")}
                           </span>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{ticket.grossKg}</td>
                    <td className="px-6 py-4">{ticket.tareKg}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {formatKg(ticket.netKg, locale)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                        ticket.status === "COMPLETED" 
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                          : "bg-amber-50 text-amber-700 ring-amber-600/20"
                      )}>
                        {ticket.status === "COMPLETED" ? t("statusCompleted") : t("statusPending")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function ProductionPage() {
  const t = useTranslations("production");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const currency = useTenantCurrency();
  const [activeTab, setActiveTab] = useState<"production" | "history" | "tickets">("production");
  
  // Pending State
  const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(new Set());
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [availableDrums, setAvailableDrums] = useState<{ id: string; code: string; capacity: number }[]>([]);
  const [selectedDrumIds, setSelectedDrumIds] = useState<Set<string>>(new Set());
  
  const [totalOilKg, setTotalOilKg] = useState<number>(0);
  
  // Service Type State
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.PERCENTAGE);
  const [serviceAmount, setServiceAmount] = useState<number>(10); // Default %10

  const [acidRatio, setAcidRatio] = useState<number>(0.5);
  const [processTemp, setProcessTemp] = useState<number>(27);
  const [lineId, setLineId] = useState<number>(1);
  const [filtration, setFiltration] = useState<boolean>(false);
  const [selectedTankId, setSelectedTankId] = useState<string>("");
  const [storeCustomerOil, setStoreCustomerOil] = useState<boolean>(true);
  
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastBatchResult, setLastBatchResult] = useState<BatchResult | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Completed State
  const [completedBatches, setCompletedBatches] = useState<CompletedBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<CompletedBatch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deliveringBatchId, setDeliveringBatchId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<DeliveryReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDrumSelectModalOpen, setIsDrumSelectModalOpen] = useState(false);
  const [deliveryBatchId, setDeliveryBatchId] = useState<string | null>(null);
  const [deliverySelectedDrumIds, setDeliverySelectedDrumIds] = useState<Set<string>>(new Set());

  // Data Fetching
  const fetchPendingData = async () => {
    try {
      const [ticketsRes, tanksRes, drumsRes] = await Promise.all([
        axios.get("/production/pending-tickets"),
        axios.get("/stock/tanks"),
        axios.get("/production/drums", { params: { status: "AVAILABLE" } }),
      ]);
      setPendingTickets(ticketsRes.data);
      setTanks(tanksRes.data);
      if (tanksRes.data.length > 0 && !selectedTankId) setSelectedTankId(tanksRes.data[0].id);
      setAvailableDrums(drumsRes.data || []);
    } catch (err) {
      console.error("Veriler çekilemedi:", err);
    }
  };

  const fetchCompletedData = async () => {
    try {
      const res = await axios.get("/production/completed");
      setCompletedBatches(res.data);
    } catch (err) {
      console.error("Geçmiş üretim verileri çekilemedi:", err);
    }
  };

  // Modal açıldığında bidonları çek
  useEffect(() => {
    if (isDrumSelectModalOpen) {
      const fetchDrums = async () => {
        try {
          const drumsRes = await axios.get("/production/drums", { params: { status: "AVAILABLE" } });
          setAvailableDrums(drumsRes.data || []);
        } catch (err) {
          console.error("Bidonlar çekilemedi:", err);
        }
      };
      fetchDrums();
    }
  }, [isDrumSelectModalOpen]);

  const handleExportExcel = () => {
    if (completedBatches.length === 0) {
      toast.error(t("toasts.exportEmpty"));
      return;
    }

    const dataToExport = completedBatches.map(batch => {
      // Collect unique customer names and product varieties from tickets
      const customers = Array.from(new Set(batch.tickets.map(t => t.customer?.name))).filter(Boolean).join(", ");
      const varieties = Array.from(new Set(batch.tickets.map(t => t.product?.name))).filter(Boolean).join(", ");

      // Kolon başlıkları da kataloğdan gelir; ekleme sırası XLSX'te sütun sırasını belirler.
      return {
        [t("excel.batchNo")]: batch.publicId || batch.id.slice(-6),
        [t("excel.date")]: formatDate(batch.createdAt, locale),
        [t("excel.customer")]: customers || "-",
        [t("excel.variety")]: varieties || "-",
        [t("excel.oliveIn")]: batch.totalOliveKg,
        [t("excel.oilOut")]: batch.totalOilKg,
        [t("excel.yield")]: formatNumber(batch.yieldRatio, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        [t("excel.acidRatio")]: batch.acidRatio || "-",
        [t("excel.temp")]: batch.processTemp || "-",
        [t("excel.filtration")]: batch.filtration ? tc("yes") : tc("no")
      };
    });

    const fileName = `${t("excel.fileName")}_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(dataToExport, fileName);
    toast.success(t("toasts.exportDone"));
  };

  const handlePrintList = () => {
    window.print();
  };

  useEffect(() => {
    if (activeTab === "production") fetchPendingData();
    else if (activeTab === "history") fetchCompletedData();
    // tickets tab doesn't need separate fetch, it uses the same tickets endpoint
  }, [activeTab]);

  // --- Logic for Pending Tab ---

  const toggleTicket = (id: string) => {
    // Single select mode: clicking a ticket selects it and deselects others.
    // Clicking the already selected ticket deselects it.
    const newSet = new Set<string>();
    if (!selectedTicketIds.has(id)) {
        newSet.add(id);
    }
    setSelectedTicketIds(newSet);
  };

  const selectedTotalOliveKg = useMemo(() => {
    return pendingTickets
      .filter((t) => selectedTicketIds.has(t.id))
      .reduce((sum, t) => sum + t.netKg, 0);
  }, [pendingTickets, selectedTicketIds]);

  const preview = useMemo(() => {
    if (selectedTotalOliveKg === 0) return null;
    const yieldRatio = totalOilKg > 0 ? selectedTotalOliveKg / totalOilKg : 0;
    
    let factoryShare = 0;
    let totalPrice = 0;

    if (serviceType === ServiceType.PERCENTAGE) {
        factoryShare = totalOilKg * (serviceAmount / 100);
    } else {
        // Cash Per KG (Olive)
        totalPrice = selectedTotalOliveKg * serviceAmount;
    }

    const customerShare = totalOilKg - factoryShare;
    
    return {
      yieldRatio,
      factoryShareKg: factoryShare,
      customerShareKg: customerShare,
      totalPrice: totalPrice,
    };
  }, [selectedTotalOliveKg, totalOilKg, serviceType, serviceAmount]);

  const handleConfirm = async () => {
    if (selectedTicketIds.size === 0) {
      toast.error(t("toasts.selectTicket"));
      return;
    }
    // Bidon seçimi sadece müşteri yağı emanete bırakılmadığında zorunlu
    // Çünkü emanete bırakıldığında yağ tanka gidiyor, bidon kullanılmıyor
    if (!storeCustomerOil && selectedDrumIds.size === 0) {
      toast.error(t("toasts.selectDrum"));
      return;
    }
    setStatus(null);
    setIsSubmitting(true);
    setLastBatchResult(null);

    try {
      const payload = {
        ticketIds: Array.from(selectedTicketIds),
        // Müşteri yağı emanete bırakıldığında bidon seçimi opsiyonel (yağ tanka gidiyor)
        drumIds: storeCustomerOil ? [] : Array.from(selectedDrumIds),
        totalOilKg,
        serviceType,
        serviceAmount,
        acidRatio,
        processTemp,
        lineId,
        filtration,
        tankId: selectedTankId || undefined,
        storeCustomerOil,
      };

      const res = await axios.post("/production", payload);

      setLastBatchResult({
        yieldRatio: res.data.yieldRatio,
        customerShareKg: res.data.customerShareKg,
        factoryShareKg: res.data.factoryShareKg,
        totalOliveKg: res.data.totalOliveKg,
        totalOilKg: res.data.totalOilKg,
      });

      setStatus({
        type: "success",
        message: res.data.smsSent
          ? t("toasts.successSms")
          : t("toasts.successNoSms")
      });
      
      setSelectedTicketIds(new Set());
      setTotalOilKg(0);
      setAcidRatio(0.5);
      setProcessTemp(27);
      setFiltration(false);
      setStoreCustomerOil(true);
      setSelectedDrumIds(new Set());
      setIsConfirmModalOpen(false);
      fetchPendingData();

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || t("toasts.productionFailed");
      setStatus({ type: "error", message: msg });
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Factory className="h-7 w-7 text-indigo-600" />
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("subtitle")}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab("production")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "production" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t("tabs.production")}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t("tabs.history")}
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "tickets" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t("tabs.tickets")}
          </button>
        </div>
      </header>

      {/* Print Only Title */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t("printReport")}</h1>
        <p className="text-slate-500">{formatDate(new Date(), locale)}</p>
      </div>

      {activeTab === "production" ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Sol Kolon: Bekleyen Fişler */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-slate-500" />
                  {t("pending.title", { count: pendingTickets.length })}
                </span>
                {selectedTicketIds.size > 0 && (
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {t("pending.selected", { count: selectedTicketIds.size, kg: formatKg(selectedTotalOliveKg, locale) })}
                  </span>
                )}
              </h2>

              {pendingTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Scale className="h-12 w-12 mb-4 opacity-20" />
                  <p>{t("pending.empty")}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {pendingTickets.map((ticket) => {
                    const isSelected = selectedTicketIds.has(ticket.id);
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => toggleTicket(ticket.id)}
                        className={cn(
                          "cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md",
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                            : "border-slate-200 bg-white hover:border-indigo-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {ticket.customer.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDateTime(ticket.createdAt, locale)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">
                              {formatKg(ticket.netKg, locale)}
                            </div>
                            <div className="text-xs text-slate-500">{t("pending.netOlive")}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon: Üretim Girişi & Sonuç */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Droplets className="h-5 w-5 text-indigo-600" />
                {t("form.title")}
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t("form.totalOil")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={totalOilKg}
                      onChange={(e) => setTotalOilKg(Number(e.target.value))}
                      className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <Droplets className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-200" />
                  </div>
                </div>

                {/* Service / Financials */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex gap-2 p-1 bg-white rounded-lg border border-slate-200">
                         <button
                           onClick={() => { setServiceType(ServiceType.PERCENTAGE); setServiceAmount(10); }}
                           className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-colors", serviceType === ServiceType.PERCENTAGE ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}
                         >
                            {t("form.oilShare")}
                         </button>
                         <button
                           onClick={() => { setServiceType(ServiceType.CASH_PER_KG); setServiceAmount(2.5); }}
                           className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-colors", serviceType === ServiceType.CASH_PER_KG ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}
                         >
                            {t("form.cash", { currency })}
                         </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {serviceType === ServiceType.PERCENTAGE ? t("form.factoryShareRate") : t("form.serviceFeeRate", { currency })}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={0}
                                step={serviceType === ServiceType.CASH_PER_KG ? 0.25 : 1}
                                value={serviceAmount}
                                onChange={(e) => setServiceAmount(Number(e.target.value))}
                                className="block w-full rounded-xl border-slate-200 bg-white px-4 py-2 text-base font-bold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {serviceType === ServiceType.PERCENTAGE ? (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                            ) : (
                                <Coins className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      {t("form.acidRatio")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={0.1}
                        min={0}
                      value={acidRatio}
                      onChange={(e) => setAcidRatio(Number(e.target.value))}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      {t("form.temp")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={processTemp}
                        onChange={(e) => setProcessTemp(Number(e.target.value))}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      {t("form.line")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={lineId}
                        onChange={(e) => setLineId(Number(e.target.value))}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">
                      {t("form.filtration")}
                    </label>
                    <div className="flex items-center h-[54px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtration}
                          onChange={(e) => setFiltration(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700">
                          {filtration ? t("form.filtrationOn") : t("form.filtrationOff")}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t("form.tank")}
                  </label>
                  <select
                    value={selectedTankId}
                    onChange={(e) => setSelectedTankId(e.target.value)}
                    className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">{t("form.tankSelect")}</option>
                    {tanks.map((tank) => (
                      <option key={tank.id} value={tank.id}>
                        {tank.name} ({tank.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t("form.drumSelect")}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-xl border border-slate-200 p-3 bg-slate-50">
                    {availableDrums.length === 0 ? (
                      <p className="text-sm text-slate-500 col-span-2">{t("form.noDrums")}</p>
                    ) : (
                      availableDrums.map((drum) => {
                        const checked = selectedDrumIds.has(drum.id);
                        return (
                          <label key={drum.id} className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = new Set(selectedDrumIds);
                                if (e.target.checked) next.add(drum.id);
                                else next.delete(drum.id);
                                setSelectedDrumIds(next);
                              }}
                            />
                            <span className="font-semibold">{drum.code}</span>
                            <span className="text-xs text-slate-500">{t("form.drumCapacity", { capacity: drum.capacity })}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {storeCustomerOil
                      ? t("form.drumHintStore")
                      : t("form.drumHintRequired")}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="storeCustomerOil"
                    checked={storeCustomerOil}
                    onChange={(e) => setStoreCustomerOil(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="storeCustomerOil" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                    {t("form.storeOil")}
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      {t("form.storeOilHint")}
                    </p>
                  </label>
                </div>

                {preview && (
                  <div className="rounded-xl bg-slate-50 p-4 space-y-3 text-sm border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t("preview.totalOlive")}</span>
                      <span className="font-semibold">{formatKg(selectedTotalOliveKg, locale)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{t("preview.yield")}</span>
                      <span className="font-semibold text-indigo-600">
                        1/{formatNumber(preview.yieldRatio, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 my-2"></div>

                    {serviceType === ServiceType.PERCENTAGE ? (
                         <div className="flex justify-between text-rose-700">
                           <span>{t("preview.factoryShare")}</span>
                           <span className="font-semibold">{formatKg(preview.factoryShareKg, locale, { digits: 1 })}</span>
                         </div>
                    ) : (
                         <div className="flex justify-between text-rose-700">
                           <span>{t("preview.serviceFee")}</span>
                           <span className="font-semibold">{formatCurrency(preview.totalPrice, currency, locale)}</span>
                         </div>
                    )}

                    <div className="flex justify-between text-emerald-700 text-base font-bold">
                      <span>{t("preview.customerRemaining")}</span>
                      <span>{formatKg(preview.customerShareKg, locale, { digits: 1 })}</span>
                    </div>
                  </div>
                )}

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
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={isSubmitting || selectedTicketIds.size === 0 || totalOilKg <= 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                    isSubmitting || selectedTicketIds.size === 0 || totalOilKg <= 0
                      ? "bg-slate-100 text-slate-400"
                      : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md focus:ring-indigo-500"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("form.submitting")}
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5" />
                      {t("form.submit")}
                    </>
                  )}
                </button>
              </div>
            </div>

            {lastBatchResult && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                <h3 className="flex items-center gap-2 font-semibold text-emerald-800 mb-4">
                  <CheckCircle2 className="h-5 w-5" />
                  {t("lastResult.title")}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/60 p-3 rounded-xl">
                    <div className="text-xs text-emerald-600 uppercase font-semibold">{t("lastResult.yield")}</div>
                    <div className="text-2xl font-bold text-emerald-900">
                      1/{formatNumber(lastBatchResult.yieldRatio, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-xl">
                    <div className="text-xs text-emerald-600 uppercase font-semibold">{t("lastResult.customerRemaining")}</div>
                    <div className="text-2xl font-bold text-emerald-900">
                      {formatKg(lastBatchResult.customerShareKg, locale, { digits: 1 })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "history" ? (
        // Completed Batches Tab
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 no-print">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {t("history.exportExcel")}
            </button>
            <button
              onClick={handlePrintList}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4" />
              {t("history.printList")}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-0 print:shadow-none">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">{t("history.colDateBatch")}</th>
                      <th className="px-6 py-4">{t("history.colOliveIn")}</th>
                      <th className="px-6 py-4">{t("history.colOilOut")}</th>
                      <th className="px-6 py-4">{t("history.colYield")}</th>
                      <th className="px-6 py-4">{t("history.colAcid")}</th>
                      <th className="px-6 py-4">{t("history.colStatus")}</th>
                      <th className="px-6 py-4 text-right print:hidden">{t("history.colActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedBatches.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                          <History className="mx-auto h-12 w-12 opacity-20 mb-3" />
                          {t("history.empty")}
                        </td>
                      </tr>
                    ) : (
                      completedBatches.map((batch) => {
                        const customerNames = Array.from(
                          new Set(
                            batch.tickets
                              .map((t) => t.customer?.name)
                              .filter((name): name is string => Boolean(name)),
                          ),
                        );

                        return (
                        <tr key={batch.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">
                              {formatDateTime(batch.createdAt, locale)}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-1">
                               {batch.publicId || `#${batch.id.slice(-6)}`}
                            </div>
                            {customerNames.length > 0 && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                                <User className="h-3 w-3 text-slate-400" />
                                <span className="truncate max-w-[220px] md:max-w-xs lg:max-w-sm">
                                  {customerNames.join(", ")}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-medium">
                            {formatKg(batch.totalOliveKg, locale)}
                          </td>
                          <td className="px-6 py-4 text-emerald-700 font-medium">
                            {formatKg(batch.totalOilKg, locale)}
                          </td>
                          <td className="px-6 py-4">
                            {typeof batch.yieldRatio === "number" ? (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                1/{formatNumber(batch.yieldRatio, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {batch.acidRatio ? (
                              <span className="text-slate-700">{formatNumber(batch.acidRatio, locale)}%</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                                batch.status === "DELIVERED"
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-700/10"
                                  : "bg-amber-50 text-amber-700 ring-amber-700/10"
                              )}
                            >
                              {batch.status === "DELIVERED" ? t("history.statusDelivered") : t("history.statusCompleted")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2 print:hidden">
                            {batch.status !== "DELIVERED" && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  // Eğer bidon yoksa bidon seçme modalı aç
                                  const hasDrums = batch.drums && batch.drums.length > 0;
                                  if (!hasDrums) {
                                    setDeliveryBatchId(batch.id);
                                    setDeliverySelectedDrumIds(new Set());
                                    setIsDrumSelectModalOpen(true);
                                    return;
                                  }
                                  
                                  // Bidon varsa direkt teslim et
                                  try {
                                    setDeliveringBatchId(batch.id);
                                    const res = await axios.post(
                                      "/production/deliver-drums",
                                      { productionId: batch.id }
                                    );
                                    const isStoredOil = res.data?.receipt?.isStoredOil;
                                    toast.success(
                                      isStoredOil
                                        ? t("toasts.storedOilDelivered")
                                        : t("toasts.drumsDelivered")
                                    );
                                    if (res.data?.receipt) {
                                      setReceipt(res.data.receipt);
                                      setIsReceiptModalOpen(true);
                                    }
                                    await fetchCompletedData();
                                  } catch (err: any) {
                                    const msg = err.response?.data?.message || t("toasts.deliveryFailed");
                                    toast.error(msg);
                                  } finally {
                                    setDeliveringBatchId(null);
                                  }
                                }}
                                disabled={deliveringBatchId === batch.id}
                                className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-100 transition-colors text-xs font-semibold disabled:opacity-60"
                                title={t("history.deliverTitle")}
                              >
                                {deliveringBatchId === batch.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                {t("history.deliver")}
                              </button>
                            )}
                            <Link
                              href={`/print/batch/${batch.id}`}
                              target="_blank"
                              className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md hover:bg-slate-200 transition-colors text-xs font-semibold"
                              title={t("history.printTitle")}
                            >
                              <Printer className="h-3 w-3" />
                              {t("history.print")}
                            </Link>
                            <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const res = await axios.post(
                                      `/production/resend-sms/${batch.id}`,
                                      {}
                                    );
                                    if (res.data.success) {
                                      toast.success(res.data.message);
                                    } else {
                                      toast.warning(res.data.message);
                                    }
                                  } catch (err: any) {
                                    const msg = err.response?.data?.message || t("toasts.smsFailed");
                                    toast.error(msg);
                                  }
                                }}
                                className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors text-xs font-semibold"
                                title={t("history.smsTitle")}
                            >
                              <MessageSquare className="h-3 w-3" />
                              {t("history.sms")}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBatch(batch);
                                setIsDetailModalOpen(true);
                              }}
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                              title={t("history.detailsTitle")}
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      ) : (
        // Tickets Tab (Kantar Fişleri)
        <TicketsTab />
      )}

      {/* Modals */}
      {preview && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirm}
          isSubmitting={isSubmitting}
          serviceType={serviceType}
          serviceAmount={serviceAmount}
          data={{
            totalOlive: selectedTotalOliveKg,
            totalOil: totalOilKg,
            acidRatio: acidRatio,
            yieldRatio: preview.yieldRatio,
            factoryShare: preview.factoryShareKg,
            customerShare: preview.customerShareKg,
            totalPrice: preview.totalPrice,
          }}
        />
      )}

      <BatchDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        batch={selectedBatch}
      />

      {/* Bidon Seçme Modalı (Teslim için) */}
      {isDrumSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{t("drumSelect.title")}</h3>
              <button onClick={() => {
                setIsDrumSelectModalOpen(false);
                setDeliverySelectedDrumIds(new Set());
                setDeliveryBatchId(null);
              }} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 text-sm text-slate-600">
              {t("drumSelect.subtitle")}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 mb-6">
              {availableDrums.length === 0 ? (
                <p className="text-center text-slate-500 py-8">{t("drumSelect.empty")}</p>
              ) : (
                availableDrums.map((drum) => (
                  <label
                    key={drum.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={deliverySelectedDrumIds.has(drum.id)}
                      onChange={(e) => {
                        const newSet = new Set(deliverySelectedDrumIds);
                        if (e.target.checked) {
                          newSet.add(drum.id);
                        } else {
                          newSet.delete(drum.id);
                        }
                        setDeliverySelectedDrumIds(newSet);
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-900">{drum.code}</span>
                    <span className="text-sm text-slate-500">({formatKg(drum.capacity, locale)})</span>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDrumSelectModalOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("drumSelect.cancel")}
              </button>
              <button
                onClick={async () => {
                  if (deliverySelectedDrumIds.size === 0) {
                    toast.error(t("toasts.selectDrum"));
                    return;
                  }
                  if (!deliveryBatchId) return;

                  try {
                    setDeliveringBatchId(deliveryBatchId);
                    setIsDrumSelectModalOpen(false);
                    const res = await axios.post(
                      "/production/deliver-drums",
                      { 
                        productionId: deliveryBatchId,
                        drumIds: Array.from(deliverySelectedDrumIds)
                      }
                    );
                    toast.success(t("toasts.drumsDelivered"));
                    if (res.data?.receipt) {
                      setReceipt(res.data.receipt);
                      setIsReceiptModalOpen(true);
                    }
                    await fetchCompletedData();
                    setDeliverySelectedDrumIds(new Set());
                    setDeliveryBatchId(null);
                  } catch (err: any) {
                    const msg = err.response?.data?.message || t("toasts.deliveryFailed");
                    toast.error(msg);
                  } finally {
                    setDeliveringBatchId(null);
                  }
                }}
                disabled={deliverySelectedDrumIds.size === 0 || deliveringBatchId === deliveryBatchId}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {deliveringBatchId === deliveryBatchId && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("drumSelect.submit")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={receipt}
      />
    </div>
  );
}
