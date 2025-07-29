import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // ✅ 1. Impor helper yang benar

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // ✅ 2. Buat instance Supabase client di dalam fungsi
    const supabase = await createClient()

    // ✅ 3. Panggil fungsi signInWithPassword langsung
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // ✅ 4. Tangani error dari Supabase
    if (error) {
      return NextResponse.json({ error: error.message || 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({
      message: 'Signed in successfully',
      user: data.user,
      session: data.session,
    })
  } catch (error: any) {
    console.error('API Signin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}