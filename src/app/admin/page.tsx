"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { Appointment, InventoryItem, Testimonial } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("tesla_admin_auth") === "true";
    setAuthenticated(isAuth);
    if (isAuth) loadData();
    else setLoading(false);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, i, t] = await Promise.all([
        store.getAppointments(),
        store.getInventory(),
        store.getTestimonials(),
      ]);
      setAppointments(a);
      setInventory(i);
      setTestimonials(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = store.getAdminPassword();
    if (password === correct) {
      sessionStorage.setItem("tesla_admin_auth", "true");
      setAuthenticated(true);
      loadData();
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("tesla_admin_auth");
    setAuthenticated(false);
    setPassword("");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-8 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#E82127] rounded-lg flex items-center justify-center text-white font-extrabold">T</div>
            <div>
              <h1 className="font-bold text-lg">Tesla Trade Admin</h1>
              <p className="text-xs text-[#6E6E73]">Secure access only</p>
            </div>
          </div>
          <form onSubmit={handleLogin}>
            <label className="block text-sm text-[#B0B0B5] mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127] mb-3"
              placeholder="Enter password"
              autoFocus
            />
            {error && <p className="text-[#FF453A] text-sm mb-3">{error}</p>}
            <button type="submit" className="w-full bg-[#E82127] hover:bg-[#FF3B41] text-white py-3 rounded-xl font-semibold transition">
              Unlock Admin Panel
            </button>
          </form>
          <p className="text-center text-xs text-[#6E6E73] mt-6">
            <Link href="/" className="hover:text-white transition">← Back to website</Link>
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const availableCount = inventory.filter((i) => i.status === "available").length;
  const approvedTestimonials = testimonials.filter((t) => t.approved).length;
  const vehicleCount = inventory.filter((i) => i.category === "Vehicles" && i.status === "available").length;
  const energyCount = inventory.filter((i) => i.category === "Energy" && i.status === "available").length;
  const robotCount = inventory.filter((i) => i.category === "Robotics" && i.status === "available").length;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E82127] rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
          <span className="font-bold">Tesla Trade Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-[#6E6E73] hover:text-white">View Site</Link>
          <button onClick={handleLogout} className="text-sm text-[#6E6E73] hover:text-red-400">Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-[#6E6E73] text-center py-20">Loading dashboard...</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
            <p className="text-[#6E6E73] mb-8">Welcome back. Manage every part of your platform from here.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
                <div className="text-2xl font-bold text-[#E82127]">{pendingCount}</div>
                <div className="text-xs text-[#6E6E73] mt-1">Pending Appointments</div>
              </div>
              <div className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
                <div className="text-2xl font-bold">{availableCount}</div>
                <div className="text-xs text-[#6E6E73] mt-1">Available Listings</div>
              </div>
              <div className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
                <div className="text-2xl font-bold">{vehicleCount}</div>
                <div className="text-xs text-[#6E6E73] mt-1">Vehicles</div>
              </div>
              <div className="bg-[#121214] border border-[#26262A] rounded-xl p-5">
                <div className="text-2xl font-bold">{approvedTestimonials}</div>
                <div className="text-xs text-[#6E6E73] mt-1">Approved Reviews</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-[#121214] border border-[#26262A] rounded-xl p-4 text-center">
                <div className="text-lg font-bold">{energyCount}</div>
                <div className="text-xs text-[#6E6E73]">Energy / Solar</div>
              </div>
              <div className="bg-[#121214] border border-[#26262A] rounded-xl p-4 text-center">
                <div className="text-lg font-bold">{robotCount}</div>
                <div className="text-xs text-[#6E6E73]">Robotics</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { href: "/admin/chat", icon: "💬", title: "Live Chat", desc: "Reply to customer support conversations in real time." },
                { href: "/admin/users", icon: "👥", title: "Users & Accounts", desc: "View registered members, suspend or delete accounts." },
                { href: "/admin/orders", icon: "🛒", title: "Orders & Applications", desc: "Product inquiries, investment applications and giveaway entries." },
                { href: "/admin/appointments", icon: "📅", title: "Appointments", desc: "Review, approve or reject private session requests." },
                { href: "/admin/inventory", icon: "📦", title: "Inventory", desc: "Add, edit or remove vehicles, energy systems and robotics." },
                { href: "/admin/giveaways", icon: "🎁", title: "Giveaways", desc: "Create and manage car giveaways and prize campaigns." },
                { href: "/admin/investments", icon: "💼", title: "Investment Packages", desc: "Create and manage investment plans." },
                { href: "/admin/payments", icon: "💳", title: "Payment Methods", desc: "Configure bank, crypto, card and other options." },
                { href: "/admin/portfolio", icon: "📊", title: "Portfolio Snapshot", desc: "Edit the illustrative portfolio holdings." },
                { href: "/admin/testimonials", icon: "⭐", title: "Testimonials", desc: "Approve, edit or remove customer reviews." },
                { href: "/admin/settings", icon: "⚙️", title: "Site Settings & Security", desc: "Edit texts, stats, and change your admin password." },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 hover:border-[rgba(232,33,39,0.5)] transition group"
                >
                  <div className="text-2xl mb-3">{card.icon}</div>
                  <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
                  <p className="text-sm text-[#6E6E73] mb-4">{card.desc}</p>
                  <span className="text-sm text-[#E82127] group-hover:underline">Manage →</span>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center text-xs text-[#6E6E73]">
              {isSupabaseConfigured
                ? "✓ Connected to Supabase cloud database."
                : "Running in local mode. Change your password under Site Settings → Security."}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
