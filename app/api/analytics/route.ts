import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import type { Dj } from '@/lib/types'

export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data: votesData } = await supabase.from('votes').select('dj_id')
  const { data: djsData } = await supabase.from('djs').select('*')
  const votes = (votesData ?? []) as Array<{ dj_id: string }>
  const djs = (djsData ?? []) as Dj[]

  const totalVotes = votes?.length || 0
  const voteCounts: Record<string, number> = {}

  votes?.forEach((vote) => {
    voteCounts[vote.dj_id] = (voteCounts[vote.dj_id] || 0) + 1
  })

  const stats = djs.map((dj) => {
    const djVotes = voteCounts[dj.id] || 0

    return {
      ...dj,
      votes: djVotes,
      percent: totalVotes
        ? Number(((djVotes / totalVotes) * 100).toFixed(1))
        : 0,
    }
  })

  stats.sort((a, b) => b.votes - a.votes)

  return NextResponse.json({
    totalVotes,
    stats,
  })
}
