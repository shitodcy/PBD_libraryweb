import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Users, BookUp } from "lucide-react";

export default async function StatsView() {
  const supabase = await createClient();

  const [{ count: totalBooks }, { count: totalMembers }, { count: booksOnLoan }] =
    await Promise.all([
      supabase.from("books").select("*", { count: "exact", head: true }),
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase
        .from("borrowing_transactions")
        .select("*", { count: "exact", head: true })
        .eq("status", "dipinjam"),
    ]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ringkasan Perpustakaan</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buku</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buku Dipinjam</CardTitle>
            <BookUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booksOnLoan ?? 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}