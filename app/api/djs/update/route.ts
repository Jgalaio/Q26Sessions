import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { id, name } = (await req.json()) as { id: string; name: string }
  const supabaseAdmin = getSupabaseAdmin()
  const payload = { name }

  await supabaseAdmin
    .from('djs')
    .update(payload as never)
    .eq('id', id)

  return NextResponse.json({ success: true })
}
