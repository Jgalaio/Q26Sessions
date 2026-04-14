import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const { code, dj_id } = await req.json()

    // ================= IP REAL =================
    const rawIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const ip = rawIp.split(',')[0].trim()

    // ================= SETTINGS =================
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settingsError) throw settingsError

    if (!settings?.voting_open) {
      return NextResponse.json(
        { error: 'Votação fechada' },
        { status: 403 }
      )
    }

    // ================= VALIDAR CÓDIGO =================
    const { data: voteCode, error: codeError } = await supabaseAdmin
      .from('vote_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (codeError) throw codeError

    if (!voteCode) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      )
    }

    // ================= JÁ USADO =================
    if (voteCode.used) {
      return NextResponse.json(
        { error: 'Código já utilizado' },
        { status: 400 }
      )
    }

    // ================= LIMITE POR IP =================
    const LIMIT = 50

    const { count, error: countError } = await supabaseAdmin
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)

    if (countError) throw countError

    if ((count || 0) >= LIMIT) {
      return NextResponse.json(
        { error: 'Limite de votos atingido' },
        { status: 429 }
      )
    }

    // ================= INSERIR VOTO =================
    const { error: voteError } = await supabaseAdmin
      .from('votes')
      .insert([
        {
          code,
          dj_id,
          ip,
        },
      ])

    if (voteError) throw voteError

    // ================= MARCAR COMO USADO =================
    const { error: updateError } = await supabaseAdmin
      .from('vote_codes')
      .update({ used: true })
      .eq('code', code)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('🔥 ERRO VOTO:', error)

    return NextResponse.json(
      { error: error.message || 'Erro ao votar' },
      { status: 500 }
    )
  }
}