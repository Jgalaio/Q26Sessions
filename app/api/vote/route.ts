import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Settings, VoteCode } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { code, dj_id } = (await req.json()) as {
      code: string
      dj_id: string
    }
    const supabaseAdmin = getSupabaseAdmin()

    const rawIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const ip = rawIp.split(',')[0].trim()

    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
    const settings = settingsData as Settings | null

    if (settingsError) {
      throw settingsError
    }

    if (!settings?.voting_open) {
      return NextResponse.json(
        { error: 'VotaÃ§Ã£o fechada' },
        { status: 403 }
      )
    }

    const { data: voteCodeData, error: codeError } = await supabaseAdmin
      .from('vote_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle()
    const voteCode = voteCodeData as VoteCode | null

    if (codeError) {
      throw codeError
    }

    if (!voteCode) {
      return NextResponse.json(
        { error: 'CÃ³digo invÃ¡lido' },
        { status: 400 }
      )
    }

    if (voteCode.used) {
      return NextResponse.json(
        { error: 'CÃ³digo jÃ¡ utilizado' },
        { status: 400 }
      )
    }

    const limitPerIp = 50

    const { count, error: countError } = await supabaseAdmin
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)

    if (countError) {
      throw countError
    }

    if ((count || 0) >= limitPerIp) {
      return NextResponse.json(
        { error: 'Limite de votos atingido' },
        { status: 429 }
      )
    }

    const votePayload = [
      {
        code,
        dj_id,
        ip,
      },
    ]

    const { error: voteError } = await supabaseAdmin
      .from('votes')
      .insert(votePayload as never)

    if (voteError) {
      throw voteError
    }

    const usedPayload = { used: true }

    const { error: updateError } = await supabaseAdmin
      .from('vote_codes')
      .update(usedPayload as never)
      .eq('code', code)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Vote error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao votar',
      },
      { status: 500 }
    )
  }
}
