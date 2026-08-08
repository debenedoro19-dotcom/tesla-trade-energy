"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = store.loginUser(email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || "Login failed");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="bg-[#121214] border border-[#26262A] rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#E82127] rounded-lg flex items-center justify-center text-white font-extrabold">T</div>
          <div>
            <h1 className="font-bold text-lg">Sign in</h1>
            <p className="text-xs text-[#6E6E73]">Access your Tesla Trade account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#B0B0B5] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-[#B0B0B5] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-[#26262A] rounded-xl px-4 py-3 focus:outline-none focus:border-[#E82127]"
              placeholder="Your password"
            />
          </div>
          {error && <p className="text-[#FF453A] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E82127] hover:bg-[#FF3B41] disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-[#6E6E73] mt-6">
          No account?{" "}
          <Link href="/signup" className="text-[#E82127] hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-center text-xs text-[#6E6E73] mt-3">
          <Link href="/" className="hover:text-white">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
