'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  FileText,
  Building,
  User,
  Star,
  Heart,
  Download,
  Share2,
} from "lucide-react"
import { borrowBookAction } from "@/app/actions/borrowing" // Pastikan path ke server action Anda benar

// --- INTERFACES (Tipe Data) ---
// Tipe ini harus cocok dengan data yang dikirim dari page.tsx
interface Book {
  id: string
  title: string
  isbn: string
  description: string
  publication_year: number
  pages: number
  language: string
  price: number
  total_copies: number
  available_copies: number
  featured: boolean
  cover_url: string
  rating: number
  categories: { name: string } | null
  publishers: { name: string } | null
  book_authors: { authors: { id: number, first_name: string, last_name: string, nationality: string, biography: string } }[]
}

interface Review {
  id: number
  rating: number
  comment: string
  created_at: string
  users: { first_name: string, last_name: string } | null
}

interface BookDetailViewProps {
  book: Book
  initialReviews: Review[]
}

export default function BookDetailView({ book, initialReviews }: BookDetailViewProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [borrowing, setBorrowing] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleBorrowBook = async () => {
    setBorrowing(true)
    try {
      const result = await borrowBookAction(book.id)
      if (result.success) {
        alert("Buku berhasil dipinjam!")
        router.refresh() // Refresh halaman untuk update data stok buku
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Terjadi kesalahan saat meminjam buku.")
    } finally {
      setBorrowing(false)
    }
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // Di aplikasi nyata, ini akan memanggil server action untuk menyimpan favorit
  }
  
  const handleShare = async () => {
    // ... (Fungsi handleShare Anda bisa disalin ke sini)
  }

  const authors = book.book_authors?.map((ba) => ba.authors) || []
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : book.rating || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        {/* ... Salin JSX <header> Anda dari kode lama ke sini ... */}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-lg"/>
                    ) : (
                      <BookOpen className="h-24 w-24 text-gray-400" />
                    )}
                  </div>
                  {/* ... (Salin sisa JSX untuk rating, tombol, dll. ke sini) ... */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleBorrowBook}
                      disabled={borrowing || book.available_copies === 0}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {borrowing ? "Meminjam..." : book.available_copies > 0 ? "Pinjam Buku" : "Tidak Tersedia"}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleToggleFavorite}>
                      <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl mb-2">{book.title}</CardTitle>
                <CardDescription className="text-lg">
                  {authors.length > 0
                    ? authors.map((author) => `${author.first_name} ${author.last_name}`).join(", ")
                    : "Penulis tidak diketahui"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* ... (Salin sisa JSX untuk detail, deskripsi, penulis, dan ulasan ke sini) ... */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}