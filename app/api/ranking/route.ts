import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: votes } = await supabase
    .from('votes')
    .select('dj_id')

  const { data: djs } = await supabase
    .from('djs')
    .select('*')

  // contar votos por DJ
  const counts: Record<string, number> = {}

  votes?.forEach((v) => {
    counts[v.dj_id] = (counts[v.dj_id] || 0) + 1
  })

  const ranking = djs?.map((dj) => ({
    ...dj,
    votes: counts[dj.id] || 0,
  }))

  ranking?.sort((a, b) => b.votes - a.votes)

  return NextResponse.json(ranking)
}