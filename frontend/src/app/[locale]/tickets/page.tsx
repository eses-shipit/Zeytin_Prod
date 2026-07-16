"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { 
  Search, 
  CalendarDays, 
  Filter, 
  ArrowUpDown, 
  Loader2,
  Ticket,
  Scale
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useTranslations, useLocale } from "next-intl";
import { formatDate, formatKg } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

type TicketStatus = "PENDING" | "COMPLETED";

type WeighingTicket = {
  id: string;
  createdAt: string;
  grossKg: number;
  tareKg: number;
  netKg: number;
  status: TicketStatus;
  origin?: string;
  variety?: string;
  quality?: string;
  customer: {
    name: string;
  };
};

export default function TicketsArchivePage() {
  const t = useTranslations("tickets");
  const tt = useTranslations("production.ticketsTab");
  const locale = useLocale() as Locale;
  const [tickets, setTickets] = useState<WeighingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const tenantId = "tenant_demo";

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await axios.get(`${apiBase}/tickets?${params.toString()}`, {
        headers: { "X-Tenant-ID": tenantId },
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Fişler çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchTickets();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter, startDate, endDate]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Ticket className="h-7 w-7 text-indigo-600" />
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={tt("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-slate-200 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full appearance-none rounded-lg border-slate-200 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{tt("allStatuses")}</option>
            <option value="PENDING">{tt("pending")}</option>
            <option value="COMPLETED">{tt("completed")}</option>
          </select>
        </div>

        {/* Date Range Start */}
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border-slate-200 pl-9 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Date Range End */}
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
                <th className="px-6 py-4">{tt("colDate")}</th>
                <th className="px-6 py-4">{tt("colCustomer")}</th>
                <th className="px-6 py-4">{tt("colOriginVarietyQuality")}</th>
                <th className="px-6 py-4">{tt("colGross")}</th>
                <th className="px-6 py-4">{tt("colTare")}</th>
                <th className="px-6 py-4 text-right">{tt("colNet")}</th>
                <th className="px-6 py-4 text-center">{tt("colStatus")}</th>
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
                    {tt("empty")}
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
                             {ticket.quality === "TREE" ? tt("qualityTree") : ticket.quality === "GROUND" ? tt("qualityGround") : tt("qualityMixed")}
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
                        {ticket.status === "COMPLETED" ? tt("statusCompleted") : tt("statusPending")}
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

