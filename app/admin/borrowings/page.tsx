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
import { returnBook } from "./actions"; // Akan kita buat di langkah selanjutnya
import { Badge } from "@/components/ui/badge";

export default async function BorrowingsPage() {
  const supabase = await createClient();
  // Ambil data transaksi dengan data buku dan anggota terkait
  const { data: transactions } = await supabase
    .from("borrowing_transactions")
    .select("*, books(title), members(first_name, last_name)")
    .order("borrow_date", { ascending: false });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Peminjaman</h1>
        <Button asChild>
          <Link href="/admin/borrowings/new">Catat Peminjaman Baru</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul Buku</TableHead>
              <TableHead>Peminjam</TableHead>
              <TableHead>Tgl Pinjam</TableHead>
              <TableHead>Tgl Kembali</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((trx) => (
              <TableRow key={trx.id}>
                <TableCell>{trx.books?.title ?? "N/A"}</TableCell>
                <TableCell>{`${trx.members?.first_name} ${trx.members?.last_name}`}</TableCell>
                <TableCell>{new Date(trx.borrow_date).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>{trx.return_date ? new Date(trx.return_date).toLocaleDateString("id-ID") : "-"}</TableCell>
                <TableCell>
                  <Badge variant={trx.status === 'dipinjam' ? 'destructive' : 'default'}>
                    {trx.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {trx.status === 'dipinjam' && (
                    <form action={returnBook.bind(null, trx.id, trx.book_id)}>
                      <Button variant="outline" size="sm" type="submit">
                        Kembalikan
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}