import { updateMember } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notFound } from "next/navigation";

// Halaman ini menerima 'params' dari URL, yang berisi 'id' anggota
export default async function EditMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Ambil data anggota yang akan diedit
  const { data: member } = await supabase
    .from("members")
    .select()
    .eq("id", params.id)
    .single();

  // Jika anggota tidak ditemukan, tampilkan halaman 404
  if (!member) {
    notFound();
  }

  // Bind 'id' anggota ke server action 'updateMember'
  const updateMemberWithId = updateMember.bind(null, member.id);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Anggota</h1>
      <form action={updateMemberWithId} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Nama Depan</Label>
            <Input
              id="first_name"
              name="first_name"
              required
              defaultValue={member.first_name}
            />
          </div>
          <div>
            <Label htmlFor="last_name">Nama Belakang</Label>
            <Input
              id="last_name"
              name="last_name"
              required
              defaultValue={member.last_name}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={member.email}
          />
        </div>
        <div>
          <Label htmlFor="phone">Telepon</Label>
          <Input id="phone" name="phone" defaultValue={member.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="address">Alamat</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={member.address ?? ""}
          />
        </div>
        <Button type="submit">Update</Button>
      </form>
    </div>
  );
}