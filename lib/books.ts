import { createClient } from "./supabase/server";

/**
 * Mengambil semua kategori dari database.
 */
export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Database error fetching categories:", error.message);
    // Di API route kita sudah tangani error ini, jadi di sini kita cukup return null
    return null;
  }

  return data;
}

/**
 * Mengambil satu buku berdasarkan ID-nya.
 * @param bookId - ID dari buku yang ingin dicari (format UUID)
 */
export async function getBookById(bookId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      `*, 
       categories (name), 
       publishers (name), 
       book_authors (authors (name))`
    )
    .eq("id", bookId)
    .single(); // .single() untuk mengambil satu baris data saja

  if (error) {
    console.error("Database error fetching book by ID:", error.message);
    // Di API route kita sudah tangani error ini, jadi di sini kita cukup return null
    return null;
  }

  return data;
}

// Anda bisa menambahkan fungsi-fungsi lain terkait data di sini di kemudian hari
// contoh: getPublishers(), getAuthors(), dll.