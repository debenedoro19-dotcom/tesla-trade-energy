"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { User } from "@/lib/types";

export default function UsersAdmin() {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "kyc">("all");

  const load = () => {
    setList(store.getUsers());
    setLoading(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem("tesla_admin_auth") !== "true") {
      window.location.href = "/admin";
      return;
    }
    load();
  }, []);

  const toggleStatus = (user: User) => {
    store.updateUser(user.id, { status: user.status === "active" ? "suspended" : "active" });
    load();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this user account permanently?")) return;
    store.deleteUser(id);
    load();
  };

  const reviewKyc = (id: string, status: "approved" | "rejected") => {
    const notes = status === "rejected" ? prompt("Rejection reason (optional):") || "" : "";
    store.reviewKyc(id, status, notes);
    load();
  };

  const shown = filter === "kyc" ? list.filter((u) => u.kycStatus === "pending") : list;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Users & KYC</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={`text-xs px-3 py-1.5 rounded-lg ${filter === "all" ? "bg-[#E82127]" : "border border-[#26262A]"}`}>All Users</button>
          <button onClick={() => setFilter("kyc")} className={`text-xs px-3 py-1.5 rounded-lg ${filter === "kyc" ? "bg-[#E82127]" : "border border-[#26262A]"}`}>Pending KYC</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-[#6E6E73] text-center py-12">Loading...</p>
        ) : (
          <div className="space-y-3">
            {shown.length === 0 && <p className="text-[#6E6E73] text-center py-12">No users in this view.</p>}
            {shown.map((u) => (
              <div key={u.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-semibold">{u.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${u.status === "active" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>{u.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        u.kycStatus === "approved" ? "bg-green-900/40 text-green-400" :
                        u.kycStatus === "pending" ? "bg-yellow-900/40 text-yellow-400" :
                        u.kycStatus === "rejected" ? "bg-red-900/40 text-red-400" : "bg-[#26262A] text-[#6E6E73]"
                      }`}>KYC: {u.kycStatus || "none"}</span>
                    </div>
                    <div className="text-sm text-[#6E6E73]">{u.email} · {u.phone || "No phone"}</div>
                    {u.kycStatus && u.kycStatus !== "none" && (
                      <div className="mt-2 text-sm text-[#B0B0B5] space-y-0.5">
                        <div>Legal name: {u.kycFullName}</div>
                        <div>ID: {u.kycIdType} — {u.kycIdNumber}</div>
                        <div>Country: {u.kycCountry}</div>
                        <div>Address: {u.kycAddress}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {u.kycStatus === "pending" && (
                      <>
                        <button onClick={() => reviewKyc(u.id, "approved")} className="text-xs bg-green-900/40 text-green-400 px-3 py-1.5 rounded-lg">Approve KYC</button>
                        <button onClick={() => reviewKyc(u.id, "rejected")} className="text-xs bg-red-900/40 text-red-400 px-3 py-1.5 rounded-lg">Reject KYC</button>
                      </>
                    )}
                    <button onClick={() => toggleStatus(u)} className="text-xs border border-[#26262A] px-3 py-1.5 rounded-lg hover:border-white">
                      {u.status === "active" ? "Suspend" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="text-xs text-red-400 px-3 py-1.5 rounded-lg">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
