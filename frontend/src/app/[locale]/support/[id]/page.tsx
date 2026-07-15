"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

type Message = {
  id: string;
  message: string;
  sender: "CUSTOMER" | "ADMIN";
  createdAt: string;
};

type TicketDetail = {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED";
  priority: string;
  messages: Message[];
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const tenantId = "tenant_demo";

  useEffect(() => {
    fetchTicket();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`${apiBase}/support/${id}`, {
        headers: { "X-Tenant-ID": tenantId },
      });
      setTicket(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await axios.post(
        `${apiBase}/support/${id}/messages`,
        { message: newMessage },
        { headers: { "X-Tenant-ID": tenantId } }
      );
      setNewMessage("");
      fetchTicket(); // Refresh chat
    } catch (err) {
      toast.error("Mesaj gönderilemedi.");
    } finally {
      setSending(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "URGENT": return "Acil";
      case "HIGH": return "Yüksek";
      case "NORMAL": return "Normal";
      case "LOW": return "Düşük";
      default: return priority;
    }
  };

  if (!ticket) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/support" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              {ticket.subject}
              {ticket.status === "RESOLVED" && (
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Çözüldü
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {ticket.id.slice(0,8)}</p>
          </div>
        </div>
        <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
           {getPriorityLabel(ticket.priority)} Öncelik
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%]",
              msg.sender === "CUSTOMER" ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm shadow-sm",
              msg.sender === "CUSTOMER" 
                ? "bg-indigo-600 text-white rounded-br-none" 
                : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
            )}>
              {msg.message}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {msg.sender === "CUSTOMER" ? "Siz" : "Destek Ekibi"} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
        {ticket.status === "RESOLVED" && (
          <div className="flex justify-center py-4">
             <div className="bg-emerald-50 text-emerald-700 text-xs px-4 py-2 rounded-full border border-emerald-100">
               Bu talep çözüme kavuşturuldu. Yeni bir mesaj yazarsanız tekrar açılacaktır.
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Bir mesaj yazın..."
            className="flex-1 rounded-none border-2 border-black bg-white pl-4 pr-12 py-3 text-slate-900 focus:border-black focus:ring-0 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

