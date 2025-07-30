'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Aksi untuk Menambah Buku Baru ---
export async function createBook(formData: FormData) {
  const supabase = await createClient();

  const bookData = {
    title: formData.get('title') as string,
    isbn: formData.get('isbn') as string,
    publication_year: Number(formData.get('publication_year')),
    category_id: formData.get('category_id') as string,
    publisher_id: formData.get('publisher_id') as string,
    // Tambahkan field lain dari tabel 'books' jika ada di form Anda
  };

  // 1. Masukkan data buku baru dan dapatkan ID-nya kembali
  const { data: newBook, error: bookError } = await supabase
    .from('books')
    .insert(bookData)
    .select('id')
    .single();

  if (bookError || !newBook) {
    console.error('Error creating book:', bookError);
    return redirect('/admin/books/new?error=Gagal membuat buku');
  }

  // 2. Ambil ID penulis dan hubungkan ke buku baru
  const authorIds = formData.getAll('author_ids') as string[];
  if (authorIds && authorIds.length > 0) {
    const bookAuthorLinks = authorIds.map(authorId => ({
      book_id: newBook.id,
      author_id: authorId
    }));
    
    const { error: authorError } = await supabase
      .from('book_authors')
      .insert(bookAuthorLinks);
      
    if (authorError) {
      console.error('Error linking authors:', authorError);
      return redirect(`/admin/books/edit/${newBook.id}?error=Buku dibuat, tapi gagal menghubungkan penulis`);
    }
  }

  revalidatePath('/admin/books');
  redirect('/admin/books');
}


// --- Aksi untuk Mengedit Buku ---
export async function updateBook(id: string, formData: FormData) {
  const supabase = await createClient();

  const bookData = {
    title: formData.get('title') as string,
    isbn: formData.get('isbn') as string,
    publication_year: Number(formData.get('publication_year')),
    category_id: formData.get('category_id') as string,
    publisher_id: formData.get('publisher_id') as string,
  };

  // 1. Update data utama buku
  const { error: bookError } = await supabase.from('books').update(bookData).eq('id', id);

  if (bookError) {
    console.error('Error updating book:', bookError);
    return redirect(`/admin/books/edit/${id}?error=Gagal mengupdate buku`);
  }
  
  // (Langkah opsional tapi direkomendasikan: update data penulis)
  // ... Anda bisa menambahkan logika untuk menghapus dan menambah ulang relasi penulis di sini ...

  revalidatePath('/admin/books');
  revalidatePath(`/admin/books/edit/${id}`);
  redirect('/admin/books');
}


// --- Aksi untuk Menghapus Buku ---
export async function deleteBook(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('books').delete().eq('id', id);

  if (error) {
    console.error('Error deleting book:', error);
    return redirect('/admin/books?error=Gagal menghapus buku');
  }

  revalidatePath('/admin/books');
}