"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store, generateId } from "@/lib/store";
import { InventoryItem } from "@/lib/types";

export default function InventoryAdmin() {
  const [list, setList] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "Vehicles" as InventoryItem["category"],
    price: 0,
    status: "available" as InventoryItem["status"],
    description: "",
    image: "",
  });

  const load = async () => {
    const data = await store.getInventory();
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
    setForm({ title: "", category: "Vehicles", price: 0, status: "available", description: "", image: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      category: form.category,
      price: Number(form.price),
      status: form.status,
      description: form.description,
      image: form.image || undefined,
    };
    if (editing) {
      await store.updateInventoryItem(editing.id, payload);
    } else {
      await store.addInventoryItem(payload);
    }
    await load();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item permanently?")) return;
    await store.deleteInventoryItem(id);
    await load();
  };

  const startEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      category: item.category,
      price: item.price,
      status: item.status,
      description: item.description,
      image: item.image || "",
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Inventory</h1>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Add Item
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 mb-8">
            <h2 className="font-semibold mb-4">{editing ? "Edit Item" : "New Inventory Item"}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3">
                <option value="Vehicles">Vehicles</option>
                <option value="Energy">Energy</option>
                <option value="Robotics">Robotics</option>
              </select>
              <input required type="number" placeholder="Price" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3">
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
              <input placeholder="Image URL (optional)" value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} className="md:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127] min-h-[80px]" />
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
            {list.length === 0 && <p className="text-[#6E6E73] text-center py-12">No inventory items yet.</p>}
            {list.map((item) => (
              <div key={item.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-xs bg-[#26262A] px-2 py-0.5 rounded">{item.category}</span>
                    <span className={`text-xs ${item.status === "available" ? "text-green-400" : "text-yellow-400"}`}>{item.status}</span>
                  </div>
                  <div className="text-sm text-[#6E6E73]">${item.price.toLocaleString()} · {item.description}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-xs border border-[#26262A] px-3 py-1.5 rounded-lg hover:border-white">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-900/20">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
