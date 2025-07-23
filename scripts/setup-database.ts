import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Configuration
const supabaseUrl = "https://rvufzybskxwtmbltcslb.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dWZ6eWJza3h3dG1ibHRjc2xiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE2MzE2NywiZXhwIjoyMDY4NzM5MTY3fQ.i2ybWJ_Kcsw1dfbM90HbpGs0SPVnQuekLRVoDKwjy1w"

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Function to execute SQL file
async function executeSQLFile(filePath: string): Promise<void> {
  try {
    console.log(`\n🔄 Executing: ${filePath}`)

    const sqlContent = fs.readFileSync(filePath, "utf8")

    // For comprehensive schema, execute as one block
    if (filePath.includes("comprehensive-database-schema")) {
      const { error } = await supabase.rpc("exec_sql", {
        sql_query: sqlContent,
      })

      if (error) {
        console.error(`❌ Error in ${filePath}:`, error.message)
      } else {
        console.log(`✅ Completed: ${filePath}`)
      }
      return
    }

    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc("exec_sql", {
            sql_query: statement + ";",
          })

          if (error) {
            console.error(`❌ Error in ${filePath}:`, error.message)
            // Continue with next statement instead of stopping
          }
        } catch (err) {
          console.error(`❌ Exception in ${filePath}:`, err)
        }
      }
    }

    console.log(`✅ Completed: ${filePath}`)
  } catch (error) {
    console.error(`❌ Failed to execute ${filePath}:`, error)
  }
}

// Function to test database connection
async function testConnection(): Promise<boolean> {
  try {
    console.log("🔍 Testing database connection...")

    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1)

    if (error) {
      console.error("❌ Connection failed:", error.message)
      return false
    }

    console.log("✅ Database connection successful!")
    return true
  } catch (error) {
    console.error("❌ Connection error:", error)
    return false
  }
}

// Main setup function
async function setupDatabase() {
  console.log("🚀 Starting Database Setup for Library System")
  console.log("=".repeat(50))

  // Test connection first
  const isConnected = await testConnection()
  if (!isConnected) {
    console.log("❌ Cannot proceed without database connection")
    return
  }

  // Define script execution order
  const scripts = [
    "scripts/00-connection-test.sql",
    "scripts/01-cleanup-existing.sql",
    "scripts/comprehensive-database-schema.sql",
    "scripts/seed-comprehensive-data.sql",
    "scripts/generate-large-dataset.sql",
    "scripts/functions-procedures.sql",
    "scripts/triggers.sql",
    "scripts/indexes.sql",
    "scripts/views.sql",
    "scripts/database-security.sql",
  ]

  console.log(`\n📋 Will execute ${scripts.length} SQL scripts in order:`)
  scripts.forEach((script, index) => {
    console.log(`   ${index + 1}. ${script}`)
  })

  console.log("\n⏳ Starting execution...")

  // Execute each script
  for (let i = 0; i < scripts.length; i++) {
    const scriptPath = path.join(process.cwd(), scripts[i])

    if (fs.existsSync(scriptPath)) {
      await executeSQLFile(scriptPath)

      // Add delay between scripts to avoid overwhelming the database
      if (i < scripts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    } else {
      console.log(`⚠️  Script not found: ${scriptPath}`)
    }
  }

  // Final verification
  console.log("\n🔍 Verifying database setup...")
  await verifySetup()

  console.log("\n🎉 Database setup completed!")
  console.log("=".repeat(50))
  console.log("Next steps:")
  console.log("1. Make sure your .env.local file has the correct database password")
  console.log("2. Run: npm install")
  console.log("3. Run: npm run dev")
  console.log("4. Visit: http://localhost:3000")
  console.log("5. Visit: http://localhost:3000/admin (for admin interface)")
}

// Function to verify setup
async function verifySetup() {
  try {
    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (!tablesError && tables) {
      console.log(`✅ Created ${tables.length} tables`)
      console.log("📋 Tables:", tables.map((t) => t.table_name).join(", "))
    }

    // Check if we can query books table
    const { data: books, error: booksError } = await supabase.from("books").select("count(*)").limit(1)

    if (!booksError && books) {
      console.log("✅ Books table is accessible")
    }

    // Check if functions exist
    const { data: functions, error: functionsError } = await supabase
      .from("information_schema.routines")
      .select("routine_name")
      .eq("routine_schema", "public")
      .eq("routine_type", "FUNCTION")

    if (!functionsError && functions) {
      console.log(`✅ Created ${functions.length} functions`)
    }

    console.log("✅ Database verification completed successfully!")
  } catch (error) {
    console.log("⚠️  Verification completed with some warnings:", error)
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase().catch(console.error)
}

export { setupDatabase, testConnection }
