import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🔥 CLIENT ADMIN (IMPORTANTE)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // tem de ser service role
)

export async function POST() {
  try {
    // ================= APAGAR VOTOS =================
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .neq('id', 0)

    if (votesError) throw votesError

    // ================= RESETAR CÓDIGOS =================
    const { error: codesError } = await supabase
      .from('vote_codes')
      .update({
        is_used: false,
        voted_dj_slug: null,
        voted_at: null,
      })
      .neq('code', '')

    if (codesError) throw codesError

    return NextResponse.json({
      success: true,
      message: 'Votos resetados com sucesso',
    })

  } catch (error) {
    console.error('RESET ERROR:', error)

    return NextResponse.json(
      { error: 'Erro ao fazer reset dos votos' },
      { status: 500 }
    )
  }
}