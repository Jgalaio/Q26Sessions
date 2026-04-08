import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { message: 'Password em falta' },
        { status: 400 }
      )
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Password incorreta' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: true, // depois no deploy muda para true
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    })

    return response
  } catch {
    return NextResponse.json(
      { message: 'Erro interno' },
      { status: 500 }
    )
  }
}