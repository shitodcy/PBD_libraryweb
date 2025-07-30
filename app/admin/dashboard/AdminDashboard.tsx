// app/admin/AdminDashboard.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Book, Trash2, Edit, PlusCircle, User, Library, Building, Shield, Home, LogOut, AlertTriangle,
} from "lucide-react";

// ShadCN UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

// --- Type Definitions ---
// FIX: Changed total_copies to stock_quantity to match database schema
interface Book { id: string; title: string; isbn: string | null; publication_year: number | null; available_quantity: number; stock_quantity: number; description: string | null; pages: number | null; category_id: string | null; publisher_id: string | null; }
interface Category { id: string; name: string; description: string | null; }
interface Publisher { id: string; name: string; address: string | null; email: string | null; }
interface Author { id: string; name: string; nationality: string | null; biography: string | null; }
interface AdminDashboardProps {
  initialBooks: Book[]; initialCategories: Category[]; initialPublishers: Publisher[]; initialAuthors: Author[];
}

// --- Reusable Components ---
const StatCard: React.FC<{ title: string; value: number; subtext: string; icon: React.ReactNode; colorClass: string; }> = ({ title, value, subtext, icon, colorClass }) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute left-0 top-0 h-full w-1 ${colorClass}`}></div>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pl-4">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent className="pl-4">
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </CardContent>
  </Card>
);

// --- Generic Manager for Categories, Publishers, Authors ---
function CrudManager<T extends { id: string; name: string; [key: string]: any }>({
  entityName, pluralEntityName, initialItems, formFields, displayFields,
}: {
  entityName: string; pluralEntityName: string; initialItems: T[];
  formFields: { name: keyof T; label: string; placeholder: string; type?: string; component?: 'input' | 'textarea' }[];
  displayFields: { name: keyof T; }[];
}) {
  const supabase = createClient();
  const [items, setItems] = React.useState(initialItems);
  const [formData, setFormData] = React.useState<Partial<T>>({});
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleInputChange = (field: keyof T, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (item: T) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    setLoading(true);
    const payload = { ...formData };
    delete (payload as any).id; 

    if (editingId) {
      const { data, error } = await supabase.from(pluralEntityName).update(payload).eq('id', editingId).select().single();
      if (data) setItems(items.map(i => i.id === editingId ? data : i));
    } else {
      const { data, error } = await supabase.from(pluralEntityName).insert(payload).select().single();
      if (data) setItems([...items, data]);
    }
    setLoading(false);
    handleCancel();
  };

  const handleDelete = async (id: string) => {
    await supabase.from(pluralEntityName).delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <h3 className="text-xl font-semibold mb-2 flex items-center"><PlusCircle className="mr-2 h-5 w-5" /> {editingId ? `Edit ${entityName}` : `Tambah ${entityName} Baru`}</h3>
        <div className="space-y-4 mt-8">
          {formFields.map(field => (
            <div key={String(field.name)}>
              <Label htmlFor={String(field.name)}>{field.label}</Label>
              {field.component === 'textarea' ? (
                <Textarea id={String(field.name)} placeholder={field.placeholder} value={String(formData[field.name] || '')} onChange={e => handleInputChange(field.name, e.target.value)} />
              ) : (
                <Input id={String(field.name)} type={field.type || 'text'} placeholder={field.placeholder} value={String(formData[field.name] || '')} onChange={e => handleInputChange(field.name, e.target.value)} />
              )}
            </div>
          ))}
          <div className="flex gap-2 !mt-6">
            {editingId && <Button variant="outline" className="w-full" onClick={handleCancel}>Batal</Button>}
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>{loading ? 'Menyimpan...' : (editingId ? 'Simpan' : 'Tambah')}</Button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <h3 className="text-xl font-semibold mb-4">Daftar {pluralEntityName} ({items.length})</h3>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {items.map(item => (
            <Card key={item.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{displayFields.map(df => item[df.name]).filter(Boolean).join(' | ') || `Detail ${entityName.toLowerCase()}`}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                <Dialog><DialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Anda yakin?</DialogTitle><DialogDescription>Aksi ini tidak dapat dibatalkan. Ini akan menghapus data secara permanen.</DialogDescription></DialogHeader>
                    <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button variant="destructive" onClick={() => handleDelete(item.id)}>Hapus</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Books Manager (with FULL CRUD) ---
const BooksManager: React.FC<{ initialBooks: Book[]; categories: Category[]; publishers: Publisher[]; }> = ({ initialBooks, categories, publishers }) => {
    const supabase = createClient();
    const [books, setBooks] = React.useState(initialBooks);
    const [formData, setFormData] = React.useState<Partial<Book>>({ publication_year: new Date().getFullYear(), pages: 0, stock_quantity: 1, available_quantity: 1 });
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    const handleInputChange = (field: keyof Book, value: string | number | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectChange = (field: keyof Book, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEdit = (book: Book) => {
        setEditingId(book.id);
        setFormData(book);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ publication_year: new Date().getFullYear(), pages: 0, stock_quantity: 1, available_quantity: 1 });
    };

    const handleSubmit = async () => {
        if (!formData.title) {
            alert("Judul buku tidak boleh kosong.");
            return;
        }
        setLoading(true);
        const payload = { 
            ...formData,
            publication_year: Number(formData.publication_year) || null,
            pages: Number(formData.pages) || 0,
            stock_quantity: Number(formData.stock_quantity) || 0,
            // Saat buku baru, stok tersedia = total stok. Saat edit, biarkan apa adanya.
            available_quantity: editingId ? Number(formData.available_quantity) : Number(formData.stock_quantity) || 0,
        };
        delete (payload as any).id;

        if (editingId) {
            const { data, error } = await supabase.from('books').update(payload).eq('id', editingId).select().single();
            if (data) setBooks(books.map(b => b.id === editingId ? data : b));
            if (error) console.error("Error updating book:", error);
        } else {
            const { data, error } = await supabase.from('books').insert(payload).select().single();
            if (data) setBooks([...books, data]);
            if (error) console.error("Error creating book:", error);
        }
        setLoading(false);
        handleCancel();
    };

    const handleDelete = async (id: string) => {
        await supabase.from('books').delete().eq('id', id);
        setBooks(books.filter(b => b.id !== id));
    };

    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <h3 className="text-xl font-semibold mb-2 flex items-center"><PlusCircle className="mr-2 h-5 w-5" /> {editingId ? 'Edit Buku' : 'Tambah Buku Baru'}</h3>
        <p className="text-sm text-muted-foreground mb-4">Masukkan informasi buku.</p>
        <div className="space-y-4">
          <div><Label htmlFor="title">Judul Buku *</Label><Input id="title" value={formData.title || ''} onChange={e => handleInputChange('title', e.target.value)} /></div>
          <div><Label htmlFor="isbn">ISBN</Label><Input id="isbn" value={formData.isbn || ''} onChange={e => handleInputChange('isbn', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="category">Kategori</Label>
              <Select value={formData.category_id || ''} onValueChange={value => handleSelectChange('category_id', value)}><SelectTrigger id="category"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="publisher">Penerbit</Label>
              <Select value={formData.publisher_id || ''} onValueChange={value => handleSelectChange('publisher_id', value)}><SelectTrigger id="publisher"><SelectValue placeholder="Pilih penerbit" /></SelectTrigger>
                <SelectContent>{publishers.map(pub => <SelectItem key={pub.id} value={pub.id}>{pub.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="year">Tahun</Label><Input id="year" type="number" value={formData.publication_year || ''} onChange={e => handleInputChange('publication_year', e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label htmlFor="pages">Halaman</Label><Input id="pages" type="number" value={formData.pages || 0} onChange={e => handleInputChange('pages', parseInt(e.target.value))} /></div>
            <div><Label htmlFor="stock">Stok</Label><Input id="stock" type="number" value={formData.stock_quantity || 1} onChange={e => handleInputChange('stock_quantity', parseInt(e.target.value))} /></div>
          </div>
          <div><Label htmlFor="description">Deskripsi</Label><Textarea id="description" value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} /></div>
          <div className="flex gap-2 !mt-6">
            {editingId && <Button variant="outline" className="w-full" onClick={handleCancel}>Batal</Button>}
            <Button className="w-full" disabled={loading} onClick={handleSubmit}>{loading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Buku')}</Button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <h3 className="text-xl font-semibold mb-4">Daftar Buku ({books.length})</h3>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {books.map(book => (
            <Card key={book.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h4 className="font-semibold">{book.title}</h4>
                <p className="text-sm text-muted-foreground">
                  ISBN: {book.isbn || '-'} | Stok: {book.available_quantity}/{book.stock_quantity} | Tahun: {book.publication_year}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(book)}><Edit className="h-4 w-4" /></Button>
                 <Dialog><DialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Anda yakin?</DialogTitle><DialogDescription>Aksi ini akan menghapus buku ini secara permanen.</DialogDescription></DialogHeader>
                        <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button variant="destructive" onClick={() => handleDelete(book.id)}>Hapus</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};


// --- Main Dashboard Component ---
export default function AdminDashboard({
  initialBooks, initialCategories, initialPublishers, initialAuthors,
}: AdminDashboardProps) {
  // 1. Impor useRouter dan createClient
  const router = useRouter();
  const supabase = createClient();

  // 2. Buat fungsi untuk menangani logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // Arahkan ke halaman login setelah logout
    router.refresh(); // Refresh untuk membersihkan state sesi
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-red-600" />
          <h1 className="text-xl font-semibold">Admin Panel - Perpustakaan Digital</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Selamat datang, Admin</span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2"/> Beranda
            </Link>
          </Button>
          {/* 3. Tambahkan onClick ke tombol Logout */}
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2"/> Logout
          </Button>
        </div>
      </header>
      <main className="p-6 space-y-6">
        <div className="flex items-start gap-4 rounded-lg bg-red-50 p-4 border-l-4 border-red-500 text-red-900" role="alert">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Area Terbatas</h3>
            <p className="text-sm">Anda berada di panel administrasi. Hanya admin yang memiliki akses ke area ini.</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
           <StatCard title="Total Buku" value={initialBooks.length} subtext={`${initialBooks.reduce((sum, book) => sum + (book.stock_quantity || 0), 0)} total stok`} icon={<Book className="h-5 w-5"/>} colorClass="bg-blue-500" />
          <StatCard title="Kategori" value={initialCategories.length} subtext="Kategori aktif" icon={<Library className="h-5 w-5"/>} colorClass="bg-green-500" />
          <StatCard title="Penerbit" value={initialPublishers.length} subtext="Penerbit terdaftar" icon={<Building className="h-5 w-5"/>} colorClass="bg-purple-500" />
          <StatCard title="Penulis" value={initialAuthors.length} subtext="Penulis terdaftar" icon={<User className="h-5 w-5"/>} colorClass="bg-orange-500" />
        </div>
        
        <Tabs defaultValue="books" className="bg-white p-6 rounded-xl shadow-sm border">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="books">Manajemen Buku</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
            <TabsTrigger value="publishers">Penerbit</TabsTrigger>
            <TabsTrigger value="authors">Penulis</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="mt-6">
            <BooksManager initialBooks={initialBooks} categories={initialCategories} publishers={initialPublishers} />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CrudManager 
              entityName="Kategori" pluralEntityName="categories" initialItems={initialCategories}
              formFields={[
                { name: 'name', label: 'Nama Kategori *', placeholder: 'Fiksi, Sejarah, dll.' },
                { name: 'description', label: 'Deskripsi', placeholder: 'Deskripsi singkat...', component: 'textarea' }
              ]}
              displayFields={[{ name: 'description' }]}
            />
          </TabsContent>

          <TabsContent value="publishers" className="mt-6">
            <CrudManager 
              entityName="Penerbit" pluralEntityName="publishers" initialItems={initialPublishers}
              formFields={[
                { name: 'name', label: 'Nama Penerbit *', placeholder: 'Gramedia Pustaka Utama' },
                { name: 'address', label: 'Alamat', placeholder: 'Jl. Palmerah Barat...', component: 'textarea' },
                { name: 'email', label: 'Email', placeholder: 'kontak@gramedia.com', type: 'email' }
              ]}
              displayFields={[{ name: 'address' }]}
            />
          </TabsContent>

           <TabsContent value="authors" className="mt-6">
            <CrudManager 
              entityName="Penulis" pluralEntityName="authors" initialItems={initialAuthors}
              formFields={[
                { name: 'name', label: 'Nama Penulis *', placeholder: 'Tere Liye' },
                { name: 'nationality', label: 'Kebangsaan', placeholder: 'Indonesia' },
                { name: 'biography', label: 'Biografi', placeholder: 'Biografi singkat...', component: 'textarea' }
              ]}
              displayFields={[{ name: 'nationality' }]}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}