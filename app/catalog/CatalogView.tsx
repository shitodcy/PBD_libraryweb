"use client"

import { useState, useEffect, useTransition, useCallback } from "react" // Impor useCallback
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Star, Filter, ArrowLeft } from "lucide-react"

// --- INTERFACES --- (Tidak ada perubahan)
interface BookAuthor {
  authors: {
    name: string;
  };
}

interface Book {
  id: number;
  title: string;
  available_quantity: number;
  book_authors?: BookAuthor[];
  rating?: number; // Tambahkan properti rating
  // ... properti lainnya
}
interface Category { id: number; name: string; }
interface Publisher { id: number; name: string; }
interface CatalogViewProps {
  books: Book[];
  categories: Category[];
  publishers: Publisher[];
  totalPages: number;
}

export default function CatalogView({ books, categories, publishers, totalPages }: CatalogViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page")) || 1
  
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")

  // ✅ PERBAIKAN 1: Buat fungsi lebih aman dan stabilkan dengan useCallback
  const createQueryString = useCallback((name: string, value: string) => {
    // Gunakan searchParams dari argumen untuk menghindari masalah stale closure
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
  }, [searchParams]) // Hanya dibuat ulang jika searchParams berubah
  
  const handleFilterChange = useCallback((name: string, value: string) => {
    const newQueryString = createQueryString(name, value)
    startTransition(() => {
      router.push(pathname + "?" + newQueryString)
    })
  }, [createQueryString, pathname, router])
  
  // ✅ PERBAIKAN 2: useEffect untuk debounce, sekarang lebih aman
  useEffect(() => {
    // Guard clause ini tidak lagi begitu penting karena useCallback, tapi tetap praktik yang baik
    if (!searchParams) return; 

    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get("q") || "")) {
        handleFilterChange("q", searchTerm)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, searchParams, handleFilterChange])

  // Jika searchParams belum siap, kita bisa tampilkan loading atau null
  if (!searchParams) {
    return null; // atau tampilkan skeleton/spinner
  }

  // Ganti seluruh isi return statement Anda dengan ini

return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/" className="mr-4 flex items-center">
                <ArrowLeft className="mr-2 h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Kembali</span>
              </Link>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Katalog Buku
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/admin">
                <Button variant="outline">Admin Panel</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Pencarian & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Cari judul..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              <Select defaultValue={searchParams.get("category") || "all"} onValueChange={(value) => handleFilterChange("category", value)} disabled={isPending}>
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

              <Select defaultValue={searchParams.get("publisher") || "all"} onValueChange={(value) => handleFilterChange("publisher", value)} disabled={isPending}>
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

              <Select defaultValue={searchParams.get("sort") || "title"} onValueChange={(value) => handleFilterChange("sort", value)} disabled={isPending}>
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

        {/* ✅ BAGIAN YANG HILANG: Menampilkan daftar buku */}
        <div className={`transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
          {books.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <Card key={book.id} className="transition-shadow hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="mb-4 flex h-48 w-full items-center justify-center rounded-md bg-gray-200">
                      <BookOpen className="h-16 w-16 text-gray-400" />
                    </div>
                    <Badge variant={book.available_quantity > 0 ? "default" : "destructive"} className="mb-2">
                      {book.available_quantity > 0 ? "Tersedia" : "Dipinjam"}
                    </Badge>
                    <CardTitle className="h-14 line-clamp-2 text-lg">{book.title}</CardTitle>
                    <CardDescription className="mt-1 h-10 line-clamp-2 text-sm">
                      {book.book_authors?.map((ba) => ba.authors.name).join(", ") || "Penulis tidak diketahui"}
                    </CardDescription>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{book.rating || 0}</span>
                      </div>
                      <span>Stok: {book.available_quantity}</span>
                    </div>
                    <Button className="mt-4 w-full" asChild>
                      <Link href={`/book/${book.id}`}>Lihat Detail</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>Tidak ada buku yang ditemukan.</p>
            </div>
          )}
        </div>

        {/* ✅ BAGIAN YANG HILANG: Menampilkan paginasi */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1 || isPending}
              onClick={() => handleFilterChange("page", String(currentPage - 1))}
            >
              Sebelumnya
            </Button>
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages || isPending}
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