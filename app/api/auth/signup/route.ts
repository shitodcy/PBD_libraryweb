import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // ✅ 1. Impor helper yang benar

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth, gender } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Email, password, first name, and last name are required" }, { status: 400 })
    }

    // ✅ 2. Buat instance Supabase client
    const supabase = await createClient()

    // ✅ 3. Daftarkan pengguna baru di sistem Auth Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // Menyimpan data tambahan yang akan digunakan setelah konfirmasi email
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          date_of_birth: dateOfBirth,
          gender: gender,
        }
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    
    // Jika Anda memerlukan pembuatan profil langsung (tanpa konfirmasi email),
    // Anda bisa menambahkan logikanya di sini untuk insert ke tabel 'profiles'.

    return NextResponse.json({
      message: "User created successfully. Please check your email to verify.",
      user: authData.user,
    })
  } catch (error: any) {
    console.error("Signup API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}