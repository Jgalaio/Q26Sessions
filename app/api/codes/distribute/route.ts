import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { codes } = await req.json()

  const { error } = await supabaseAdmin
    .from('vote_codes')
    .update({ distributed: true })
    .in('code', codes)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}