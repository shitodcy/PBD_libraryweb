// path: app/admin/books/new/page.tsx

import { createBook } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function NewBookPage() {
  const supabase = await createClient();

  // Ambil data untuk pilihan dropdown
  const { data: categories } = await supabase.from("categories").select("id, name");
  const { data: publishers } = await supabase.from("publishers").select("id, name");
  const { data: authors } = await supabase.from("authors").select("id, name");

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Tambah Buku Baru</h1>
      <form action={createBook} className="space-y-4 max-w-lg">
        <div>
          <Label htmlFor="title">Judul</Label>
          <Input id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input id="isbn" name="isbn" />
        </div>
        <div>
          <Label htmlFor="publication_year">Tahun Terbit</Label>
          <Input id="publication_year" name="publication_year" type="number" />
        </div>
        <div>
          <Label htmlFor="category_id">Kategori</Label>
          <select id="category_id" name="category_id" required className="w-full mt-1 p-2 border rounded-md">
            <option value="">Pilih Kategori</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="publisher_id">Penerbit</Label>
          <select id="publisher_id" name="publisher_id" required className="w-full mt-1 p-2 border rounded-md">
            <option value="">Pilih Penerbit</option>
            {publishers?.map((publisher) => (
              <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="author_ids">Penulis</Label>
          <select id="author_ids" name="author_ids" multiple required className="w-full mt-1 p-2 border rounded-md h-32">
            {authors?.map((author) => (
              <option key={author.id} value={author.id}>{author.name}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Tahan Ctrl (atau Cmd di Mac) untuk memilih lebih dari satu.
          </p>
        </div>
        <Button type="submit">Simpan</Button>
      </form>
    </div>
  );
}