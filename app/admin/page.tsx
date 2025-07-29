// app/(admin)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard' // Komponen klien untuk UI

// Komponen ini berjalan di server
export default async function AdminPage() {
  const supabase = await createClient()

  // 1. Ambil data sesi pengguna saat ini
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Jika tidak ada pengguna yang login, alihkan ke halaman login
  if (!user) {
    return redirect('/login')
  }

  // 3. Ambil profil pengguna untuk memeriksa perannya (role)
  const { data: profile } = await supabase
    .from('profiles') // Pastikan Anda memiliki tabel 'profiles'
    .select('role')
    .eq('id', user.id)
    .single()

  // 4. Jika profil tidak ditemukan atau perannya bukan 'admin', alihkan ke dashboard member
  if (!profile || profile.role !== 'admin') {
    return redirect('/dashboard')
  }

  // 5. Jika aman, muat semua data awal dari database
  const [booksRes, categoriesRes, publishersRes, authorsRes] = await Promise.all([
    supabase.from("books").select("*"),
    supabase.from("categories").select("*"),
    supabase.from("publishers").select("*"),
    supabase.from("authors").select("*"),
  ])

  // 6. Kirim data ke komponen klien untuk ditampilkan
  return (
    <AdminDashboard
      initialBooks={booksRes.data ?? []}
      initialCategories={categoriesRes.data ?? []}
      initialPublishers={publishersRes.data ?? []}
      initialAuthors={authorsRes.data ?? []}
    />
  )
}
