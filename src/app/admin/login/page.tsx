"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/brand/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-sky/10 px-4 py-16">
      <Wordmark />
      <h1 className="mt-6 font-display text-2xl font-semibold text-brand-umber-dark">Admin sign in</h1>

      {!configured ? (
        <p className="mt-6 max-w-sm text-center font-body text-sm text-brand-error">
          Supabase isn&apos;t configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your
          environment, run the migrations, and create an admin user in Supabase Auth to use this dashboard.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm space-y-4 rounded-xl bg-brand-ivory p-6 shadow-sm">
          <div>
            <label htmlFor="email" className="block font-body text-sm font-medium text-brand-charcoal">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1.5"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-body text-sm font-medium text-brand-charcoal">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1.5"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p role="alert" className="font-body text-sm text-brand-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-umber py-2.5 font-body text-sm font-semibold text-brand-ivory disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}
    </div>
  );
}
