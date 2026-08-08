"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { InvestmentPackage } from "@/lib/types";

export default function InvestmentsAdmin() {
  const [list, setList] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InvestmentPackage | null>(null);
  const [form, setForm] = useState({
    name: "",
    minAmount: 0,
    expectedReturn: "",
    duration: "",
    description: "",
    features: "",
    highlighted: false,
    active: true,
  });

  const load = async () => {
    const data = await store.getInvestments();
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
    setForm({
      name: "",
      minAmount: 0,
      expectedReturn: "",
      duration: "",
      description: "",
      features: "",
      highlighted: false,
      active: true,
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      minAmount: Number(form.minAmount),
      expectedReturn: form.expectedReturn,
      duration: form.duration,
      description: form.description,
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      highlighted: form.highlighted,
      active: form.active,
    };
    if (editing) {
      await store.updateInvestment(editing.id, payload);
    } else {
      await store.addInvestment(payload);
    }
    await load();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    await store.deleteInvestment(id);
    await load();
  };

  const startEdit = (item: InvestmentPackage) => {
    setEditing(item);
    setForm({
      name: item.name,
      minAmount: item.minAmount,
      expectedReturn: item.expectedReturn,
      duration: item.duration,
      description: item.description,
      features: item.features.join("\n"),
      highlighted: item.highlighted,
      active: item.active,
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Investment Packages</h1>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Add Package
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 mb-8">
            <h2 className="font-semibold mb-4">{editing ? "Edit Package" : "New Investment Package"}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Package Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required type="number" placeholder="Minimum Amount ($)" value={form.minAmount || ""} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required placeholder="Expected Return (e.g. 12–18% p.a.)" value={form.expectedReturn} onChange={(e) => setForm({ ...form, expectedReturn: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required placeholder="Duration (e.g. 24 months)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127] min-h-[80px]" />
              <textarea placeholder="Features (one per line)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="md:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127] min-h-[100px]" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.highlighted} onChange={(e) => setForm({ ...form, highlighted: e.target.checked })} />
                Highlight as Most Popular
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Active (show on website)
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
            {list.length === 0 && <p className="text-[#6E6E73] text-center py-12">No packages yet.</p>}
            {list.map((item) => (
              <div key={item.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{item.name}</span>
                    {item.highlighted && <span className="text-xs bg-[#E82127] px-2 py-0.5 rounded">Popular</span>}
                    <span className={`text-xs ${item.active ? "text-green-400" : "text-yellow-400"}`}>{item.active ? "Active" : "Hidden"}</span>
                  </div>
                  <div className="text-sm text-[#6E6E73]">
                    ${item.minAmount.toLocaleString()} min · {item.expectedReturn} · {item.duration}
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
