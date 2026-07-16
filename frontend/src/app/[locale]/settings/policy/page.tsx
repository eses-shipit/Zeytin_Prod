"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2, Save, History, Tag } from "lucide-react";
import api from "@/lib/axios";
import { formatDateTime } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

/**
 * Fabrika çalışma kuralları (TenantPolicy) yönetim ekranı.
 *
 * Faz 3'te backend'e eklenen politika motorunu operatör arayüzüne bağlar.
 * Backend @Roles(ADMIN, SUPER_ADMIN) uyguladığı için USER rolü kaydedemez;
 * ekran yine de görüntülenebilir.
 *
 * Kaydetme yeni bir SÜRÜM oluşturur (backend); bu yüzden buton metni bunu
 * açıkça söyler. Sürüm geçmişi altta listelenir.
 */

type Policy = {
  id: string;
  version: number;
  isActive: boolean;
  defaultServiceType: "PERCENTAGE" | "CASH_PER_KG";
  defaultServiceAmount: number;
  percentageBasis: "OIL_OUT" | "OLIVE_IN";
  minServiceAmount: number | null;
  maxServiceAmount: number | null;
  allowServiceOverride: boolean;
  escrowEnabled: boolean;
  escrowDefault: boolean;
  minWithdrawalKg: number | null;
  allowNegativeBalance: boolean;
  liquidationPriceSource: "PER_TRANSACTION" | "DAILY_TABLE";
  messageAutomationEnabled: boolean;
  currency: "TRY" | "EUR";
  kgDecimalPlaces: number;
  tlDecimalPlaces: number;
  yieldAsRatio: boolean;
  createdAt: string;
};

