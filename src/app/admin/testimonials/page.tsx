"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store, generateId } from "@/lib/store";
import { Testimonial } from "@/lib/types";

export default function TestimonialsAdmin() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    quote: "",
    rating: 5,
    approved: true,
    avatar: "",
  });

  const load = async () => {
    const data = await store.getTestimonials();
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
    setForm({ name: "", role: "", quote: "", rating: 5, approved: true, avatar: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      role: form.role,
      quote: form.quote,
      rating: Number(form.rating),
      approved: form.approved,
      avatar: form.avatar || undefined,
    };
    if (editing) {
      await store.updateTestimonial(editing.id, payload);
    } else {
      await store.addTestimonial(payload);
    }
    await load();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await store.deleteTestimonial(id);
    await load();
  };

  const toggleApproved = async (item: Testimonial) => {
    await store.updateTestimonial(item.id, { approved: !item.approved });
    await load();
  };

  const startEdit = (item: Testimonial) => {
    setEditing(item);
    setForm({
      name: item.name,
      role: item.role,
      quote: item.quote,
      rating: item.rating,
      approved: item.approved,
      avatar: item.avatar || "",
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Testimonials</h1>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Add Review
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 mb-8">
            <h2 className="font-semibold mb-4">{editing ? "Edit Testimonial" : "New Testimonial"}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input placeholder="Role / Location" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3">
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.approved} onChange={(e) => setForm({ ...form, approved: e.target.checked })} />
                Approved (show on website)
              </label>
              <textarea required placeholder="Quote" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="md:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127] min-h-[100px]" />
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
            {list.length === 0 && <p className="text-[#6E6E73] text-center py-12">No testimonials yet.</p>}
            {list.map((item) => (
              <div key={item.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-yellow-400 text-sm">{"★".repeat(item.rating)}</span>
                    <span className={`text-xs ${item.approved ? "text-green-400" : "text-yellow-400"}`}>
                      {item.approved ? "Approved" : "Hidden"}
                    </span>
                  </div>
                  <div className="text-sm text-[#6E6E73]">{item.role}</div>
                  <div className="text-sm text-[#B0B0B5] mt-1">"{item.quote}"</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleApproved(item)} className="text-xs border border-[#26262A] px-3 py-1.5 rounded-lg">
                    {item.approved ? "Hide" : "Approve"}
                  </button>
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
