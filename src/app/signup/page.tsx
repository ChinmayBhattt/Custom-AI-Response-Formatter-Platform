"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Signup failed");
      setLoading(false);
      return;
    }

    // Auto-login after signup
    const loginRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (loginRes?.error) {
      setError("Account created but login failed. Please sign in.");
    } else {
      router.push("/chat");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            AI Format<span className="text-primary">Hub</span>
          </h1>
          <p className="text-muted mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
