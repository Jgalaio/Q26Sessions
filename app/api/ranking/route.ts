import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Dj } from '@/lib/types'

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: votesData } = await supabaseAdmin
    .from('votes')
    .select('dj_id')

  const { data: djsData } = await supabaseAdmin
    .from('djs')
    .select('*')
  const votes = (votesData ?? []) as Array<{ dj_id: string }>
  const djs = (djsData ?? []) as Dj[]

  const counts: Record<string, number> = {}

  votes?.forEach((v) => {
    counts[v.dj_id] = (counts[v.dj_id] || 0) + 1
  })

  const ranking = djs.map((dj) => ({
    ...dj,
    votes: counts[dj.id] || 0,
  }))

  ranking.sort((a, b) => b.votes - a.votes)

  return NextResponse.json(ranking)
}
