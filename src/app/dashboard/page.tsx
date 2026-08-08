"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { Order, User } from "@/lib/types";

export default function UserDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycForm, setKycForm] = useState({
    kycFullName: "",
    kycIdType: "National ID",
    kycIdNumber: "",
    kycCountry: "",
    kycAddress: "",
  });
  const [kycMsg, setKycMsg] = useState("");

  const refresh = (email: string, id: string) => {
    const users = store.getUsers();
    const u = users.find((x) => x.id === id) || null;
    setUser(u);
    setOrders(store.getOrdersByEmail(email));
    setAppointments(store.getAppointmentsByEmail(email));
    if (u) {
      setKycForm({
        kycFullName: u.kycFullName || u.name || "",
        kycIdType: u.kycIdType || "National ID",
        kycIdNumber: u.kycIdNumber || "",
        kycCountry: u.kycCountry || "",
        kycAddress: u.kycAddress || "",
      });
    }
  };

  useEffect(() => {
    const s = store.getSession();
    if (!s) {
      router.push("/login");
      return;
    }
    setSession(s);
    refresh(s.email, s.id);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    store.logoutUser();
    router.push("/");
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    store.submitKyc(session.id, kycForm);
    setKycMsg("KYC submitted successfully. Status: Pending review.");
    refresh(session.email, session.id);
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
        <p className="text-[#63636E]">Loading portfolio…</p>
      </div>
    );
  }

  const kycStatus = user?.kycStatus || "none";
  const kycBadge =
    kycStatus === "approved"
      ? "bg-green-900/40 text-[#00E676] border border-green-800/50"
      : kycStatus === "pending"
      ? "bg-yellow-900/30 text-[#FFD60A] border border-yellow-800/40"
      : kycStatus === "rejected"
      ? "bg-red-900/40 text-red-400 border border-red-800/50"
      : "bg-[#1E1E26] text-[#63636E] border border-[#2a2a32]";

  const portfolioValue = orders.length * 12450 + appointments.length * 50000;
  const changePct = orders.length > 0 ? 2.4 : 0.0;

  return (
    <div className="min-h-screen bg-[#050507] text-white relative">
      <div className="crypto-bg" aria-hidden />
      <div className="crypto-grid" aria-hidden />

      <header className="relative z-20 border-b border-[#1E1E26] px-6 py-4 flex items-center justify-between glass-strong sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-8 h-8 bg-[#E82127] rounded-lg flex items-center justify-center text-sm font-extrabold">T</div>
            Tesla Trade
          </Link>
          <span className="text-[#63636E] text-xs uppercase tracking-widest hidden sm:inline">Investor Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#A8A8B3] hidden sm:inline">{session.name}</span>
          <button onClick={handleLogout} className="text-sm text-[#63636E] hover:text-red-400 transition">Logout</button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-[#63636E] uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-3xl font-bold tracking-tight">{session.name.split(" ")[0]}</h1>
            <p className="text-[#63636E] text-sm mt-1">{session.email}</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${kycBadge}`}>
            KYC: {kycStatus}
          </div>
        </div>

        {/* High-impact portfolio strip */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 card-premium p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle,rgba(232,33,39,0.15),transparent_70%)]" />
            <p className="text-xs text-[#63636E] uppercase tracking-wider mb-2">Estimated Portfolio Exposure</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                ${portfolioValue.toLocaleString()}
              </span>
              <span className={`text-sm font-semibold mb-1 ${changePct >= 0 ? "text-[#00E676]" : "text-red-400"}`}>
                {changePct >= 0 ? "▲" : "▼"} {changePct.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-[#63636E] mt-3">Based on active orders & VIP sessions · illustrative</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-black/40 rounded-xl p-3 border border-[#1E1E26]">
                <div className="text-lg font-bold text-[#E82127]">{orders.length}</div>
                <div className="text-[10px] text-[#63636E] uppercase">Orders</div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-[#1E1E26]">
                <div className="text-lg font-bold text-[#00E5FF]">{appointments.length}</div>
                <div className="text-[10px] text-[#63636E] uppercase">VIP Sessions</div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-[#1E1E26]">
                <div className="text-lg font-bold text-[#00E676]">Active</div>
                <div className="text-[10px] text-[#63636E] uppercase">Account</div>
              </div>
            </div>
          </div>

          <div className="card-premium p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-[#63636E] uppercase tracking-wider mb-2">Quick actions</p>
              <div className="space-y-2">
                <Link href="/#inventory" className="block w-full text-center bg-[#E82127] hover:bg-[#FF3B41] text-white py-2.5 rounded-xl text-sm font-semibold transition">
                  Browse Inventory
                </Link>
                <Link href="/#investments" className="block w-full text-center border border-[#1E1E26] hover:border-[#00E5FF] py-2.5 rounded-xl text-sm transition">
                  Investment Packages
                </Link>
                <Link href="/#vip" className="block w-full text-center border border-[#1E1E26] hover:border-[#E82127] py-2.5 rounded-xl text-sm transition">
                  Book VIP Session
                </Link>
              </div>
            </div>
            <p className="text-[10px] text-[#63636E] mt-4">Markets · Vehicles · Energy · Robotics</p>
          </div>
        </div>

        {/* Orders */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#E82127] rounded-full" />
            Your Orders
          </h2>
          {orders.length === 0 ? (
            <div className="card-premium p-8 text-center text-[#63636E] text-sm">
              No orders yet. Explore inventory to place your first request.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="card-premium p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{o.productTitle || o.type}</div>
                    <div className="text-xs text-[#63636E] mt-1">{o.email} · {new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#00E5FF]">{o.amount || "—"}</span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-black/40 border border-[#1E1E26] capitalize">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* VIP */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#00E5FF] rounded-full" />
            VIP Sessions
          </h2>
          {appointments.length === 0 ? (
            <div className="card-premium p-8 text-center text-[#63636E] text-sm">No VIP applications yet.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map((a: any) => (
                <div key={a.id} className="card-premium p-4 flex justify-between items-center gap-3">
                  <div>
                    <div className="font-medium">{a.format} session</div>
                    <div className="text-xs text-[#63636E]">{a.preferredDate || "Date TBD"}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-black/40 border border-[#1E1E26] capitalize">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* KYC */}
        <section className="card-premium p-6">
          <h2 className="text-lg font-semibold mb-1">Identity Verification (KYC)</h2>
          <p className="text-xs text-[#63636E] mb-5">Complete verification to unlock higher limits and faster settlement.</p>
          {kycStatus === "approved" ? (
            <p className="text-[#00E676] text-sm font-medium">Your identity is verified.</p>
          ) : (
            <form onSubmit={handleKycSubmit} className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Full legal name" value={kycForm.kycFullName} onChange={(e) => setKycForm({ ...kycForm, kycFullName: e.target.value })} className="bg-black/50 border border-[#1E1E26] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <select value={kycForm.kycIdType} onChange={(e) => setKycForm({ ...kycForm, kycIdType: e.target.value })} className="bg-black/50 border border-[#1E1E26] rounded-xl px-4 py-3">
                <option>National ID</option>
                <option>Passport</option>
                <option>Driver License</option>
              </select>
              <input required placeholder="ID number" value={kycForm.kycIdNumber} onChange={(e) => setKycForm({ ...kycForm, kycIdNumber: e.target.value })} className="bg-black/50 border border-[#1E1E26] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required placeholder="Country" value={kycForm.kycCountry} onChange={(e) => setKycForm({ ...kycForm, kycCountry: e.target.value })} className="bg-black/50 border border-[#1E1E26] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              <input required placeholder="Residential address" value={kycForm.kycAddress} onChange={(e) => setKycForm({ ...kycForm, kycAddress: e.target.value })} className="sm:col-span-2 bg-black/50 border border-[#1E1E26] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
              {kycMsg && <p className="sm:col-span-2 text-sm text-[#00E676]">{kycMsg}</p>}
              <button type="submit" className="sm:col-span-2 bg-[#E82127] hover:bg-[#FF3B41] text-white py-3 rounded-xl font-semibold transition">
                Submit KYC
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
