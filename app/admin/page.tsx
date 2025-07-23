"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Users, Building, User, Plus, Edit, Trash2, ArrowLeft, Shield, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

// --- INTERFACES (Tipe Data) ---
// Pastikan tipe ID (number/string) sesuai dengan skema database Anda.
interface Book {
  id: number | string
  title: string
  isbn: string
  category_id: number | string
  publisher_id: number | string
  publication_year: number
  pages: number
  stock_quantity: number
  available_quantity: number
  description: string
}

interface Category {
  id: number | string
  name: string
  description: string
}

interface Publisher {
  id: number | string
  name: string
  address: string
  email: string
}

interface Author {
  id: number | string
  name: string
  biography: string
  nationality: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")

  // Data states
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // --- State untuk Edit Mode & Forms ---
  const [isEditMode, setIsEditMode] = useState({ book: false, category: false, publisher: false, author: false })
  const [editingId, setEditingId] = useState<number | string | null>(null)

  const initialBookFormState = { title: "", isbn: "", category_id: "", publisher_id: "", publication_year: new Date().getFullYear(), pages: 0, stock_quantity: 1, description: "" }
  const [bookForm, setBookForm] = useState(initialBookFormState)
  
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })
  const [publisherForm, setPublisherForm] = useState({ name: "", address: "", email: "" })
  const [authorForm, setAuthorForm] = useState({ name: "", biography: "", nationality: "" })

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const checkAuthentication = () => {
    const adminAuth = localStorage.getItem("admin_authenticated")
    if (adminAuth === "true") setIsAuthenticated(true)
    setIsLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (loginForm.username === "admin" && loginForm.password === "admin123") {
      localStorage.setItem("admin_authenticated", "true")
      setIsAuthenticated(true)
    } else {
      setLoginError("Username atau password salah")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    setIsAuthenticated(false)
    setLoginForm({ username: "", password: "" })
  }

  const fetchData = async () => {
    setLoadingData(true)
    try {
      const [booksRes, categoriesRes, publishersRes, authorsRes] = await Promise.all([
        supabase.from("books").select("*").order("title"),
        supabase.from("categories").select("*").order("name"),
        supabase.from("publishers").select("*").order("name"),
        supabase.from("authors").select("*").order("name"),
      ])
      if (booksRes.data) setBooks(booksRes.data as Book[])
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[])
      if (publishersRes.data) setPublishers(publishersRes.data as Publisher[])
      if (authorsRes.data) setAuthors(authorsRes.data as Author[])
    } catch (error) { console.error("Error fetching data:", error) } 
    finally { setLoadingData(false) }
  }

  // --- Generic Cancel Edit ---
  const cancelEdit = (entity: 'book' | 'category' | 'publisher' | 'author') => {
    setIsEditMode(prev => ({ ...prev, [entity]: false }));
    setEditingId(null);
    if (entity === 'book') setBookForm(initialBookFormState);
    if (entity === 'category') setCategoryForm({ name: "", description: "" });
    if (entity === 'publisher') setPublisherForm({ name: "", address: "", email: "" });
    if (entity === 'author') setAuthorForm({ name: "", biography: "", nationality: "" });
  };
  
  // --- BOOK CRUD ---
  const handleBookSubmit = () => isEditMode.book ? updateBook() : addBook();
  const addBook = async () => {
    const { data, error } = await supabase.from("books").insert([{ ...bookForm, available_quantity: bookForm.stock_quantity }]).select().single();
    if (error) { alert("Gagal menambahkan buku"); console.error(error); }
    else if (data) { setBooks([...books, data as Book]); setBookForm(initialBookFormState); alert("Buku berhasil ditambahkan!"); }
  };
  const handleEditBook = (book: Book) => {
    setIsEditMode({ book: true, category: false, publisher: false, author: false });
    setEditingId(book.id);
    setBookForm({ ...book, category_id: String(book.category_id), publisher_id: String(book.publisher_id) });
    const booksTab = document.querySelector('button[data-radix-collection-item][value="books"]') as HTMLButtonElement;
    if (booksTab) booksTab.click();
  };
  const updateBook = async () => {
    const { data, error } = await supabase.from("books").update({ ...bookForm, available_quantity: bookForm.stock_quantity }).eq("id", editingId).select().single();
    if (error) { alert("Gagal memperbarui buku"); console.error(error); }
    else if (data) { setBooks(books.map(b => b.id === editingId ? data as Book : b)); cancelEdit('book'); alert("Buku berhasil diperbarui!"); }
  };
  const deleteBook = async (id: number | string) => {
    if (!confirm("Yakin ingin menghapus buku ini?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) { alert("Gagal menghapus buku"); console.error(error); }
    else { setBooks(books.filter(b => b.id !== id)); alert("Buku berhasil dihapus!"); }
  };

  // --- CATEGORY CRUD ---
  const handleCategorySubmit = () => isEditMode.category ? updateCategory() : addCategory();
  const addCategory = async () => {
    const { data, error } = await supabase.from("categories").insert([categoryForm]).select().single();
    if (error) { alert("Gagal menambahkan kategori"); console.error(error); }
    else if (data) { setCategories([...categories, data as Category]); cancelEdit('category'); alert("Kategori berhasil ditambahkan!"); }
  };
  const handleEditCategory = (category: Category) => {
    setIsEditMode({ book: false, category: true, publisher: false, author: false });
    setEditingId(category.id);
    setCategoryForm(category);
  };
  const updateCategory = async () => {
    const { data, error } = await supabase.from("categories").update(categoryForm).eq("id", editingId).select().single();
    if (error) { alert("Gagal memperbarui kategori"); console.error(error); }
    else if (data) { setCategories(categories.map(c => c.id === editingId ? data as Category : c)); cancelEdit('category'); alert("Kategori berhasil diperbarui!"); }
  };
  const deleteCategory = async (id: number | string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { alert("Gagal menghapus kategori."); console.error(error); }
    else { setCategories(categories.filter(c => c.id !== id)); alert("Kategori berhasil dihapus!"); }
  };

  // --- PUBLISHER CRUD ---
  const handlePublisherSubmit = () => isEditMode.publisher ? updatePublisher() : addPublisher();
  const addPublisher = async () => {
      const { data, error } = await supabase.from("publishers").insert([publisherForm]).select().single();
      if (error) { alert("Gagal menambahkan penerbit"); console.error(error); }
      else if (data) { setPublishers([...publishers, data as Publisher]); cancelEdit('publisher'); alert("Penerbit berhasil ditambahkan!"); }
  };
  const handleEditPublisher = (publisher: Publisher) => {
      setIsEditMode({ book: false, category: false, publisher: true, author: false });
      setEditingId(publisher.id);
      setPublisherForm(publisher);
  };
  const updatePublisher = async () => {
      const { data, error } = await supabase.from("publishers").update(publisherForm).eq("id", editingId).select().single();
      if (error) { alert("Gagal memperbarui penerbit"); console.error(error); }
      else if (data) { setPublishers(publishers.map(p => p.id === editingId ? data as Publisher : p)); cancelEdit('publisher'); alert("Penerbit berhasil diperbarui!"); }
  };
  const deletePublisher = async (id: number | string) => {
    if (!confirm("Yakin ingin menghapus penerbit ini?")) return;
    const { error } = await supabase.from("publishers").delete().eq("id", id);
    if (error) { alert("Gagal menghapus penerbit."); console.error(error); }
    else { setPublishers(publishers.filter(p => p.id !== id)); alert("Penerbit berhasil dihapus!"); }
  };

  // --- AUTHOR CRUD ---
  const handleAuthorSubmit = () => isEditMode.author ? updateAuthor() : addAuthor();
  const addAuthor = async () => {
    const { data, error } = await supabase.from("authors").insert([authorForm]).select().single();
    if (error) { alert("Gagal menambahkan penulis"); console.error(error); }
    else if (data) { setAuthors([...authors, data as Author]); cancelEdit('author'); alert("Penulis berhasil ditambahkan!"); }
  };
  const handleEditAuthor = (author: Author) => {
      setIsEditMode({ book: false, category: false, publisher: false, author: true });
      setEditingId(author.id);
      setAuthorForm(author);
  };
  const updateAuthor = async () => {
      const { data, error } = await supabase.from("authors").update(authorForm).eq("id", editingId).select().single();
      if (error) { alert("Gagal memperbarui penulis"); console.error(error); }
      else if (data) { setAuthors(authors.map(a => a.id === editingId ? data as Author : a)); cancelEdit('author'); alert("Penulis berhasil diperbarui!"); }
  };
  const deleteAuthor = async (id: number | string) => {
    if (!confirm("Yakin ingin menghapus penulis ini?")) return;
    const { error } = await supabase.from("authors").delete().eq("id", id);
    if (error) { alert("Gagal menghapus penulis."); console.error(error); }
    else { setAuthors(authors.filter(a => a.id !== id)); alert("Penulis berhasil dihapus!"); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Masukkan kredensial admin untuk mengakses panel administrasi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Masukkan username admin"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Masukkan password admin"
                />
              </div>
              {loginError && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{loginError}</span>
                </div>
              )}
              <Button type="submit" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Login Admin
              </Button>
            </form>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <p className="text-sm text-blue-700">Username: admin</p>
              <p className="text-sm text-blue-700">Password: admin123</p>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b-2 border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel - Perpustakaan Digital</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Selamat datang, Admin</span>
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Beranda
              </Button>
              <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Area Terbatas</span>
          </div>
          <p className="text-red-700 text-sm mt-1">Anda berada di panel administrasi. Hanya admin yang memiliki akses ke area ini.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Buku</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{books.length}</div>
                <p className="text-xs text-muted-foreground">
                    {books.reduce((sum, book) => sum + book.stock_quantity, 0)} total stok
                </p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kategori</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-muted-foreground">Kategori aktif</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Penerbit</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{publishers.length}</div>
                <p className="text-xs text-muted-foreground">Penerbit terdaftar</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Penulis</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{authors.length}</div>
                <p className="text-xs text-muted-foreground">Penulis terdaftar</p>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="books" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="books">Manajemen Buku</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
            <TabsTrigger value="publishers">Penerbit</TabsTrigger>
            <TabsTrigger value="authors">Penulis</TabsTrigger>
          </TabsList>

          {/* Books Management */}
          <TabsContent value="books">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {isEditMode.book ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                    {isEditMode.book ? 'Edit Buku' : 'Tambah Buku Baru'}
                  </CardTitle>
                  <CardDescription>
                    {isEditMode.book ? `Anda sedang mengedit: ${bookForm.title}` : 'Masukkan informasi buku yang akan ditambahkan'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Buku *</Label>
                    <Input id="title" value={bookForm.title} onChange={(e) => setBookForm({...bookForm, title: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input id="isbn" value={bookForm.isbn} onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <Select value={String(bookForm.category_id)} onValueChange={(value) => setBookForm({...bookForm, category_id: value})}>
                        <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="publisher">Penerbit</Label>
                      <Select value={String(bookForm.publisher_id)} onValueChange={(value) => setBookForm({...bookForm, publisher_id: value})}>
                         <SelectTrigger><SelectValue placeholder="Pilih penerbit" /></SelectTrigger>
                         <SelectContent>
                           {publishers.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
                         </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Tahun</Label><Input type="number" value={bookForm.publication_year} onChange={(e) => setBookForm({...bookForm, publication_year: Number(e.target.value)})} /></div>
                    <div><Label>Halaman</Label><Input type="number" value={bookForm.pages} onChange={(e) => setBookForm({...bookForm, pages: Number(e.target.value)})} /></div>
                    <div><Label>Stok</Label><Input type="number" value={bookForm.stock_quantity} onChange={(e) => setBookForm({...bookForm, stock_quantity: Number(e.target.value)})} /></div>
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" value={bookForm.description} onChange={(e) => setBookForm({...bookForm, description: e.target.value})} rows={3} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleBookSubmit} className="flex-1" disabled={!bookForm.title}>
                        {isEditMode.book ? 'Simpan Perubahan' : <><Plus className="h-4 w-4 mr-2" /> Tambah Buku</>}
                    </Button>
                    {isEditMode.book && (<Button variant="outline" onClick={() => cancelEdit('book')}>Batal</Button>)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Daftar Buku ({books.length})</CardTitle></CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                  {books.map((book) => (
                    <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-semibold">{book.title}</h4>
                        <p className="text-sm text-gray-600">ISBN: {book.isbn || "N/A"}</p>
                        <p className="text-sm text-gray-600">Stok: {book.available_quantity}/{book.stock_quantity} | Tahun: {book.publication_year}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditBook(book)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteBook(book.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {isEditMode.category ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                    {isEditMode.category ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Nama Kategori *</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required /></div>
                  <div><Label>Deskripsi</Label><Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={3} /></div>
                  <div className="flex gap-2">
                    <Button onClick={handleCategorySubmit} className="flex-1" disabled={!categoryForm.name}>{isEditMode.category ? 'Simpan' : 'Tambah'}</Button>
                    {isEditMode.category && <Button variant="outline" onClick={() => cancelEdit('category')}>Batal</Button>}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Daftar Kategori ({categories.length})</CardTitle></CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex-1">
                        <h4 className="font-semibold">{cat.name}</h4>
                        <p className="text-sm text-gray-600">{cat.description || "Tidak ada deskripsi"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCategory(cat)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCategory(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="publishers">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader><CardTitle>{isEditMode.publisher ? 'Edit Penerbit' : 'Tambah Penerbit Baru'}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div><Label>Nama Penerbit *</Label><Input value={publisherForm.name} onChange={(e) => setPublisherForm({ ...publisherForm, name: e.target.value })} required /></div>
                        <div><Label>Alamat</Label><Textarea value={publisherForm.address} onChange={(e) => setPublisherForm({ ...publisherForm, address: e.target.value })} rows={2}/></div>
                        <div><Label>Email</Label><Input type="email" value={publisherForm.email} onChange={(e) => setPublisherForm({ ...publisherForm, email: e.target.value })} /></div>
                        <div className="flex gap-2">
                           <Button onClick={handlePublisherSubmit} className="flex-1" disabled={!publisherForm.name}>{isEditMode.publisher ? 'Simpan' : 'Tambah'}</Button>
                           {isEditMode.publisher && <Button variant="outline" onClick={() => cancelEdit('publisher')}>Batal</Button>}
                        </div>
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader><CardTitle>Daftar Penerbit ({publishers.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                        {publishers.map((pub) => (
                            <div key={pub.id} className="flex justify-between items-center p-2 border rounded">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{pub.name}</h4>
                                  <p className="text-sm text-gray-600">{pub.address || "Alamat tidak tersedia"}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEditPublisher(pub)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="destructive" onClick={() => deletePublisher(pub.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                 </Card>
             </div>
          </TabsContent>

          <TabsContent value="authors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>{isEditMode.author ? 'Edit Penulis' : 'Tambah Penulis Baru'}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div><Label>Nama Penulis *</Label><Input value={authorForm.name} onChange={(e) => setAuthorForm({...authorForm, name: e.target.value})} required /></div>
                        <div><Label>Kebangsaan</Label><Input value={authorForm.nationality} onChange={(e) => setAuthorForm({...authorForm, nationality: e.target.value})} /></div>
                        <div><Label>Biografi</Label><Textarea value={authorForm.biography} onChange={(e) => setAuthorForm({...authorForm, biography: e.target.value})} rows={3}/></div>
                        <div className="flex gap-2">
                           <Button onClick={handleAuthorSubmit} className="flex-1" disabled={!authorForm.name}>{isEditMode.author ? 'Simpan' : 'Tambah'}</Button>
                           {isEditMode.author && <Button variant="outline" onClick={() => cancelEdit('author')}>Batal</Button>}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Daftar Penulis ({authors.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                        {authors.map((auth) => (
                            <div key={auth.id} className="flex justify-between items-center p-2 border rounded">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{auth.name}</h4>
                                  <p className="text-sm text-gray-600">{auth.nationality || "Kebangsaan tidak diketahui"}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEditAuthor(auth)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteAuthor(auth.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}