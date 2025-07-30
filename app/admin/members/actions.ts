'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- Aksi untuk Menambah Anggota Baru ---
export async function createMember(formData: FormData) {
  const supabase = await createClient();

  const memberData = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
  };

  const { error } = await supabase.from('members').insert(memberData);

  if (error) {
    console.error('Error creating member:', error);
    return redirect('/admin/members/new?error=Gagal membuat anggota');
  }

  revalidatePath('/admin/members');
  redirect('/admin/members');
}

// --- Aksi untuk Mengedit Anggota ---
export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient();

  const memberData = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
  };

  const { error } = await supabase.from('members').update(memberData).eq('id', id);

  if (error) {
    console.error('Error updating member:', error);
    return redirect(`/admin/members/edit/${id}?error=Gagal mengupdate anggota`);
  }

  revalidatePath('/admin/members');
  revalidatePath(`/admin/members/edit/${id}`);
  redirect('/admin/members');
}

// --- Aksi untuk Menghapus Anggota ---
export async function deleteMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('members').delete().eq('id', id);

  if (error) {
    console.error('Error deleting member:', error);
    return redirect('/admin/members?error=Gagal menghapus anggota');
  }

  revalidatePath('/admin/members');
}