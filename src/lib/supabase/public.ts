import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for reading public catalog data (categories,
 * products). Product/category reads never need a user session — the anon
 * key with RLS is enough — and critically this client works in build-time
 * contexts like generateStaticParams, where there is no request to read
 * cookies from. The cookie-based client in server.ts throws
 * ("cookies was called outside a request scope") if used there.
 */
export function createPublicClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
