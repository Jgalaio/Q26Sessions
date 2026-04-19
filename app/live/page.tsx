'use client'

import { useEffect, useState } from 'react'
import type { AnalyticsData } from '@/lib/types'

export default function LivePage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await fetch('/api/analytics')
        const json = (await res.json()) as AnalyticsData

        if (!isMounted) {
          return
        }

        setData(json)
        setError('')
      } catch (loadError) {
        console.error('Erro ao carregar live:', loadError)

        if (isMounted) {
          setError('Nao foi possivel carregar os dados live.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void load()
    const interval = setInterval(() => {
      void load()
    }, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-3xl text-white">
        A carregar...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-black px-6 text-center text-2xl text-white">
        {error || 'Nao foi possivel carregar os dados.'}
      </div>
    )
  }

  const leader = data.stats[0]
  const others = data.stats.slice(1)

  return (
    <main className="flex h-screen flex-col bg-black p-8 text-white">
      <div className="mb-6 text-center">
        <h1 className="text-5xl font-black tracking-widest">LIVE VOTACAO</h1>
        <p className="text-xl opacity-70">Total votos: {data.totalVotes}</p>
      </div>

      {leader && (
        <div className="mb-10 text-center">
          <div className="mb-2 text-2xl opacity-70">Em 1.o lugar</div>

          <div className="inline-block rounded-3xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 p-6">
            <img
              src={leader.image_url}
              alt={leader.name}
              className="mx-auto mb-4 h-48 w-48 rounded-2xl border-4 border-white object-cover"
            />

            <h2 className="text-4xl font-black">{leader.name}</h2>

            <p className="mt-2 text-2xl">
              {leader.votes} votos ({leader.percent}%)
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-hidden">
        {others.map((dj, index) => (
          <div
            key={dj.id}
            className="flex items-center gap-4 rounded-2xl bg-zinc-900 p-4"
          >
            <div className="w-12 text-center text-2xl font-black">
              #{index + 2}
            </div>

            <img
              src={dj.image_url}
              alt={dj.name}
              className="h-16 w-16 rounded-xl object-cover"
            />

            <div className="flex-1">
              <p className="text-xl font-bold">{dj.name}</p>

              <div className="mt-2 h-4 w-full rounded-full bg-zinc-700">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 transition-all duration-700"
                  style={{ width: `${dj.percent}%` }}
                />
              </div>
            </div>

            <div className="w-32 text-right text-xl font-bold">
              {dj.votes} votos
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
