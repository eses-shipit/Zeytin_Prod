"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Loader2 } from "lucide-react";

type BatchDetail = {
  id: string;
  createdAt: string;
  totalOliveKg: number;
  totalOilKg: number;
  acidRatio?: number;
  yieldRatio: number;
  factoryRate?: number;
  processTemp?: number;
  factoryShareKg: number;
  customerShareKg: number;
  factoryName?: string;
  tickets: Array<{
    id: string;
    grossKg: number;
    tareKg: number;
    netKg: number;
    origin?: string;
    variety?: string;
    product?: {
      id: string;
      name: string;
    };
    customer: {
      name: string;
      phone?: string;
    };
  }>;
};

export default function PrintBatchPage({ params }: { params: { id: string } }) {
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await axios.get(`/production/completed`);
        
        const found = res.data.find((b: any) => b.id === params.id);
        if (found) {
            setBatch(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Kayıt bulunamadı.
      </div>
    );
  }

  // Aggregate Data
  const customerName = batch.tickets[0]?.customer?.name || "Bilinmeyen Müşteri";
  const origin = batch.tickets[0]?.origin || "-";
  // Ürün cinsini product'tan çek, yoksa variety'den, yoksa "Karışık"
  const productName = batch.tickets[0]?.product?.name || batch.tickets[0]?.variety || "Karışık";
  
  // Get Tenant Info from LocalStorage
  let tenantInfo = {
      name: "ZEYTINSAAS Fabrikası",
      address: "Cumhuriyet Mah. Zeytin Sk. No:1\nAyvalık / Balıkesir",
      phone: "0266 123 45 67"
  };

  if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              if (user.tenant) {
                  tenantInfo = {
                      name: user.tenant.officialName || user.tenant.name,
                      address: user.tenant.address || tenantInfo.address,
                      phone: user.tenant.phone || tenantInfo.phone
                  };
              }
          } catch (e) {
              console.error("Tenant info parse error", e);
          }
      }
  }

  const factoryTitle = tenantInfo.name;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Action Bar (No Print) */}
      <div className="no-print fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <div className="text-sm font-medium">Müstahsil Makbuzu Önizleme</div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
          >
            Yazdır / PDF Kaydet
          </button>
          <button
            onClick={() => window.close()}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[210mm] mx-auto print:p-8 mt-16 print:mt-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center text-2xl font-bold rounded">
              {factoryTitle.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide">{factoryTitle}</h1>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {tenantInfo.address}<br />
                {tenantInfo.phone && `Tel: ${tenantInfo.phone}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-900">MÜSTAHSİL MAKBUZU</h2>
            <p className="text-sm text-slate-500 mt-1">
              Fiş No: <span className="font-mono font-semibold text-slate-900">#{batch.id.slice(-6)}</span>
            </p>
            <p className="text-sm text-slate-500">
              Tarih: {new Date(batch.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>

        {/* Customer & Batch Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border border-slate-200 rounded p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Müşteri Bilgileri</h3>
            <p className="font-bold text-lg">{customerName}</p>
            <p className="text-sm text-slate-600">Bölge/Köy: {origin}</p>
          </div>
          <div className="border border-slate-200 rounded p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Ürün Bilgileri</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500">Cins:</span> <span className="font-semibold">{productName}</span>
              </div>
              <div>
                <span className="text-slate-500">Sıcaklık:</span> <span className="font-semibold">{batch.processTemp}°C</span>
              </div>
              <div>
                <span className="text-slate-500">Asit:</span> <span className="font-semibold">{batch.acidRatio}%</span>
              </div>
              <div>
                <span className="text-slate-500">Verim:</span> <span className="font-semibold">1/{batch.yieldRatio.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300">
              <th className="py-3 px-4 text-left font-semibold text-sm uppercase">Açıklama</th>
              <th className="py-3 px-4 text-right font-semibold text-sm uppercase">Miktar (kg)</th>
              <th className="py-3 px-4 text-right font-semibold text-sm uppercase">Oran</th>
              <th className="py-3 px-4 text-right font-semibold text-sm uppercase">Tutar / Net</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-slate-100">
              <td className="py-3 px-4 font-medium">Toplam Zeytin Girişi</td>
              <td className="py-3 px-4 text-right">{batch.totalOliveKg} kg</td>
              <td className="py-3 px-4 text-right text-slate-500">-</td>
              <td className="py-3 px-4 text-right text-slate-500">-</td>
            </tr>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <td className="py-3 px-4 font-bold text-slate-900">Elde Edilen Zeytinyağı</td>
              <td className="py-3 px-4 text-right font-bold text-slate-900">{batch.totalOilKg} kg</td>
              <td className="py-3 px-4 text-right font-semibold">1/{batch.yieldRatio.toFixed(1)}</td>
              <td className="py-3 px-4 text-right">-</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 px-4 text-slate-600">Fabrika Hakkı (Kesinti)</td>
              <td className="py-3 px-4 text-right text-slate-600">{batch.factoryShareKg.toFixed(2)} kg</td>
              <td className="py-3 px-4 text-right text-slate-600">%{batch.factoryRate}</td>
              <td className="py-3 px-4 text-right text-slate-600">-</td>
            </tr>
            <tr className="border-t-2 border-slate-800 text-base">
              <td className="py-4 px-4 font-bold text-slate-900">MÜSTAHSİL NET HAKKI</td>
              <td className="py-4 px-4 text-right font-bold text-slate-900"></td>
              <td className="py-4 px-4 text-right"></td>
              <td className="py-4 px-4 text-right font-bold text-slate-900 text-lg">{batch.customerShareKg.toFixed(2)} kg</td>
            </tr>
          </tbody>
        </table>

        {/* Footer / Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-16 text-sm text-center">
          <div>
            <p className="font-semibold text-slate-900 mb-8">Teslim Eden (Müstahsil)</p>
            <div className="h-16 border-b border-slate-300 w-2/3 mx-auto"></div>
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-8">Teslim Alan (Fabrika)</p>
            <div className="h-16 border-b border-slate-300 w-2/3 mx-auto"></div>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-slate-400">
          Bu makbuz dijital olarak <strong>ZeytinSaaS</strong> platformunda oluşturulmuştur.
        </div>
      </div>
    </div>
  );
}
