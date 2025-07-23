import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function quickSetup() {
  console.log("🚀 Quick Setup for Library Management System")
  console.log("==================================================")

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .limit(1)

    if (testError) {
      throw new Error(`Connection failed: ${testError.message}`)
    }

    console.log("✅ Connection successful!")

    // Create essential tables
    const tables = [
      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Publishers table
      `CREATE TABLE IF NOT EXISTS publishers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        address TEXT,
        email VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Authors table
      `CREATE TABLE IF NOT EXISTS authors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        biography TEXT,
        nationality VARCHAR(100),
        birth_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Books table
      `CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        isbn VARCHAR(20) UNIQUE,
        category_id INTEGER REFERENCES categories(id),
        publisher_id INTEGER REFERENCES publishers(id),
        publication_year INTEGER,
        pages INTEGER,
        language VARCHAR(50) DEFAULT 'Indonesian',
        description TEXT,
        cover_url TEXT,
        stock_quantity INTEGER DEFAULT 1,
        available_quantity INTEGER DEFAULT 1,
        rating DECIMAL(3,2) DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Book Authors junction table
      `CREATE TABLE IF NOT EXISTS book_authors (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
        UNIQUE(book_id, author_id)
      );`,

      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role VARCHAR(20) DEFAULT 'member',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Borrowings table
      `CREATE TABLE IF NOT EXISTS borrowings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        book_id INTEGER REFERENCES books(id),
        borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP NOT NULL,
        returned_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        fine_amount DECIMAL(10,2) DEFAULT 0.0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
    ]

    for (const table of tables) {
      const { error } = await supabase.rpc("exec_sql", { sql: table })
      if (error && !error.message.includes("already exists")) {
        console.error("Error creating table:", error)
      }
    }

    console.log("✅ Essential tables created!")

    // Insert sample data
    const sampleData = {
      categories: [
        { name: "Fiksi", description: "Novel dan cerita fiksi" },
        { name: "Non-Fiksi", description: "Buku faktual dan edukatif" },
        { name: "Sejarah", description: "Buku tentang sejarah dan peradaban" },
        { name: "Teknologi", description: "Buku tentang teknologi dan komputer" },
        { name: "Biografi", description: "Riwayat hidup tokoh terkenal" },
      ],
      publishers: [
        {
          name: "Gramedia Pustaka Utama",
          address: "Jakarta, Indonesia",
          email: "info@gramedia.com",
          phone: "021-5350660",
        },
        { name: "Mizan Pustaka", address: "Bandung, Indonesia", email: "info@mizan.com", phone: "022-5229999" },
        { name: "Erlangga", address: "Jakarta, Indonesia", email: "info@erlangga.co.id", phone: "021-7394262" },
        {
          name: "Bentang Pustaka",
          address: "Yogyakarta, Indonesia",
          email: "info@bentangpustaka.com",
          phone: "0274-560033",
        },
        {
          name: "Republika Penerbit",
          address: "Jakarta, Indonesia",
          email: "info@republika.co.id",
          phone: "021-7394000",
        },
      ],
      authors: [
        {
          name: "Andrea Hirata",
          biography: "Penulis Indonesia terkenal dengan novel Laskar Pelangi",
          nationality: "Indonesia",
        },
        {
          name: "Pramoedya Ananta Toer",
          biography: "Sastrawan Indonesia penulis Tetralogi Buru",
          nationality: "Indonesia",
        },
        { name: "Tere Liye", biography: "Penulis produktif Indonesia dengan berbagai genre", nationality: "Indonesia" },
        { name: "Dee Lestari", biography: "Penulis dan musisi Indonesia", nationality: "Indonesia" },
        { name: "Ahmad Fuadi", biography: "Penulis Indonesia penulis Negeri 5 Menara", nationality: "Indonesia" },
      ],
    }

    // Insert categories
    for (const category of sampleData.categories) {
      await supabase.from("categories").upsert(category, { onConflict: "name" })
    }

    // Insert publishers
    for (const publisher of sampleData.publishers) {
      await supabase.from("publishers").upsert(publisher, { onConflict: "name" })
    }

    // Insert authors
    for (const author of sampleData.authors) {
      await supabase.from("authors").upsert(author, { onConflict: "name" })
    }

    // Insert sample books
    const sampleBooks = [
      {
        title: "Laskar Pelangi",
        isbn: "978-979-22-4800-0",
        category_id: 1,
        publisher_id: 1,
        publication_year: 2005,
        pages: 529,
        description: "Novel yang mengisahkan perjuangan anak-anak Belitung untuk mendapatkan pendidikan",
        stock_quantity: 5,
        available_quantity: 4,
        rating: 4.8,
      },
      {
        title: "Bumi Manusia",
        isbn: "978-979-97-3124-0",
        category_id: 3,
        publisher_id: 2,
        publication_year: 1980,
        pages: 535,
        description: "Novel pertama dari Tetralogi Buru karya Pramoedya Ananta Toer",
        stock_quantity: 3,
        available_quantity: 2,
        rating: 4.9,
      },
      {
        title: "Negeri 5 Menara",
        isbn: "978-979-22-4801-7",
        category_id: 5,
        publisher_id: 1,
        publication_year: 2009,
        pages: 423,
        description: "Kisah inspiratif santri Pondok Modern Darussalam Gontor",
        stock_quantity: 4,
        available_quantity: 3,
        rating: 4.7,
      },
    ]

    for (const book of sampleBooks) {
      await supabase.from("books").upsert(book, { onConflict: "isbn" })
    }

    // Insert sample users
    const sampleUsers = [
      {
        email: "admin@library.com",
        password_hash: "hashed_password_admin",
        first_name: "Admin",
        last_name: "System",
        role: "admin",
        phone: "081234567890",
      },
      {
        email: "librarian@library.com",
        password_hash: "hashed_password_librarian",
        first_name: "Pustakawan",
        last_name: "Utama",
        role: "librarian",
        phone: "081234567891",
      },
      {
        email: "member@library.com",
        password_hash: "hashed_password_member",
        first_name: "Anggota",
        last_name: "Perpustakaan",
        role: "member",
        phone: "081234567892",
      },
    ]

    for (const user of sampleUsers) {
      await supabase.from("users").upsert(user, { onConflict: "email" })
    }

    console.log("✅ Sample data inserted!")
    console.log("🎉 Quick setup completed!")
    console.log("")
    console.log("🌐 Access your application:")
    console.log("   - Main Site: http://localhost:3000")
    console.log("   - Admin Panel: http://localhost:3000/admin")
    console.log("   - Catalog: http://localhost:3000/catalog")
    console.log("")
  } catch (error) {
    console.error("❌ Setup failed:", error)
    process.exit(1)
  }
}

quickSetup()
