import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export async function testConnection() {
  try {
    const { data, error } = await supabase.from("information_schema.tables").select("table_name").limit(1)
    return { success: !error, error }
  } catch (error) {
    return { success: false, error }
  }
}

export async function isDatabaseReady() {
  try {
    const { data, error } = await supabase.from("categories").select("id").limit(1)
    return !error
  } catch {
    return false
  }
}