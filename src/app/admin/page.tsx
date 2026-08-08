"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { Appointment, InventoryItem, Testimonial } from "@/lib/types";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    try {
      const lock = Number(sessionStorage.getItem("tesla_admin_lock") || "0");
      setLockedUntil(lock);
      const at = Number(sessionStorage.getItem("tesla_admin_attempts") || "0");
      setAttempts(at);
    } catch {}
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
      setUsersCount(store.getUsers().length);
      setOrdersCount(store.getOrders().length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCorrectPassword = () => {
    const envPwd = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (envPwd && envPwd.trim()) return envPwd.trim();
    return store.getAdminPassword();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (lockedUntil && now < lockedUntil) {
      const mins = Math.ceil((lockedUntil - now) / 60000);
      setError(`Too many attempts. Try again in ${mins} minute(s).`);
      return;
    }
    const correct = getCorrectPassword();
    if (password === correct) {
      sessionStorage.setItem("tesla_admin_auth", "true");
      sessionStorage.removeItem("tesla_admin_attempts");
      sessionStorage.removeItem("tesla_admin_lock");
      setAttempts(0);
      setLockedUntil(0);
      setAuthenticated(true);
      loadData();
      setError("");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      sessionStorage.setItem("tesla_admin_attempts", String(next));
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_MS;
        setLockedUntil(until);
        sessionStorage.setItem("tesla_admin_lock", String(until));
        setError("Account temporarily locked after failed attempts.");
      } else {
        setError(`Incorrect password. ${MAX_ATTEMPTS - next} attempt(s) left.`);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("tesla_admin_auth");
    setAuthenticated(false);
    setPassword("");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center px-4 relative">
        <div className="crypto-bg" aria-hidden />
        <div className="crypto-grid" aria-hidden />
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-strong rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#E82127] rounded-xl flex items-center justify-center font-extrabold">T</div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">Restricted Area</h1>
                <p className="text-xs text-[#63636E]">Authorized personnel only</p>
              </div>
            </div>
            <p className="text-sm text-[#63636E] mb-6 mt-4">
              This panel is private. Unauthorized access attempts are logged.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A8A8B3] mb-2 uppercase tracking-wider">Access Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-black/60 border border-[#1E1E26] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127] transition"
                  placeholder="••••••••"
                  disabled={!!(lockedUntil && Date.now() < lockedUntil)}
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-[#E82127] hover:bg-[#FF3B41] text-white py-3 rounded-xl font-semibold transition btn-glow"
              >
                Authenticate
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/" className="text-xs text-[#63636E] hover:text-white transition">← Return to site</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
        <p className="text-[#63636E]">Loading control center…</p>
      </div>
    );
  }

  const pendingApts = appointments.filter((a) => a.status === "pending").length;
  const availableInv = inventory.filter((i) => i.status === "available").length;

  const links = [
    { href: "/admin/inventory", label: "Inventory", desc: "Cars, energy, robots", count: inventory.length },
    { href: "/admin/investments", label: "Investments", desc: "Packages & returns", count: null },
    { href: "/admin/orders", label: "Orders", desc: "Customer requests", count: ordersCount },
    { href: "/admin/appointments", label: "VIP Sessions", desc: "Private bookings", count: appointments.length },
    { href: "/admin/users", label: "Users & KYC", desc: "Accounts & verification", count: usersCount },
    { href: "/admin/testimonials", label: "Testimonials", desc: "Reviews & avatars", count: testimonials.length },
    { href: "/admin/payments", label: "Payments", desc: "Accepted methods", count: null },
    { href: "/admin/portfolio", label: "Portfolio", desc: "Market snapshot", count: null },
    { href: "/admin/giveaways", label: "Giveaways", desc: "Contests & prizes", count: null },
    { href: "/admin/chat", label: "Live Chat", desc: "Customer support", count: null },
    { href: "/admin/settings", label: "Settings", desc: "Password, WhatsApp, content", count: null },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white relative">
      <div className="crypto-bg" aria-hidden />
      <header className="relative z-20 border-b border-[#1E1E26] px-6 py-4 flex items-center justify-between glass-strong sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#E82127] rounded-lg flex items-center justify-center font-extrabold">T</div>
          <div>
            <div className="font-bold">Tesla Trade Control</div>
            <div className="text-[10px] text-[#63636E] uppercase tracking-widest">Admin console</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-[#A8A8B3] hover:text-white">View site</Link>
          <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Command Center</h1>
        <p className="text-[#63636E] mb-8 text-sm">Monitor inventory, investors, and platform activity.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="stat-card">
            <div className="text-3xl font-bold text-[#E82127]">{availableInv}</div>
            <div className="text-xs text-[#63636E] mt-1">Live listings</div>
          </div>
          <div className="stat-card cyan">
            <div className="text-3xl font-bold text-[#00E5FF]">{pendingApts}</div>
            <div className="text-xs text-[#63636E] mt-1">Pending VIP</div>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold">{usersCount}</div>
            <div className="text-xs text-[#63636E] mt-1">Registered users</div>
          </div>
          <div className="stat-card cyan">
            <div className="text-3xl font-bold text-[#00E676]">{ordersCount}</div>
            <div className="text-xs text-[#63636E] mt-1">Orders</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="card-premium p-5 block group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold group-hover:text-[#E82127] transition">{l.label}</div>
                  <div className="text-xs text-[#63636E] mt-1">{l.desc}</div>
                </div>
                {l.count !== null && (
                  <span className="text-sm font-bold text-[#A8A8B3] bg-black/40 px-2 py-1 rounded-lg">{l.count}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
