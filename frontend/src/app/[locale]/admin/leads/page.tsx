"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { ArrowLeft, Mail, Phone, Building2, MapPin, Inbox, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

/**
 * Landing page iletişim formundan gelen lisans/demo talepleri.
 *
 * E-posta bildirimi kurulu olmadığından (harici servis gerekiyor) talepler
 * buradan takip edilir. Backend GET/PATCH /leads yalnızca SUPER_ADMIN'e açık.
 */

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  factoryName?: string | null;
  city?: string | null;
  message?: string | null;
  interest?: string | null;
  locale: string;
  status: "NEW" | "CONTACTED" | "CONVERTED" | "REJECTED";
  note?: string | null;
  createdAt: string;
};

const STATUSES: Lead["status"][] = ["NEW", "CONTACTED", "CONVERTED", "REJECTED"];

const STATUS_STYLE: Record<Lead["status"], string> = {
  NEW: "bg-emerald-100 text-emerald-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  CONVERTED: "bg-indigo-100 text-indigo-700",
  REJECTED: "bg-slate-200 text-slate-600",
};

const INTERESTS = new Set(["DEMO", "STANDARD", "PRO"]);

export default function AdminLeadsPage() {
  const t = useTranslations("admin.leads");
  const locale = useLocale() as Locale;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const q = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await axios.get(`/leads${q}`);
      setLeads(res.data);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Lead["status"]) {
    try {
      await axios.patch(`/leads/${id}`, { status });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast.success(t("statusUpdated"));
    } catch {
      toast.error(t("updateError"));
    }
  }

  const newCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["ALL", "NEW", "CONTACTED", "CONVERTED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === s ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s === "ALL" ? t("all") : t(`status.${s}`)}
            {s === "NEW" && newCount > 0 && (
              <span className="ml-1.5 rounded-full bg-white/90 px-1.5 text-xs text-emerald-700">{newCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Inbox className="h-10 w-10 text-slate-300" />
          <p className="text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                    {lead.interest && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {INTERESTS.has(lead.interest) ? t(`interest.${lead.interest}`) : lead.interest}
                      </span>
                    )}
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium uppercase text-slate-400">
                      {lead.locale}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-emerald-700">
                      <Mail className="h-4 w-4 text-slate-400" /> {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 hover:text-emerald-700">
                        <Phone className="h-4 w-4 text-slate-400" /> {lead.phone}
                      </a>
                    )}
                    {lead.factoryName && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-slate-400" /> {lead.factoryName}
                      </span>
                    )}
                    {lead.city && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" /> {lead.city}
                      </span>
                    )}
                  </div>
                  {lead.message && (
                    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{lead.message}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="whitespace-nowrap text-xs text-slate-400">
                    {formatDateTime(lead.createdAt, locale)}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[lead.status]}`}>
                    {t(`status.${lead.status}`)}
                  </span>
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value as Lead["status"])}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-emerald-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`status.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
