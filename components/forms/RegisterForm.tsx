// path: components/forms/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterForm() {
  // 1. State untuk menampung data dari setiap input
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  // State untuk menampilkan pesan dan status loading
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // 2. Fungsi yang dijalankan saat form disubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const response = await fetch('/api/auth/signup', { // Pastikan path API benar
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        // Anda bisa menambahkan field lain di sini jika ada
      }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setErrorMsg(data.error || 'Terjadi kesalahan saat mendaftar.')
    } else {
      setSuccessMsg(data.message || 'Registrasi berhasil! Silakan cek email Anda.')
    }
  }

  // 3. Hubungkan state dan handler ke elemen JSX
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Mendaftarkan...' : 'Register'}
      </Button>

      {/* 4. Tampilkan pesan feedback kepada pengguna */}
      {errorMsg && <p className="text-sm text-center text-red-600">{errorMsg}</p>}
      {successMsg && <p className="text-sm text-center text-green-600">{successMsg}</p>}
    </form>
  )
}