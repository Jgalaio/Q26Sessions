import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin()

  const { data } = await supabaseAdmin
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { voting_open } = (await req.json()) as { voting_open: boolean }
  const supabaseAdmin = getSupabaseAdmin()
  const payload = { voting_open }

  await supabaseAdmin
    .from('settings')
    .update(payload as never)
    .eq('id', 1)

  return NextResponse.json({ success: true })
}
