import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_COOKIE_NAME, '', {
    maxAge: 0,
    path: '/',
  })

  return NextResponse.json({ success: true })
}
