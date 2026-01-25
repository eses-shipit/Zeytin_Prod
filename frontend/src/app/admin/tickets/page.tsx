"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { cn } from "@/lib/cn";
import { CheckCircle2, AlertCircle, Clock, XCircle, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  tenant: { name: string };
  messages: { message: string }[];
};

type Stats = {
  avgResolutionTime: number;
  slaComplianceRate: number;
  openTickets: number;
  urgentTickets: number;
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("OPEN");

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        axios.get(`/support/admin/all?status=${filterStatus === 'ALL' ? '' : filterStatus}`),
        axios.get(`/support/admin/stats`),
      ]);
      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Destek Merkezi Yönetimi</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="text-sm font-medium text-slate-500">Ort. Çözüm Süresi</div>
           <div className="text-3xl font-bold text-slate-900 mt-2">{stats?.avgResolutionTime ?? 0}s</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="text-sm font-medium text-slate-500">SLA Uyumu (24h)</div>
           <div className={cn(
             "text-3xl font-bold mt-2",
             (stats?.slaComplianceRate ?? 0) > 90 ? "text-emerald-600" : "text-orange-600"
           )}>%{stats?.slaComplianceRate ?? 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="text-sm font-medium text-slate-500">Açık Talepler</div>
           <div className="text-3xl font-bold text-slate-900 mt-2">{stats?.openTickets ?? 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 bg-rose-50 border-rose-100">
           <div className="text-sm font-medium text-rose-600">Acil Durumlar</div>
           <div className="text-3xl font-bold text-rose-700 mt-2">{stats?.urgentTickets ?? 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ALL'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filterStatus === status 
                ? "bg-indigo-600 text-white" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {status === 'ALL' ? 'Tümü' : 
             status === 'OPEN' ? 'Açık' :
             status === 'IN_PROGRESS' ? 'İşleniyor' : 'Çözüldü'}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Fabrika</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Konu</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Durum</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Öncelik</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Oluşturulma</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{ticket.tenant.name}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{ticket.subject}</div>
                  <div className="text-sm text-slate-500 mt-0.5 line-clamp-1">{ticket.messages[0]?.message}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    ticket.status === 'OPEN' ? "bg-blue-100 text-blue-700" :
                    ticket.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                  )}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                   {ticket.priority === 'URGENT' && <span className="text-rose-600 font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4"/> ACİL</span>}
                   {ticket.priority === 'HIGH' && <span className="text-orange-600 font-medium">Yüksek</span>}
                   {ticket.priority === 'NORMAL' && <span className="text-slate-600">Normal</span>}
                </td>
                <td className="px-6 py-4 text-right text-sm text-slate-500">
                  {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/admin/tickets/${ticket.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    Yönet
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

