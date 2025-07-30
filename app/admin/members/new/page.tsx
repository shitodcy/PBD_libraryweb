import { createMember } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewMemberPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Tambah Anggota Baru</h1>
      <form action={createMember} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Nama Depan</Label>
            <Input id="first_name" name="first_name" required />
          </div>
          <div>
            <Label htmlFor="last_name">Nama Belakang</Label>
            <Input id="last_name" name="last_name" required />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="phone">Telepon</Label>
          <Input id="phone" name="phone" />
        </div>
        <div>
          <Label htmlFor="address">Alamat</Label>
          <Textarea id="address" name="address" />
        </div>
        <Button type="submit">Simpan</Button>
      </form>
    </div>
  );
}