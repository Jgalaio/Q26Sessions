'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminClient() {
  const [ranking, setRanking] = useState<any[]>([])

  useEffect(() => {
    fetchRanking()

    // REALTIME 🔥
    const channel = supabase
      .channel('votes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => {
          fetchRanking()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchRanking = async () => {
    const res = await fetch('/api/ranking')
    const data = await res.json()
    setRanking(data || [])
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black mb-6">
        Ranking em Tempo Real
      </h1>

      <div className="space-y-4">
        {ranking.map((dj, index) => (
          <div
            key={dj.id}
            className="flex items-center gap-4 p-4 rounded-xl border shadow-sm"
          >
            {/* POSIÇÃO */}
            <div className="text-2xl font-black w-10">
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
              {index > 2 && `#${index + 1}`}
            </div>

            {/* IMAGEM */}
            <img
              src={dj.image_url}
              className="w-16 h-16 object-cover rounded-lg"
            />

            {/* INFO */}
            <div className="flex-1">
              <p className="font-bold text-lg">{dj.name}</p>
              <p className="text-zinc-500 text-sm">
                {dj.votes} votos
              </p>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-32 h-3 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500"
                style={{
                  width: `${
                    ranking[0]?.votes
                      ? (dj.votes / ranking[0].votes) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}