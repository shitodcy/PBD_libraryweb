// path: app/auth/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()

  // Invalidate sesi pengguna
  await supabase.auth.signOut()

  // Arahkan pengguna kembali ke halaman login
  return redirect('/login')
}