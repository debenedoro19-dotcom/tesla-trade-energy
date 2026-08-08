"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const result = store.registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error || "Registration failed");
      return;
    }
    // Auto-login
    store.loginUser(form.email.trim(), form.password);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#E82127] rounded-lg flex items-center justify-center text-white font-extrabold">T</div>
          <div>
            <h1 className="font-bold text-lg">Create account</h1>
            <p className="text-xs text-[#6E6E73]">Join Tesla Trade</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
          />
          <input
            required
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
          />
          <input
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
          />
          <input
            required
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
          />
          <input
            required
            type="password"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
          />
          {error && <p className="text-[#FF453A] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E82127] hover:bg-[#FF3B41] disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#6E6E73] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#E82127] hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-[#6E6E73] mt-3">
          <Link href="/" className="hover:text-white">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
