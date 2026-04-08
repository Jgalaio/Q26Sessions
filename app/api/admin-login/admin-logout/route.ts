import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  response.cookies.set('admin-auth', '', {
    httpOnly: true,
    secure: true, // depois no deploy muda para true
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}