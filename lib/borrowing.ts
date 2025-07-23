import { supabase } from "./supabase"

// Perubahan: properti 'books' sekarang adalah sebuah array
export interface Borrowing {
  id: string
  user_id: string
  book_id: string
  borrowed_at: string
  due_date: string
  returned_at?: string
  status: "active" | "returned" | "overdue"
  created_at: string
  updated_at: string
  renewal_count: number
  books?: Array<{
    id: string
    title: string
    isbn: string
    cover_url: string
    available_copies: number
    total_copies: number
    categories: {
      name: string
    }
    book_authors: Array<{
      authors: {
        first_name: string
        last_name: string
      }
    }>
  }>
}

export async function borrowBook(userId: string, bookId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if book exists and is available
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, title, available_copies, total_copies")
      .eq("id", bookId)
      .single()

    if (bookError || !book) {
      return { success: false, message: "Buku tidak ditemukan" }
    }

    if (book.available_copies <= 0) {
      return { success: false, message: "Buku tidak tersedia untuk dipinjam" }
    }

    // Check if user already borrowed this book and hasn't returned it
    const { data: existingBorrow } = await supabase
      .from("borrowings")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .eq("status", "active")
      .single()

    if (existingBorrow) {
      return { success: false, message: "Anda sudah meminjam buku ini" }
    }

    // Check user's borrowing limit (max 5 books)
    const { data: userBorrowings, error: borrowError } = await supabase
      .from("borrowings")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")

    if (borrowError) {
      return { success: false, message: "Gagal memeriksa riwayat peminjaman" }
    }

    if (userBorrowings && userBorrowings.length >= 5) {
      return { success: false, message: "Anda sudah mencapai batas maksimal peminjaman (5 buku)" }
    }

    // Create borrowing record
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 14 days loan period

    const { error: insertError } = await supabase.from("borrowings").insert({
      user_id: userId,
      book_id: bookId,
      due_date: dueDate.toISOString(),
      status: "active",
    })

    if (insertError) {
      console.error("Error creating borrowing:", insertError)
      return { success: false, message: "Gagal meminjam buku" }
    }

    // Update available copies
    const { error: updateError } = await supabase
      .from("books")
      .update({ available_copies: book.available_copies - 1 })
      .eq("id", bookId)

    if (updateError) {
      console.error("Error updating book availability:", updateError)
      return { success: false, message: "Gagal mengupdate ketersediaan buku" }
    }

    return { success: true, message: "Buku berhasil dipinjam" }
  } catch (error) {
    console.error("Error borrowing book:", error)
    return { success: false, message: "Terjadi kesalahan sistem" }
  }
}

export async function returnBook(borrowingId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get borrowing record
    const { data: borrowing, error: borrowError } = await supabase
      .from("borrowings")
      .select("book_id, books(available_copies, total_copies)")
      .eq("id", borrowingId)
      .eq("status", "active")
      .single()

    if (borrowError || !borrowing) {
      return { success: false, message: "Peminjaman tidak ditemukan" }
    }

    // Update borrowing status
    const { error: updateBorrowError } = await supabase
      .from("borrowings")
      .update({
        status: "returned",
        returned_at: new Date().toISOString(),
      })
      .eq("id", borrowingId)

    if (updateBorrowError) {
      console.error("Error updating borrowing:", updateBorrowError)
      return { success: false, message: "Gagal mengembalikan buku" }
    }

    // Perbaikan: Akses object buku dari elemen pertama array
    const bookData = Array.isArray(borrowing.books) ? borrowing.books[0] : borrowing.books;

    if (bookData) {
      const { error: updateBookError } = await supabase
        .from("books")
        .update({ available_copies: bookData.available_copies + 1 })
        .eq("id", borrowing.book_id)

      if (updateBookError) {
        console.error("Error updating book availability:", updateBookError)
        // Consider rolling back the borrowing status update here in a real-world scenario
        return { success: false, message: "Gagal mengupdate ketersediaan buku" }
      }
    }

    return { success: true, message: "Buku berhasil dikembalikan" }
  } catch (error) {
    console.error("Error returning book:", error)
    return { success: false, message: "Terjadi kesalahan sistem" }
  }
}

export async function getUserBorrowings(userId: string): Promise<Borrowing[]> {
  try {
    const { data, error } = await supabase
      .from("borrowings")
      .select(`
        *,
        books (
          id,
          title,
          isbn,
          cover_url,
          categories (
            name
          ),
          book_authors (
            authors (
              first_name,
              last_name
            )
          )
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("borrowed_at", { ascending: false })

    if (error) {
      console.error("Error fetching user borrowings:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching user borrowings:", error)
    return []
  }
}

export async function extendBorrowing(borrowingId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data: borrowing, error: borrowError } = await supabase
      .from("borrowings")
      .select("due_date, renewal_count")
      .eq("id", borrowingId)
      .eq("status", "active")
      .single()

    if (borrowError || !borrowing) {
      return { success: false, message: "Peminjaman tidak ditemukan" }
    }

    const renewalCount = borrowing.renewal_count || 0
    if (renewalCount >= 2) {
      return { success: false, message: "Batas perpanjangan sudah tercapai (maksimal 2 kali)" }
    }

    const newDueDate = new Date(borrowing.due_date)
    newDueDate.setDate(newDueDate.getDate() + 7) // Extend by 7 days

    const { error: updateError } = await supabase
      .from("borrowings")
      .update({
        due_date: newDueDate.toISOString(),
        renewal_count: renewalCount + 1,
      })
      .eq("id", borrowingId)

    if (updateError) {
      console.error("Error extending borrowing:", updateError)
      return { success: false, message: "Gagal memperpanjang peminjaman" }
    }

    return { success: true, message: "Peminjaman berhasil diperpanjang 7 hari" }
  } catch (error) {
    console.error("Error extending borrowing:", error)
    return { success: false, message: "Terjadi kesalahan sistem" }
  }
}

export async function getBorrowingHistory(userId: string): Promise<Borrowing[]> {
  try {
    const { data, error } = await supabase
      .from("borrowings")
      .select(`
        *,
        books (
          id,
          title,
          isbn,
          cover_url,
          categories (
            name
          ),
          book_authors (
            authors (
              first_name,
              last_name
            )
          )
        )
      `)
      .eq("user_id", userId)
      .order("borrowed_at", { ascending: false })

    if (error) {
      console.error("Error fetching borrowing history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching borrowing history:", error)
    return []
  }
}

export async function checkOverdueBooks(): Promise<void> {
  try {
    const { error } = await supabase
      .from("borrowings")
      .update({ status: "overdue" })
      .eq("status", "active")
      .lt("due_date", new Date().toISOString())

    if (error) {
      console.error("Error updating overdue books:", error)
    }
  } catch (error) {
    console.error("Error checking overdue books:", error)
  }
}