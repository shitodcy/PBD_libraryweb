import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Search, Star, Clock, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Perpustakaan Digital</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/catalog">
                <Button variant="ghost">Katalog Buku</Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost">Tentang</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/admin">
                <Button>Admin Panel</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Selamat Datang di Perpustakaan Digital</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Sistem manajemen perpustakaan modern dengan fitur lengkap untuk mengelola koleksi buku, anggota, dan
            peminjaman secara digital dan efisien.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link href="/catalog">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Search className="mr-2 h-5 w-5" />
                Jelajahi Katalog
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buku</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+20% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anggota Aktif</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">+12% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buku Dipinjam</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Hari ini</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">Dari 234 review</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Fitur Unggulan</h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                  Manajemen Buku Lengkap
                </CardTitle>
                <CardDescription>
                  Kelola koleksi buku dengan mudah, termasuk kategori, penulis, penerbit, dan informasi detail lainnya.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  Sistem Keanggotaan
                </CardTitle>
                <CardDescription>
                  Registrasi dan manajemen anggota dengan berbagai level akses: admin, pustakawan, dan anggota.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-6 w-6 text-orange-600 mr-2" />
                  Peminjaman Digital
                </CardTitle>
                <CardDescription>
                  Sistem peminjaman dan pengembalian otomatis dengan tracking, reminder, dan perhitungan denda.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-6 w-6 text-purple-600 mr-2" />
                  Pencarian Canggih
                </CardTitle>
                <CardDescription>
                  Cari buku berdasarkan judul, penulis, kategori, ISBN, atau kata kunci dengan hasil yang akurat.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-red-600 mr-2" />
                  Laporan & Analitik
                </CardTitle>
                <CardDescription>
                  Dashboard komprehensif dengan statistik, laporan peminjaman, dan analisis tren perpustakaan.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-6 w-6 text-yellow-600 mr-2" />
                  Review & Rating
                </CardTitle>
                <CardDescription>
                  Sistem review dan rating buku dari anggota untuk membantu rekomendasi dan evaluasi koleksi.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Popular Books Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Buku Populer</h3>
            <Link href="/catalog">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-16 w-16 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Laskar Pelangi</CardTitle>
                <CardDescription>Andrea Hirata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Tersedia</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle className="text-lg">Bumi Manusia</CardTitle>
                <CardDescription>Pramoedya Ananta Toer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Tersedia</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-16 w-16 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Negeri 5 Menara</CardTitle>
                <CardDescription>Ahmad Fuadi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">4.7</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Tersedia</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Mulai Perjalanan Membaca Anda</h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pembaca lainnya dan nikmati akses ke koleksi buku terlengkap dengan sistem
            perpustakaan digital yang modern dan mudah digunakan.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Daftar Gratis
              </Button>
            </Link>
            <Link href="/catalog">
              <Button size="lg" variant="outline">
                Jelajahi Katalog
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-lg font-semibold">Perpustakaan Digital</span>
              </div>
              <p className="text-gray-600">
                Sistem manajemen perpustakaan modern untuk era digital dengan fitur lengkap dan mudah digunakan.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/catalog" className="hover:text-blue-600">
                    Katalog Buku
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-blue-600">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-600">
                    Kontak
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-blue-600">
                    Bantuan
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/borrowing" className="hover:text-blue-600">
                    Peminjaman
                  </Link>
                </li>
                <li>
                  <Link href="/membership" className="hover:text-blue-600">
                    Keanggotaan
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-blue-600">
                    Laporan
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-blue-600">
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontak</h4>
              <div className="text-gray-600 space-y-2">
                <p>Email: info@perpustakaan.com</p>
                <p>Telepon: (021) 123-4567</p>
                <p>Alamat: Jl. Pendidikan No. 123</p>
                <p>Jakarta, Indonesia 12345</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Perpustakaan Digital. Semua hak dilindungi undang-undang.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
