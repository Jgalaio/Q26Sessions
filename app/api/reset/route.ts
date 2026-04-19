import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = getSupabaseAdmin()
    const resetPayload = { used: false }

    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .not('id', 'is', null)

    if (votesError) {
      throw votesError
    }

    const { error: codesError } = await supabase
      .from('vote_codes')
      .update(resetPayload as never)
      .not('id', 'is', null)

    if (codesError) {
      throw codesError
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Reset error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao fazer reset',
      },
      { status: 500 }
    )
  }
}
