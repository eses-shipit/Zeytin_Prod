"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios"; // Use configured axios instance
import { useTranslations, useLocale } from "next-intl";
// DİKKAT: `next/navigation` değil. Dil prefix'ini koruyan sarmalayıcı.
import { useRouter } from "@/i18n/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Droplet,
  Scale,
  Ticket,
  TrendingUp,
  Loader2,
  Banknote,
  Package,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatKg, formatNumber } from "@/lib/format";
import { useTenantCurrency } from "@/hooks/useTenantCurrency";
import type { Locale } from "@/i18n/routing";

/**
 * REFERANS MİGRASYON — diğer sayfalar bu deseni takip etmeli (bkz. I18N.md).
 *
 * Bu dosyada gösterilen 4 şey:
 *  1. `useTranslations("dashboard")` ile namespace'e bağlanma
 *  2. `@/i18n/navigation` üzerinden dil-korumalı yönlendirme
 *  3. `@/lib/format` ile dil-farkında sayı/para/kg biçimlendirme
 *  4. Para biriminin tenant'tan gelmesi — `₺` sabiti YOK
 */

type DashboardStats = {
  kpis: {
    dailyOliveKg: number;
    dailyOilKg: number;
    pendingTicketsCount: number;
    avgYield: number;
    totalReceivable: number;
    totalFactoryShareOil: number;
    pendingContainerTickets: number;
  };
  charts: {
    yieldByOrigin: { name: string; yield: number }[];
    qualityDistribution: { name: string; value: number }[];
    revenueByProduct: { name: string; value: number }[];
    customersByVillage: { name: string; value: number }[];
  };
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale() as Locale;
  const currency = useTenantCurrency();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"all" | "today" | "week">("all");

  useEffect(() => {
    fetchStats();
  }, [range]);

  const fetchStats = async () => {
    try {
      // No manual header or base URL needed, handled by lib/axios
      const response = await axios.get("/reports/dashboard", { params: { range } });
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      // Don't show error immediately on empty state (new factory)
      // Just set empty stats or show specific message
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Handle empty state gracefully
  if (!stats) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700">{t("empty.title")}</h2>
        <p className="text-gray-500 mt-2">{t("empty.description")}</p>
        <div className="mt-6 flex justify-center gap-4">
             <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
             >
                <Scale className="h-4 w-4" />
                {t("firstWeighing")}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-xl p-1 text-sm">
              {(["today", "week", "all"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setRange(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition",
                    range === key ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
                  )}
                >
                  {t(`range.${key}`)}
                </button>
              ))}
            </div>
            <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
                <Scale className="h-4 w-4" />
                {t("firstWeighing")}
            </button>
        </div>
      </div>

      {/* KPI Kartları - Üst Sıra (Operasyonel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title={t("kpi.oliveIn.title")}
          value={formatKg(stats.kpis.dailyOliveKg, locale)}
          icon={<Scale className="w-8 h-8 text-blue-600" />}
          trend={t("kpi.oliveIn.trend")}
        />
        <KpiCard
          title={t("kpi.oilOut.title")}
          value={formatKg(stats.kpis.dailyOilKg, locale)}
          icon={<Droplet className="w-8 h-8 text-green-600" />}
          trend={t("kpi.oilOut.trend")}
        />
        <KpiCard
          title={t("kpi.avgYield.title")}
          // "1/5,32" — randıman oranı. Bölme çizgisi dile bağlı değil ama
          // ondalık ayracı bağlı, o yüzden sayı kısmı formatNumber'dan geçiyor.
          value={`1/${formatNumber(stats.kpis.avgYield, locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<Activity className="w-8 h-8 text-purple-600" />}
          trend={t("kpi.avgYield.trend")}
        />
        <KpiCard
          title={t("kpi.pendingTickets.title")}
          value={formatNumber(stats.kpis.pendingTicketsCount, locale)}
          icon={<Ticket className="w-8 h-8 text-orange-600" />}
          trend={t("kpi.pendingTickets.trend")}
        />
      </div>

      {/* Alert Section */}
      {stats.kpis.pendingTicketsCount > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm flex items-center gap-3 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <div>
                  <p className="font-bold text-amber-800 text-lg">
                      {/* Emoji kasıtlı olarak JSX'te: çeviri dosyasına girerse
                          her dilde tekrar edilmesi/kaybolması gerekir. */}
                      ⚠️ {t("alert.title", { count: stats.kpis.pendingTicketsCount })}
                  </p>
                  <p className="text-sm text-amber-700">
                      {t("alert.description")}
                  </p>
              </div>
          </div>
      )}

      {/* KPI Kartları - Alt Sıra (Finansal & İdari) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            title={t("kpi.receivable.title")}
            // Para birimi tenant'tan (GET /policy). "₺" sabiti YOK.
            value={formatCurrency(stats.kpis.totalReceivable, currency, locale)}
            icon={<Banknote className="w-8 h-8 text-emerald-600" />}
            trend={t("kpi.receivable.trend")}
          />
          <KpiCard
            title={t("kpi.factoryShareOil.title")}
            value={formatKg(stats.kpis.totalFactoryShareOil, locale, { digits: 1 })}
            icon={<Droplet className="w-8 h-8 text-amber-500" />}
            trend={t("kpi.factoryShareOil.trend")}
          />
          <KpiCard
            title={t("kpi.containers.title")}
            value={t("kpi.containers.value", {
              count: stats.kpis.pendingContainerTickets,
            })}
            icon={<Package className="w-8 h-8 text-slate-600" />}
            trend={t("kpi.containers.trend")}
          />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Ürün Bazlı Fabrika Payı (kg) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-gray-700 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-emerald-600" />
                {t("charts.factoryShareByProduct.title")}
            </h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.charts.revenueByProduct}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis
                            tickFormatter={(val) => formatKg(val, locale)}
                            width={80}
                        />
                        <Tooltip
                            formatter={(value) => [
                              formatKg(Number(value), locale, { digits: 2 }),
                              t("charts.factoryShareByProduct.series"),
                            ]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f3f4f6' }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#059669"
                          radius={[4, 4, 0, 0]}
                          name={t("charts.factoryShareByProduct.title")}
                          barSize={60}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Köylere Göre Randıman */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t("charts.yieldByVillage.title")}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.yieldByOrigin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar
                  dataKey="yield"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name={t("charts.yieldByVillage.series")}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kalite Dağılımı */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-700 flex items-center gap-2">
            <Scale className="w-5 h-5" />
            {t("charts.qualityDistribution.title")}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.qualityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${formatNumber((percent ?? 0) * 100, locale, {
                      style: "percent",
                      maximumFractionDigits: 0,
                    })})`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.charts.qualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Müşterilerin Köy Dağılımı */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-700 flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t("charts.customersByVillage.title")}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.customersByVillage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  cursor={{ fill: "#f3f4f6" }}
                />
                <Bar
                  dataKey="value"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  name={t("charts.customersByVillage.series")}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between hover:shadow-xl transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-2">{trend}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
  );
}
