import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { codes } = await req.json()
  const supabaseAdmin = getSupabaseAdmin()
  const updatePayload = { distributed: true }

  const { error } = await supabaseAdmin
    .from('vote_codes')
    .update(updatePayload as never)
    .in('code', codes)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
