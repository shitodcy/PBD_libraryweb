import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookCopy, Clock, History, User, Search, Bell } from 'lucide-react'

// Helper function untuk format tanggal dan cek jatuh tempo
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const getDueDateStatus = (dueDateString: string) => {
  const dueDate = new Date(dueDateString);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `Terlambat ${Math.abs(diffDays)} hari`, variant: "destructive" as const };
  if (diffDays === 0) return { text: "Jatuh tempo hari ini", variant: "destructive" as const };
  if (diffDays <= 3) return { text: `Jatuh tempo dalam ${diffDays} hari`, variant: "secondary" as const };
  return { text: `Jatuh tempo pada ${formatDate(dueDateString)}`, variant: "outline" as const };
};

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Ambil data peminjaman aktif (belum dikembalikan) beserta detail bukunya
  const { data: activeBorrowings } = await supabase
    .from('borrowings')
    .select(`
      id,
      due_date,
      books (
        id,
        title,
        cover_url
      )
    `)
    .eq('user_id', user.id)
    .is('returned_at', null)

  // Ambil data riwayat peminjaman (sudah dikembalikan)
  const { data: borrowingHistory } = await supabase
    .from('borrowings')
    .select(`
      id,
      returned_at,
      books (
        id,
        title
      )
    `)
    .eq('user_id', user.id)
    .not('returned_at', 'is', null)
    .order('returned_at', { ascending: false })
    .limit(5)

  const overdueBooksCount = activeBorrowings?.filter(b => new Date(b.due_date) < new Date()).length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard Pengguna</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle>Selamat Datang Kembali!</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          {overdueBooksCount > 0 && (
            <CardContent>
              <div className="bg-red-100 text-red-800 p-3 rounded-md flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                <span>Perhatian! Anda memiliki **{overdueBooksCount}** buku yang sudah melewati jatuh tempo.</span>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Utama */}
          <div className="lg:col-span-2 space-y-8">
            {/* Buku yang Sedang Dipinjam */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookCopy className="h-5 w-5 mr-2 text-blue-600" />
                  Buku yang Sedang Dipinjam ({activeBorrowings?.length ?? 0})
                </CardTitle>
                <CardDescription>
                  Berikut adalah daftar buku yang sedang Anda pinjam. Mohon kembalikan tepat waktu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeBorrowings && activeBorrowings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBorrowings.map((borrowing) => {
                      // ✅ FIX: Ambil objek buku pertama dari array relasi
                      const book = Array.isArray(borrowing.books) ? borrowing.books[0] : borrowing.books;
                      if (!book) return null;

                      const dueDateStatus = getDueDateStatus(borrowing.due_date);
                      return (
                        <div key={borrowing.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                          <div className="w-16 h-20 bg-gray-200 rounded-md flex-shrink-0">
                            {book.cover_url && <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-md" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{book.title ?? 'Judul tidak tersedia'}</h3>
                            <Badge variant={dueDateStatus.variant}>{dueDateStatus.text}</Badge>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                             <Link href={`/book/${book.id}`}>Lihat Detail</Link>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Anda tidak sedang meminjam buku apa pun.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Riwayat Peminjaman */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2 text-green-600" />
                  Riwayat Peminjaman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {borrowingHistory && borrowingHistory.length > 0 ? (
                    borrowingHistory.map(item => {
                      // ✅ FIX: Terapkan juga di sini
                      const book = Array.isArray(item.books) ? item.books[0] : item.books;
                      if (!book) return null;

                      return (
                        <li key={item.id} className="text-sm text-gray-600">
                          Anda mengembalikan buku <span className="font-medium">"{book.title}"</span> pada tanggal {formatDate(item.returned_at!)}.
                        </li>
                      )
                    })
                  ) : (
                     <p className="text-center py-4 text-gray-500">Belum ada riwayat peminjaman.</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Samping */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profil Anda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">Lihat & Edit Profil</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Aksi Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/catalog">Jelajahi Katalog Buku</Link>
                </Button>
                <Button variant="outline" className="w-full">Bantuan & Dukungan</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}