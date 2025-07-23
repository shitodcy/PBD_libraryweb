import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types/supabase"

const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Server-side Supabase environment variables not configured")
}

// Server-side Supabase client with service role key
export const supabaseServer: SupabaseClient<Database> | null =
  supabaseUrl && supabaseServiceKey ? createClient<Database>(supabaseUrl, supabaseServiceKey) : null
