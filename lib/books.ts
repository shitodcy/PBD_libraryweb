import { supabase, isSupabaseConfigured, isDatabaseReady } from "./supabase"
import type { Book, BookFilters, PaginatedResponse } from "@/types"

// Mock data for when Supabase is not configured or database is not ready
const mockBooks: Book[] = [
  {
    id: "1",
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    description:
      "Novel yang mengisahkan tentang perjuangan anak-anak Belitung untuk mendapatkan pendidikan di sekolah Muhammadiyah yang hampir roboh.",
    category: "Fiksi",
    isbn: "9789792248000",
    publication_year: 2005,
    pages: 529,
    cover_url: "/placeholder.svg?height=300&width=200&text=Laskar+Pelangi",
    total_copies: 5,
    available_copies: 4,
    rating: 4.8,
    featured: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    description:
      "Novel pertama dari Tetralogi Buru yang mengisahkan kehidupan di masa kolonial Belanda melalui tokoh Minke.",
    category: "Sejarah",
    isbn: "9789799731240",
    publication_year: 1980,
    pages: 535,
    cover_url: "/placeholder.svg?height=300&width=200&text=Bumi+Manusia",
    total_copies: 3,
    available_copies: 2,
    rating: 4.9,
    featured: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    title: "Negeri 5 Menara",
    author: "Ahmad Fuadi",
    description:
      "Kisah inspiratif tentang perjuangan santri di Pondok Modern Darussalam Gontor dalam mengejar mimpi dan cita-cita.",
    category: "Biografi",
    isbn: "9789792248017",
    publication_year: 2009,
    pages: 423,
    cover_url: "/placeholder.svg?height=300&width=200&text=Negeri+5+Menara",
    total_copies: 4,
    available_copies: 0,
    rating: 4.7,
    featured: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    title: "Ayat-Ayat Cinta",
    author: "Habiburrahman El Shirazy",
    description:
      "Novel yang mengisahkan perjalanan spiritual seorang mahasiswa Indonesia di Mesir dalam mencari cinta sejati.",
    category: "Religi",
    isbn: "9789792248024",
    publication_year: 2004,
    pages: 418,
    cover_url: "/placeholder.svg?height=300&width=200&text=Ayat+Ayat+Cinta",
    total_copies: 6,
    available_copies: 5,
    rating: 4.6,
    featured: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    title: "Perahu Kertas",
    author: "Dee Lestari",
    description:
      "Novel tentang perjalanan cinta dan mimpi dua anak muda Jakarta yang bertemu dalam keadaan tak terduga.",
    category: "Romance",
    isbn: "9789792248031",
    publication_year: 2009,
    pages: 456,
    cover_url: "/placeholder.svg?height=300&width=200&text=Perahu+Kertas",
    total_copies: 3,
    available_copies: 3,
    rating: 4.5,
    featured: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "6",
    title: "Sang Pemimpi",
    author: "Andrea Hirata",
    description:
      "Sekuel dari Laskar Pelangi yang mengisahkan perjuangan melanjutkan pendidikan ke jenjang yang lebih tinggi.",
    category: "Fiksi",
    isbn: "9789792248048",
    publication_year: 2006,
    pages: 292,
    cover_url: "/placeholder.svg?height=300&width=200&text=Sang+Pemimpi",
    total_copies: 4,
    available_copies: 4,
    rating: 4.4,
    featured: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "7",
    title: "Ronggeng Dukuh Paruk",
    author: "Ahmad Tohari",
    description:
      "Novel yang mengisahkan kehidupan seorang ronggeng di desa Dukuh Paruk dan konflik sosial yang melingkupinya.",
    category: "Fiksi",
    isbn: "9789792248055",
    publication_year: 1982,
    pages: 320,
    cover_url: "/placeholder.svg?height=300&width=200&text=Ronggeng+Dukuh+Paruk",
    total_copies: 2,
    available_copies: 2,
    rating: 4.3,
    featured: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "8",
    title: "Cantik Itu Luka",
    author: "Eka Kurniawan",
    description:
      "Novel yang menggabungkan realisme magis dengan sejarah Indonesia, mengisahkan kehidupan keluarga Dewi Ayu.",
    category: "Fiksi",
    isbn: "9789792248062",
    publication_year: 2002,
    pages: 520,
    cover_url: "/placeholder.svg?height=300&width=200&text=Cantik+Itu+Luka",
    total_copies: 3,
    available_copies: 1,
    rating: 4.6,
    featured: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

export async function getFeaturedBooks(): Promise<Book[]> {
  // Always check if database is ready first
  const dbReady = await isDatabaseReady()

  if (!isSupabaseConfigured || !supabase || !dbReady) {
    console.log("Using mock data for featured books")
    return mockBooks.filter((book) => book.featured)
  }

  try {
    const { data, error } = await supabase.from("books").select("*").eq("featured", true).limit(4)

    if (error) {
      console.error("Error fetching featured books:", error.message)
      return mockBooks.filter((book) => book.featured)
    }

    return data || mockBooks.filter((book) => book.featured)
  } catch (error) {
    console.error("Error fetching featured books:", error)
    return mockBooks.filter((book) => book.featured)
  }
}

export async function getAllBooks(filters: BookFilters = {}): Promise<PaginatedResponse<Book>> {
  const { search, category, sortBy, page = 1, limit = 12 } = filters

  // Always check if database is ready first
  const dbReady = await isDatabaseReady()

  if (!isSupabaseConfigured || !supabase || !dbReady) {
    console.log("Using mock data for all books")
    return getMockBooks(filters)
  }

  try {
    let query = supabase.from("books").select("*", { count: "exact" })

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (sortBy) {
      switch (sortBy) {
        case "title":
          query = query.order("title", { ascending: true })
          break
        case "author":
          query = query.order("author", { ascending: true })
          break
        case "year":
          query = query.order("publication_year", { ascending: false })
          break
        case "rating":
          query = query.order("rating", { ascending: false })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error("Error fetching books:", error.message)
      // Fallback to mock data
      return getMockBooks(filters)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages,
    }
  } catch (error) {
    console.error("Error fetching books:", error)
    // Fallback to mock data
    return getMockBooks(filters)
  }
}

// Helper function to handle mock data filtering and pagination
function getMockBooks(filters: BookFilters = {}): PaginatedResponse<Book> {
  const { search, category, sortBy, page = 1, limit = 12 } = filters
  let filteredBooks = [...mockBooks]

  if (search) {
    filteredBooks = filteredBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()),
    )
  }

  if (category && category !== "all") {
    filteredBooks = filteredBooks.filter((book) => book.category === category)
  }

  if (sortBy) {
    switch (sortBy) {
      case "title":
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "author":
        filteredBooks.sort((a, b) => a.author.localeCompare(b.author))
        break
      case "year":
        filteredBooks.sort((a, b) => b.publication_year - a.publication_year)
        break
      case "rating":
        filteredBooks.sort((a, b) => b.rating - a.rating)
        break
    }
  }

  const from = (page - 1) * limit
  const to = from + limit
  const paginatedBooks = filteredBooks.slice(from, to)
  const totalPages = Math.ceil(filteredBooks.length / limit)

  return {
    data: paginatedBooks,
    total: filteredBooks.length,
    page,
    limit,
    totalPages,
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  // Always check if database is ready first
  const dbReady = await isDatabaseReady()

  if (!isSupabaseConfigured || !supabase || !dbReady) {
    console.log("Using mock data for book by ID")
    return mockBooks.find((book) => book.id === id) || null
  }

  try {
    const { data, error } = await supabase.from("books").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching book:", error.message)
      return mockBooks.find((book) => book.id === id) || null
    }

    return data
  } catch (error) {
    console.error("Error fetching book:", error)
    return mockBooks.find((book) => book.id === id) || null
  }
}

export async function getCategories(): Promise<string[]> {
  // Always check if database is ready first
  const dbReady = await isDatabaseReady()

  if (!isSupabaseConfigured || !supabase || !dbReady) {
    console.log("Using mock data for categories")
    const categories = [...new Set(mockBooks.map((book) => book.category))]
    return categories.sort()
  }

  try {
    const { data, error } = await supabase.from("books").select("category").not("category", "is", null)

    if (error) {
      console.error("Error fetching categories:", error.message)
      const categories = [...new Set(mockBooks.map((book) => book.category))]
      return categories.sort()
    }

    const categories = [...new Set(data.map((item) => item.category).filter(Boolean))]
    return categories.sort()
  } catch (error) {
    console.error("Error fetching categories:", error)
    const categories = [...new Set(mockBooks.map((book) => book.category))]
    return categories.sort()
  }
}
