"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { borrowBookAction } from "@/app/actions/borrowing"

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
  created_at: string
  updated_at: string
  categories: {
    id: number
    name: string
    description: string
  }
  publishers: {
    id: number
    name: string
    address: string
    email: string
  }
  book_authors: Array<{
    authors: {
      id: number
      first_name: string
      last_name: string
      nationality: string
      biography: string
    }
  }>
}

interface Review {
  id: number
  rating: number
  comment: string
  created_at: string
  users: {
    first_name: string
    last_name: string
  }
}

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchBookDetails(params.id as string)
      fetchBookReviews(params.id as string)
    }
  }, [params.id])

  const fetchBookDetails = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select(`
          *,
          categories (
            id,
            name,
            description
          ),
          publishers (
            id,
            name,
            address,
            email
          ),
          book_authors (
            authors (
              id,
              first_name,
              last_name,
              nationality,
              biography
            )
          )
        `)
        .eq("id", bookId)
        .single()

      if (error) {
        console.error("Error fetching book:", error)
        setError("Buku tidak ditemukan")
        return
      }

      setBook(data)
    } catch (error) {
      console.error("Error:", error)
      setError("Terjadi kesalahan saat memuat data buku")
    } finally {
      setLoading(false)
    }
  }

  const fetchBookReviews = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          users (
            first_name,
            last_name
          )
        `)
        .eq("book_id", bookId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (!error && data) {
        setReviews(data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const handleBorrowBook = async () => {
    if (!book) return

    setBorrowing(true)
    try {
      const result = await borrowBookAction(book.id)

      if (result.success) {
        alert("Buku berhasil dipinjam!")
        // Refresh book data to update available copies
        await fetchBookDetails(book.id)
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Terjadi kesalahan saat meminjam buku")
    } finally {
      setBorrowing(false)
    }
  }

  const handleToggleFavorite = async () => {
    // Toggle favorite functionality would be implemented here
    setIsFavorite(!isFavorite)
    // In a real app, this would make an API call to update favorites
  }

  const handleShare = async () => {
    if (navigator.share && book) {
      try {
        await navigator.share({
          title: book.title,
          text: `Lihat buku "${book.title}" di Perpustakaan Digital`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href)
        alert("Link berhasil disalin ke clipboard!")
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link berhasil disalin ke clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat detail buku...</p>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Buku Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">{error || "Buku yang Anda cari tidak tersedia"}</p>
            <div className="space-y-2">
              <Button onClick={() => router.back()} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/catalog">Jelajahi Katalog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const authors = book.book_authors?.map((ba) => ba.authors) || []
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : book.rating || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Kembali
              </Button>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Detail Buku</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/catalog">Katalog</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-6">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <BookOpen className="h-24 w-24 text-blue-600" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({averageRating.toFixed(1)}) • {reviews.length} ulasan
                      </span>
                    </div>

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

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Tersedia:</span>
                        <span className={book.available_copies > 0 ? "text-green-600" : "text-red-600"}>
                          {book.available_copies}/{book.total_copies}
                        </span>
                      </div>
                      {book.price && (
                        <div className="flex justify-between">
                          <span>Harga:</span>
                          <span>Rp {book.price.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{book.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {authors.length > 0
                        ? authors.map((author) => `${author.first_name} ${author.last_name}`).join(", ")
                        : "Penulis tidak diketahui"}
                    </CardDescription>
                  </div>
                  {book.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-medium">{book.publication_year}</div>
                    <div className="text-xs text-gray-500">Tahun Terbit</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-medium">{book.pages}</div>
                    <div className="text-xs text-gray-500">Halaman</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Building className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-medium">{book.publishers?.name || "N/A"}</div>
                    <div className="text-xs text-gray-500">Penerbit</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-medium">{book.categories?.name || "N/A"}</div>
                    <div className="text-xs text-gray-500">Kategori</div>
                  </div>
                </div>

                {book.isbn && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">ISBN: </span>
                    <span className="text-sm font-mono">{book.isbn}</span>
                  </div>
                )}

                {book.language && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Bahasa: </span>
                    <span className="text-sm">{book.language}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {book.description || "Deskripsi tidak tersedia untuk buku ini."}
                </p>
              </CardContent>
            </Card>

            {/* Author Information */}
            {authors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tentang Penulis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {authors.map((author) => (
                      <div key={author.id} className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {author.first_name} {author.last_name}
                          </h4>
                          {author.nationality && <p className="text-sm text-gray-600 mb-2">{author.nationality}</p>}
                          {author.biography && <p className="text-sm text-gray-700">{author.biography}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Ulasan ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="font-medium">
                              {review.users?.first_name} {review.users?.last_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada ulasan</h3>
                    <p className="text-gray-600">Jadilah yang pertama memberikan ulasan untuk buku ini</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
