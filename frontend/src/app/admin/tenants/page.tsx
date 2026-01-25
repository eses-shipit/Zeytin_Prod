"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
  CalendarPlus,
  Key,
  Loader2,
  AlertCircle,
  Eye,
  X,
  Edit,
  Trash2,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type Tenant = {
  id: string;
  name: string;
  code: string;
  status: "ACTIVE" | "SUSPENDED";
  subscriptionEndDate: string | null;
  createdAt: string;
  officialName?: string;
  taxId?: string;
  address?: string;
  city?: string;
  _count: { users: number };
};

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editForm, setEditForm] = useState({ name: "", code: "", officialName: "", taxId: "", address: "", city: "" });
  const [managingUsers, setManagingUsers] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      const res = await axios.get("/admin/tenants");
      setTenants(res.data);
    } catch (err: any) {
      console.error("Fetch tenants error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Fabrika listesi yüklenemedi.";
      toast.error(errorMessage);
      
      // Eğer unauthorized hatası ise, login sayfasına yönlendir
      if (err.response?.status === 401) {
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleExtendTenant = async (id: string) => {
      const days = prompt("Kaç gün uzatmak istiyorsunuz?", "365");
      if (!days) return;
      
      try {
          await axios.post(`/admin/tenants/${id}/extend`, { days: Number(days) });
          toast.success("Üyelik süresi uzatıldı.");
          fetchTenants();
      } catch (err: any) {
          toast.error("Süre uzatılamadı.");
      }
  };

  const handleImpersonate = async (tenantId: string) => {
      try {
          const res = await axios.post(`/admin/impersonate/${tenantId}`, {});
          if (res.data.success) {
              if(!confirm("Yönetici oturumunuz sonlandırılacak ve seçilen fabrikanın yöneticisi olarak giriş yapacaksınız. Devam etmek istiyor musunuz?")) return;
              
              // 1. Mevcut Super Admin oturumunu yedekle
              const currentUser = localStorage.getItem("user");
              const currentToken = localStorage.getItem("token"); // Token'ı da yedekle
              
              if (currentUser && currentToken) {
                  localStorage.setItem("superAdminSession", currentUser);
                  localStorage.setItem("superAdminToken", currentToken);
              }

              // 2. Yeni (Impersonated) oturumu kaydet
              localStorage.setItem("user", JSON.stringify(res.data.user));
              if (res.data.token) {
                  localStorage.setItem("token", res.data.token);
              }
              
              // 3. Yönlendir
              window.location.href = "/dashboard";
          }
      } catch (err: any) {
          toast.error("Yönetim paneline geçiş yapılamadı. (Yönetici kullanıcısı yok olabilir)");
      }
  };

  const handleEditTenant = (tenant: Tenant) => {
      setEditingTenant(tenant);
      setEditForm({
          name: tenant.name || "",
          code: tenant.code || "",
          officialName: tenant.officialName || "",
          taxId: tenant.taxId || "",
          address: tenant.address || "",
          city: tenant.city || "",
      });
  };

  const handleUpdateTenant = async () => {
      if (!editingTenant) return;
      
      try {
            await axios.patch(`/admin/tenants/${editingTenant.id}`, editForm);
          toast.success("Fabrika bilgileri güncellendi.");
          setEditingTenant(null);
          fetchTenants();
      } catch (err: any) {
          toast.error(err.response?.data?.message || "Güncelleme başarısız.");
      }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
      if (!confirm(`"${name}" fabrikasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
      
      try {
                await axios.delete(`/admin/tenants/${id}`);
          toast.success("Fabrika silindi.");
          fetchTenants();
      } catch (err: any) {
          toast.error(err.response?.data?.message || "Silme işlemi başarısız.");
      }
  };

  const handleManageUsers = async (tenantId: string) => {
      try {
                const res = await axios.get(`/admin/tenants/${tenantId}/users`);
          setUsers(res.data);
          setManagingUsers(tenantId);
      } catch (err: any) {
          toast.error("Kullanıcılar yüklenemedi.");
      }
  };

  const fetchUsers = async (tenantId: string) => {
      try {
                const res = await axios.get(`/admin/tenants/${tenantId}/users`);
          setUsers(res.data);
      } catch (err: any) {
          toast.error("Kullanıcılar yüklenemedi.");
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
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Fabrikalar</h1>
                    <p className="text-slate-500 text-sm">Sisteme kayıtlı tüm işletmeler.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Fabrika Adı</th>
                  <th className="px-6 py-4">Kod</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Kullanıcı</th>
                  <th className="px-6 py-4">Üyelik Bitiş</th>
                  <th className="px-6 py-4">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{t.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{t.code || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", t.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        {t._count.users === 0 ? (
                            <span className="text-amber-600 font-medium flex items-center gap-1 text-xs">
                                <AlertCircle className="h-3 w-3" />
                                Yok
                            </span>
                        ) : t._count.users}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {t.subscriptionEndDate ? new Date(t.subscriptionEndDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                            <button 
                                onClick={() => setSelectedTenant(t)}
                                className="text-slate-600 hover:text-slate-800 flex items-center gap-1 text-xs font-medium bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                                title="Detaylar"
                            >
                                <Eye className="h-3 w-3" />
                                Detay
                            </button>
                            <button 
                                onClick={() => handleEditTenant(t)}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-medium bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                title="Düzenle"
                            >
                                <Edit className="h-3 w-3" />
                                Düzenle
                            </button>
                            <button 
                                onClick={() => handleExtendTenant(t.id)}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-medium bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                            >
                                <CalendarPlus className="h-3 w-3" />
                                Uzat
                            </button>
                            <button 
                                onClick={() => handleManageUsers(t.id)}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-medium bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                title="Kullanıcıları Yönet"
                            >
                                <Users className="h-3 w-3" />
                                Kullanıcılar
                            </button>
                            <button 
                                onClick={() => handleImpersonate(t.id)}
                                className="text-amber-600 hover:text-amber-800 flex items-center gap-1 text-xs font-medium bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                                title="Fabrika Yöneticisi Olarak Giriş Yap"
                            >
                                <Key className="h-3 w-3" />
                                Yönet
                            </button>
                            <button 
                                onClick={() => handleDeleteTenant(t.id, t.name)}
                                className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs font-medium bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                                title="Sil"
                            >
                                <Trash2 className="h-3 w-3" />
                                Sil
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            Henüz kayıtlı fabrika yok.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenant Detail Modal */}
        {selectedTenant && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Fabrika Detayları</h3>
                        <button onClick={() => setSelectedTenant(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fabrika Adı</label>
                            <p className="text-base font-semibold text-slate-900 mt-1">{selectedTenant.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kısa Kod</label>
                                <p className="text-sm font-mono font-medium text-slate-700 mt-1 bg-slate-50 inline-block px-2 py-1 rounded">{selectedTenant.code}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</label>
                                <p className={cn("text-sm font-medium mt-1", selectedTenant.status === 'ACTIVE' ? "text-emerald-600" : "text-red-600")}>
                                    {selectedTenant.status}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 pt-4 mt-2">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resmi Unvan</label>
                            <p className="text-sm text-slate-900 mt-1">{selectedTenant.officialName || "-"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vergi No</label>
                                <p className="text-sm text-slate-900 mt-1">{selectedTenant.taxId || "-"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Şehir</label>
                                <p className="text-sm text-slate-900 mt-1">{selectedTenant.city || "-"}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Adres</label>
                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{selectedTenant.address || "-"}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg mt-4 text-xs text-slate-500">
                            Kayıt Tarihi: {new Date(selectedTenant.createdAt).toLocaleString('tr-TR')}
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end">
                        <button 
                            onClick={() => setSelectedTenant(null)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Tenant Modal */}
        {editingTenant && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Fabrika Düzenle</h3>
                        <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Fabrika Adı</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Kısa Kod</label>
                            <input
                                type="text"
                                value={editForm.code}
                                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Resmi Unvan</label>
                            <input
                                type="text"
                                value={editForm.officialName}
                                onChange={(e) => setEditForm({ ...editForm, officialName: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Vergi No</label>
                                <input
                                    type="text"
                                    value={editForm.taxId}
                                    onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Şehir</label>
                                <input
                                    type="text"
                                    value={editForm.city}
                                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Adres</label>
                            <textarea
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2">
                        <button 
                            onClick={() => setEditingTenant(null)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            İptal
                        </button>
                        <button 
                            onClick={handleUpdateTenant}
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* User Management Modal */}
        {managingUsers && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Kullanıcı Yönetimi</h3>
                        <button onClick={() => setManagingUsers(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="space-y-4">
                            {users.length === 0 ? (
                                <div className="text-center text-slate-500 py-8">Bu fabrikada henüz kullanıcı yok.</div>
                            ) : (
                                users.map((user) => (
                                    <div key={user.id} className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-slate-900">{user.name || user.email}</div>
                                            <div className="text-sm text-slate-600">{user.email}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {user.phone && `📞 ${user.phone} • `}
                                                Rol: {user.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
                                                        try {
                                                            await axios.delete(`/admin/users/${user.id}`);
                                                            toast.success("Kullanıcı silindi.");
                                                            fetchUsers(managingUsers);
                                                        } catch (err: any) {
                                                            toast.error(err.response?.data?.message || "Silme başarısız.");
                                                        }
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end">
                        <button 
                            onClick={() => setManagingUsers(null)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
