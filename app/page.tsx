'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [djs, setDjs] = useState<any[]>([])
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    fetchRanking()
  }, [])

  const fetchRanking = async () => {
    const res = await fetch('/api/ranking')
    const data = await res.json()

    const total = data.reduce((acc: number, dj: any) => acc + dj.votes, 0)

    setTotalVotes(total)
    setDjs(data)
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* TÍTULO */}
        <div className="text-center mb-12">
          <img
            src="/tittle.png"
            className="mx-auto max-w-[500px] mb-4"
          />

          <p className="text-zinc-600">
            Vota no teu DJ favorito
          </p>

          <p className="text-sm text-zinc-400 mt-2">
            {totalVotes} votos registados
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

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
                className={`relative rounded-2xl overflow-hidden shadow-lg ${
                  isLeader ? 'ring-4 ring-yellow-400' : ''
                }`}
              >

                {/* IMAGEM */}
                <img
                  src={dj.image_url}
                  className="w-full h-[260px] object-cover"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/40" />

                {/* CONTEÚDO */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">

                  <h2 className="text-xl font-bold">
                    {dj.name}
                  </h2>

                  {/* PERCENTAGEM */}
                  <p className="text-sm font-medium">
                    {percent}%
                  </p>

                  {/* BARRA */}
                  <div className="w-full h-2 bg-white/20 rounded mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                </div>

                {/* BADGE LÍDER */}
                {isLeader && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                    #1
                  </div>
                )}

              </motion.a>
            )
          })}

        </div>
      </div>
    </main>
  )
}