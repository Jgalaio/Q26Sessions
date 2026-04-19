'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { RankedDj } from '@/lib/types'

export default function HomePage() {
  const [djs, setDjs] = useState<RankedDj[]>([])
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadRanking = async () => {
      try {
        const res = await fetch('/api/ranking')
        const data = (await res.json()) as RankedDj[]

        if (!isMounted) {
          return
        }

        const total = data.reduce((acc, dj) => acc + dj.votes, 0)
        setTotalVotes(total)
        setDjs(data)
      } catch (error) {
        console.error('Erro ao carregar ranking:', error)
      }
    }

    void loadRanking()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <img
            src="/tittle.png"
            alt="Quarentoes 26 Sessions"
            className="mx-auto mb-4 max-w-[250px]"
          />

          <p className="text-zinc-600">Vota no teu DJ favorito</p>

          <p className="mt-2 text-sm text-zinc-400">
            {totalVotes} votos registados
          </p>
        </div>

        {djs.length >= 3 && (
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-xl font-bold">Top DJs</h2>

            <div className="flex flex-col justify-center gap-4 md:flex-row">
              {djs.slice(0, 3).map((dj, index) => {
                const percent =
                  totalVotes > 0
                    ? Math.round((dj.votes / totalVotes) * 100)
                    : 0

                const medals = ['🥇', '🥈', '🥉']

                return (
                  <div
                    key={dj.id}
                    className="rounded-2xl border bg-white px-6 py-4 shadow-sm"
                  >
                    <p className="text-lg font-bold">
                      {medals[index]} {dj.name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {percent}% dos votos
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {djs.map((dj, index) => {
            const percent =
              totalVotes > 0
                ? Math.round((dj.votes / totalVotes) * 100)
                : 0

            const isLeader = index === 0

            return (
              <motion.a
                key={dj.id}
                href={`/votar/${dj.id}`}
                whileHover={{ scale: 1.03 }}
                className={`relative overflow-hidden rounded-2xl shadow-lg ${
                  isLeader ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                {index < 3 && (
                  <div className="absolute left-3 top-3 z-10">
                    <div
                      className={`
                        rounded-full px-3 py-1 text-xs font-bold shadow-md
                        ${index === 0 ? 'bg-yellow-400 text-black' : ''}
                        ${index === 1 ? 'bg-gray-300 text-black' : ''}
                        ${index === 2 ? 'bg-orange-400 text-black' : ''}
                      `}
                    >
                      {index === 0 && '🥇 #1'}
                      {index === 1 && '🥈 #2'}
                      {index === 2 && '🥉 #3'}
                    </div>
                  </div>
                )}

                <img
                  src={dj.image_url}
                  alt={dj.name}
                  className="h-[260px] w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                  <h2 className="text-xl font-bold">{dj.name}</h2>

                  <p className="text-sm font-medium">{percent}%</p>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded bg-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </main>
  )
}
