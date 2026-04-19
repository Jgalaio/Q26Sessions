'use client'

import { useEffect, useState } from 'react'
import type { AnalyticsData } from '@/lib/types'

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await fetch('/api/analytics')
        const json = (await res.json()) as AnalyticsData

        if (isMounted) {
          setData(json)
        }
      } catch (error) {
        console.error('Erro analytics:', error)
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
      <main className="p-6 text-center">
        <p className="text-xl font-bold">A carregar analytics...</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="p-6 text-center">
        <p>Erro ao carregar dados</p>
      </main>
    )
  }

  const top3 = data.stats.slice(0, 3)

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-3xl font-black">Analytics</h1>

      <div className="rounded-2xl bg-black p-6 text-center text-white">
        <p className="text-lg">Total de votos</p>
        <p className="text-4xl font-black">{data.totalVotes}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {top3.map((dj, index) => (
          <div key={dj.id} className="rounded-xl border p-4 text-center">
            <img
              src={dj.image_url}
              alt={dj.name}
              className="mb-2 h-24 w-full rounded object-cover"
            />
            <p className="font-bold">
              #{index + 1} {dj.name}
            </p>
            <p>{dj.votes} votos</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {data.stats.map((dj) => (
          <div key={dj.id} className="rounded-xl border p-3">
            <div className="mb-1 flex justify-between">
              <span>{dj.name}</span>
              <span>{dj.percent}%</span>
            </div>

            <div className="h-3 w-full rounded-full bg-zinc-200">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${dj.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
