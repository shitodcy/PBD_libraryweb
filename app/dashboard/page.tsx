"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Download,
  RefreshCw,
  Bell,
  Settings,
  LogOut,
  AlertCircle,
} from "lucide-react"
import { getCurrentUser, getUserProfile, signOut } from "@/lib/auth"
import { getUserBorrowings, getBorrowingHistory, extendBorrowing, returnBook } from "@/lib/borrowing"
import type { Borrowing } from "@/lib/borrowing"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  gender?: string
  role: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [borrowedBooks, setBorrowedBooks] = useState<Borrowing[]>([])
  const [borrowingHistory, setBorrowingHistory] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }

      const profile = await getUserProfile(currentUser.id)
      if (profile) {
        setUser(profile)

        // Load borrowing data
        const [borrowed, history] = await Promise.all([
          getUserBorrowings(currentUser.id),
          getBorrowingHistory(currentUser.id),
        ])

        setBorrowedBooks(borrowed)
        setBorrowingHistory(history)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRenewBook = async (borrowingId: string) => {
    try {
      const result = await extendBorrowing(borrowingId)

      if (result.success) {
        alert(result.message)
        await loadUserData() // Refresh data
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Gagal memperpanjang peminjaman")
    }
  }

  const handleReturnBook = async (borrowingId: string) => {
    if (!confirm("Apakah Anda yakin ingin mengembalikan buku ini?")) return

    try {
      const result = await returnBook(borrowingId)

      if (result.success) {
        alert(result.message)
        await loadUserData() // Refresh data
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Gagal mengembalikan buku")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (status === "returned") {
      return <Badge variant="secondary">Dikembalikan</Badge>
    } else if (status === "overdue" || diffDays < 0) {
      return <Badge variant="destructive">Terlambat</Badge>
    } else if (diffDays <= 3) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
          Segera Jatuh Tempo
        </Badge>
      )
    } else {
      return <Badge variant="default">Aktif</Badge>
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">Anda harus login untuk mengakses dashboard</p>
            <Button asChild className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeBorrowings = borrowedBooks.filter((b) => b.status === "active")
  const overdueBorrowings = borrowedBooks.filter((b) => {
    const dueDate = new Date(b.due_date)
    return b.status === "active" && dueDate < new Date()
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-gray-600">Beranda</span>
              </Link>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/catalog">
                <Button variant="outline">Katalog</Button>
              </Link>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="text-lg">
                    {user.first_name?.[0]}
                    {user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>
                  {user.first_name} {user.last_name}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {user.role === "member" ? "Anggota" : user.role}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{borrowingHistory.length}</div>
                      <div className="text-xs text-gray-500">Total Dipinjam</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{activeBorrowings.length}</div>
                      <div className="text-xs text-gray-500">Sedang Dipinjam</div>
                    </div>
                  </div>

                  {overdueBorrowings.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center text-red-700">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{overdueBorrowings.length} buku terlambat</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/profile">
                        <Settings className="mr-2 h-4 w-4" />
                        Pengaturan Profil
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat datang, {user.first_name}!</h2>
              <p className="text-gray-600">Kelola peminjaman buku dan aktivitas perpustakaan Anda</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Dipinjam</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{borrowingHistory.length}</div>
                  <p className="text-xs text-muted-foreground">Sepanjang waktu</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sedang Dipinjam</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeBorrowings.length}</div>
                  <p className="text-xs text-muted-foreground">Buku aktif</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overdueBorrowings.length}</div>
                  <p className="text-xs text-muted-foreground">Perlu dikembalikan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Aktif</div>
                  <p className="text-xs text-muted-foreground">Anggota {user.role}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                <TabsTrigger value="borrowed">Dipinjam ({activeBorrowings.length})</TabsTrigger>
                <TabsTrigger value="history">Riwayat</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Buku Sedang Dipinjam</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activeBorrowings.slice(0, 3).map((borrowing) => (
                          <div key={borrowing.id} className="flex items-center space-x-4">
                            <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                              {borrowing.books?.cover_url ? (
                                <img
                                  src={borrowing.books.cover_url || "/placeholder.svg"}
                                  alt={borrowing.books.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <BookOpen className="h-6 w-6 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{borrowing.books?.title}</h4>
                              <p className="text-sm text-gray-600">
                                {borrowing.books?.book_authors?.[0]?.authors?.first_name}{" "}
                                {borrowing.books?.book_authors?.[0]?.authors?.last_name}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {getStatusBadge(borrowing.status, borrowing.due_date)}
                                <span className="text-xs text-gray-500">
                                  {getDaysUntilDue(borrowing.due_date) < 0
                                    ? `Terlambat ${Math.abs(getDaysUntilDue(borrowing.due_date))} hari`
                                    : `${getDaysUntilDue(borrowing.due_date)} hari lagi`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {activeBorrowings.length === 0 && (
                          <div className="text-center py-4">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Tidak ada buku yang dipinjam</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {borrowingHistory.slice(0, 5).map((borrowing, index) => (
                          <div key={borrowing.id} className="flex items-center space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                borrowing.status === "returned"
                                  ? "bg-green-600"
                                  : borrowing.status === "overdue"
                                    ? "bg-red-600"
                                    : "bg-blue-600"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-sm">
                                {borrowing.status === "returned" ? "Mengembalikan" : "Meminjam"} "
                                {borrowing.books?.title}"
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(borrowing.borrowed_at).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                          </div>
                        ))}
                        {borrowingHistory.length === 0 && (
                          <div className="text-center py-4">
                            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Belum ada aktivitas</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="borrowed" className="space-y-6">
                <div className="space-y-4">
                  {activeBorrowings.map((borrowing) => (
                    <Card key={borrowing.id}>
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="w-20 h-28 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                            {borrowing.books?.cover_url ? (
                              <img
                                src={borrowing.books.cover_url || "/placeholder.svg"}
                                alt={borrowing.books.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <BookOpen className="h-8 w-8 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{borrowing.books?.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {borrowing.books?.book_authors?.[0]?.authors?.first_name}{" "}
                              {borrowing.books?.book_authors?.[0]?.authors?.last_name}
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Dipinjam:</span>
                                <span>{new Date(borrowing.borrowed_at).toLocaleDateString("id-ID")}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Jatuh Tempo:</span>
                                <span>{new Date(borrowing.due_date).toLocaleDateString("id-ID")}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Status:</span>
                                {getStatusBadge(borrowing.status, borrowing.due_date)}
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRenewBook(borrowing.id)}
                                disabled={borrowing.renewal_count >= 2}
                              >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Perpanjang ({borrowing.renewal_count || 0}/2)
                              </Button>
                              <Button size="sm" onClick={() => handleReturnBook(borrowing.id)}>
                                Kembalikan
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/book/${borrowing.book_id}`}>Lihat Detail</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {activeBorrowings.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada buku yang dipinjam</h3>
                      <p className="text-gray-600 mb-4">Mulai jelajahi katalog untuk meminjam buku</p>
                      <Link href="/catalog">
                        <Button>Jelajahi Katalog</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Riwayat Peminjaman</CardTitle>
                    <CardDescription>Semua buku yang pernah Anda pinjam</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {borrowingHistory.map((borrowing) => (
                        <div key={borrowing.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                              {borrowing.books?.cover_url ? (
                                <img
                                  src={borrowing.books.cover_url || "/placeholder.svg"}
                                  alt={borrowing.books.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <BookOpen className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{borrowing.books?.title}</h4>
                              <p className="text-sm text-gray-600">
                                {borrowing.books?.book_authors?.[0]?.authors?.first_name}{" "}
                                {borrowing.books?.book_authors?.[0]?.authors?.last_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(borrowing.borrowed_at).toLocaleDateString("id-ID")} -{" "}
                                {borrowing.returned_at
                                  ? new Date(borrowing.returned_at).toLocaleDateString("id-ID")
                                  : new Date(borrowing.due_date).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(borrowing.status, borrowing.due_date)}
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/book/${borrowing.book_id}`}>Lihat Detail</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      {borrowingHistory.length === 0 && (
                        <div className="text-center py-12">
                          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada riwayat</h3>
                          <p className="text-gray-600 mb-4">Mulai meminjam buku untuk melihat riwayat</p>
                          <Link href="/catalog">
                            <Button>Jelajahi Katalog</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
