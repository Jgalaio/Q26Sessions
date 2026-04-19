import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin()

  const { count } = await supabaseAdmin
    .from('votes')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({ count: count ?? 0 })
}
