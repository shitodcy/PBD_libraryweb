"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Star, Grid, List, Filter, ArrowLeft } from "lucide-react"

// --- INTERFACES ---
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

interface CatalogViewProps {
  books: Book[]
  categories: Category[]
  publishers: Publisher[]
  totalPages: number
}

export default function CatalogView({ books, categories, publishers, totalPages }: CatalogViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page")) || 1
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    if (name !== 'page') {
      params.set('page', '1')
    }
    return params.toString()
  }
  
  const handleFilterChange = (name: string, value: string) => {
    router.push(pathname + "?" + createQueryString(name, value))
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Pencarian & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari judul, penulis, atau ISBN..."
                    className="pl-10"
                    defaultValue={searchParams.get("q") || ""}
                    onChange={(e) => handleFilterChange("q", e.target.value)}
                  />
                </div>
              </div>

              <Select defaultValue={searchParams.get("category") || "all"} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue={searchParams.get("publisher") || "all"} onValueChange={(value) => handleFilterChange("publisher", value)}>
                <SelectTrigger><SelectValue placeholder="Penerbit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Penerbit</SelectItem>
                  {publishers.map((publisher) => (
                    <SelectItem key={publisher.id} value={String(publisher.id)}>
                      {publisher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue={searchParams.get("sort") || "title"} onValueChange={(value) => handleFilterChange("sort", value)}>
                <SelectTrigger><SelectValue placeholder="Urutkan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Judul A-Z</SelectItem>
                  <SelectItem value="year">Tahun Terbaru</SelectItem>
                  <SelectItem value="rating">Rating Tertinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center mb-4">
                  <BookOpen className="h-16 w-16 text-gray-400" />
                </div>
                <Badge variant={book.available_quantity > 0 ? "default" : "destructive"} className="mb-2">
                  {book.available_quantity > 0 ? "Tersedia" : "Dipinjam"}
                </Badge>
                <CardTitle className="text-lg line-clamp-2 h-14">{book.title}</CardTitle>
                <CardDescription className="text-sm mt-1 h-10 line-clamp-2">
                  {book.book_authors?.map((ba) => ba.authors.name).join(", ") || "Penulis tidak diketahui"}
                </CardDescription>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{book.rating || 0}</span>
                  </div>
                  <span>Stok: {book.available_quantity}</span>
                </div>
                <Button className="w-full mt-4" asChild>
                  <Link href={`/book/${book.id}`}>Lihat Detail</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 items-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handleFilterChange("page", String(currentPage - 1))}
            >
              Sebelumnya
            </Button>
            <span>Halaman {currentPage} dari {totalPages}</span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handleFilterChange("page", String(currentPage + 1))}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}