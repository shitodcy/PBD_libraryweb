import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookCopy, Clock, History, Search, Bell, User } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'

// Helper function untuk format tanggal dan cek jatuh tempo (tidak berubah)
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const getDueDateStatus = (dueDateString: string) => {
  const dueDate = new Date(dueDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  dueDate.setHours(0, 0, 0, 0);

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

  const [
    activeBorrowingsResult,
    borrowingHistoryResult,
    historyCountResult,
    profileResult // (BARU) Ambil data profil
  ] = await Promise.all([
    supabase
      .from('borrowings')
      .select('id, due_date, books(id, title, cover_url)')
      .eq('user_id', user.id)
      .is('returned_at', null),
    supabase
      .from('borrowings')
      .select('id, returned_at, books(id, title)')
      .eq('user_id', user.id)
      .not('returned_at', 'is', null)
      .order('returned_at', { ascending: false })
      .limit(5),
    supabase
      .from('borrowings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('returned_at', 'is', null),
    // (BARU) Query untuk mendapatkan nama pengguna
    supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()
  ]);

  const { data: activeBorrowings } = activeBorrowingsResult;
  const { data: borrowingHistory } = borrowingHistoryResult;
  const { count: historyCount } = historyCountResult;
  const { data: profile } = profileResult;

  const overdueBooksCount = activeBorrowings?.filter(b => new Date(b.due_date) < new Date()).length ?? 0;
  const displayName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : user.email;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800/50 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* (DIROMBAK) Kartu Selamat Datang dengan Tombol Edit Profil */}
        <Card className="mb-8 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Selamat Datang, {displayName}!</h1>
                    <p className="text-gray-500 dark:text-gray-400">Kelola peminjaman buku Anda di sini.</p>
                </div>
                <Button asChild className="mt-4 sm:mt-0">
                    <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        Edit Profil
                    </Link>
                </Button>
            </div>
          </div>
        </Card>

        {/* Notifikasi Keterlambatan */}
        {overdueBooksCount > 0 && (
          <Card className="mb-8 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Bell className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <CardTitle className="text-red-800 dark:text-red-300">Perhatian!</CardTitle>
                <CardDescription className="text-red-700 dark:text-red-400">
                  Anda memiliki {overdueBooksCount} buku yang sudah melewati tanggal jatuh tempo.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Grid Statistik */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* ... (sisa kode statistik tidak berubah) ... */}
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sedang Dipinjam</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBorrowings?.length ?? 0} Buku</div>
              <p className="text-xs text-muted-foreground">Buku yang sedang dalam masa pinjaman</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueBooksCount} Buku</div>
              <p className="text-xs text-muted-foreground">Buku yang melewati jatuh tempo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Riwayat</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{historyCount ?? 0} Buku</div>
              <p className="text-xs text-muted-foreground">Total buku yang pernah dipinjam</p>
            </CardContent>
          </Card>
        </div>

        {/* Daftar Buku yang Sedang Dipinjam */}
        <div className="flex flex-col gap-8">
            {/* ... (sisa kode daftar buku tidak berubah) ... */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookCopy className="h-5 w-5 mr-2 text-blue-600" />
                Buku yang Sedang Anda Pinjam
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeBorrowings && activeBorrowings.length > 0 ? (
                <div className="space-y-6">
                  {activeBorrowings.map((borrowing) => {
                    const book = Array.isArray(borrowing.books) ? borrowing.books[0] : borrowing.books;
                    if (!book) return null;

                    const dueDateStatus = getDueDateStatus(borrowing.due_date);
                    return (
                      <div key={borrowing.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0">
                          {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><BookCopy className="w-8 h-8 text-gray-400"/></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{book.title ?? 'Judul tidak tersedia'}</h3>
                          <Badge variant={dueDateStatus.variant} className="mt-1">{dueDateStatus.text}</Badge>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                             <Link href={`/book/${book.id}`}>Lihat Detail</Link>
                          </Button>
                          <Button size="sm" className="flex-1 sm:flex-none">Perpanjang</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed rounded-lg">
                   <BookCopy className="mx-auto h-12 w-12 text-gray-400" />
                   <h3 className="mt-2 text-lg font-semibold">Anda belum meminjam buku.</h3>
                   <p className="mt-1 text-sm">Ayo mulai petualangan membaca Anda!</p>
                   <Button asChild className="mt-4">
                     <Link href="/catalog">
                       <Search className="mr-2 h-4 w-4" />
                       Jelajahi Katalog Buku
                     </Link>
                   </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Riwayat Peminjaman */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2 text-green-600" />
                Riwayat Peminjaman Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              {borrowingHistory && borrowingHistory.length > 0 ? (
                <ul className="space-y-4">
                  {borrowingHistory.map(item => {
                    const book = Array.isArray(item.books) ? item.books[0] : item.books;
                    if (!book) return null;
                    return (
                      <li key={item.id} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div>
                          Anda mengembalikan buku <Link href={`/book/${book.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">"{book.title}"</Link>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(item.returned_at!)}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                 <p className="text-center py-4 text-gray-500 dark:text-gray-400">Belum ada riwayat peminjaman.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}