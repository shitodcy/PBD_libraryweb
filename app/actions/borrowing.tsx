'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function borrowBookAction(bookId: string) {
  // ✅ FIX: Tambahkan 'await' di sini
  const supabase = await createClient()

  // 1. Check for active user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "You must be logged in to borrow a book." }
  }

  // 2. Check if the book is available
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('available_copies')
    .eq('id', bookId)
    .single()

  if (bookError || !book) {
    return { success: false, message: "Book not found." }
  }

  if (book.available_copies < 1) {
    return { success: false, message: "Sorry, this book is currently unavailable." }
  }

  // 3. Create a new borrowing record
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14) // Due in 14 days

  const { error: insertError } = await supabase.from('borrowings').insert({
    book_id: bookId,
    user_id: user.id,
    due_date: dueDate.toISOString(),
  })

  if (insertError) {
    console.error("Error creating borrowing record:", insertError)
    return { success: false, message: "Failed to create borrowing record." }
  }

  // 4. Decrement the available_copies count for the book
  const { error: updateError } = await supabase.rpc('decrement_book_quantity', {
    book_id_param: bookId
  })

  if (updateError) {
    console.error("Error updating book quantity:", updateError)
    return { success: false, message: "Failed to update book stock." }
  }

  // 5. Revalidate the book detail page path to show updated stock
  revalidatePath(`/book/${bookId}`)

  return { success: true, message: "Book borrowed successfully!" }
}