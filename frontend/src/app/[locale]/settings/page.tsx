"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Plus, Trash2, Loader2, User, Lock, Building2, Package, Save, XCircle, Settings2, Calendar, SlidersHorizontal, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

/** Fabrika çalışma kuralları sayfasına yönlendiren kart (Faz 3 politika motoru). */
function PolicyLink() {
  const t = useTranslations("policy");
  return (
    <Link
      href="/settings/policy"
      className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 transition hover:bg-emerald-100"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-600 text-white">
          <SlidersHorizontal className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-emerald-900">{t("title")}</p>
          <p className="text-sm text-emerald-700">{t("subtitle")}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-emerald-600" />
    </Link>
  );
}

type Product = {
  id: string;
  name: string;
  isActive: boolean;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

type TenantSettings = {
  id: string;
  name: string;
  officialName?: string | null;
  taxId?: string | null;
  address?: string | null;
  city?: string | null;
  code?: string | null;
  status: string;
  subscriptionEndDate?: string | null;
  defaultDrumWeight: number;
  daysRemaining: number | null;
  authorizedPerson?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale() as Locale;
  const [activeTab, setActiveTab] = useState<"products" | "profile" | "security" | "factory" | "production">("products");
  
  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Security State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Factory State
  const [factoryInfo, setFactoryInfo] = useState<TenantSettings | null>(null);
  const [factoryForm, setFactoryForm] = useState({
    name: "",
    officialName: "",
    taxId: "",
    address: "",
    city: "",
  });
  const [factorySubmitting, setFactorySubmitting] = useState(false);

  // Production Settings State
  const [defaultDrumWeight, setDefaultDrumWeight] = useState<number>(50);
  const [productionSubmitting, setProductionSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    } else if (activeTab === "profile") {
      fetchProfile();
    } else if (activeTab === "factory" || activeTab === "production") {
      fetchFactorySettings();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/products");
      setProducts(res.data);
    } catch (err) {
      toast.error(t("products.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setProfile({
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || null,
        });
        setProfileForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      }
    } catch (err) {
      console.error("Profil yüklenemedi:", err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      await axios.post("/products", { name: newName, isActive: true });
      toast.success(t("products.added"));
      setNewName("");
      fetchProducts();
    } catch (err) {
      toast.error(t("products.addError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t("products.confirmDelete"))) return;
    try {
      await axios.delete(`/products/${id}`);
      toast.success(t("products.deleted"));
      fetchProducts();
    } catch (err) {
      toast.error(t("products.deleteError"));
    }
  };

  const handleUpdateProfile = async () => {
    setProfileSubmitting(true);
    try {
      const res = await axios.patch("/auth/profile", {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone || undefined,
      });
      toast.success(t("profile.updated"));

      // Update localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...res.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      fetchProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("profile.updateError"));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("security.mismatch"));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t("security.minLength"));
      return;
    }

    setPasswordSubmitting(true);
    try {
      await axios.patch("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(t("security.changed"));
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("security.changeError"));
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const fetchFactorySettings = async () => {
    try {
      const res = await axios.get("/tenant/settings");
      setFactoryInfo(res.data);
      setFactoryForm({
        name: res.data.name || "",
        officialName: res.data.officialName || "",
        taxId: res.data.taxId || "",
        address: res.data.address || "",
        city: res.data.city || "",
      });
      setDefaultDrumWeight(res.data.defaultDrumWeight || 50);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("factory.loadError"));
    }
  };

  const handleUpdateFactory = async () => {
    setFactorySubmitting(true);
    try {
      await axios.patch("/tenant/settings", factoryForm);
      toast.success(t("factory.updated"));
      fetchFactorySettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("factory.updateError"));
    } finally {
      setFactorySubmitting(false);
    }
  };

  const handleUpdateProductionSettings = async () => {
    setProductionSubmitting(true);
    try {
      await axios.patch("/tenant/settings", { defaultDrumWeight });
      toast.success(t("production.updated"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("production.updateError"));
    } finally {
      setProductionSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-indigo-600" />
          {t("title")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Fabrika çalışma kuralları (politika motoru) — ayrı sayfa */}
      <PolicyLink />

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl gap-1 flex-wrap">
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "flex-1 min-w-[140px] px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === "products" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Package className="h-4 w-4" />
          {t("tabs.products")}
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex-1 min-w-[140px] px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <User className="h-4 w-4" />
          {t("tabs.profile")}
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={cn(
            "flex-1 min-w-[140px] px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === "security" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Lock className="h-4 w-4" />
          {t("tabs.security")}
        </button>
        <button
          onClick={() => setActiveTab("factory")}
          className={cn(
            "flex-1 min-w-[140px] px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === "factory" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Building2 className="h-4 w-4" />
          {t("tabs.factory")}
        </button>
        <button
          onClick={() => setActiveTab("production")}
          className={cn(
            "flex-1 min-w-[140px] px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === "production" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Settings2 className="h-4 w-4" />
          {t("tabs.production")}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">{t("products.addTitle")}</h2>
            <form onSubmit={handleAddProduct} className="flex gap-4">
              <input
                type="text"
                placeholder={t("products.namePlaceholder")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <button
                type="submit"
                disabled={submitting || !newName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t("products.add")}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-slate-500">{t("products.empty")}</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-900">{t("products.colName")}</th>
                    <th className="px-6 py-3 font-semibold text-slate-900 text-right">{t("products.colActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title={t("products.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">{t("profile.title")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("profile.name")}</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder={t("profile.namePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("profile.email")}</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder={t("profile.emailPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("profile.phone")}</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder={t("profile.phonePlaceholder")}
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              disabled={profileSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {profileSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("save")}
            </button>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">{t("security.title")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("security.current")}</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder={t("security.currentPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("security.new")}</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder={t("security.newPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("security.confirm")}</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder={t("security.confirmPlaceholder")}
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={passwordSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {passwordSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {t("security.submit")}
            </button>
          </div>
        </div>
      )}

      {activeTab === "factory" && factoryInfo && (
        <div className="space-y-6">
          {/* License Card */}
          <div className={cn(
            "rounded-xl border p-6 shadow-sm",
            factoryInfo.daysRemaining !== null && factoryInfo.daysRemaining <= 30
              ? "bg-rose-50 border-rose-200"
              : factoryInfo.daysRemaining !== null && factoryInfo.daysRemaining <= 90
              ? "bg-amber-50 border-amber-200"
              : "bg-indigo-50 border-indigo-200"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">{t("factory.licenseStatus")}</h3>
                {factoryInfo.daysRemaining !== null ? (
                  <p className={cn(
                    "text-2xl font-bold",
                    factoryInfo.daysRemaining <= 30 ? "text-rose-700" :
                    factoryInfo.daysRemaining <= 90 ? "text-amber-700" : "text-indigo-700"
                  )}>
                    {factoryInfo.daysRemaining > 0 ? (
                      t("factory.daysRemaining", { days: factoryInfo.daysRemaining })
                    ) : (
                      t("factory.expired")
                    )}
                  </p>
                ) : (
                  <p className="text-slate-600">{t("factory.unlimited")}</p>
                )}
                {factoryInfo.subscriptionEndDate && (
                  <p className="text-xs text-slate-500 mt-1">
                    {t("factory.endDate", { date: formatDate(factoryInfo.subscriptionEndDate, locale) })}
                  </p>
                )}
              </div>
              <Calendar className={cn(
                "h-8 w-8",
                factoryInfo.daysRemaining !== null && factoryInfo.daysRemaining <= 30
                  ? "text-rose-600"
                  : factoryInfo.daysRemaining !== null && factoryInfo.daysRemaining <= 90
                  ? "text-amber-600"
                  : "text-indigo-600"
              )} />
            </div>
          </div>

          {/* Factory Info Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">{t("factory.title")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("factory.name")}</label>
                <input
                  type="text"
                  value={factoryForm.name}
                  onChange={(e) => setFactoryForm({ ...factoryForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("factory.officialName")}</label>
                <input
                  type="text"
                  value={factoryForm.officialName}
                  onChange={(e) => setFactoryForm({ ...factoryForm, officialName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("factory.taxId")}</label>
                <input
                  type="text"
                  value={factoryForm.taxId}
                  onChange={(e) => setFactoryForm({ ...factoryForm, taxId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("factory.address")}</label>
                <input
                  type="text"
                  value={factoryForm.address}
                  onChange={(e) => setFactoryForm({ ...factoryForm, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("factory.city")}</label>
                <input
                  type="text"
                  value={factoryForm.city}
                  onChange={(e) => setFactoryForm({ ...factoryForm, city: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              {factoryInfo.authorizedPerson && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t("factory.authorizedPerson")}</label>
                  <p className="text-sm text-slate-600">{factoryInfo.authorizedPerson.name}</p>
                  <p className="text-xs text-slate-500">{factoryInfo.authorizedPerson.email}</p>
                  {factoryInfo.authorizedPerson.phone && (
                    <p className="text-xs text-slate-500">{factoryInfo.authorizedPerson.phone}</p>
                  )}
                </div>
              )}
              <button
                onClick={handleUpdateFactory}
                disabled={factorySubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {factorySubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "production" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">{t("production.title")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("production.drumWeight")}
              </label>
              <p className="text-xs text-slate-500 mb-2">
                {t("production.drumWeightHint")}
              </p>
              <input
                type="number"
                min={1}
                step={0.1}
                value={defaultDrumWeight}
                onChange={(e) => setDefaultDrumWeight(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="50"
              />
            </div>
            <button
              onClick={handleUpdateProductionSettings}
              disabled={productionSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {productionSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
