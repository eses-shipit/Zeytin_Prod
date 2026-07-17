"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
  X,
  Droplet,
  ArrowRight,
  Printer,
  MessageSquare,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { formatKg, formatDateTime, formatNumber } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

type BatchDetail = {
  id: string;
  publicId?: string;
  createdAt: string;
  totalOliveKg: number;
  totalOilKg: number;
  acidRatio?: number;
  yieldRatio: number;
  factoryRate?: number;
  processTemp?: number;
  lineId?: number;
  filtration: boolean;
    tickets: Array<{
    origin?: string;
    variety?: string;
    quality?: string;
    netKg: number;
    note?: string;
    customer?: {
      name: string;
    };
    product?: {
      name: string;
    };
  }>;
};

type BatchDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  batch: any; // We'll fetch detailed data inside
};

export function BatchDetailModal({ isOpen, onClose, batch }: BatchDetailModalProps) {
  const t = useTranslations("batchDetail");
  const locale = useLocale() as Locale;
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && batch?.id) {
      setLoading(true);
      // Yapılandırılmış axios: token + x-tenant-id otomatik. Raw axios + sabit
      // "tenant_demo" başlığı token taşımadığı için 401 alıyordu (modal boş açılırdı).
      axios
        .get(`/production/completed/${batch.id}`)
        .then((res) => {
          setDetail(res.data);
        })
        .catch((err) => {
          toast.error(t("loadError"));
          onClose();
        })
        .finally(() => setLoading(false));
    } else {
        setDetail(null);
    }
  }, [isOpen, batch?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {t("title")}
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {detail?.publicId || batch?.id ? `#${(detail?.publicId || batch?.id).slice(-6)}` : "..."}
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {batch?.createdAt ? formatDateTime(batch.createdAt, locale) : "..."}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : detail ? (
            <div className="space-y-8">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">{t("oliveIn")}</div>
                  <div className="text-xl font-bold text-slate-900">{formatKg(detail.totalOliveKg, locale)}</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                  <div className="text-xs text-emerald-600 uppercase font-semibold mb-1">{t("oilOut")}</div>
                  <div className="text-xl font-bold text-emerald-900">{formatKg(detail.totalOilKg, locale)}</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                  <div className="text-xs text-indigo-600 uppercase font-semibold mb-1">{t("yield")}</div>
                  <div className="text-xl font-bold text-indigo-900">1/{formatNumber(detail.yieldRatio, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                  <div className="text-xs text-amber-600 uppercase font-semibold mb-1">{t("acid")}</div>
                  <div className="text-xl font-bold text-amber-900">{detail.acidRatio || "-"}</div>
                </div>
              </div>

              {/* Master Data Specs */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">{t("technicalData")}</h3>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("processTemp")}:</span>
                      <span className="font-medium text-slate-900">{detail.processTemp}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("lineNumber")}:</span>
                      <span className="font-medium text-slate-900">{t("line", { n: detail.lineId ?? "-" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("filtration")}:</span>
                      <span className={cn("font-medium", detail.filtration ? "text-emerald-600" : "text-slate-900")}>
                        {detail.filtration ? t("done") : t("notDone")}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">{t("sourceAnalysis")}</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-full max-h-[140px] overflow-y-auto">
                    {/* Unique Origins/Varieties Summary could go here, for now just list tickets simply */}
                    <div className="space-y-3">
                        {detail.tickets.map((ticket, i) => (
                            <div key={i} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                <div>
                                    <span className="font-medium text-slate-900 block">
                                        {ticket.customer?.name ? `${ticket.customer.name} - ` : ""}{ticket.origin || t("unknown")} {ticket.product?.name ? `(${ticket.product.name})` : ticket.variety ? `(${ticket.variety})` : ""}
                                    </span>
                                    <div className="text-xs text-slate-500">
                                        {ticket.quality === "TREE" ? t("qualityTREE") : ticket.quality === "GROUND" ? t("qualityGROUND") : t("qualityMIXED")}
                                        {ticket.note && (
                                            <span className="block text-amber-600 italic mt-0.5">{t("note")}: {ticket.note}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="font-bold text-slate-700">{formatKg(ticket.netKg, locale)}</span>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">{t("notFound")}</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
            <Link
                href={`/print/batch/${batch?.id}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
                <Printer className="h-4 w-4" />
                {t("printReceipt")}
            </Link>
            <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors"
            >
                {t("close")}
            </button>
        </div>
      </div>
    </div>
  );
}
