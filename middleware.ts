import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // ✅ PERBAIKAN: Definisikan semua rute yang perlu dilindungi
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  const isAuthRoute = pathname.startsWith('/login')

  // 1. Jika pengguna belum login dan mencoba akses rute terproteksi, arahkan ke login.
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. Jika pengguna sudah login dan mencoba akses halaman login, arahkan ke dashboard.
  if (isAuthRoute && session) {
    // Middleware tidak tahu peran pengguna, jadi kita arahkan ke dashboard umum.
    // Logika di halaman login sudah cukup untuk mengarahkan ke dashboard admin jika perlu.
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}