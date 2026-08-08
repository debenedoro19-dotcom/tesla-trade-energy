"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { PaymentMethod } from "@/lib/types";

export default function PaymentsAdmin() {
  const [list, setList] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "Bank" as PaymentMethod["type"],
    details: "",
    instructions: "",
    active: true,
  });

  const load = async () => {
    const data = await store.getPayments();
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
    setForm({ name: "", type: "Bank", details: "", instructions: "", active: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await store.updatePayment(editing.id, form);
    } else {
      await store.addPayment(form);
    }
    await load();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment method?")) return;
    await store.deletePayment(id);
    await load();
  };

  const startEdit = (item: PaymentMethod) => {
    setEditing(item);
    setForm({
      name: item.name,
      type: item.type,
      details: item.details,
      instructions: item.instructions,
      active: item.active,
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Payment Methods</h1>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Add Method
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 mb-8">
            <h2 className="font-semibold mb-4">{editing ? "Edit Payment Method" : "New Payment Method"}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Name (e.g. Bank Wire Transfer)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3">
                <option value="Bank">Bank</option>
                <option value="Crypto">Crypto</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
              <input required placeholder="Short details (e.g. USD · SWIFT)" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="md:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <textarea required placeholder="Instructions shown to users" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="md:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127] min-h-[100px]" />
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
            {list.length === 0 && <p className="text-[#6E6E73] text-center py-12">No payment methods yet.</p>}
            {list.map((item) => (
              <div key={item.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs bg-[#26262A] px-2 py-0.5 rounded">{item.type}</span>
                    <span className={`text-xs ${item.active ? "text-green-400" : "text-yellow-400"}`}>{item.active ? "Active" : "Hidden"}</span>
                  </div>
                  <div className="text-sm text-[#6E6E73]">{item.details}</div>
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
