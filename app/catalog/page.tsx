import { createClient } from "@/lib/supabase/server";
import CatalogView from "./CatalogView";

interface CatalogSearchParams {
  q?: string;
  category?: string;
  publisher?: string;
  sort?: string;
  page?: string;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}) {
  const supabase = await createClient();

  const page = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 12;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let query = supabase
    .from("books")
    .select(
      `*, categories (name), publishers (name), book_authors (authors (name))`,
      { count: "exact" }
    );

  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }
  if (searchParams.category) {
    query = query.eq("category_id", searchParams.category);
  }
  if (searchParams.publisher) {
    query = query.eq("publisher_id", searchParams.publisher);
  }

  const sort = searchParams.sort || "title";
  if (sort === "title") query = query.order("title", { ascending: true });
  if (sort === "year")
    query = query.order("publication_year", { ascending: false });
  if (sort === "rating") query = query.order("rating", { ascending: false });

  query = query.range(from, to);

  const [booksResult, categoriesResult, publishersResult] = await Promise.all([
    query,
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("publishers").select("id, name").order("name"),
  ]);

  // ✅ PERBAIKAN: Ekstrak 'error' dari hasil query buku
  const { data: books, count, error: booksError } = booksResult;
  const { data: categories } = categoriesResult;
  const { data: publishers } = publishersResult;

  // ✅ PERBAIKAN: Periksa dan tangani jika ada error saat mengambil data buku
  if (booksError) {
    console.error("Supabase query error:", booksError);
    // Tampilkan pesan error di halaman agar jelas, dan hentikan eksekusi
    return (
      <div className="text-center text-red-500 p-8">
        <h1 className="text-xl font-bold">Terjadi Kesalahan pada Database</h1>
        <p className="mt-2 font-mono bg-gray-100 p-2 rounded">
          {booksError.message}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / itemsPerPage);
   console.log("Jumlah Total Ditemukan (Server):", count);
  console.log("Data Buku Diterima (Server):", books);
  return (
    <CatalogView
      books={books ?? []}
      categories={categories ?? []}
      publishers={publishers ?? []}
      totalPages={totalPages}
    />
  );
}