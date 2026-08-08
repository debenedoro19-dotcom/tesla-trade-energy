"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store, generateId } from "@/lib/store";
import { Appointment } from "@/lib/types";

export default function AppointmentsAdmin() {
  const [list, setList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    format: "Virtual" as "In-Person" | "Virtual",
    notes: "",
    status: "pending" as Appointment["status"],
  });

  const load = async () => {
    const data = await store.getAppointments();
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
      email: "",
      phone: "",
      preferredDate: "",
      format: "Virtual",
      notes: "",
      status: "pending",
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await store.updateAppointment(editing.id, form);
    } else {
      await store.addAppointment(form);
    }
    await load();
    resetForm();
  };

  const updateStatus = async (id: string, status: Appointment["status"]) => {
    await store.updateAppointment(id, { status });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment permanently?")) return;
    await store.deleteAppointment(id);
    await load();
  };

  const startEdit = (apt: Appointment) => {
    setEditing(apt);
    setForm({
      name: apt.name,
      email: apt.email,
      phone: apt.phone,
      preferredDate: apt.preferredDate,
      format: apt.format,
      notes: apt.notes,
      status: apt.status,
    });
    setShowForm(true);
  };

  const statusColor = (s: string) => {
    if (s === "pending") return "text-yellow-400";
    if (s === "approved") return "text-green-400";
    if (s === "rejected") return "text-red-400";
    return "text-blue-400";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Appointments</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          + Add Appointment
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 mb-8">
            <h2 className="font-semibold mb-4">{editing ? "Edit Appointment" : "New Appointment"}</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as "In-Person" | "Virtual" })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3">
                <option value="Virtual">Virtual</option>
                <option value="In-Person">In-Person</option>
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Appointment["status"] })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127] min-h-[80px]" />
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
            {list.length === 0 && <p className="text-[#6E6E73] text-center py-12">No appointments yet.</p>}
            {list.map((apt) => (
              <div key={apt.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{apt.name}</span>
                    <span className={`text-xs font-medium uppercase ${statusColor(apt.status)}`}>{apt.status}</span>
                  </div>
                  <div className="text-sm text-[#6E6E73]">{apt.email} · {apt.phone || "No phone"} · {apt.format} · {apt.preferredDate || "No date"}</div>
                  {apt.notes && <div className="text-sm text-[#B0B0B5] mt-1">{apt.notes}</div>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {apt.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(apt.id, "approved")} className="text-xs bg-green-900/40 text-green-400 px-3 py-1.5 rounded-lg">Approve</button>
                      <button onClick={() => updateStatus(apt.id, "rejected")} className="text-xs bg-red-900/40 text-red-400 px-3 py-1.5 rounded-lg">Reject</button>
                    </>
                  )}
                  <button onClick={() => startEdit(apt)} className="text-xs border border-[#26262A] px-3 py-1.5 rounded-lg hover:border-white">Edit</button>
                  <button onClick={() => handleDelete(apt.id)} className="text-xs text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-900/20">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
