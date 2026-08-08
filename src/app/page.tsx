"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { store } from "@/lib/store";
import {
  InventoryItem,
  Testimonial,
  SiteSettings,
  InvestmentPackage,
  PaymentMethod,
  PortfolioItem,
  Giveaway,
} from "@/lib/types";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [modalType, setModalType] = useState<"vip" | "product" | "investment" | "giveaway" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentPackage | null>(null);
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [investments, setInvestments] = useState<InvestmentPackage[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [invFilter, setInvFilter] = useState<"All" | "Vehicles" | "Energy" | "Robotics">("All");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSessionId] = useState(() => `sess-${Date.now()}`);
  const [chatName, setChatName] = useState("");
  const [chatEmail, setChatEmail] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; message: string; from: string; createdAt: string }[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    format: "Virtual" as "In-Person" | "Virtual",
    paymentMethod: "",
    notes: "",
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);

    (async () => {
      try {
        let [inv, tes, set, invp, pays, port, gws] = await Promise.all([
          store.getInventory(),
          store.getTestimonials(),
          Promise.resolve(store.getSettings()),
          store.getInvestments(),
          store.getPayments(),
          store.getPortfolio(),
          store.getGiveaways(),
        ]);
        let invList = inv.filter((i: any) => i.status === "available");
        if (invList.length === 0 && typeof store.resetAll === "function") {
          store.resetAll();
          inv = await store.getInventory();
          tes = await store.getTestimonials();
          invp = await store.getInvestments();
          pays = await store.getPayments();
          port = await store.getPortfolio();
          gws = await store.getGiveaways();
          set = store.getSettings();
          invList = inv.filter((i: any) => i.status === "available");
        }
        setInventory(invList);
        setTestimonials(tes.filter((x: any) => x.approved));
        setSettings(set);
        setInvestments(invp.filter((x: any) => x.active));
        setPayments(pays.filter((x: any) => x.active));
        setPortfolio(port);
        setGiveaways(gws.filter((x: any) => x.active));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    })();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resetForm = () => setForm({
    name: "", email: "", phone: "", preferredDate: "", format: "Virtual", paymentMethod: "", notes: "",
  });

  const openVipModal = () => {
    setFormSuccess(false);
    resetForm();
    setModalType("vip");
  };
  const openProductModal = (item: InventoryItem) => {
    setFormSuccess(false);
    resetForm();
    setSelectedProduct(item);
    setModalType("product");
  };
  const openInvestmentModal = (pkg: InvestmentPackage) => {
    setFormSuccess(false);
    resetForm();
    setSelectedInvestment(pkg);
    setModalType("investment");
  };
  const openGiveawayModal = (gw: Giveaway) => {
    setFormSuccess(false);
    resetForm();
    setSelectedGiveaway(gw);
    setModalType("giveaway");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedProduct(null);
    setSelectedInvestment(null);
    setSelectedGiveaway(null);
  };

  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await store.addAppointment({
        name: form.name,
        email: form.email,
        phone: form.phone,
        preferredDate: form.preferredDate,
        format: form.format,
        status: "pending",
        notes: form.notes + (form.paymentMethod ? ` | Payment: ${form.paymentMethod}` : ""),
      });
      setFormSuccess(true);
      resetForm();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setFormSubmitting(true);
    try {
      await store.addOrder({
        type: "product",
        productName: selectedProduct.title,
        productId: selectedProduct.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        paymentMethod: form.paymentMethod || "Not specified",
        amount: `$${selectedProduct.price.toLocaleString()}`,
        notes: form.notes,
        status: "pending",
      });
      setFormSuccess(true);
      resetForm();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestment) return;
    setFormSubmitting(true);
    try {
      await store.addOrder({
        type: "investment",
        productName: selectedInvestment.name,
        productId: selectedInvestment.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        paymentMethod: form.paymentMethod || "Not specified",
        amount: `$${selectedInvestment.minAmount.toLocaleString()}+`,
        notes: form.notes,
        status: "pending",
      });
      setFormSuccess(true);
      resetForm();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleGiveawaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGiveaway) return;
    setFormSubmitting(true);
    try {
      await store.addOrder({
        type: "giveaway",
        productName: selectedGiveaway.title,
        productId: selectedGiveaway.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        paymentMethod: form.paymentMethod || selectedGiveaway.entryFee || "Free",
        amount: selectedGiveaway.entryFee || "Free",
        notes: form.notes,
        status: "pending",
      });
      setFormSuccess(true);
      resetForm();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };


  const loadChat = () => {
    const all = store.getChatMessages().filter((m) => m.sessionId === chatSessionId);
    setChatMessages(all.map((m) => ({ id: m.id, message: m.message, from: m.from, createdAt: m.createdAt })));
  };

  const startChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatName.trim() || !chatEmail.trim()) return;
    setChatStarted(true);
    store.addChatMessage({
      sessionId: chatSessionId,
      name: chatName.trim(),
      email: chatEmail.trim(),
      message: "Chat started",
      from: "user",
    });
    store.addChatMessage({
      sessionId: chatSessionId,
      name: "Support",
      email: "support",
      message: "Hi! Thanks for contacting Tesla Trade support. How can we help you today?",
      from: "support",
    });
    loadChat();
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    store.addChatMessage({
      sessionId: chatSessionId,
      name: chatName.trim() || "Guest",
      email: chatEmail.trim() || "guest",
      message: chatInput.trim(),
      from: "user",
    });
    setChatInput("");
    loadChat();
  };

  const s = settings || {
    heroTitle: "Trade Tesla Tomorrow",
    heroSubtitle:
      "Buy and sell Tesla vehicles, robots, and energy products on the most secure fintech marketplace. Zero friction. Maximum opportunity.",
    tradingVolume: "2.4T+",
    activeTraders: "50K+",
    uptime: "99.9%",
    appointmentFee: "$50,000",
    inventoryTitle: "Live Inventory",
    inventorySubtitle: "Verified Tesla vehicles, energy systems and robotics available now",
    marketTitle: "Live Market Data",
    marketSubtitle: "Real-time prices powered by institutional-grade feeds",
    visionTitle: "The Future Is Now",
    visionSubtitle: "Beyond Earth. Beyond Limits.",
    vipTitle: "Book a Private Session with Elon Musk",
    vipSubtitle:
      "Discuss investment opportunities, the Tesla ecosystem, and the future of energy, robotics, and space in a private 30-minute session.",
    testimonialsTitle: "Trusted by Traders Worldwide",
    testimonialsSubtitle: "Join thousands of satisfied users from the UK, US, and beyond",
    contactTitle: "Powering Tomorrow’s Wealth, Energy & Innovation",
    contactSubtitle: "Invest smarter. Drive the future. Build sustainable energy.",
    investmentsTitle: "Investment Packages",
    investmentsSubtitle: "Choose the allocation that matches your goals and risk appetite",
    paymentsTitle: "Accepted Payment Methods",
    paymentsSubtitle: "Secure and flexible ways to fund your investments and purchases",
    portfolioTitle: "Platform Portfolio Snapshot",
    portfolioSubtitle: "Illustrative allocation across the Tesla ecosystem",
    giveawayTitle: "Tesla Giveaways",
    giveawaySubtitle: "Enter for a chance to win vehicles and exclusive experiences",
    whatsappNumber: "+2348100000000",
    supportEmail: "support@teslatrade.com",
  };

  return (
    <>
      <div className="crypto-bg" aria-hidden />
      <div className="crypto-grid" aria-hidden />
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-6 md:px-10 transition-all duration-300 ${
          scrolled ? "glass-strong border-b border-[#1E1E26]" : "bg-[#050507]/80 backdrop-blur-xl"
        }`}
      >
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <div className="w-9 h-9 bg-[#E82127] rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
            T
          </div>
          <span>Tesla Trade</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <a href="#buy" className="text-sm font-medium tracking-widest uppercase text-[#B0B0B5] hover:text-white transition">Buy</a>
          <a href="#inventory" className="text-sm font-medium tracking-widest uppercase text-[#B0B0B5] hover:text-white transition">Inventory</a>
          <a href="#investments" className="text-sm font-medium tracking-widest uppercase text-[#B0B0B5] hover:text-white transition">Invest</a>
          <a href="#giveaways" className="text-sm font-medium tracking-widest uppercase text-[#B0B0B5] hover:text-white transition">Giveaways</a>
          <a href="#market" className="text-sm font-medium tracking-widest uppercase text-[#B0B0B5] hover:text-white transition">Market</a>
          <a href="#vip" className="text-sm font-medium tracking-widest uppercase text-[#B0B0B5] hover:text-white transition">VIP</a>
          <button
            onClick={openVipModal}
            className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition shadow-[0_0_20px_rgba(232,33,39,0.3)]"
          >
            Meet Elon
          </button>
          <Link href="/login" className="text-sm font-medium text-[#B0B0B5] hover:text-white transition">Login</Link>
          <Link href="/signup" className="text-sm font-medium border border-[#26262A] hover:border-[#E82127] px-4 py-2 rounded-full transition">Sign Up</Link>
        </nav>

        <button onClick={openVipModal} className="lg:hidden bg-[#E82127] text-white px-4 py-2 rounded-full text-sm font-semibold">
          Meet Elon
        </button>
      </header>

      {/* HERO */}
      <section id="buy" className="relative min-h-screen pt-36 pb-20 px-6 md:px-10 max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="absolute top-[15%] left-[-10%] w-[50%] h-[60%] bg-[radial-gradient(ellipse,rgba(232,33,39,0.09)_0%,transparent_65%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[rgba(232,33,39,0.12)] border border-[rgba(232,33,39,0.4)] text-[#FF6B6F] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Powered by Tesla Ecosystem
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.75rem] font-extrabold leading-[1.07] tracking-tight mb-5">
            {s.heroTitle.includes("Tomorrow") ? (
              <>Trade Tesla <span className="text-[#E82127]">Tomorrow</span></>
            ) : (
              s.heroTitle
            )}
          </h1>

          <p className="text-[#B0B0B5] text-lg max-w-md mb-8 leading-relaxed">{s.heroSubtitle}</p>

          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { value: s.tradingVolume, label: "Trading Volume" },
              { value: s.activeTraders, label: "Active Traders" },
              { value: s.uptime, label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#121214] border border-[#26262A] rounded-xl px-5 py-4 min-w-[120px] hover:border-[rgba(232,33,39,0.45)] hover:-translate-y-0.5 transition">
                <div className="text-2xl font-bold text-[#E82127]">{stat.value}</div>
                <div className="text-[11px] text-[#6E6E73] uppercase tracking-wide mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-7 py-3.5 rounded-xl font-semibold transition shadow-[0_8px_25px_rgba(232,33,39,0.35)] hover:-translate-y-0.5"
            >
              Browse Inventory →
            </button>
            <button onClick={openVipModal} className="border border-[#26262A] hover:border-[#E82127] hover:text-[#E82127] text-white px-7 py-3.5 rounded-xl font-semibold transition">
              Book Private Session
            </button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-[#6E6E73]">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E82127]" /> Bank-grade Security</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E82127]" /> Real-time Pricing</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E82127]" /> Instant Settlement</span>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="relative w-full max-w-[540px] rounded-2xl overflow-hidden border border-[#26262A] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_80px_rgba(232,33,39,0.08)]">
            <Image
              src="/cybertruck.jpg"
              alt="Tesla Cybertruck"
              width={1059}
              height={706}
              className="w-full h-auto object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 540px"
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-[#26262A] rounded-xl px-6 py-3.5 flex gap-8 min-w-[280px]">
              <div>
                <div className="text-[11px] text-[#6E6E73] uppercase tracking-wide">Current Price</div>
                <div className="text-xl font-bold">$45,230</div>
              </div>
              <div>
                <div className="text-[11px] text-[#6E6E73] uppercase tracking-wide">24h Change</div>
                <div className="text-xl font-bold text-[#30D158]">+2.4%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE INVENTORY */}
      <section id="inventory" className="max-w-[1440px] mx-auto px-6 md:px-10 py-16">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">{s.inventoryTitle}</h2>
            <p className="text-[#6E6E73]">{s.inventorySubtitle}</p>
          </div>
          <Link href="/inventory" className="text-sm font-semibold text-[#E82127] hover:underline whitespace-nowrap">
            View Full Catalog →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {(["All", "Vehicles", "Energy", "Robotics"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setInvFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                invFilter === cat
                  ? "bg-[#E82127] text-white"
                  : "bg-[#121214] border border-[#26262A] text-[#B0B0B5] hover:border-[#E82127]"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 opacity-70">
                  ({inventory.filter((i) => i.category === cat).length})
                </span>
              )}
              {cat === "All" && <span className="ml-1.5 opacity-70">({inventory.length})</span>}
            </button>
          ))}
        </div>

        {loadingData ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#121214] border border-[#26262A] rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          (() => {
            const filtered = invFilter === "All" ? inventory : inventory.filter((i) => i.category === invFilter);
            if (filtered.length === 0) return <p className="text-[#6E6E73]">No listings in this category.</p>;
            return (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#121214] border border-[#26262A] rounded-2xl overflow-hidden hover:border-[rgba(232,33,39,0.4)] hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Product visual */}
                    <div className={`relative h-40 flex items-center justify-center ${
                      item.category === "Vehicles" ? "bg-gradient-to-br from-[#0a1628] via-[#12253d] to-[#1a1a2e]" :
                      item.category === "Energy" ? "bg-gradient-to-br from-[#1a1508] via-[#2a2208] to-[#1a1a14]" :
                      "bg-gradient-to-br from-[#1a0a28] via-[#2a153d] to-[#1a1a2e]"
                    }`}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl opacity-90 drop-shadow-lg">
                          {item.category === "Vehicles" ? "🚗" : item.category === "Energy" ? "⚡" : "🤖"}
                        </span>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md border backdrop-blur-sm ${
                          item.category === "Vehicles" ? "bg-blue-500/20 text-blue-300 border-blue-400/40" :
                          item.category === "Energy" ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40" :
                          "bg-purple-500/20 text-purple-300 border-purple-400/40"
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-xs text-green-400 font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">Available</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-[#E82127] transition leading-snug">{item.title}</h3>
                      <p className="text-sm text-[#6E6E73] mb-4 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold">${item.price.toLocaleString()}</div>
                        <button onClick={() => openProductModal(item)} className="text-sm text-[#E82127] font-medium hover:underline">
                          Inquire →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </section>

      {/* GIVEAWAYS */}
      <section id="giveaways" className="max-w-[1440px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{s.giveawayTitle || "Tesla Giveaways"}</h2>
          <p className="text-[#6E6E73]">{s.giveawaySubtitle || "Enter for a chance to win vehicles and exclusive experiences"}</p>
        </div>
        {loadingData ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#121214] border border-[#26262A] rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : giveaways.length === 0 ? (
          <p className="text-center text-[#6E6E73]">No active giveaways at the moment.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {giveaways.map((gw) => (
              <div key={gw.id} className="bg-[#121214] border border-[#26262A] rounded-2xl p-7 hover:border-[rgba(232,33,39,0.4)] transition relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#E82127] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">GIVEAWAY</div>
                <h3 className="text-xl font-bold mb-1 pr-20">{gw.title}</h3>
                <div className="text-[#E82127] font-semibold mb-3">{gw.prize}</div>
                <p className="text-sm text-[#B0B0B5] mb-4 leading-relaxed">{gw.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-[#6E6E73] mb-5">
                  <span>Ends: {gw.endDate || "TBA"}</span>
                  <span>{gw.entryFee}</span>
                  <span>{gw.currentEntries.toLocaleString()} / {gw.maxEntries.toLocaleString()} entries</span>
                </div>
                <div className="w-full bg-[#26262A] rounded-full h-2 mb-5">
                  <div
                    className="bg-[#E82127] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (gw.currentEntries / Math.max(1, gw.maxEntries)) * 100)}%` }}
                  />
                </div>
                <button onClick={() => openGiveawayModal(gw)} className="w-full bg-[#E82127] hover:bg-[#FF3B41] text-white py-3 rounded-xl font-semibold transition">
                  Enter Giveaway
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 pb-16 grid md:grid-cols-3 gap-5">
        {[
          { icon: "🚗", title: "Tesla Vehicles", desc: "Model S, 3, X, Y & Cybertruck — full range of verified listings with live market pricing.", href: "/inventory" },
          { icon: "⚡", title: "Energy Systems", desc: "Powerwall, Solar Roof, Solar Panels & Megapack — complete your energy ecosystem.", href: "/inventory" },
          { icon: "🤖", title: "Robotics", desc: "Optimus Gen 2 & industrial automation — early access to the future of humanoid robotics.", href: "/inventory" },
        ].map((cat) => (
          <Link key={cat.title} href={cat.href} className="group bg-[#121214] border border-[#26262A] rounded-2xl p-7 hover:border-[rgba(232,33,39,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden block">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E82127] to-transparent opacity-0 group-hover:opacity-100 transition" />
            <div className="w-11 h-11 bg-[rgba(232,33,39,0.12)] rounded-xl flex items-center justify-center text-xl mb-4">{cat.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{cat.title}</h3>
            <p className="text-[#6E6E73] text-sm leading-relaxed mb-3">{cat.desc}</p>
            <span className="text-sm text-[#E82127] font-medium group-hover:underline">Browse listings →</span>
          </Link>
        ))}
      </section>

      {/* INVESTMENT PACKAGES */}
      <section id="investments" className="max-w-[1440px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{s.investmentsTitle}</h2>
          <p className="text-[#6E6E73]">{s.investmentsSubtitle}</p>
        </div>

        {loadingData ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#121214] border border-[#26262A] rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {investments.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-[#121214] border rounded-2xl p-7 relative transition-all duration-300 hover:-translate-y-1 ${
                  pkg.highlighted
                    ? "border-[#E82127] shadow-[0_0_40px_rgba(232,33,39,0.15)]"
                    : "border-[#26262A] hover:border-[rgba(232,33,39,0.4)]"
                }`}
              >
                {pkg.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E82127] text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                <div className="text-3xl font-extrabold text-[#E82127] mb-1">
                  ${pkg.minAmount.toLocaleString()}
                  <span className="text-sm font-normal text-[#6E6E73]"> min</span>
                </div>
                <div className="text-sm text-[#B0B0B5] mb-4">
                  Expected return: <span className="text-white font-medium">{pkg.expectedReturn}</span> · {pkg.duration}
                </div>
                <p className="text-sm text-[#6E6E73] mb-5">{pkg.description}</p>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((f, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-[#E82127] mt-0.5">✓</span>
                      <span className="text-[#B0B0B5]">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openInvestmentModal(pkg)}
                  className={`w-full py-3 rounded-xl font-semibold transition ${
                    pkg.highlighted
                      ? "bg-[#E82127] hover:bg-[#FF3B41] text-white"
                      : "border border-[#26262A] hover:border-[#E82127] hover:text-[#E82127]"
                  }`}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PORTFOLIO SNAPSHOT */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-1">{s.portfolioTitle}</h2>
          <p className="text-[#6E6E73]">{s.portfolioSubtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {portfolio.map((item) => (
            <div key={item.id} className="bg-[#121214] border border-[#26262A] rounded-xl p-5 hover:border-[#3A3A40] transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{item.symbol}</span>
                <span className="text-xs text-[#6E6E73]">{item.allocation}</span>
              </div>
              <div className="text-sm text-[#6E6E73] mb-1">{item.name}</div>
              <div className="text-xl font-bold">{item.value}</div>
              <div className={`text-sm font-medium ${item.changeUp ? "text-[#30D158]" : "text-[#FF453A]"}`}>
                {item.changeUp ? "▲" : "▼"} {item.change}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PAYMENT METHODS */}
      <section id="payments" className="max-w-[1440px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{s.paymentsTitle}</h2>
          <p className="text-[#6E6E73]">{s.paymentsSubtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {payments.map((pay) => (
            <div key={pay.id} className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 hover:border-[rgba(232,33,39,0.35)] transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(232,33,39,0.12)] flex items-center justify-center text-lg">
                  {pay.type === "Bank" ? "🏦" : pay.type === "Crypto" ? "₿" : pay.type === "Card" ? "💳" : "•"}
                </div>
                <div>
                  <div className="font-semibold">{pay.name}</div>
                  <div className="text-xs text-[#6E6E73]">{pay.details}</div>
                </div>
              </div>
              <p className="text-sm text-[#B0B0B5] leading-relaxed">{pay.instructions}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE MARKET */}
      <section id="market" className="max-w-[1440px] mx-auto px-6 md:px-10 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-1">{s.marketTitle}</h2>
          <p className="text-[#6E6E73]">{s.marketSubtitle}</p>
        </div>

        <div className="bg-[#121214] border border-[#26262A] rounded-xl px-5 py-3.5 mb-8 flex items-center gap-4 overflow-hidden">
          <div className="flex items-center gap-2 text-[#30D158] text-xs font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
            LIVE
          </div>
          <div className="overflow-hidden flex-1">
            <div className="ticker-track flex gap-8 animate-[ticker_30s_linear_infinite]">
              {[
                { s: "TSLA", p: "$319.53", c: "▼ 0.63%", up: false },
                { s: "MSFT", p: "$499.86", c: "▲ 2.54%", up: true },
                { s: "AAPL", p: "$312.41", c: "▲ 1.85%", up: true },
                { s: "GOOGL", p: "$357.75", c: "▲ 1.29%", up: true },
                { s: "NVDA", p: "$218.99", c: "▼ 0.10%", up: false },
                { s: "META", p: "$589.90", c: "▲ 0.19%", up: true },
                { s: "AMZN", p: "$272.26", c: "▼ 0.14%", up: false },
                { s: "JPM", p: "$356.30", c: "▼ 0.82%", up: false },
              ].map((t, i) => (
                <div key={i} className="text-sm flex items-center gap-2 text-[#B0B0B5] whitespace-nowrap">
                  <strong className="text-white font-semibold">{t.s}</strong>
                  {t.p}
                  <span className={t.up ? "text-[#30D158]" : "text-[#FF453A]"}>{t.c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { symbol: "AAPL", name: "Apple Inc", price: "$312.41", change: "+1.85%", up: true, bg: "#000", letter: "" },
            { symbol: "MSFT", name: "Microsoft Corp", price: "$499.86", change: "+2.54%", up: true, bg: "#00A4EF", letter: "M" },
            { symbol: "TSLA", name: "Tesla Inc", price: "$319.53", change: "−0.63%", up: false, bg: "#E82127", letter: "T" },
          ].map((stock) => (
            <div key={stock.symbol} className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 hover:border-[#3A3A40] hover:-translate-y-0.5 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: stock.bg }}>
                  {stock.letter}
                </div>
                <div>
                  <div className="font-semibold">{stock.symbol}</div>
                  <div className="text-sm text-[#6E6E73]">{stock.name}</div>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stock.price}</div>
              <div className={`text-sm font-medium ${stock.up ? "text-[#30D158]" : "text-[#FF453A]"}`}>
                {stock.up ? "▲" : "▼"} {stock.change}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VISION */}
      <section className="text-center py-24 px-6 bg-gradient-to-b from-transparent via-[rgba(232,33,39,0.03)] to-transparent">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{s.visionTitle}</h2>
        <div className="text-[#E82127] text-xl font-semibold mb-5">{s.visionSubtitle}</div>
        <p className="max-w-xl mx-auto text-[#B0B0B5] mb-10 text-lg">
          From Tesla vehicles and energy to SpaceX Starship, Neuralink, and xAI — one interconnected vision for humanity’s multiplanetary future.
        </p>
        <div className="flex justify-center gap-10 md:gap-16 flex-wrap mb-10">
          {[
            { num: "6+", label: "Starship Launches" },
            { num: "2026", label: "Mars Target" },
            { num: "$350B+", label: "Ecosystem Value" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-4xl font-extrabold text-[#E82127]">{item.num}</div>
              <div className="text-sm text-[#6E6E73] mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* APPOINTMENT CTA */}
      <section id="vip" className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-[#121214] border border-[#26262A] rounded-3xl p-10 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E82127] to-transparent" />
          <div className="text-[#E82127] text-xs font-bold tracking-[0.15em] uppercase mb-3">Limited Appointments Available</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">{s.vipTitle}</h2>
          <p className="text-[#B0B0B5] max-w-md mx-auto mb-8">{s.vipSubtitle}</p>
          <div className="flex justify-center gap-8 md:gap-12 flex-wrap mb-8">
            <div>
              <div className="text-xl font-bold">{s.appointmentFee}</div>
              <div className="text-sm text-[#6E6E73]">Appointment Fee</div>
            </div>
            <div>
              <div className="text-xl font-bold">30 Minutes</div>
              <div className="text-sm text-[#6E6E73]">Session Length</div>
            </div>
            <div>
              <div className="text-xl font-bold">In-Person / Virtual</div>
              <div className="text-sm text-[#6E6E73]">Format</div>
            </div>
          </div>
          <button
            onClick={openVipModal}
            className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-8 py-3.5 rounded-xl font-semibold transition shadow-[0_8px_25px_rgba(232,33,39,0.35)]"
          >
            Apply for an Appointment
          </button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{s.testimonialsTitle}</h2>
          <p className="text-[#6E6E73]">{s.testimonialsSubtitle}</p>
        </div>

        {loadingData ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#121214] border border-[#26262A] rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-[#121214] border border-[#26262A] rounded-2xl p-6 hover:border-[rgba(232,33,39,0.35)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=E82127&color=fff&size=128`}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#26262A] shadow-md"
                  />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-[#6E6E73]">{t.role}</div>
                  </div>
                </div>
                <div className="text-[#FFD60A] mb-3 tracking-wider text-sm">{"★".repeat(t.rating)}</div>
                <p className="text-[#B0B0B5] text-sm leading-relaxed">"{t.quote}"</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FINAL CTA */}
      <section id="contact" className="text-center py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
          {s.contactTitle}
        </h2>
        <p className="text-[#B0B0B5] text-lg mb-8">{s.contactSubtitle}</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-8 py-3.5 rounded-xl font-semibold transition"
          >
            Explore Inventory
          </button>
          <button onClick={openVipModal} className="border border-[#26262A] hover:border-[#E82127] hover:text-[#E82127] px-8 py-3.5 rounded-xl font-semibold transition">
            Book Session
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#26262A] py-10 px-6 text-center text-[#6E6E73] text-sm">
        <p>© 2026 Tesla Trade · Powered by Tesla Ecosystem · All rights reserved.</p>
        <p className="mt-2 text-xs opacity-70">This is a high-fidelity design recreation for demonstration purposes. Not affiliated with Tesla, Inc. or Elon Musk.</p>
        <p className="mt-4">
          <Link href="/signup" className="text-[#6E6E73] hover:text-[#E82127] transition text-xs mr-4">Sign Up</Link>
          <Link href="/login" className="text-[#6E6E73] hover:text-[#E82127] transition text-xs mr-4">Login</Link>
          {/* Admin access is private — not linked publicly */}
        </p>
      </footer>

      {/* WhatsApp + Live Chat */}
      <div className="fixed bottom-7 right-7 z-40 flex flex-col items-end gap-3">
        {/* Live chat panel */}
        {chatOpen && (
          <div className="w-[340px] max-w-[calc(100vw-2rem)] bg-[#121214] border border-[#26262A] rounded-2xl shadow-2xl overflow-hidden mb-1">
            <div className="bg-[#E82127] px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Live Support</div>
                <div className="text-xs text-white/80">Usually replies in minutes</div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/90 hover:text-white text-xl leading-none">×</button>
            </div>
            {!chatStarted ? (
              <form onSubmit={startChat} className="p-4 space-y-3">
                <p className="text-sm text-[#B0B0B5]">Start a conversation with our team.</p>
                <input required placeholder="Your name" value={chatName} onChange={(e) => setChatName(e.target.value)} className="w-full bg-black border border-[#26262A] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E82127]" />
                <input required type="email" placeholder="Email" value={chatEmail} onChange={(e) => setChatEmail(e.target.value)} className="w-full bg-black border border-[#26262A] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E82127]" />
                <button type="submit" className="w-full bg-[#E82127] hover:bg-[#FF3B41] text-white py-2.5 rounded-xl text-sm font-semibold">Start Chat</button>
              </form>
            ) : (
              <>
                <div className="h-56 overflow-y-auto p-4 space-y-2 bg-black/40">
                  {chatMessages.filter((m) => m.message !== "Chat started").map((m) => (
                    <div key={m.id} className={`max-w-[85%] text-sm px-3 py-2 rounded-xl ${m.from === "user" ? "ml-auto bg-[#E82127] text-white" : "bg-[#26262A] text-[#B0B0B5]"}`}>
                      {m.message}
                    </div>
                  ))}
                </div>
                <form onSubmit={sendChatMessage} className="p-3 border-t border-[#26262A] flex gap-2">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-black border border-[#26262A] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E82127]" />
                  <button type="submit" className="bg-[#E82127] text-white px-3 rounded-xl text-sm font-semibold">Send</button>
                </form>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/${(s.whatsappNumber || "+2348100000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I need help with Tesla Trade.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-[#25D366] text-white text-2xl flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.4)] hover:scale-110 transition"
            title="WhatsApp Support"
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-14 h-14 rounded-full bg-[#E82127] text-white text-2xl flex items-center justify-center shadow-[0_6px_24px_rgba(232,33,39,0.4)] hover:scale-110 hover:bg-[#FF3B41] transition"
            title="Live Chat"
          >
            💬
          </button>
        </div>
      </div>

      {/* MULTI-PURPOSE MODALS */}
      {modalType && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-8 max-w-md w-full relative my-8">
            <button onClick={closeModal} className="absolute top-4 right-5 text-[#6E6E73] hover:text-white text-2xl leading-none">
              ×
            </button>

            {formSuccess ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold mb-2">Application Received</h3>
                <p className="text-[#B0B0B5] text-sm mb-6">
                  Thank you. Our team will contact you within 24 hours with next steps and payment instructions.
                </p>
                <button onClick={closeModal} className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-6 py-3 rounded-xl font-semibold">
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* VIP */}
                {modalType === "vip" && (
                  <>
                    <h3 className="text-xl font-bold mb-1">Private Session Application</h3>
                    <p className="text-[#6E6E73] text-sm mb-6">Fee: {s.appointmentFee} · 30 minutes · Hybrid format</p>
                    <form onSubmit={handleVipSubmit} className="space-y-4">
                      <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                        <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as "In-Person" | "Virtual" })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]">
                          <option value="Virtual">Virtual</option>
                          <option value="In-Person">In-Person</option>
                        </select>
                      </div>
                      <select required value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]">
                        <option value="">Select payment method</option>
                        {payments.map((p) => (
                          <option key={p.id} value={p.name}>{p.name} — {p.details}</option>
                        ))}
                      </select>
                      <textarea placeholder="Anything we should know? (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127] min-h-[80px]" />
                      <button type="submit" disabled={formSubmitting} className="w-full bg-[#E82127] hover:bg-[#FF3B41] disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition">
                        {formSubmitting ? "Submitting..." : "Submit Application"}
                      </button>
                    </form>
                  </>
                )}

                {/* PRODUCT ORDER */}
                {modalType === "product" && selectedProduct && (
                  <>
                    <h3 className="text-xl font-bold mb-1">Product Inquiry / Order</h3>
                    <div className="bg-black/50 border border-[#26262A] rounded-xl p-4 mb-5">
                      <div className="text-xs text-[#6E6E73] mb-1">{selectedProduct.category}</div>
                      <div className="font-semibold">{selectedProduct.title}</div>
                      <div className="text-[#E82127] font-bold text-lg mt-1">${selectedProduct.price.toLocaleString()}</div>
                    </div>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <select required value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]">
                        <option value="">Preferred payment method</option>
                        {payments.map((p) => (
                          <option key={p.id} value={p.name}>{p.name} — {p.details}</option>
                        ))}
                      </select>
                      <textarea placeholder="Questions or special requests (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127] min-h-[80px]" />
                      <button type="submit" disabled={formSubmitting} className="w-full bg-[#E82127] hover:bg-[#FF3B41] disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition">
                        {formSubmitting ? "Submitting..." : "Submit Order Inquiry"}
                      </button>
                    </form>
                  </>
                )}

                {/* INVESTMENT */}
                {modalType === "investment" && selectedInvestment && (
                  <>
                    <h3 className="text-xl font-bold mb-1">Investment Application</h3>
                    <div className="bg-black/50 border border-[#26262A] rounded-xl p-4 mb-5">
                      <div className="font-semibold">{selectedInvestment.name}</div>
                      <div className="text-[#E82127] font-bold text-lg mt-1">${selectedInvestment.minAmount.toLocaleString()} min</div>
                      <div className="text-sm text-[#6E6E73] mt-1">{selectedInvestment.expectedReturn} · {selectedInvestment.duration}</div>
                    </div>
                    <form onSubmit={handleInvestmentSubmit} className="space-y-4">
                      <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <select required value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]">
                        <option value="">Preferred funding method</option>
                        {payments.map((p) => (
                          <option key={p.id} value={p.name}>{p.name} — {p.details}</option>
                        ))}
                      </select>
                      <textarea placeholder="Investment goals or questions (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127] min-h-[80px]" />
                      <button type="submit" disabled={formSubmitting} className="w-full bg-[#E82127] hover:bg-[#FF3B41] disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition">
                        {formSubmitting ? "Submitting..." : "Submit Investment Application"}
                      </button>
                    </form>
                  </>
                )}

                {/* GIVEAWAY */}
                {modalType === "giveaway" && selectedGiveaway && (
                  <>
                    <h3 className="text-xl font-bold mb-1">Enter Giveaway</h3>
                    <div className="bg-black/50 border border-[#26262A] rounded-xl p-4 mb-5">
                      <div className="font-semibold">{selectedGiveaway.title}</div>
                      <div className="text-[#E82127] font-bold mt-1">{selectedGiveaway.prize}</div>
                      <div className="text-sm text-[#6E6E73] mt-1">Entry: {selectedGiveaway.entryFee} · Ends: {selectedGiveaway.endDate || "TBA"}</div>
                    </div>
                    <form onSubmit={handleGiveawaySubmit} className="space-y-4">
                      <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]" />
                      {selectedGiveaway.entryFee && selectedGiveaway.entryFee.toLowerCase() !== "free" && (
                        <select required value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127]">
                          <option value="">Payment method for entry fee</option>
                          {payments.map((p) => (
                            <option key={p.id} value={p.name}>{p.name} — {p.details}</option>
                          ))}
                        </select>
                      )}
                      <textarea placeholder="Anything else? (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E82127] min-h-[80px]" />
                      <button type="submit" disabled={formSubmitting} className="w-full bg-[#E82127] hover:bg-[#FF3B41] disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition">
                        {formSubmitting ? "Submitting..." : "Enter Giveaway"}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
