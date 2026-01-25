import { useState } from "react";
import axios from "@/lib/axios";
import { X, Loader2, Banknote } from "lucide-react";
import { toast } from "sonner";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  onSuccess: () => void;
};

export function PaymentModal({ isOpen, onClose, customerId, customerName, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      await axios.post(`/transactions/${customerId}/payment`, {
        amountTL: Number(amount),
        description: description || undefined,
      });
      toast.success("Tahsilat başarıyla kaydedildi.");
      onSuccess();
      onClose();
      setAmount("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tahsilat kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-600" />
            Ödeme Al (Tahsilat)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800 mb-4">
            <span className="font-semibold">{customerName}</span> müşterisinden nakit ödeme alıyorsunuz.
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tutar (TL)</label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-lg border-slate-200 pl-4 pr-12 py-3 text-lg font-semibold text-slate-900 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">TL</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Açıklama</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: Elden tahsilat"
              className="block w-full rounded-lg border-slate-200 px-4 py-2 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Ödemeyi Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}

