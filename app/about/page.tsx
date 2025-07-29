import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Target, Award, ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-gray-600">Kembali</span>
              </Link>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Tentang Kami</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/catalog">
                <Button variant="outline">Katalog</Button>
              </Link>
              <Link href="/contact">
                <Button>Kontak</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Tentang Perpustakaan Digital</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kami adalah platform perpustakaan digital modern yang berkomitmen untuk memberikan akses mudah dan efisien
            terhadap koleksi buku dan sumber daya pembelajaran untuk semua kalangan.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                Visi Kami
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg leading-relaxed">
                Menjadi platform perpustakaan digital terdepan yang memungkinkan akses pengetahuan tanpa batas untuk
                mencerdaskan bangsa dan memajukan peradaban melalui teknologi modern.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Award className="h-8 w-8 text-green-600 mr-3" />
                Misi Kami
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Menyediakan akses mudah dan cepat ke koleksi buku digital berkualitas
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Mengembangkan sistem manajemen perpustakaan yang efisien dan user-friendly
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Mendukung budaya membaca dan pembelajaran berkelanjutan
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Memberikan layanan perpustakaan digital yang inovatif dan berkelanjutan
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Keunggulan Platform Kami</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                  Koleksi Lengkap
                </CardTitle>
                <CardDescription>
                  Ribuan buku dari berbagai kategori dan penerbit terpercaya dengan update berkala
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  Manajemen Modern
                </CardTitle>
                <CardDescription>
                  Sistem manajemen terintegrasi dengan teknologi cloud dan keamanan tingkat enterprise
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-6 w-6 text-purple-600 mr-2" />
                  Layanan 24/7
                </CardTitle>
                <CardDescription>
                  Akses perpustakaan digital kapan saja dan dimana saja dengan dukungan teknis terbaik
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Pencapaian Kami</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,250+</div>
              <div className="text-gray-600">Total Buku</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Anggota Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">15</div>
              <div className="text-gray-600">Kategori Buku</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Kepuasan Pengguna</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Tim Pengembang</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle>Tim Teknologi</CardTitle>
                <CardDescription>
                  Developer berpengalaman yang mengembangkan platform dengan teknologi terdepan
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle>Tim Konten</CardTitle>
                <CardDescription>
                  Pustakawan profesional yang mengelola dan mengkurasi koleksi buku berkualitas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle>Tim Dukungan</CardTitle>
                <CardDescription>Customer service yang siap membantu pengguna 24/7 dengan respon cepat</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Hubungi Kami</CardTitle>
            <CardDescription className="text-center">
              Kami siap membantu Anda dengan pertanyaan atau saran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-gray-600">info@perpustakaan.com</p>
                <p className="text-gray-600">support@perpustakaan.com</p>
              </div>
              <div className="text-center">
                <Phone className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Telepon</h4>
                <p className="text-gray-600">(021) 123-4567</p>
                <p className="text-gray-600">(021) 123-4568</p>
              </div>
              <div className="text-center">
                <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Alamat</h4>
                <p className="text-gray-600">Jl. Pendidikan No. 123</p>
                <p className="text-gray-600">Jakarta, Indonesia 12345</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/contact">
                <Button size="lg">Kirim Pesan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
