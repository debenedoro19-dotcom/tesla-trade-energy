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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-[#6E6E73]">Loading dashboard...</p>
      </div>
    );
  }

  const kycStatus = user?.kycStatus || "none";
  const kycBadge =
    kycStatus === "approved"
      ? "bg-green-900/40 text-green-400"
      : kycStatus === "pending"
      ? "bg-yellow-900/40 text-yellow-400"
      : kycStatus === "rejected"
      ? "bg-red-900/40 text-red-400"
      : "bg-[#26262A] text-[#6E6E73]";

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-8 h-8 bg-[#E82127] rounded-lg flex items-center justify-center text-white font-extrabold text-sm">T</div>
            Tesla Trade
          </Link>
          <span className="text-[#6E6E73] text-sm hidden sm:inline">/ My Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#B0B0B5] hidden sm:inline">{session.name}</span>
          <button onClick={handleLogout} className="text-sm text-[#6E6E73] hover:text-red-400">Logout</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">Welcome, {session.name.split(" ")[0]}</h1>
        <p className="text-[#6E6E73] mb-8">{session.email}</p>

        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
            <div className="text-2xl font-bold text-[#E82127]">{orders.length}</div>
            <div className="text-xs text-[#6E6E73] mt-1">Orders</div>
          </div>
          <div className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
            <div className="text-2xl font-bold">{appointments.length}</div>
            <div className="text-xs text-[#6E6E73] mt-1">VIP Sessions</div>
          </div>
          <div className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
            <div className={`text-sm font-bold inline-block px-2 py-1 rounded ${kycBadge}`}>{kycStatus}</div>
            <div className="text-xs text-[#6E6E73] mt-2">KYC Status</div>
          </div>
          <div className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
            <div className="text-2xl font-bold text-green-400">Active</div>
            <div className="text-xs text-[#6E6E73] mt-1">Account</div>
          </div>
        </div>

        {/* KYC */}
        <section className="mb-10">
          <h2 className="font-semibold text-lg mb-4">KYC Verification</h2>
          <div className="bg-[#121214] border border-[#26262A] rounded-xl p-6">
            {kycStatus === "approved" ? (
              <p className="text-green-400 text-sm">Your identity has been verified. You have full access to platform features.</p>
            ) : kycStatus === "pending" ? (
              <div>
                <p className="text-yellow-400 text-sm mb-2">Your KYC is under review. We will update you shortly.</p>
                {user?.kycSubmittedAt && (
                  <p className="text-xs text-[#6E6E73]">Submitted: {new Date(user.kycSubmittedAt).toLocaleString()}</p>
                )}
              </div>
            ) : (
              <>
                {kycStatus === "rejected" && (
                  <p className="text-red-400 text-sm mb-4">
                    Previous submission was rejected{user?.kycNotes ? `: ${user.kycNotes}` : "."} Please resubmit.
                  </p>
                )}
                <p className="text-sm text-[#6E6E73] mb-4">
                  Complete KYC to unlock higher limits and priority processing on investments and vehicle purchases.
                </p>
                <form onSubmit={handleKycSubmit} className="grid sm:grid-cols-2 gap-4">
                  <input required placeholder="Full legal name" value={kycForm.kycFullName} onChange={(e) => setKycForm({ ...kycForm, kycFullName: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
                  <select value={kycForm.kycIdType} onChange={(e) => setKycForm({ ...kycForm, kycIdType: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3">
                    <option>National ID</option>
                    <option>Passport</option>
                    <option>Driver License</option>
                    <option>Residence Permit</option>
                  </select>
                  <input required placeholder="ID number" value={kycForm.kycIdNumber} onChange={(e) => setKycForm({ ...kycForm, kycIdNumber: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
                  <input required placeholder="Country" value={kycForm.kycCountry} onChange={(e) => setKycForm({ ...kycForm, kycCountry: e.target.value })} className="bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
                  <input required placeholder="Residential address" value={kycForm.kycAddress} onChange={(e) => setKycForm({ ...kycForm, kycAddress: e.target.value })} className="sm:col-span-2 bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]" />
                  <button type="submit" className="sm:col-span-2 bg-[#E82127] hover:bg-[#FF3B41] text-white py-3 rounded-xl font-semibold">
                    Submit KYC for Review
                  </button>
                </form>
                {kycMsg && <p className="text-green-400 text-sm mt-3">{kycMsg}</p>}
              </>
            )}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-semibold text-lg mb-4">Your Orders & Applications</h2>
          {orders.length === 0 ? (
            <div className="bg-[#121214] border border-[#26262A] rounded-xl p-8 text-center text-[#6E6E73]">
              <p className="mb-3">No orders yet.</p>
              <Link href="/inventory" className="text-[#E82127] hover:underline text-sm">Browse Inventory →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs bg-[#26262A] px-2 py-0.5 rounded capitalize">{o.type}</span>
                    <span className={`text-xs ${o.status === "pending" ? "text-yellow-400" : o.status === "paid" ? "text-green-400" : "text-[#6E6E73]"}`}>{o.status}</span>
                  </div>
                  <div className="font-semibold">{o.productName}</div>
                  <div className="text-sm text-[#6E6E73] mt-1">{o.amount} · Payment: {o.paymentMethod}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="font-semibold text-lg mb-4">VIP Session Requests</h2>
          {appointments.length === 0 ? (
            <div className="bg-[#121214] border border-[#26262A] rounded-xl p-8 text-center text-[#6E6E73]">
              <p className="mb-3">No session requests yet.</p>
              <Link href="/#vip" className="text-[#E82127] hover:underline text-sm">Book a Private Session →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((a: any) => (
                <div key={a.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs ${a.status === "pending" ? "text-yellow-400" : a.status === "approved" ? "text-green-400" : "text-[#6E6E73]"}`}>{a.status}</span>
                    <span className="text-xs text-[#6E6E73]">{a.format}</span>
                  </div>
                  <div className="text-sm text-[#B0B0B5]">Preferred date: {a.preferredDate || "Not set"}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/inventory" className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Browse Inventory</Link>
          <Link href="/#investments" className="border border-[#26262A] hover:border-[#E82127] px-5 py-2.5 rounded-xl text-sm font-semibold">View Investments</Link>
          <a href={`https://wa.me/2348100000000`} target="_blank" rel="noopener noreferrer" className="border border-[#25D366] text-[#25D366] px-5 py-2.5 rounded-xl text-sm font-semibold">WhatsApp Support</a>
          <Link href="/" className="border border-[#26262A] hover:border-white px-5 py-2.5 rounded-xl text-sm">Home</Link>
        </div>
      </main>
    </div>
  );
}
