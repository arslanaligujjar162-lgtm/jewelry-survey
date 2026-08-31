"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-full border border-brand-umber/30 px-4 py-1.5 font-body text-xs font-medium text-brand-umber-dark hover:bg-brand-sky"
    >
      Sign out
    </button>
  );
}
