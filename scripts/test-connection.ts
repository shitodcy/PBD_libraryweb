import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://rvufzybskxwtmbltcslb.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dWZ6eWJza3h3dG1ibHRjc2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjMxNjcsImV4cCI6MjA2ODczOTE2N30.LKFjhFHWt-c65PzTDTSOEjUtZvHPvFmTT-VsH8r1-bY"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dWZ6eWJza3h3dG1ibHRjc2xiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MzE2NywiZXhwIjoyMDY4NzM5MTY3fQ.i2ybWJ_Kcsw1dfbM90HbpGs0SPVnQuekLRVoDKwjy1w"

async function testConnection() {
  console.log("🔍 Testing Supabase Connection...")
  console.log("URL:", supabaseUrl)
  console.log("Anon Key:", supabaseAnonKey.substring(0, 20) + "...")
  console.log("Service Key:", supabaseServiceKey.substring(0, 20) + "...")

  // Test with anon key (public access)
  console.log("\n1️⃣ Testing with Anon Key (Public Access)...")
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const { data: anonData, error: anonError } = await supabaseAnon
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(3)

    if (anonError) {
      console.log("⚠️  Anon key limited access (expected):", anonError.message)
    } else {
      console.log("✅ Anon key connection successful!")
      console.log("📋 Accessible tables:", anonData?.map((t) => t.table_name) || [])
    }
  } catch (error) {
    console.log("⚠️  Anon key connection issue:", error)
  }

  // Test with service role key (admin access)
  console.log("\n2️⃣ Testing with Service Role Key (Admin Access)...")
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(10)

    if (adminError) {
      console.error("❌ Service role connection failed:", adminError.message)
      return false
    }

    console.log("✅ Service role connection successful!")
    console.log("📋 Existing tables:", adminData?.map((t) => t.table_name) || [])

    // Test SQL execution capability
    console.log("\n3️⃣ Testing SQL Execution...")
    const { data: sqlTest, error: sqlError } = await supabaseAdmin.rpc("exec_sql", {
      sql_query: "SELECT current_timestamp as test_time;",
    })

    if (sqlError) {
      console.log("⚠️  SQL execution test failed:", sqlError.message)
      console.log("💡 This is normal if exec_sql function doesn't exist yet")
    } else {
      console.log("✅ SQL execution test passed!")
    }

    return true
  } catch (error) {
    console.error("❌ Service role connection error:", error)
    return false
  }
}

// Run the test
testConnection().then((success) => {
  if (success) {
    console.log("\n🎉 Connection tests completed!")
    console.log("📝 Next steps:")
    console.log("   1. Add your database password to .env.local")
    console.log("   2. Run: npm run setup-db")
    console.log("   3. Run: npm run dev")
  } else {
    console.log("\n❌ Please check your credentials and try again")
  }
})
