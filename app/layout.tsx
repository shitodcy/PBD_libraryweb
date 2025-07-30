import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"

// ✅ 1. Impor yang diperlukan
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button" // Pastikan komponen ini ada

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Perpustakaan Digital - Sistem Manajemen Perpustakaan Modern",
  description:
    "Sistem manajemen perpustakaan digital dengan fitur lengkap untuk mengelola koleksi buku, anggota, dan peminjaman",
  generator: 'v0.dev'
}

// ✅ 2. Ubah fungsi menjadi 'async'
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ 3. Ambil data pengguna di sisi server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="id">
      <body className={inter.className}>
        {/* ✅ 4. Tambahkan header dan navigasi */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <nav className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="font-bold text-lg text-gray-800">
              Perpustakaan Digital
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Halo, {user.email}
                  </span>
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
              )}
            </div>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  )
}