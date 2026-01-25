"use client";

import { XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { cn } from "@/lib/cn";

type CustomerFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    tckn?: string;
  } | null;
};

export function CustomerFormModal({ isOpen, onClose, onSuccess, customer }: CustomerFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tckn, setTckn] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal açıldığında veya customer değiştiğinde formu doldur
  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setPhone(customer.phone || "");
      setTckn(customer.tckn || "");
    } else {
      setName("");
      setPhone("");
      setTckn("");
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (customer) {
        // Update existing customer
        const res = await axios.put(
          `/customers/${customer.id}`,
          { name, phone, tckn }
        );
        onSuccess(res.data);
      } else {
        // Create new customer
        const res = await axios.post(
          "/customers",
          { name, phone, tckn }
        );
        onSuccess(res.data);
      }
      
      onClose();
      // Formu temizle
      if (!customer) {
        setName("");
        setPhone("");
        setTckn("");
      }
    } catch (err) {
      setError(customer ? "Müşteri güncellenirken bir hata oluştu." : "Müşteri oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {customer ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ad Soyad <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Örn: Ahmet Yılmaz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="05XX XXX XX XX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              TCKN / Vergi No
            </label>
            <input
              type="text"
              value={tckn}
              onChange={(e) => setTckn(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="11 Haneli No"
            />
          </div>

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {customer ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

