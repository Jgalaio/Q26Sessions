import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth')
  const isAuthenticated = authCookie?.value === 'true'

  const pathname = request.nextUrl.pathname

  const protectedRoutes = ['/admin', '/codigos', '/qr-print']

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isLoginPage = pathname === '/admin/login'

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/codigos/:path*', '/qr-print/:path*'],
}