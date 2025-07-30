import StatsView from "@/components/admin/StatsView";
import BooksView from "@/components/admin/BooksView";
import MembersView from "@/components/admin/MembersView";
import BorrowingsView from "@/components/admin/BorrowingsView";
import DashboardNav from "@/components/admin/DashboardNav"; // ✅ Impor komponen navigasi baru

interface DashboardPageProps {
  searchParams: {
    view?: string;
  };
}

export default async function AdminDashboardPage({ searchParams }: DashboardPageProps) {
  const currentView = searchParams.view || "stats";

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* ✅ Gunakan Client Component untuk navigasi yang interaktif */}
      <DashboardNav />

      <div>
        {currentView === 'stats' && <StatsView />}
        {currentView === 'books' && <BooksView />}
        {currentView === 'members' && <MembersView />}
        {currentView === 'borrowings' && <BorrowingsView />}
      </div>
    </div>
  );
}