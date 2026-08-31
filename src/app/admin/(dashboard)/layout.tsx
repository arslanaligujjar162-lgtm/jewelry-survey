import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Wordmark } from "@/components/brand/Logo";
import { SignOutButton } from "@/components/admin/SignOutButton";

// Admin pages depend on auth cookies and live Supabase data — never
// statically prerender them.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/returns", label: "Returns" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-sky px-4">
        <div className="max-w-sm rounded-xl bg-brand-ivory p-6 text-center shadow-sm">
          <h1 className="font-display text-xl font-semibold text-brand-umber-dark">Admin dashboard not configured</h1>
          <p className="mt-3 font-body text-sm text-brand-charcoal/70">
            Add your Supabase credentials to the environment, run the migrations in{" "}
            <code>supabase/migrations</code>, and create an admin user in Supabase Auth to use this dashboard.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-brand-sky/30">
      <header className="border-b border-brand-umber/10 bg-brand-ivory">
        <div className="container-page flex h-16 items-center justify-between">
          <Wordmark />
          <nav className="hidden gap-6 font-body text-sm sm:flex" aria-label="Admin">
            {NAV.map((link) => (
              <Link key={link.href} href={link.href} className="text-brand-charcoal hover:text-brand-umber">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="hidden font-body text-xs text-brand-charcoal/60 sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
        <nav className="container-page flex gap-4 overflow-x-auto pb-3 font-body text-sm sm:hidden" aria-label="Admin">
          {NAV.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap text-brand-charcoal hover:text-brand-umber">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
