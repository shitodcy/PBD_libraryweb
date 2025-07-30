'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Coba login dengan email dan password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error('Sign in error:', signInError)
    // Jika gagal, kembali ke halaman login dengan pesan error
    return redirect('/login?message=Could not authenticate user')
  }

  // 2. Jika login berhasil, ambil data pengguna dan perannya
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login?message=User not found after login')
  }

  // Ambil data dari tabel 'profiles'
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 3. Arahkan berdasarkan peran
  if (profile?.role === 'admin') {
    // Jika perannya 'admin', arahkan ke dashboard admin
    return redirect('/admin/dashboard')
  } else {
    // Jika bukan, arahkan ke dashboard biasa
    return redirect('/dashboard')
  }
}