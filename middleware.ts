import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake could make it very hard to debug
  // issues with docs.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userEmail = user?.email
  
  // Check if email is in the admin whitelist from env
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  const isAdmin = userEmail ? adminEmails.includes(userEmail.toLowerCase()) : false

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${request.nextUrl.pathname} | User: ${userEmail || 'None'} | Admin: ${isAdmin}`)
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/osaka-ops')) {
    // If it's the login page or internal signup, allow it
    if (request.nextUrl.pathname === '/admin' || 
        request.nextUrl.pathname === '/osaka-ops' || 
        request.nextUrl.pathname.includes('signup-internal')) {
      return supabaseResponse
    }

    // Redirect if not logged in or not an admin
    if (!user || !isAdmin) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] Unauthorized access attempt to ${request.nextUrl.pathname}, redirecting to /osaka-ops`)
      }
      const url = request.nextUrl.clone()
      url.pathname = '/osaka-ops'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets (images, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}