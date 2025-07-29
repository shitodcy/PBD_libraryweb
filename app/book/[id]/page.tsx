import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import BookDetailView from "./BookDetailView"

// Ini adalah Server Component, berjalan di server
export default async function BookDetailPage({ params }: { params: { id: string } }) {
  // ✅ FIX: Tambahkan 'await' di sini
  const supabase = await createClient()
  const bookId = params.id

  // 1. Muat data buku dan ulasan secara bersamaan di server
  const [bookResult, reviewsResult] = await Promise.all([
    supabase
      .from("books")
      .select(`
        *,
        categories (*),
        publishers (*),
        book_authors ( authors (*) )
      `)
      .eq("id", bookId)
      .single(),
    supabase
      .from("reviews")
      .select(`*, users (first_name, last_name)`)
      .eq("book_id", bookId)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  // 2. Jika buku tidak ditemukan, tampilkan halaman 404
  if (bookResult.error || !bookResult.data) {
    notFound()
  }

  // 3. Kirim data yang sudah dimuat ke Client Component sebagai props
  return (
    <BookDetailView
      book={bookResult.data}
      initialReviews={reviewsResult.data ?? []}
    />
  )
}