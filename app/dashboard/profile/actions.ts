'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  // 1. Dapatkan pengguna yang sedang login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // 2. Siapkan data yang akan diupdate dari form
  const profileData = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone: formData.get('phone') as string,
    // Tambahkan field lain jika ada
  };

  // 3. Lakukan update ke tabel 'profiles'
  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return redirect('/dashboard/profile?message=Gagal memperbarui profil.');
  }

  // 4. Revalidasi path dan redirect dengan pesan sukses
  revalidatePath('/dashboard/profile');
  redirect('/dashboard/profile?message=Profil berhasil diperbarui!');
}