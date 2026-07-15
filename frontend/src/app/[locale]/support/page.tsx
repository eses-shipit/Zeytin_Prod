"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, MessageSquare, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Ticket = {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  messages: { message: string }[];
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  // Tenant ID should ideally come from auth context
  const tenantId = "tenant_demo";

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${apiBase}/support`, {
        headers: { "X-Tenant-ID": tenantId },
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS": return "bg-purple-100 text-purple-700";
      case "WAITING_FOR_CUSTOMER": return "bg-orange-100 text-orange-700";
      case "RESOLVED": return "bg-emerald-100 text-emerald-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT": return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case "HIGH": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "URGENT": return "Acil";
      case "HIGH": return "Yüksek";
      case "NORMAL": return "Normal";
      case "LOW": return "Düşük";
      default: return priority;
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Destek Taleplerim</h1>
          <p className="text-slate-500 mt-1">Teknik sorunlar ve sorularınız için buradayız.</p>
        </div>
        <Link 
          href="/support/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Talep Oluştur
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">Henüz talep oluşturmadınız</h3>
          <p className="text-slate-500 mb-6">Bir sorunuz mu var? Hemen yeni bir destek talebi oluşturun.</p>
          <Link 
            href="/support/new" 
            className="text-indigo-600 font-medium hover:underline"
          >
            Talep Oluştur &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Konu</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Durum</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Öncelik</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/support/${ticket.id}`} className="block">
                      <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {ticket.subject}
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                        {ticket.messages[0]?.message}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      getStatusColor(ticket.status)
                    )}>
                      {ticket.status === "WAITING_FOR_CUSTOMER" ? "Yanıt Bekliyor" : 
                       ticket.status === "IN_PROGRESS" ? "İşleniyor" :
                       ticket.status === "RESOLVED" ? "Çözüldü" : "Açık"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {getPriorityIcon(ticket.priority)}
                      <span>{getPriorityLabel(ticket.priority)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

