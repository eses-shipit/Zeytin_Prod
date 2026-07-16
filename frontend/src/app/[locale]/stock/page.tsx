"use client";

import axios from "@/lib/axios";
import {
  Cylinder,
  Plus,
  Droplet,
  MoreVertical,
  Gauge,
  XCircle,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
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
};

// Tank Ekleme Modalı
function AddTankModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const ti = useTranslations("inventory");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number>(1000);
  const [type, setType] = useState("ACID_05");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
      await axios.post(
        `${apiBase}/stock/tanks`,
        { name, capacity, type },
        { headers: { "X-Tenant-ID": "tenant_demo" } }
      );
      onSuccess();
      onClose();
      setName("");
      setCapacity(1000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{ti("tank.add")}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{ti("tank.name")}</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ti("tank.namePlaceholder")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{ti("tank.capacity")}</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">{ti("tank.oilType")}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {OIL_TYPE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {ti(`oilTypes.${value}`)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {ti("tank.save")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StockPage() {
  const t = useTranslations("stock");
  const ti = useTranslations("inventory");
  const locale = useLocale() as Locale;
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTanks = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
      const res = await axios.get(`${apiBase}/stock/tanks`, {
        headers: { "X-Tenant-ID": "tenant_demo" },
      });
      setTanks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTanks();
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Cylinder className="h-7 w-7 text-indigo-600" />
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t("addNew")}
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tanks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <Cylinder className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>{ti("tank.empty")}</p>
          </div>
        ) : (
          tanks.map((tank) => {
            const fillPercentage = Math.min((tank.currentLevel / tank.capacity) * 100, 100);
            return (
              <div key={tank.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{tank.name}</h3>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">
                      {(OIL_TYPE_VALUES as readonly string[]).includes(tank.type) ? ti(`oilTypes.${tank.type}`) : tank.type}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Droplet className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{formatKg(tank.currentLevel, locale)}</span>
                    <span className="text-slate-500">/ {formatKg(tank.capacity, locale)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        fillPercentage > 90 ? "bg-rose-500" : 
                        fillPercentage > 70 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                  
                  <div className="text-right text-xs font-bold text-slate-400">
                    {ti("tank.fillPercent", { percent: formatPercent(fillPercentage, locale) })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddTankModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTanks} 
      />
    </div>
  );
}

