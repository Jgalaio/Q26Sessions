import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { code, dj_id } = await req.json()

  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown'

  // 🔒 verificar votação aberta
  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (!settings?.voting_open) {
    return NextResponse.json(
      { error: 'Votação fechada' },
      { status: 403 }
    )
  }

  // 🔐 código único
  const { data: existingCode } = await supabaseAdmin
    .from('votes')
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (existingCode) {
    return NextResponse.json(
      { error: 'Código já usado' },
      { status: 400 }
    )
  }

  // ⚖️ LIMITE POR IP (CONFIGURÁVEL)
  const LIMIT = 20 // 👈 podes aumentar

  const { count } = await supabaseAdmin
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)

  if ((count || 0) > LIMIT) {
    return NextResponse.json(
      { error: 'Limite de votos por IP atingido' },
      { status: 429 }
    )
  }

  // ✅ guardar voto
  await supabaseAdmin.from('votes').insert([
    {
      code,
      dj_id,
      ip,
    },
  ])

  return NextResponse.json({ success: true })
}