'use client' // ✅ Jadikan ini Client Component

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardNav() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "stats";

  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
      <Button asChild variant={currentView === 'stats' ? 'default' : 'outline'}>
        <Link href="/admin/dashboard">Statistik</Link>
      </Button>
      <Button asChild variant={currentView === 'books' ? 'default' : 'outline'}>
        <Link href="/admin/dashboard?view=books">Manajemen Buku</Link>
      </Button>
      <Button asChild variant={currentView === 'members' ? 'default' : 'outline'}>
        <Link href="/admin/dashboard?view=members">Manajemen Anggota</Link>
      </Button>
      <Button asChild variant={currentView === 'borrowings' ? 'default' : 'outline'}>
        <Link href="/admin/dashboard?view=borrowings">Peminjaman</Link>
      </Button>
    </div>
  );
}