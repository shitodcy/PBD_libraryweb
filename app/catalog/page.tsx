"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Star, Grid, List, Filter, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Book {
  id: number
  title: string
  isbn: string
  publication_year: number
  pages: number
  description: string
  stock_quantity: number
  available_quantity: number
  rating: number
  categories?: { name: string }
  publishers?: { name: string }
  book_authors?: { authors: { name: string } }[]
}

interface Category {
  id: number
  name: string
}

interface Publisher {
  id: number
  name: string
}

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPublisher, setSelectedPublisher] = useState("all")
  const [sortBy, setSortBy] = useState("title")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [searchQuery, selectedCategory, selectedPublisher, sortBy])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch books with relations
      const { data: booksData } = await supabase
        .from("books")
        .select(`
          *,
          categories(name),
          publishers(name),
          book_authors(authors(name))
        `)
        .order("title")

      // Fetch categories
      const { data: categoriesData } = await supabase.from("categories").select("*").order("name")

      // Fetch publishers
      const { data: publishersData } = await supabase.from("publishers").select("*").order("name")

      setBooks(booksData || [])
      setCategories(categoriesData || [])
      setPublishers(publishersData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterBooks = () => {
    let filtered = [...books]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.isbn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.book_authors?.some((ba) => ba.authors.name.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((book) => book.categories?.name === selectedCategory)
    }

    // Publisher filter
    if (selectedPublisher !== "all") {
      filtered = filtered.filter((book) => book.publishers?.name === selectedPublisher)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "year":
          return (b.publication_year || 0) - (a.publication_year || 0)
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "availability":
          return (b.available_quantity || 0) - (a.available_quantity || 0)
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredBooks = filterBooks()
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat katalog buku...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-gray-600">Kembali</span>
              </Link>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Katalog Buku</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/admin">
                <Button variant="outline">Admin Panel</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Pencarian & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari judul, penulis, atau ISBN..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Publisher Filter */}
              <Select value={selectedPublisher} onValueChange={setSelectedPublisher}>
                <SelectTrigger>
                  <SelectValue placeholder="Penerbit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Penerbit</SelectItem>
                  {publishers.map((publisher) => (
                    <SelectItem key={publisher.id} value={publisher.name}>
                      {publisher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Judul A-Z</SelectItem>
                  <SelectItem value="year">Tahun Terbaru</SelectItem>
                  <SelectItem value="rating">Rating Tertinggi</SelectItem>
                  <SelectItem value="availability">Ketersediaan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Menampilkan {paginatedBooks.length} dari {filteredBooks.length} buku
              </p>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Display */}
        {paginatedBooks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada buku ditemukan</h3>
              <p className="text-gray-600">Coba ubah kriteria pencarian atau filter Anda</p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-16 w-16 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <Badge variant={book.available_quantity > 0 ? "default" : "destructive"}>
                      {book.available_quantity > 0 ? "Tersedia" : "Dipinjam"}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                    <CardDescription>
                      {book.book_authors?.map((ba) => ba.authors.name).join(", ") || "Penulis tidak diketahui"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Penerbit:</strong> {book.publishers?.name || "Tidak diketahui"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Tahun:</strong> {book.publication_year || "Tidak diketahui"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Halaman:</strong> {book.pages || "Tidak diketahui"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{book.rating || 0}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Stok: {book.available_quantity}/{book.stock_quantity}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" disabled={book.available_quantity === 0} asChild>
                    <Link href={`/book/${book.id}`}>
                      {book.available_quantity > 0 ? "Lihat Detail" : "Tidak Tersedia"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant={book.available_quantity > 0 ? "default" : "destructive"} className="mb-2">
                            {book.available_quantity > 0 ? "Tersedia" : "Dipinjam"}
                          </Badge>
                          <h3 className="text-xl font-semibold mb-1">{book.title}</h3>
                          <p className="text-gray-600 mb-2">
                            {book.book_authors?.map((ba) => ba.authors.name).join(", ") || "Penulis tidak diketahui"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{book.rating || 0}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            Stok: {book.available_quantity}/{book.stock_quantity}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{book.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Penerbit: {book.publishers?.name || "Tidak diketahui"}</span>
                          <span>Tahun: {book.publication_year || "Tidak diketahui"}</span>
                          <span>Halaman: {book.pages || "Tidak diketahui"}</span>
                        </div>
                        <Button disabled={book.available_quantity === 0} asChild>
                          <Link href={`/book/${book.id}`}>
                            {book.available_quantity > 0 ? "Lihat Detail" : "Tidak Tersedia"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                Sebelumnya
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
