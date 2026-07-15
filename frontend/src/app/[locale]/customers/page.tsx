"use client";

import axios from "@/lib/axios";
import { ChevronRight, Search, User, Plus, Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { CustomerFormModal } from "@/components/CustomerFormModal";

type Customer = {
  id: string;
  name: string;
  oliveOilBalance: number;
  balanceTL: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("/customers");
        setCustomers(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <User className="h-7 w-7 text-indigo-600" />
            Müşteriler
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cari hesapları ve stok durumlarını görüntüleyin.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Yeni Müşteri
        </button>
      </header>

      {/* Arama */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Müşteri ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Liste */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Müşteri bulunamadı.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              >
                <Link
                  href={`/customers/${customer.id}`}
                  className="flex items-center gap-4 flex-1"
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{customer.name}</div>
                    <div className="text-xs text-slate-500">ID: {customer.id}</div>
                  </div>
                </Link>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingCustomer(customer);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-emerald-600">
                        {customer.oliveOilBalance.toFixed(1)} kg Yağ
                      </div>
                      <div className="text-xs text-slate-500">
                        ₺{customer.balanceTL.toLocaleString("tr-TR")}
                      </div>
                    </div>
                    <Link href={`/customers/${customer.id}`}>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
        onSuccess={async (updatedCustomer) => {
          if (editingCustomer) {
            // Update existing customer in list
            setCustomers((prev) =>
              prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
            );
          } else {
            // Yeni müşteri eklendi, listeyi yeniden yükle
            // (Prisma middleware tenantId filtrelediği için doğru müşteriler gelecek)
            try {
              const res = await axios.get("/customers");
              setCustomers(res.data);
            } catch (error) {
              console.error("Failed to refresh customers list:", error);
              // Fallback: Optimistic update
              setCustomers((prev) => [...prev, updatedCustomer]);
            }
          }
          setEditingCustomer(null);
        }}
      />
    </div>
  );
}

