"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { CheckCircle2, Loader2, RefreshCw, RotateCcw, ShieldPlus, Package } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

type Drum = {
  id: string;
  code: string;
  type: "PLASTIC" | "CHROME" | "TIN";
  capacity: number;
  status: "AVAILABLE" | "FILLED" | "WITH_CUSTOMER";
  currentHolderId?: string | null;
};

export default function DrumsPage() {
  const t = useTranslations("drums");
  const ti = useTranslations("inventory");
  const locale = useLocale() as Locale;
  const [drums, setDrums] = useState<Drum[]>([]);
  const [statusFilter, setStatusFilter] = useState<"" | "AVAILABLE" | "WITH_CUSTOMER">("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ code: string; type: Drum["type"]; capacity: number }>({
    code: "",
    type: "PLASTIC",
    capacity: 60,
  });

  const fetchDrums = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/production/drums", {
        params: statusFilter ? { status: statusFilter } : undefined,
      });
      setDrums(res.data);
    } catch (err) {
      console.error(err);
      toast.error(ti("drum.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrums();
  }, [statusFilter]);

  const handleCreate = async () => {
    if (!form.code || form.capacity <= 0) {
      toast.error(ti("drum.codeRequired"));
      return;
    }
    setCreating(true);
    try {
      await axios.post("/production/drums", form);
      toast.success(ti("drum.added"));
      setForm({ code: "", type: "PLASTIC", capacity: 60 });
      fetchDrums();
    } catch (err: any) {
      toast.error(err.response?.data?.message || ti("drum.addError"));
    } finally {
      setCreating(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await axios.post("/production/return-drums", { drumIds: [id] });
      toast.success(ti("drum.returned"));
      fetchDrums();
    } catch (err: any) {
      toast.error(err.response?.data?.message || ti("drum.returnError"));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            {ti("tabs.drums")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={fetchDrums}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          {ti("drum.refresh")}
        </button>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">{ti("drum.statusFilter")}</span>
              <div className="flex gap-2">
                {[
                  { key: "", label: ti("status.all") },
                  { key: "AVAILABLE", label: ti("status.AVAILABLE") },
                  { key: "WITH_CUSTOMER", label: ti("status.WITH_CUSTOMER") },
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
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">{ti("drum.colCode")}</th>
                  <th className="px-4 py-3 text-left">{ti("drum.colType")}</th>
                  <th className="px-4 py-3 text-left">{t("capacityLt")}</th>
                  <th className="px-4 py-3 text-left">{ti("drum.colStatus")}</th>
                  <th className="px-4 py-3 text-right">{ti("drum.colAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-600" />
                    </td>
                  </tr>
                ) : drums.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      {ti("drum.empty")}
                    </td>
                  </tr>
                ) : (
                  drums.map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{d.code}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {ti(`drumTypes.${d.type}`)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatNumber(d.capacity, locale)}</td>
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
                          {d.status === "AVAILABLE" ? ti("status.AVAILABLE") : d.status === "WITH_CUSTOMER" ? ti("status.WITH_CUSTOMER") : ti("status.FILLED")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {d.status === "WITH_CUSTOMER" ? (
                          <button
                            onClick={() => handleReturn(d.id)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            {ti("drum.return")}
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">{ti("drum.addTitle")}</h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-slate-600 mb-1">{ti("drum.code")}</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder={ti("drum.codePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">{ti("drum.type")}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Drum["type"] })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="PLASTIC">{ti("drumTypes.PLASTIC")}</option>
                <option value="CHROME">{ti("drumTypes.CHROME")}</option>
                <option value="TIN">{ti("drumTypes.TIN")}</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">{t("capacityLt")}</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full rounded-lg bg-indigo-600 text-white py-2 font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : ti("drum.add")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
