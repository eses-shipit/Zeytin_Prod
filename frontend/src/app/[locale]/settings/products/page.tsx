"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type Product = {
  id: string;
  name: string;
  isActive: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products");
      setProducts(res.data);
    } catch (err) {
      toast.error("Ürünler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      await axios.post("/products", { name: newName, isActive: true });
      toast.success("Ürün eklendi");
      setNewName("");
      fetchProducts();
    } catch (err) {
      toast.error("Ürün eklenirken hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`/products/${id}`);
      toast.success("Ürün silindi");
      fetchProducts();
    } catch (err) {
      toast.error("Ürün silinemedi (Kullanımda olabilir)");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Ürün Yönetimi</h1>
        <div className="text-sm text-slate-500">Zeytin Cinsleri</div>
      </div>

      {/* Add Form */}
      <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Yeni Cins Ekle</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Örn: Domat, Trilye..."
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
            Ekle
          </button>
        </form>
      </div>

      {/* List */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Henüz hiç ürün eklenmemiş.</div>
        ) : (
          <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[320px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-900">Ürün Adı</th>
                <th className="px-6 py-3 font-semibold text-slate-900 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

