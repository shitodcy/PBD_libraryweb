'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Aksi untuk mencatat peminjaman baru
export async function createBorrowing(formData: FormData) {
  const supabase = await createClient();
  const bookId = formData.get('book_id') as string;

  const transactionData = {
    book_id: bookId,
    member_id: formData.get('member_id') as string,
    borrow_date: new Date().toISOString(),
    // Batas waktu kembali, contoh: 7 hari dari sekarang
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'dipinjam',
  };

  // 1. Kurangi stok buku yang tersedia
  // Di aplikasi production, ini sebaiknya dilakukan dalam satu transaksi/RPC
  const { data: book } = await supabase.from('books').select('available_quantity').eq('id', bookId).single();
  if (book && book.available_quantity > 0) {
    await supabase.from('books').update({ available_quantity: book.available_quantity - 1 }).eq('id', bookId);
  } else {
    return redirect('/admin/borrowings/new?error=Stok buku habis');
  }

  // 2. Catat transaksi peminjaman
  const { error } = await supabase.from('borrowing_transactions').insert(transactionData);

  if (error) {
    console.error("Error creating borrowing:", error);
    return redirect('/admin/borrowings/new?error=Gagal mencatat peminjaman');
  }

  revalidatePath('/admin/borrowings');
  redirect('/admin/borrowings');
}

// Aksi untuk mencatat pengembalian buku
export async function returnBook(transactionId: string, bookId: string) {
  const supabase = await createClient();

  // 1. Update status transaksi
  const { error: trxError } = await supabase
    .from('borrowing_transactions')
    .update({ status: 'dikembalikan', return_date: new Date().toISOString() })
    .eq('id', transactionId);
    
  if (trxError) {
    console.error("Error returning book (transaction):", trxError);
    return; // Gagal
  }

  // 2. Tambah kembali stok buku
  const { data: book } = await supabase.from('books').select('available_quantity').eq('id', bookId).single();
  if (book) {
    await supabase.from('books').update({ available_quantity: book.available_quantity + 1 }).eq('id', bookId);
  }

  revalidatePath('/admin/borrowings');
}