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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function BorrowingsView() {
  const supabase = await createClient();
  
  // Ambil data transaksi dengan join ke tabel buku dan anggota
  const { data: transactions } = await supabase
    .from("borrowing_transactions")
    .select("*, books(title), members(first_name, last_name)")
    .order("borrow_date", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Riwayat Peminjaman</h2>
        {/* Tombol ini akan mengarah ke form peminjaman baru */}
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
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((trx) => (
              <TableRow key={trx.id}>
                <TableCell>{trx.books?.title ?? "N/A"}</TableCell>
                <TableCell>{`${trx.members?.first_name ?? ''} ${trx.members?.last_name ?? ''}`}</TableCell>
                <TableCell>{new Date(trx.borrow_date).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>
                  <Badge variant={trx.status === 'dipinjam' ? 'destructive' : 'default'}>
                    {trx.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {trx.status === 'dipinjam' && (
                    <Button variant="outline" size="sm">
                      Kembalikan
                    </Button>
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