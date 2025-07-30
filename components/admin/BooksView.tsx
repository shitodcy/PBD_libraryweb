import { createClient } from "@/lib/supabase/server";
import BookDataTable from "./BookDataTable"; // Impor komponen tabel interaktif

export default async function BooksView() {
  const supabase = await createClient();
  
  // Ambil semua data yang diperlukan untuk tabel dan form
  const { data: books } = await supabase
    .from("books")
    .select("*, categories(name), publishers(name), book_authors(authors(name))")
    .order("title");
    
  const { data: categories } = await supabase.from("categories").select("id, name");
  const { data: publishers } = await supabase.from("publishers").select("id, name");
  const { data: authors } = await supabase.from("authors").select("id, name");

  return (
    <div>
      {/* Kirim semua data sebagai props ke komponen client */}
      <BookDataTable 
        books={books ?? []} 
        categories={categories ?? []}
        publishers={publishers ?? []}
        authors={authors ?? []}
      />
    </div>
  );
}