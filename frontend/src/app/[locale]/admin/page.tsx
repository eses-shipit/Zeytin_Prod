"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
  Factory,
  Database,
  Key,
  MessageSquare,
  TrendingUp,
  Activity,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Smartphone,
  Inbox
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

type GlobalStats = {
  totalTenants: number;
  activeTenants: number;
  totalLicenses: number;
  usedLicenses: number;
  globalOliveKg: number;
  globalOilKg: number;
  recentActivities: Array<{
    id: string;
    action: string;
    date: string;
    tenantName: string;
  }>;
  expiringTenants: Array<{
    id: string;
    name: string;
    subscriptionEndDate: string;
  }>;
  monthlyGrowth: Array<{
    name: string;
    count: number;
  }>;
  ticketStats: Array<{
    name: string;
    value: number;
  }>;
  smsStats: Array<{
    tenantId: string;
    tenantName: string;
    smsCount: number;
  }>;
  totalSmsSent: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Debug: Token kontrolü
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    console.log("[AdminPage] Fetching stats...");
    console.log("[AdminPage] Token in localStorage:", token ? "Yes" : "No");
    console.log("[AdminPage] User in localStorage:", user ? JSON.parse(user) : "No");
    
    try {
      const statsRes = await axios.get("/admin/stats");
      console.log("[AdminPage] ✅ Stats fetched successfully");
      setStats(statsRes.data);
    } catch (err: any) {
      console.error("[AdminPage] ❌ Fetch stats error:", err);
      console.error("[AdminPage] Error response:", err.response);
      const errorMessage = err.response?.data?.message || err.message || "Veriler yüklenemedi.";
      toast.error(errorMessage);
      
      // Eğer unauthorized hatası ise, login sayfasına yönlendir
      if (err.response?.status === 401) {
        console.warn("[AdminPage] ⚠️ Unauthorized, redirecting to login...");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExtendTenant = async (id: string) => {
      const days = prompt("Kaç gün uzatmak istiyorsunuz?", "365");
      if (!days) return;
      
      try {
          await axios.post(`/admin/tenants/${id}/extend`, { days: Number(days) });
          toast.success("Üyelik süresi uzatıldı.");
          fetchData();
      } catch (err: any) {
          toast.error("Süre uzatılamadı.");
      }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl p-6">
        {stats && (
          <div className="space-y-8 animate-in fade-in">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Genel Bakış</h1>
                <p className="text-slate-500 text-sm">Sistem genelindeki metrikler ve aktiviteler.</p>
            </div>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500">Toplam Fabrika</h3>
                  <Factory className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stats.totalTenants}</div>
                <div className="text-xs text-emerald-600 mt-1 font-medium">{stats.activeTenants} Aktif</div>
              </div>

              <Link href="/admin/tickets" className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">Destek Merkezi</h3>
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                 </div>
                 <div className="text-lg font-bold text-slate-900 mb-1">Talepleri Yönet</div>
                 <div className="text-xs text-slate-400">Tüm fabrikalardan gelen bildirimler</div>
              </Link>

              {/* Landing page'den gelen lisans/demo talepleri (lead). */}
              <Link href="/admin/leads" className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer group">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">Lisans Talepleri</h3>
                    <Inbox className="h-5 w-5 text-emerald-500" />
                 </div>
                 <div className="text-lg font-bold text-slate-900 mb-1">Gelen Talepler</div>
                 <div className="text-xs text-slate-400">Web sitesi iletişim formundan</div>
              </Link>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500">Global Üretilen Yağ</h3>
                  <Database className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{(stats.globalOilKg / 1000).toFixed(1)} <span className="text-lg text-slate-400">ton</span></div>
                <div className="text-xs text-slate-500 mt-1">Tüm zamanlar</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500">Lisans Durumu</h3>
                  <Key className="h-5 w-5 text-slate-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stats.totalLicenses}</div>
                <div className="text-xs text-slate-500 mt-1">{stats.totalLicenses - stats.usedLicenses} Boşta</div>
              </div>
            </div>

            {/* SMS Statistics Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-indigo-600" />
                  SMS İstatistikleri
                </h3>
                <div className="text-sm font-medium text-slate-600">
                  Toplam: <span className="text-indigo-600 font-bold">{stats.totalSmsSent}</span> SMS
                </div>
              </div>
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {stats.smsStats.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">Henüz SMS gönderimi yapılmamış.</div>
                ) : (
                  stats.smsStats.map((sms) => (
                    <div key={sms.tenantId} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{sms.tenantName}</div>
                          <div className="text-xs text-slate-500">Fabrika ID: {sms.tenantId.substring(0, 8)}...</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-indigo-600">{sms.smsCount}</div>
                        <div className="text-xs text-slate-500">SMS</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        Büyüme Grafiği
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ticket Stats Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                        Destek Durumu
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.ticketStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.ticketStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Feed */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            Canlı Operasyon Akışı
                        </h3>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                        {stats.recentActivities.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-sm">Henüz işlem kaydı yok.</div>
                        ) : (
                            stats.recentActivities.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-slate-900 text-sm">{log.tenantName}</span>
                                        <span className="text-xs text-slate-400">{new Date(log.date).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="text-xs text-slate-600 bg-slate-100 inline-block px-2 py-1 rounded">
                                        {log.action}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Expiring Licenses */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Lisansı Bitmek Üzere Olanlar
                            </h3>
                            <button onClick={fetchData} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Son 30 gün içinde biten lisanslar gösterilmektedir.
                        </p>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                        {stats.expiringTenants.length === 0 ? (
                            <div className="p-6 text-center text-emerald-600 text-sm flex flex-col items-center gap-2">
                                <CheckCircle2 className="h-8 w-8 opacity-20" />
                                Kritik durumda fabrika yok.
                            </div>
                        ) : (
                            stats.expiringTenants.map((t) => (
                                <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                                        <div className="text-xs text-rose-600 font-medium">
                                            Bitiş: {new Date(t.subscriptionEndDate).toLocaleDateString("tr-TR")}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleExtendTenant(t.id)}
                                        className="text-indigo-600 text-xs font-medium hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                                    >
                                        Uzat
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
