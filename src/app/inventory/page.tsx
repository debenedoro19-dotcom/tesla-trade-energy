"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { InventoryItem } from "@/lib/types";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | "Vehicles" | "Energy" | "Robotics">("All");
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await store.getInventory();
      setItems(data.filter((i) => i.status === "available" || i.status === "pending"));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...items];
    if (category !== "All") list = list.filter((i) => i.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return list;
  }, [items, category, search, sort]);

  const counts = {
    All: items.length,
    Vehicles: items.filter((i) => i.category === "Vehicles").length,
    Energy: items.filter((i) => i.category === "Energy").length,
    Robotics: items.filter((i) => i.category === "Robotics").length,
  };

  const catIcon = (c: string) =>
    c === "Vehicles" ? "🚗" : c === "Energy" ? "⚡" : c === "Robotics" ? "🤖" : "📦";

  const catColor = (c: string) =>
    c === "Vehicles"
      ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
      : c === "Energy"
      ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
      : "bg-purple-500/15 text-purple-400 border-purple-500/30";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-[#26262A]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold text-lg">
            <div className="w-8 h-8 bg-[#E82127] rounded-lg flex items-center justify-center text-white font-extrabold">T</div>
            Tesla Trade
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-[#B0B0B5] hover:text-white">Home</Link>
            <Link href="/inventory" className="text-white font-medium">Inventory</Link>
            <Link href="/#investments" className="text-[#B0B0B5] hover:text-white">Invest</Link>
            <Link href="/#vip" className="text-[#B0B0B5] hover:text-white">VIP</Link>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-4 py-2 rounded-full text-sm font-semibold"
            >
              Meet Elon
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 md:px-10 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Full Inventory</h1>
          <p className="text-[#6E6E73] max-w-2xl">
            Browse verified Tesla vehicles, energy systems and robotics. Filter by category, search by name, and sort by price.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            {(["All", "Vehicles", "Energy", "Robotics"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition ${
                  category === cat
                    ? "bg-[#E82127] text-white shadow-[0_0_20px_rgba(232,33,39,0.3)]"
                    : "bg-[#121214] border border-[#26262A] text-[#B0B0B5] hover:border-[#E82127]"
                }`}
              >
                {cat !== "All" && <span className="mr-1.5">{catIcon(cat)}</span>}
                {cat}
                <span className="ml-1.5 opacity-70">({counts[cat]})</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="search"
              placeholder="Search models, solar, Optimus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121214] border border-[#26262A] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E82127] min-w-[220px]"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-[#121214] border border-[#26262A] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E82127]"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-[#6E6E73] mb-5">
          Showing <span className="text-white font-medium">{filtered.length}</span> listing{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#121214] border border-[#26262A] rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#121214] border border-[#26262A] rounded-2xl">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[#B0B0B5]">No products match your filters.</p>
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="mt-4 text-[#E82127] text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-[#121214] border border-[#26262A] rounded-2xl overflow-hidden hover:border-[rgba(232,33,39,0.45)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Product visual */}
                <div className={`relative h-36 flex items-center justify-center ${
                  item.category === "Vehicles" ? "bg-gradient-to-br from-[#0a1628] via-[#12253d] to-[#1a1a2e]" :
                  item.category === "Energy" ? "bg-gradient-to-br from-[#1a1508] via-[#2a2208] to-[#1a1a14]" :
                  "bg-gradient-to-br from-[#1a0a28] via-[#2a153d] to-[#1a1a2e]"
                }`}>
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl opacity-90">{catIcon(item.category)}</span>
                  )}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md border backdrop-blur-sm ${catColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-xs font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md ${item.status === "available" ? "text-green-400" : "text-yellow-400"}`}>
                      {item.status === "available" ? "Available" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-base mb-2 group-hover:text-[#E82127] transition leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6E6E73] mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold tracking-tight">
                      ${item.price.toLocaleString()}
                    </div>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="text-sm font-medium text-[#E82127] hover:underline"
                    >
                      Inquire →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category summary cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-5">
          {[
            { cat: "Vehicles" as const, icon: "🚗", title: "Tesla Vehicles", desc: "Cybertruck, Model S, 3, X, Y — every configuration with live pricing." },
            { cat: "Energy" as const, icon: "⚡", title: "Energy & Solar", desc: "Powerwall, Solar Roof, Solar Panels, Megapack and home charging." },
            { cat: "Robotics" as const, icon: "🤖", title: "Robotics", desc: "Optimus Gen 2 allocations and industrial automation packages." },
          ].map((c) => (
            <button
              key={c.cat}
              onClick={() => { setCategory(c.cat); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-left bg-[#121214] border border-[#26262A] rounded-2xl p-6 hover:border-[rgba(232,33,39,0.4)] transition"
            >
              <div className="text-2xl mb-3">{c.icon}</div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-sm text-[#6E6E73] mb-3">{c.desc}</p>
              <span className="text-sm text-[#E82127]">{counts[c.cat]} listings →</span>
            </button>
          ))}
        </div>
      </main>

      <footer className="border-t border-[#26262A] py-8 text-center text-sm text-[#6E6E73]">
        <Link href="/" className="hover:text-white">← Back to Home</Link>
      </footer>

      {/* Simple inquire modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-8 max-w-md w-full relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-5 text-[#6E6E73] hover:text-white text-2xl">×</button>
            <h3 className="text-xl font-bold mb-2">Inquire About Inventory</h3>
            <p className="text-[#6E6E73] text-sm mb-6">
              For the fastest response, apply for a private session or contact our team through the main site appointment form.
            </p>
            <Link
              href="/#vip"
              onClick={() => setModalOpen(false)}
              className="block text-center bg-[#E82127] hover:bg-[#FF3B41] text-white py-3 rounded-xl font-semibold"
            >
              Go to Appointment Form
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
