import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Not logged in — redirect to login (except login page itself)
  if (!user && pathname !== '/login') {
    if (pathname.startsWith('/admin') || pathname.startsWith('/teacher')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Logged in — redirect away from login page to correct portal
  if (user && pathname === '/login') {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = roleData?.role
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    if (role === 'teacher') return NextResponse.redirect(new URL('/teacher', request.url))
  }

  // Protect /admin from teachers
  if (user && pathname.startsWith('/admin')) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/teacher', request.url))
    }
  }

  // Protect /teacher from admins trying to access wrong portal
  if (user && pathname.startsWith('/teacher')) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleData?.role !== 'teacher') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/teacher/:path*'],
}
