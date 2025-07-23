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

interface Book {
  id: number
  title: string
  isbn: string
  category_id: number
  publisher_id: number
  publication_year: number
  pages: number
  stock_quantity: number
  available_quantity: number
  description: string
}

interface Category {
  id: number
  name: string
  description: string
}

interface Publisher {
  id: number
  name: string
  address: string
  email: string
}

interface Author {
  id: number
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
  const [loading, setLoading] = useState(false)

  // Form states
  const [newBook, setNewBook] = useState({
    title: "",
    isbn: "",
    category_id: 1,
    publisher_id: 1,
    publication_year: 2024,
    pages: 0,
    stock_quantity: 1,
    description: "",
  })

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  })

  const [newPublisher, setNewPublisher] = useState({
    name: "",
    address: "",
    email: "",
  })

  const [newAuthor, setNewAuthor] = useState({
    name: "",
    biography: "",
    nationality: "",
  })

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const checkAuthentication = () => {
    // Check if admin is logged in (simple localStorage check)
    const adminAuth = localStorage.getItem("admin_authenticated")
    if (adminAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    // Simple authentication check
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
    setLoading(true)
    try {
      const [booksRes, categoriesRes, publishersRes, authorsRes] = await Promise.all([
        supabase.from("books").select("*").order("title"),
        supabase.from("categories").select("*").order("name"),
        supabase.from("publishers").select("*").order("name"),
        supabase.from("authors").select("*").order("name"),
      ])

      if (booksRes.data) setBooks(booksRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (publishersRes.data) setPublishers(publishersRes.data)
      if (authorsRes.data) setAuthors(authorsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const addBook = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .insert([
          {
            ...newBook,
            available_quantity: newBook.stock_quantity,
          },
        ])
        .select()

      if (error) throw error

      if (data) {
        setBooks([...books, data[0]])
        setNewBook({
          title: "",
          isbn: "",
          category_id: 1,
          publisher_id: 1,
          publication_year: 2024,
          pages: 0,
          stock_quantity: 1,
          description: "",
        })
        alert("Buku berhasil ditambahkan!")
      }
    } catch (error) {
      console.error("Error adding book:", error)
      alert("Gagal menambahkan buku")
    }
  }

  const addCategory = async () => {
    try {
      const { data, error } = await supabase.from("categories").insert([newCategory]).select()

      if (error) throw error

      if (data) {
        setCategories([...categories, data[0]])
        setNewCategory({ name: "", description: "" })
        alert("Kategori berhasil ditambahkan!")
      }
    } catch (error) {
      console.error("Error adding category:", error)
      alert("Gagal menambahkan kategori")
    }
  }

  const addPublisher = async () => {
    try {
      const { data, error } = await supabase.from("publishers").insert([newPublisher]).select()

      if (error) throw error

      if (data) {
        setPublishers([...publishers, data[0]])
        setNewPublisher({ name: "", address: "", email: "" })
        alert("Penerbit berhasil ditambahkan!")
      }
    } catch (error) {
      console.error("Error adding publisher:", error)
      alert("Gagal menambahkan penerbit")
    }
  }

  const addAuthor = async () => {
    try {
      const { data, error } = await supabase.from("authors").insert([newAuthor]).select()

      if (error) throw error

      if (data) {
        setAuthors([...authors, data[0]])
        setNewAuthor({ name: "", biography: "", nationality: "" })
        alert("Penulis berhasil ditambahkan!")
      }
    } catch (error) {
      console.error("Error adding author:", error)
      alert("Gagal menambahkan penulis")
    }
  }

  const deleteBook = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus buku ini?")) return

    try {
      const { error } = await supabase.from("books").delete().eq("id", id)

      if (error) throw error

      setBooks(books.filter((book) => book.id !== id))
      alert("Buku berhasil dihapus!")
    } catch (error) {
      console.error("Error deleting book:", error)
      alert("Gagal menghapus buku")
    }
  }

  const deleteCategory = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      setCategories(categories.filter((category) => category.id !== id))
      alert("Kategori berhasil dihapus!")
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Gagal menghapus kategori")
    }
  }

  // Loading state
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

  // Login form
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

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <ArrowLeft className="h-4 w-4 mr-2" />
                Beranda
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Area Terbatas</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Anda berada di panel administrasi. Hanya admin yang memiliki akses ke area ini.
          </p>
        </div>

        {/* Stats Cards */}
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

        {/* Management Tabs */}
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
              {/* Add Book Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Tambah Buku Baru
                  </CardTitle>
                  <CardDescription>Masukkan informasi buku yang akan ditambahkan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Buku *</Label>
                    <Input
                      id="title"
                      value={newBook.title}
                      onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                      placeholder="Masukkan judul buku"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={newBook.isbn}
                      onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                      placeholder="978-xxx-xxx-xxx-x"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={newBook.category_id.toString()}
                        onValueChange={(value) => setNewBook({ ...newBook, category_id: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="publisher">Penerbit</Label>
                      <Select
                        value={newBook.publisher_id.toString()}
                        onValueChange={(value) => setNewBook({ ...newBook, publisher_id: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih penerbit" />
                        </SelectTrigger>
                        <SelectContent>
                          {publishers.map((publisher) => (
                            <SelectItem key={publisher.id} value={publisher.id.toString()}>
                              {publisher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="year">Tahun</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newBook.publication_year}
                        onChange={(e) => setNewBook({ ...newBook, publication_year: Number.parseInt(e.target.value) })}
                        min="1900"
                        max="2030"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pages">Halaman</Label>
                      <Input
                        id="pages"
                        type="number"
                        value={newBook.pages}
                        onChange={(e) => setNewBook({ ...newBook, pages: Number.parseInt(e.target.value) })}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stok</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newBook.stock_quantity}
                        onChange={(e) => setNewBook({ ...newBook, stock_quantity: Number.parseInt(e.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={newBook.description}
                      onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                      placeholder="Deskripsi buku"
                      rows={3}
                    />
                  </div>
                  <Button onClick={addBook} className="w-full" disabled={!newBook.title}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Buku
                  </Button>
                </CardContent>
              </Card>

              {/* Books List */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Buku ({books.length})</CardTitle>
                  <CardDescription>Kelola koleksi buku perpustakaan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-gray-600">ISBN: {book.isbn || "N/A"}</p>
                          <p className="text-sm text-gray-600">
                            Stok: {book.available_quantity}/{book.stock_quantity} | Tahun: {book.publication_year}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteBook(book.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {books.length === 0 && (
                      <div className="text-center py-8 text-gray-500">Belum ada buku yang ditambahkan</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Management */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Category Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Tambah Kategori Baru
                  </CardTitle>
                  <CardDescription>Buat kategori baru untuk mengorganisir buku</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Nama Kategori *</Label>
                    <Input
                      id="categoryName"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="Masukkan nama kategori"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">Deskripsi</Label>
                    <Textarea
                      id="categoryDescription"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Deskripsi kategori"
                      rows={3}
                    />
                  </div>
                  <Button onClick={addCategory} className="w-full" disabled={!newCategory.name}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kategori
                  </Button>
                </CardContent>
              </Card>

              {/* Categories List */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Kategori ({categories.length})</CardTitle>
                  <CardDescription>Kelola kategori buku</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description || "Tidak ada deskripsi"}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="text-center py-8 text-gray-500">Belum ada kategori yang ditambahkan</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Publishers Management */}
          <TabsContent value="publishers">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Publisher Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Tambah Penerbit Baru
                  </CardTitle>
                  <CardDescription>Daftarkan penerbit buku baru</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="publisherName">Nama Penerbit *</Label>
                    <Input
                      id="publisherName"
                      value={newPublisher.name}
                      onChange={(e) => setNewPublisher({ ...newPublisher, name: e.target.value })}
                      placeholder="Masukkan nama penerbit"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="publisherAddress">Alamat</Label>
                    <Textarea
                      id="publisherAddress"
                      value={newPublisher.address}
                      onChange={(e) => setNewPublisher({ ...newPublisher, address: e.target.value })}
                      placeholder="Alamat penerbit"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="publisherEmail">Email</Label>
                    <Input
                      id="publisherEmail"
                      type="email"
                      value={newPublisher.email}
                      onChange={(e) => setNewPublisher({ ...newPublisher, email: e.target.value })}
                      placeholder="email@penerbit.com"
                    />
                  </div>
                  <Button onClick={addPublisher} className="w-full" disabled={!newPublisher.name}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Penerbit
                  </Button>
                </CardContent>
              </Card>

              {/* Publishers List */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Penerbit ({publishers.length})</CardTitle>
                  <CardDescription>Kelola informasi penerbit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {publishers.map((publisher) => (
                      <div
                        key={publisher.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{publisher.name}</h4>
                          <p className="text-sm text-gray-600">{publisher.address || "Alamat tidak tersedia"}</p>
                          <p className="text-sm text-gray-600">{publisher.email || "Email tidak tersedia"}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {publishers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">Belum ada penerbit yang ditambahkan</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Authors Management */}
          <TabsContent value="authors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Author Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Tambah Penulis Baru
                  </CardTitle>
                  <CardDescription>Daftarkan penulis buku baru</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="authorName">Nama Penulis *</Label>
                    <Input
                      id="authorName"
                      value={newAuthor.name}
                      onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                      placeholder="Masukkan nama penulis"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorNationality">Kebangsaan</Label>
                    <Input
                      id="authorNationality"
                      value={newAuthor.nationality}
                      onChange={(e) => setNewAuthor({ ...newAuthor, nationality: e.target.value })}
                      placeholder="Kebangsaan penulis"
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorBiography">Biografi</Label>
                    <Textarea
                      id="authorBiography"
                      value={newAuthor.biography}
                      onChange={(e) => setNewAuthor({ ...newAuthor, biography: e.target.value })}
                      placeholder="Biografi singkat penulis"
                      rows={3}
                    />
                  </div>
                  <Button onClick={addAuthor} className="w-full" disabled={!newAuthor.name}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Penulis
                  </Button>
                </CardContent>
              </Card>

              {/* Authors List */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Penulis ({authors.length})</CardTitle>
                  <CardDescription>Kelola informasi penulis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {authors.map((author) => (
                      <div
                        key={author.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{author.name}</h4>
                          <p className="text-sm text-gray-600">{author.nationality || "Kebangsaan tidak diketahui"}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {author.biography || "Biografi tidak tersedia"}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {authors.length === 0 && (
                      <div className="text-center py-8 text-gray-500">Belum ada penulis yang ditambahkan</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
