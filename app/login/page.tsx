'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // 1. Coba untuk login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setErrorMsg(loginError.message)
      setLoading(false)
      return
    }

    // ✅ PERBAIKAN: Jika login berhasil, periksa peran pengguna
    if (loginData.user) {
      // 2. Ambil data profil dari database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', loginData.user.id)
        .single()
      
      // 3. Arahkan berdasarkan peran
      if (profile?.role === 'admin') {
        router.push('/admin/dashboard') // Arahkan admin ke dashboard admin
      } else {
        router.push('/dashboard') // Arahkan pengguna biasa ke dashboard mereka
      }
    } else {
      // Fallback jika user tidak ditemukan setelah login (jarang terjadi)
      router.refresh()
    }
    
    // setLoading(false) tidak diperlukan karena halaman akan di-redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-800">Login Member</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>

          {errorMsg && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}