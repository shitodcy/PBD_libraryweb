import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { deleteMember } from "./actions";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("members")
    .select("id, first_name, last_name, email, phone");

  if (error) {
    return <p className="text-red-500">Error memuat data: {error.message}</p>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Anggota</h1>
        <Button asChild>
          <Link href="/admin/members/new">Tambah Anggota Baru</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead className="w-[180px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.first_name} {member.last_name}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm" className="mr-2">
                    <Link href={`/admin/members/edit/${member.id}`}>Edit</Link>
                  </Button>
                  <form action={deleteMember.bind(null, member.id)} className="inline">
                    <Button variant="destructive" size="sm" type="submit">
                      Hapus
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}