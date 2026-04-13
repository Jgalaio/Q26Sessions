import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { voting_open } = await req.json()

  await supabaseAdmin
    .from('settings')
    .update({ voting_open })
    .eq('id', 1)

  return NextResponse.json({ success: true })
}