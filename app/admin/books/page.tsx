import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function AdminBooksPage() {
  const supabase = await createClient();
  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, isbn, publication_year");

  if (error) {
    return <p className="text-red-500">Error memuat data: {error.message}</p>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Buku</h1>
        <Button asChild>
          <Link href="/admin/books/new">Tambah Buku Baru</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead className="w-[120px]">Tahun Terbit</TableHead>
              <TableHead className="w-[180px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books?.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.isbn}</TableCell>
                <TableCell>{book.publication_year}</TableCell>
                <TableCell>
                  {/* Logika untuk Edit dan Hapus akan kita tambahkan nanti */}
                  <Button variant="outline" size="sm" className="mr-2">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}