import { createBorrowing } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default async function NewBorrowingPage() {
  const supabase = await createClient();

  // Ambil daftar anggota
  const { data: members } = await supabase.from("members").select("id, first_name, last_name");
  // Ambil daftar buku yang stoknya masih ada
  const { data: availableBooks } = await supabase
    .from("books")
    .select("id, title")
    .gt("available_quantity", 0);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Catat Peminjaman Baru</h1>
      <form action={createBorrowing} className="space-y-4 max-w-lg">
        <div>
          <Label htmlFor="member_id">Pilih Anggota</Label>
          <select id="member_id" name="member_id" required className="w-full mt-1 p-2 border rounded-md">
            <option value="">-- Pilih Peminjam --</option>
            {members?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="book_id">Pilih Buku</Label>
          <select id="book_id" name="book_id" required className="w-full mt-1 p-2 border rounded-md">
            <option value="">-- Pilih Buku yang Tersedia --</option>
            {availableBooks?.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Simpan Peminjaman</Button>
      </form>
    </div>
  );
}