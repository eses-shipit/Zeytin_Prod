"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Package, Cylinder, Plus, Droplet, XCircle, Loader2, CheckCircle2, RefreshCw, RotateCcw, ShieldPlus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

// Tank Tipleri
const OIL_TYPES = [
  { value: "ACID_03", label: "0.3 Asit" },
  { value: "ACID_05", label: "0.5 Asit" },
  { value: "ACID_08", label: "0.8 Asit" },
  { value: "VIRGIN", label: "Natürel Sızma" },
  { value: "LAMPANTE", label: "Lampante (Ham)" },
];

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
        toast.success("Tank güncellendi");
      } else {
        // Ekleme
        await axios.post("/stock/tanks", { 
          name, 
          capacity, 
          type,
          acidRatio: acidRatio !== "" ? Number(acidRatio) : undefined,
        });
        toast.success("Tank eklendi");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (editingTank ? "Tank güncellenemedi" : "Tank eklenemedi"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{editingTank ? "Tank Düzenle" : "Yeni Tank Ekle"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tank Adı</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Krom Tank 1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kapasite (kg)</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Yağ Tipi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {OIL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asit Oranı (%) - Opsiyonel</label>
            <input
              type="number"
              step={0.1}
              min={0}
              value={acidRatio}
              onChange={(e) => setAcidRatio(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Örn: 0.5"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          {editingTank && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mevcut Seviye (kg)</label>
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
            {editingTank ? "Güncelle" : "Kaydet"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
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
      toast.error("Tanklar yüklenemedi");
    }
  };

  const handleDeleteTank = async (id: string) => {
    if (!confirm("Bu tankı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    try {
      await axios.delete(`/stock/tanks/${id}`);
      toast.success("Tank silindi");
      fetchTanks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tank silinemedi");
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
      toast.error("Bidon listesi alınamadı");
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
      toast.error("Kod ve kapasite gerekli");
      return;
    }
    setCreating(true);
    try {
      await axios.post("/production/drums", form);
      toast.success("Bidon eklendi");
      setForm({ code: "", type: "PLASTIC", capacity: defaultDrumCapacity });
      fetchDrums();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bidon eklenemedi");
    } finally {
      setCreating(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await axios.post("/production/return-drums", { drumIds: [id] });
      toast.success("Bidon iade alındı");
      fetchDrums();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "İade alınamadı");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            Envanter Yönetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ürün stoğu ve bidon takibi.</p>
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
          Tanker Durumu
        </button>
        <button
          onClick={() => setActiveTab("drums")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === "drums" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Bidon Yönetimi
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
              Yeni Tank Ekle
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tanks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <Cylinder className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Henüz tank eklenmemiş.</p>
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
                          {OIL_TYPES.find(t => t.value === tank.type)?.label || tank.type}
                        </div>
                        {tank.acidRatio && (
                          <div className="text-xs text-amber-600 font-semibold">
                            Asit: {tank.acidRatio}%
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
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTank(tank.id)}
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Sil"
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
                        <span className="font-semibold text-slate-700">{tank.currentLevel.toLocaleString("tr-TR")} kg</span>
                        <span className="text-slate-500">/ {tank.capacity.toLocaleString("tr-TR")} kg</span>
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
                          %{fillPercentage.toFixed(1)} Dolu
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
                <span className="text-sm text-slate-600">Durum Filtresi:</span>
                <div className="flex gap-2">
                  {[
                    { key: "", label: "Tümü" },
                    { key: "AVAILABLE", label: "Boşta" },
                    { key: "WITH_CUSTOMER", label: "Müşteride" },
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
                Yenile
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Kod</th>
                    <th className="px-4 py-3 text-left">Tip</th>
                    <th className="px-4 py-3 text-left">Kapasite (kg)</th>
                    <th className="px-4 py-3 text-left">Durum</th>
                    <th className="px-4 py-3 text-left">Müşteri</th>
                    <th className="px-4 py-3 text-right">Aksiyon</th>
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
                        Kayıt bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    drums.map((d) => (
                      <tr key={d.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{d.code}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {d.type === "PLASTIC" ? "PLASTİK" : d.type === "CHROME" ? "KROM" : "TENEKE"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{d.capacity} kg</td>
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
                            {d.status === "AVAILABLE" ? "Boşta" : d.status === "WITH_CUSTOMER" ? "Müşteride" : "Dolu"}
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
                              İade Al
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
            <h3 className="text-sm font-semibold text-slate-900">Yeni Bidon Ekle</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-slate-600 mb-1">Kod</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="B-001"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Tip</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Drum["type"] })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="PLASTIC">PLASTIK</option>
                  <option value="CHROME">KROM</option>
                  <option value="TIN">TENEKE</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Kapasite (kg)</label>
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
                {creating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
