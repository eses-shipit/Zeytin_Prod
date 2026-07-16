"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Package, Cylinder, Plus, Droplet, XCircle, Loader2, CheckCircle2, RefreshCw, RotateCcw, ShieldPlus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { formatKg, formatPercent } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

// Tank yağ tipi değerleri; etiketleri `inventory.oilTypes.<value>` kataloğundan gelir.
const OIL_TYPE_VALUES = ["ACID_03", "ACID_05", "ACID_08", "VIRGIN", "LAMPANTE"] as const;

type Tank = {
  id: string;
  name: string;
  capacity: number;
  currentLevel: number;
  type: string;
  acidRatio?: number | null;
};

type Drum = {
  id: string;
  code: string;
  type: "PLASTIC" | "CHROME" | "TIN";
  capacity: number;
  status: "AVAILABLE" | "FILLED" | "WITH_CUSTOMER";
  currentHolderId?: string | null;
  currentHolder?: {
    id: string;
    name: string;
  } | null;
};

// Tank Ekleme/Düzenleme Modalı
function AddTankModal({
  isOpen,
  onClose,
  onSuccess,
  editingTank,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTank?: Tank | null;
}) {
  const t = useTranslations("inventory");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number>(1000);
  const [type, setType] = useState("ACID_05");
  const [acidRatio, setAcidRatio] = useState<number | "">("");
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing tank varsa formu doldur
  useEffect(() => {
    if (editingTank) {
      setName(editingTank.name);
      setCapacity(editingTank.capacity);
      setType(editingTank.type);
      setAcidRatio(editingTank.acidRatio || "");
      setCurrentLevel(editingTank.currentLevel);
    } else {
      setName("");
      setCapacity(1000);
      setType("ACID_05");
      setAcidRatio("");
      setCurrentLevel(0);
    }
  }, [editingTank, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingTank) {
        // Güncelleme
        await axios.patch(`/stock/tanks/${editingTank.id}`, { 
          name, 
          capacity, 
          type,
          acidRatio: acidRatio !== "" ? Number(acidRatio) : undefined,
          currentLevel,
        });
        toast.success(t("tank.updated"));
      } else {
        // Ekleme
        await axios.post("/stock/tanks", {
          name,
          capacity,
          type,
          acidRatio: acidRatio !== "" ? Number(acidRatio) : undefined,
        });
        toast.success(t("tank.added"));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (editingTank ? t("tank.updateError") : t("tank.addError")));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{editingTank ? t("tank.edit") : t("tank.add")}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("tank.name")}</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("tank.namePlaceholder")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("tank.capacity")}</label>
            <input
              required
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("tank.oilType")}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {OIL_TYPE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t(`oilTypes.${value}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("tank.acidRatio")}</label>
            <input
              type="number"
              step={0.1}
              min={0}
              value={acidRatio}
              onChange={(e) => setAcidRatio(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={t("tank.acidRatioPlaceholder")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          {editingTank && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("tank.currentLevel")}</label>
              <input
                required
                type="number"
                min={0}
                max={capacity}
                value={currentLevel}
                onChange={(e) => setCurrentLevel(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingTank ? t("tank.update") : t("tank.save")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const locale = useLocale() as Locale;
  const [activeTab, setActiveTab] = useState<"stock" | "drums">("stock");
  
  // Stock State
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isTankModalOpen, setIsTankModalOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  
  // Drums State
  const [drums, setDrums] = useState<Drum[]>([]);
  const [statusFilter, setStatusFilter] = useState<"" | "AVAILABLE" | "WITH_CUSTOMER">("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [defaultDrumCapacity, setDefaultDrumCapacity] = useState<number>(60); // Varsayılan değer
  const [form, setForm] = useState<{ code: string; type: Drum["type"]; capacity: number }>({
    code: "",
    type: "PLASTIC",
    capacity: 60,
  });

  const fetchTenantSettings = async () => {
    try {
      const res = await axios.get("/tenant/settings");
      const defaultWeight = res.data.defaultDrumWeight || 60;
      setDefaultDrumCapacity(defaultWeight);
      // Form'un varsayılan değerini de güncelle
      setForm(prev => ({ ...prev, capacity: defaultWeight }));
    } catch (error) {
      console.error("Ayarlar yüklenemedi, varsayılan değer kullanılıyor:", error);
    }
  };

  const fetchTanks = async () => {
    try {
      const res = await axios.get("/stock/tanks");
      setTanks(res.data);
    } catch (error) {
      console.error(error);
      toast.error(t("tank.loadError"));
    }
  };

  const handleDeleteTank = async (id: string) => {
    if (!confirm(t("tank.confirmDelete"))) {
      return;
    }
    try {
      await axios.delete(`/stock/tanks/${id}`);
      toast.success(t("tank.deleted"));
      fetchTanks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("tank.deleteError"));
    }
  };

  const fetchDrums = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/production/drums", {
        params: statusFilter ? { status: statusFilter } : undefined,
      });
      setDrums(res.data);
    } catch (err) {
      console.error(err);
      toast.error(t("drum.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sayfa ilk yüklendiğinde ayarları çek
    fetchTenantSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "stock") {
      fetchTanks();
    } else {
      fetchDrums();
    }
  }, [activeTab, statusFilter]);

  const handleCreateDrum = async () => {
    if (!form.code || form.capacity <= 0) {
      toast.error(t("drum.codeRequired"));
      return;
    }
    setCreating(true);
    try {
      await axios.post("/production/drums", form);
      toast.success(t("drum.added"));
      setForm({ code: "", type: "PLASTIC", capacity: defaultDrumCapacity });
      fetchDrums();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("drum.addError"));
    } finally {
      setCreating(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await axios.post("/production/return-drums", { drumIds: [id] });
      toast.success(t("drum.returned"));
      fetchDrums();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("drum.returnError"));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab("stock")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === "stock" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {t("tabs.stock")}
        </button>
        <button
          onClick={() => setActiveTab("drums")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === "drums" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {t("tabs.drums")}
        </button>
      </div>

      {activeTab === "stock" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setIsTankModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {t("tank.add")}
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tanks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <Cylinder className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{t("tank.empty")}</p>
              </div>
            ) : (
              tanks.map((tank) => {
                const fillPercentage = Math.min((tank.currentLevel / tank.capacity) * 100, 100);
                return (
                  <div key={tank.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{tank.name}</h3>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                          {(OIL_TYPE_VALUES as readonly string[]).includes(tank.type) ? t(`oilTypes.${tank.type}`) : tank.type}
                        </div>
                        {tank.acidRatio && (
                          <div className="text-xs text-amber-600 font-semibold">
                            {t("tank.acidLabel", { ratio: tank.acidRatio })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTank(tank);
                            setIsTankModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title={t("tank.editTitle")}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTank(tank.id)}
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title={t("tank.deleteTitle")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <Droplet className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-700">{formatKg(tank.currentLevel, locale)}</span>
                        <span className="text-slate-500">/ {formatKg(tank.capacity, locale)}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              fillPercentage > 90 ? "bg-rose-500" : 
                              fillPercentage > 70 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${fillPercentage}%` }}
                          />
                        </div>
                        <div className="text-center text-xs font-bold text-slate-600 mt-1">
                          {t("tank.fillPercent", { percent: formatPercent(fillPercentage, locale) })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <AddTankModal 
            isOpen={isTankModalOpen} 
            onClose={() => {
              setIsTankModalOpen(false);
              setEditingTank(null);
            }} 
            onSuccess={() => {
              fetchTanks();
              setEditingTank(null);
            }}
            editingTank={editingTank}
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          {/* List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{t("drum.statusFilter")}</span>
                <div className="flex gap-2">
                  {[
                    { key: "", label: t("status.all") },
                    { key: "AVAILABLE", label: t("status.AVAILABLE") },
                    { key: "WITH_CUSTOMER", label: t("status.WITH_CUSTOMER") },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key as any)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        statusFilter === f.key ? "border-indigo-500 text-indigo-700 bg-indigo-50" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={fetchDrums}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                {t("drum.refresh")}
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("drum.colCode")}</th>
                    <th className="px-4 py-3 text-left">{t("drum.colType")}</th>
                    <th className="px-4 py-3 text-left">{t("drum.colCapacity")}</th>
                    <th className="px-4 py-3 text-left">{t("drum.colStatus")}</th>
                    <th className="px-4 py-3 text-left">{t("drum.colCustomer")}</th>
                    <th className="px-4 py-3 text-right">{t("drum.colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-600" />
                      </td>
                    </tr>
                  ) : drums.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        {t("drum.empty")}
                      </td>
                    </tr>
                  ) : (
                    drums.map((d) => (
                      <tr key={d.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{d.code}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {t(`drumTypes.${d.type}`)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatKg(d.capacity, locale)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              d.status === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-700"
                                : d.status === "WITH_CUSTOMER"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {d.status === "AVAILABLE" && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {d.status === "WITH_CUSTOMER" && <RotateCcw className="h-3.5 w-3.5" />}
                            {d.status === "FILLED" && <ShieldPlus className="h-3.5 w-3.5" />}
                            {d.status === "AVAILABLE" ? t("status.AVAILABLE") : d.status === "WITH_CUSTOMER" ? t("status.WITH_CUSTOMER") : t("status.FILLED")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {d.status === "WITH_CUSTOMER" && d.currentHolder ? (
                            <span className="font-medium">{d.currentHolder.name}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {d.status === "WITH_CUSTOMER" ? (
                            <button
                              onClick={() => handleReturn(d.id)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              {t("drum.return")}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Form */}
          <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">{t("drum.addTitle")}</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-slate-600 mb-1">{t("drum.code")}</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder={t("drum.codePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">{t("drum.type")}</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Drum["type"] })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="PLASTIC">{t("drumTypes.PLASTIC")}</option>
                  <option value="CHROME">{t("drumTypes.CHROME")}</option>
                  <option value="TIN">{t("drumTypes.TIN")}</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">{t("drum.capacity")}</label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <button
                onClick={handleCreateDrum}
                disabled={creating}
                className="w-full rounded-lg bg-indigo-600 text-white py-2 font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t("drum.add")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
