"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { SiteSettings } from "@/lib/types";

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("tesla_admin_auth") !== "true") {
      window.location.href = "/admin";
      return;
    }
    setSettings(store.getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    store.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (newPassword.length < 6) {
      setPwdError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match");
      return;
    }
    store.setAdminPassword(newPassword);
    setPwdSaved(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwdSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm("Reset ALL data to defaults? This will also reset the admin password to tesla2026.")) return;
    store.resetAll();
    setSettings(store.getSettings());
    alert("All data has been reset to defaults. Password is now: tesla2026");
  };

  if (!settings) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  const field = (key: keyof SiteSettings, label: string, multiline = false) => (
    <div key={key as string}>
      <label className="block text-sm text-[#B0B0B5] mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={(settings[key] as string) || ""}
          onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
          className="w-full bg-[#121214] border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127] min-h-[80px]"
        />
      ) : (
        <input
          value={(settings[key] as string) || ""}
          onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
          className="w-full bg-[#121214] border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
          <h1 className="font-bold text-lg">Site Settings & Security</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-12">
        {/* SECURITY */}
        <section className="bg-[#121214] border border-[#26262A] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2 text-[#E82127]">🔒 Change Admin Password</h2>
          <p className="text-sm text-[#6E6E73] mb-4">
            Current password is stored securely in your browser. After changing, use the new password next time you log in.
          </p>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
            />
            {pwdError && <p className="text-red-400 text-sm">{pwdError}</p>}
            {pwdSaved && <p className="text-green-400 text-sm">Password updated successfully!</p>}
            <button type="submit" className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-6 py-2.5 rounded-xl font-semibold">
              Update Password
            </button>
          </form>
        </section>

        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Hero Section</h2>
            <div className="space-y-4">
              {field("heroTitle", "Hero Title")}
              {field("heroSubtitle", "Hero Subtitle", true)}
              <div className="grid grid-cols-3 gap-4">
                {field("tradingVolume", "Trading Volume")}
                {field("activeTraders", "Active Traders")}
                {field("uptime", "Uptime")}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Inventory</h2>
            <div className="space-y-4">
              {field("inventoryTitle", "Title")}
              {field("inventorySubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Giveaways</h2>
            <div className="space-y-4">
              {field("giveawayTitle", "Title")}
              {field("giveawaySubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Investments</h2>
            <div className="space-y-4">
              {field("investmentsTitle", "Title")}
              {field("investmentsSubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Portfolio</h2>
            <div className="space-y-4">
              {field("portfolioTitle", "Title")}
              {field("portfolioSubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Payments</h2>
            <div className="space-y-4">
              {field("paymentsTitle", "Title")}
              {field("paymentsSubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Market</h2>
            <div className="space-y-4">
              {field("marketTitle", "Title")}
              {field("marketSubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Vision</h2>
            <div className="space-y-4">
              {field("visionTitle", "Title")}
              {field("visionSubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">VIP / Appointment</h2>
            <div className="space-y-4">
              {field("vipTitle", "Title")}
              {field("vipSubtitle", "Subtitle", true)}
              {field("appointmentFee", "Appointment Fee")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Testimonials</h2>
            <div className="space-y-4">
              {field("testimonialsTitle", "Title")}
              {field("testimonialsSubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Contact / Final CTA</h2>
            <div className="space-y-4">
              {field("contactTitle", "Title")}
              {field("contactSubtitle", "Subtitle")}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4 text-[#E82127]">Customer Support</h2>
            <div className="space-y-4">
              {field("whatsappNumber", "WhatsApp Number (with country code, e.g. +2348012345678)")}
              {field("supportEmail", "Support Email")}
            </div>
          </section>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="bg-[#E82127] hover:bg-[#FF3B41] text-white px-6 py-3 rounded-xl font-semibold">
              {saved ? "Saved!" : "Save All Settings"}
            </button>
            <button type="button" onClick={handleReset} className="border border-red-900 text-red-400 px-6 py-3 rounded-xl">
              Reset All Data
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
