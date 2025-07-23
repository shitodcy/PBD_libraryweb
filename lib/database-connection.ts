import { createClient } from "@supabase/supabase-js"

// Database connection configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client for database operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Test database connection
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1)

    if (error) {
      console.error("Database connection failed:", error)
      return false
    }

    console.log("Database connection successful!")
    return true
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

// Execute SQL script
export async function executeSQLScript(sql: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("SQL execution error:", error)
      return { success: false, error }
    }

    console.log("SQL script executed successfully")
    return { success: true, data }
  } catch (error) {
    console.error("SQL execution failed:", error)
    return { success: false, error }
  }
}
