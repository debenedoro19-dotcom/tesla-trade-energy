"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { Order } from "@/lib/types";

export default function OrdersAdmin() {
  const [list, setList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await store.getOrders();
    setList(data);
    setLoading(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem("tesla_admin_auth") !== "true") {
      window.location.href = "/admin";
      return;
    }
    load();
  }, []);

  const updateStatus = async (id: string, status: Order["status"]) => {
    await store.updateOrder(id, { status });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    await store.deleteOrder(id);
    await load();
  };

  const typeLabel = (t: string) =>
    t === "product" ? "Product" : t === "investment" ? "Investment" : "Giveaway";

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Orders & Applications</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-[#6E6E73] text-center py-12">Loading...</p>
        ) : (
          <div className="space-y-3">
            {list.length === 0 && <p className="text-[#6E6E73] text-center py-12">No product, investment or giveaway applications yet.</p>}
            {list.map((o) => (
              <div key={o.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-xs bg-[#26262A] px-2 py-0.5 rounded">{typeLabel(o.type)}</span>
                    <span className="font-semibold">{o.productName}</span>
                    <span className={`text-xs ${o.status === "pending" ? "text-yellow-400" : o.status === "paid" ? "text-green-400" : "text-[#6E6E73]"}`}>{o.status}</span>
                  </div>
                  <div className="text-sm text-[#6E6E73]">{o.name} · {o.email} · {o.phone || "No phone"}</div>
                  <div className="text-sm text-[#B0B0B5] mt-1">Amount: {o.amount} · Payment: {o.paymentMethod}</div>
                  {o.notes && <div className="text-sm text-[#6E6E73] mt-1">{o.notes}</div>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {o.status === "pending" && (
                    <button onClick={() => updateStatus(o.id, "paid")} className="text-xs bg-green-900/40 text-green-400 px-3 py-1.5 rounded-lg">Mark Paid</button>
                  )}
                  <button onClick={() => handleDelete(o.id)} className="text-xs text-red-400 px-3 py-1.5 rounded-lg">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
