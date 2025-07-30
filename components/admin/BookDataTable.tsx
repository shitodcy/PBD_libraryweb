'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBook, updateBook, deleteBook } from "@/app/api/admin/books/actions"; // Sesuaikan path jika perlu

// Definisikan tipe data untuk props
type Book = { id: string; [key: string]: any };
type Category = { id: string; name: string };
type Publisher = { id: string; name: string };
type Author = { id: string; name: string };

interface BookDataTableProps {
  books: Book[];
  categories: Category[];
  publishers: Publisher[];
  authors: Author[];
}

export default function BookDataTable({ books, categories, publishers, authors }: BookDataTableProps) {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Fungsi untuk menangani hapus
  const handleDelete = async () => {
    if (selectedBook) {
      await deleteBook(selectedBook.id);
      setDeleteDialogOpen(false);
      setSelectedBook(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Daftar Buku</h2>
        <Button onClick={() => setAddDialogOpen(true)}>Tambah Buku Baru</Button>
      </div>

      {/* Tabel Buku */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.book_authors?.map((ba: any) => ba.authors.name).join(", ")}</TableCell>
                <TableCell>{book.publication_year}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => { setSelectedBook(book); setEditDialogOpen(true); }}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => { setSelectedBook(book); setDeleteDialogOpen(true); }}>
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Tambah Buku */}
      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Buku Baru</DialogTitle></DialogHeader>
          <form action={createBook} onSubmit={() => setAddDialogOpen(false)} className="space-y-4">
            {/* Isi Form (Judul, ISBN, dll.) */}
            <div><Label>Judul</Label><Input name="title" required /></div>
            {/* ... Tambahkan semua input lain seperti di form 'new/page.tsx' sebelumnya ... */}
            <Button type="submit">Simpan</Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal Edit Buku */}
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Buku: {selectedBook?.title}</DialogTitle></DialogHeader>
          <form action={updateBook.bind(null, selectedBook?.id || '')} onSubmit={() => setEditDialogOpen(false)} className="space-y-4">
            {/* Isi Form dengan defaultValue */}
            <div><Label>Judul</Label><Input name="title" defaultValue={selectedBook?.title} required /></div>
            {/* ... Tambahkan semua input lain dengan defaultValue ... */}
            <Button type="submit">Update</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Konfirmasi Hapus</DialogTitle></DialogHeader>
          <p>Anda yakin ingin menghapus buku "{selectedBook?.title}"? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}