export default function PolicyPage() {
  const t = useTranslations("policy");
  const locale = useLocale() as Locale;
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [history, setHistory] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyPrice, setDailyPrice] = useState<string>("");
  const [todayPrice, setTodayPrice] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [pol, hist] = await Promise.all([
        api.get<Policy>("/policy"),
        api.get<Policy[]>("/policy/history").catch(() => ({ data: [] as Policy[] })),
      ]);
      setPolicy(pol.data);
      setHistory(hist.data);
      // Bugünün fiyatı (varsa)
      const prices = await api.get("/policy/daily-price").catch(() => ({ data: [] }));
      const today = new Date().toISOString().slice(0, 10);
      const match = (prices.data as Array<{ date: string; pricePerKg: number }>).find(
        (p) => p.date.slice(0, 10) === today,
      );
      setTodayPrice(match ? match.pricePerKg : null);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof Policy>(key: K, value: Policy[K]) {
    setPolicy((p) => (p ? { ...p, [key]: value } : p));
  }

  async function save() {
    if (!policy) return;
    setSaving(true);
    try {
      // Backend yalnızca değişebilir alanları bekler; sürüm/id/tarih göndermeyiz.
      const payload = {
        defaultServiceType: policy.defaultServiceType,
        defaultServiceAmount: Number(policy.defaultServiceAmount),
        percentageBasis: policy.percentageBasis,
        minServiceAmount: policy.minServiceAmount != null ? Number(policy.minServiceAmount) : undefined,
        maxServiceAmount: policy.maxServiceAmount != null ? Number(policy.maxServiceAmount) : undefined,
        allowServiceOverride: policy.allowServiceOverride,
        escrowEnabled: policy.escrowEnabled,
        escrowDefault: policy.escrowDefault,
        minWithdrawalKg: policy.minWithdrawalKg != null ? Number(policy.minWithdrawalKg) : undefined,
        allowNegativeBalance: policy.allowNegativeBalance,
        liquidationPriceSource: policy.liquidationPriceSource,
        messageAutomationEnabled: policy.messageAutomationEnabled,
        currency: policy.currency,
        kgDecimalPlaces: Number(policy.kgDecimalPlaces),
        tlDecimalPlaces: Number(policy.tlDecimalPlaces),
        yieldAsRatio: policy.yieldAsRatio,
      };
      await api.patch("/policy", payload);
      toast.success(t("saved"));
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function saveDailyPrice() {
    const value = Number(dailyPrice);
    if (!value || value <= 0) return;
    try {
      await api.post("/policy/daily-price", { pricePerKg: value });
      toast.success(t("dailyPriceSaved"));
      setDailyPrice("");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? t("saveError"));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!policy) {
    return <div className="p-8 text-center text-slate-500">{t("loadError")}</div>;
  }

  const label = "mb-1 block text-sm font-medium text-slate-700";
  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
  const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

  const Toggle = ({ k, text }: { k: keyof Policy; text: string }) => (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-slate-700">{text}</span>
      <button
        type="button"
        onClick={() => set(k, !policy[k] as any)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${policy[k] ? "bg-emerald-600" : "bg-slate-300"}`}
        aria-pressed={Boolean(policy[k])}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${policy[k] ? "left-5" : "left-0.5"}`} />
      </button>
    </label>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          <Tag className="h-3.5 w-3.5" /> {t("activeVersion")}: v{policy.version}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {/* Hizmet bedeli */}
        <section className={card}>
          <h2 className="mb-4 font-semibold text-slate-900">{t("sectionFee")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>{t("serviceType")}</label>
              <select className={input} value={policy.defaultServiceType} onChange={(e) => set("defaultServiceType", e.target.value as Policy["defaultServiceType"])}>
                <option value="PERCENTAGE">{t("serviceTypePercentage")}</option>
                <option value="CASH_PER_KG">{t("serviceTypeCash")}</option>
              </select>
            </div>
            <div>
              <label className={label}>{t("serviceAmount")}</label>
              <input type="number" step="0.01" min="0" className={input} value={policy.defaultServiceAmount} onChange={(e) => set("defaultServiceAmount", e.target.value as any)} />
            </div>
            {policy.defaultServiceType === "PERCENTAGE" && (
              <div className="sm:col-span-2">
                <label className={label}>{t("percentageBasis")}</label>
                <select className={input} value={policy.percentageBasis} onChange={(e) => set("percentageBasis", e.target.value as Policy["percentageBasis"])}>
                  <option value="OIL_OUT">{t("basisOilOut")}</option>
                  <option value="OLIVE_IN">{t("basisOliveIn")}</option>
                </select>
              </div>
            )}
            <div>
              <label className={label}>{t("minServiceAmount")}</label>
              <input type="number" step="0.01" min="0" className={input} value={policy.minServiceAmount ?? ""} onChange={(e) => set("minServiceAmount", (e.target.value === "" ? null : e.target.value) as any)} />
            </div>
            <div>
              <label className={label}>{t("maxServiceAmount")}</label>
              <input type="number" step="0.01" min="0" className={input} value={policy.maxServiceAmount ?? ""} onChange={(e) => set("maxServiceAmount", (e.target.value === "" ? null : e.target.value) as any)} />
            </div>
          </div>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <Toggle k="allowServiceOverride" text={t("allowServiceOverride")} />
          </div>
        </section>

        {/* Emanet */}
        <section className={card}>
          <h2 className="mb-2 font-semibold text-slate-900">{t("sectionEscrow")}</h2>
          <Toggle k="escrowEnabled" text={t("escrowEnabled")} />
          <Toggle k="escrowDefault" text={t("escrowDefault")} />
          <div className="mt-2">
            <label className={label}>{t("minWithdrawalKg")}</label>
            <input type="number" step="0.001" min="0" className={input} value={policy.minWithdrawalKg ?? ""} onChange={(e) => set("minWithdrawalKg", (e.target.value === "" ? null : e.target.value) as any)} />
          </div>
        </section>

        {/* Ödeme */}
        <section className={card}>
          <h2 className="mb-2 font-semibold text-slate-900">{t("sectionPayment")}</h2>
          <Toggle k="allowNegativeBalance" text={t("allowNegativeBalance")} />
          <div className="mt-2">
            <label className={label}>{t("liquidationPriceSource")}</label>
            <select className={input} value={policy.liquidationPriceSource} onChange={(e) => set("liquidationPriceSource", e.target.value as Policy["liquidationPriceSource"])}>
              <option value="PER_TRANSACTION">{t("priceSourcePerTx")}</option>
              <option value="DAILY_TABLE">{t("priceSourceDaily")}</option>
            </select>
          </div>

          {policy.liquidationPriceSource === "DAILY_TABLE" && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">{t("dailyPrice")}</p>
              <p className="mb-3 text-xs text-slate-500">{t("dailyPriceHint")}</p>
              <p className="mb-2 text-sm text-slate-600">
                {todayPrice != null ? `${todayPrice} ${policy.currency}/kg` : t("noPrice")}
              </p>
              <div className="flex gap-2">
                <input type="number" step="0.0001" min="0" placeholder={t("dailyPriceLabel")} className={input} value={dailyPrice} onChange={(e) => setDailyPrice(e.target.value)} />
                <button type="button" onClick={saveDailyPrice} className="shrink-0 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900">
                  {t("dailyPriceSet")}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Mesaj otomasyonu (Pro) */}
        <section className={card}>
          <h2 className="mb-2 font-semibold text-slate-900">{t("sectionMessaging")}</h2>
          <Toggle k="messageAutomationEnabled" text={t("messageAutomationEnabled")} />
          <p className="mt-1 text-xs text-slate-500">{t("messagingHint")}</p>
        </section>

        {/* Para birimi & yuvarlama */}
        <section className={card}>
          <h2 className="mb-4 font-semibold text-slate-900">{t("sectionUnit")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>{t("currency")}</label>
              <select className={input} value={policy.currency} onChange={(e) => set("currency", e.target.value as Policy["currency"])}>
                <option value="TRY">TRY (₺)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className={label}>{t("kgDecimals")}</label>
              <input type="number" min="0" max="3" className={input} value={policy.kgDecimalPlaces} onChange={(e) => set("kgDecimalPlaces", e.target.value as any)} />
            </div>
            <div>
              <label className={label}>{t("tlDecimals")}</label>
              <input type="number" min="0" max="2" className={input} value={policy.tlDecimalPlaces} onChange={(e) => set("tlDecimalPlaces", e.target.value as any)} />
            </div>
          </div>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <Toggle k="yieldAsRatio" text={t("yieldAsRatio")} />
          </div>
        </section>

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? t("saving") : t("save")}
        </button>

        {/* Sürüm geçmişi */}
        {history.length > 0 && (
          <section className={card}>
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <History className="h-4 w-4" /> {t("history")}
            </h2>
            <ul className="divide-y divide-slate-100">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{t("version")} v{h.version}</span>
                    {h.isActive && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{t("active")}</span>}
                  </span>
                  <span className="text-slate-500">
                    {h.defaultServiceType === "PERCENTAGE" ? `${h.defaultServiceAmount}%` : `${h.defaultServiceAmount}/kg`} · {formatDateTime(h.createdAt, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
