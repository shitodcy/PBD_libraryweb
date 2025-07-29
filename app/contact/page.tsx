"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, ArrowLeft, Mail, Phone, MapPin, Clock, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setSubmitted(true)
    setFormData({ name: "", email: "", subject: "", category: "", message: "" })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Kontak Kami</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/about">
                <Button variant="outline">Tentang</Button>
              </Link>
              <Link href="/catalog">
                <Button>Katalog</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kami siap membantu Anda dengan pertanyaan, saran, atau dukungan teknis. Jangan ragu untuk menghubungi tim
            kami.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Umum:</strong> info@perpustakaan.com
                  </p>
                  <p className="text-gray-600">
                    <strong>Dukungan:</strong> support@perpustakaan.com
                  </p>
                  <p className="text-gray-600">
                    <strong>Admin:</strong> admin@perpustakaan.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 text-green-600 mr-2" />
                  Telepon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Utama:</strong> (021) 123-4567
                  </p>
                  <p className="text-gray-600">
                    <strong>Dukungan:</strong> (021) 123-4568
                  </p>
                  <p className="text-gray-600">
                    <strong>WhatsApp:</strong> +62 812-3456-7890
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                  Alamat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Jl. Pendidikan No. 123
                  <br />
                  Gedung Perpustakaan Digital
                  <br />
                  Jakarta Pusat, DKI Jakarta
                  <br />
                  Indonesia 12345
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-600 mr-2" />
                  Jam Operasional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Senin - Jumat:</strong> 08:00 - 17:00
                  </p>
                  <p className="text-gray-600">
                    <strong>Sabtu:</strong> 09:00 - 15:00
                  </p>
                  <p className="text-gray-600">
                    <strong>Minggu:</strong> Tutup
                  </p>
                  <p className="text-sm text-blue-600 mt-2">*Platform digital tersedia 24/7</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Kirim Pesan</CardTitle>
                <CardDescription>Isi formulir di bawah ini dan kami akan merespons dalam 24 jam</CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pesan Terkirim!</h3>
                    <p className="text-gray-600 mb-4">Terima kasih atas pesan Anda. Tim kami akan segera merespons.</p>
                    <Button onClick={() => setSubmitted(false)}>Kirim Pesan Lain</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Masukkan nama lengkap Anda"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="nama@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Kategori Pesan</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori pesan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Pertanyaan Umum</SelectItem>
                          <SelectItem value="technical">Dukungan Teknis</SelectItem>
                          <SelectItem value="membership">Keanggotaan</SelectItem>
                          <SelectItem value="books">Koleksi Buku</SelectItem>
                          <SelectItem value="feedback">Saran & Masukan</SelectItem>
                          <SelectItem value="complaint">Keluhan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subjek *</Label>
                      <Input
                        id="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Ringkasan singkat pesan Anda"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Pesan *</Label>
                      <Textarea
                        id="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Tulis pesan Anda secara detail..."
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="loading-spinner mr-2"></div>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Kirim Pesan
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Pertanyaan Umum</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bagaimana cara mendaftar sebagai anggota?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Anda dapat mendaftar melalui halaman registrasi dengan mengisi formulir pendaftaran. Setelah
                  verifikasi, akun Anda akan aktif dalam 24 jam.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Berapa lama masa peminjaman buku?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Masa peminjaman standar adalah 14 hari dan dapat diperpanjang 1 kali selama 7 hari jika tidak ada
                  anggota lain yang memesan buku tersebut.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apakah ada denda keterlambatan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ya, denda keterlambatan adalah Rp 1.000 per hari per buku. Anda akan mendapat notifikasi sebelum jatuh
                  tempo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bagaimana cara mengakses buku digital?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Setelah login, Anda dapat mengakses katalog dan meminjam buku digital. Buku dapat dibaca langsung di
                  browser atau diunduh dalam format PDF.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
