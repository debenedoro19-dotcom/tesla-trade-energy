"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { PortfolioItem } from "@/lib/types";

export default function PortfolioAdmin() {
  const [list, setList] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    value: "",
    change: "",
    changeUp: true,
    allocation: "",
  });

  const load = async () => {
    const data = await store.getPortfolio();
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

  const resetForm = () => {
    setForm({ name: "", symbol: "", value: "", change: "", changeUp: true, allocation: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await store.updatePortfolioItem(editing.id, form);
    } else {
      await store.addPortfolioItem(form);
    }
    await load();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return;
    await store.deletePortfolioItem(id);
    await load();
  };

  const startEdit = (item: PortfolioItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      symbol: item.symbol,
      value: item.value,
      change: item.change,
      changeUp: item.changeUp,
      allocation: item.allocation,
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Portfolio Snapshot</h1>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Add Item
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 mb-8">
            <h2 className="font-semibold mb-4">{editing ? "Edit Item" : "New Portfolio Item"}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Name (e.g. Tesla Inc)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required placeholder="Symbol (e.g. TSLA)" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required placeholder="Value (e.g. $319.53 or $1.2M)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required placeholder="Change (e.g. +2.4% or −0.63%)" value={form.change} onChange={(e) => setForm({ ...form, change: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required placeholder="Allocation (e.g. 32%)" value={form.allocation} onChange={(e) => setForm({ ...form, allocation: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.changeUp} onChange={(e) => setForm({ ...form, changeUp: e.target.checked })} />
                Positive change (green)
              </label>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-6 py-2.5 rounded-xl font-semibold">{editing ? "Update" : "Create"}</button>
                <button type="button" onClick={resetForm} className="border border-[#26262A] px-6 py-2.5 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-[#6E6E73] text-center py-12">Loading...</p>
        ) : (
          <div className="space-y-3">
            {list.length === 0 && <p className="text-[#6E6E73] text-center py-12">No portfolio items yet.</p>}
            {list.map((item) => (
              <div key={item.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{item.symbol}</span>
                    <span className="text-sm text-[#6E6E73]">{item.name}</span>
                    <span className="text-xs bg-[#26262A] px-2 py-0.5 rounded">{item.allocation}</span>
                  </div>
                  <div className="text-sm">
                    {item.value} · <span className={item.changeUp ? "text-green-400" : "text-red-400"}>{item.change}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-xs border border-[#26262A] px-3 py-1.5 rounded-lg hover:border-white">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 px-3 py-1.5 rounded-lg">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
