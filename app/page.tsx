'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type DJ = {
  id: string
  name: string
  image_url: string
}

export default function HomePage() {
  const [djs, setDjs] = useState<DJ[]>([])
  const [totalVotes, setTotalVotes] = useState<number | null>(null)
  const [loadingVotes, setLoadingVotes] = useState(true)

  useEffect(() => {
    fetchDjs()
    fetchVotes()
  }, [])

  const fetchDjs = async () => {
    try {
      const res = await fetch('/api/djs')
      const data = await res.json()
      setDjs(data || [])
    } catch (err) {
      console.error('Erro ao carregar DJs', err)
    }
  }

  const fetchVotes = async () => {
    try {
      const res = await fetch('/api/votes-count')
      const data = await res.json()
      setTotalVotes(data.count ?? 0)
    } catch {
      setTotalVotes(0)
    } finally {
      setLoadingVotes(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center">

        {/* TÍTULO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <img
            src="/tittle.png"
            alt="Purificação Sessions"
            className="mx-auto w-full max-w-[520px] object-contain mb-4"
          />

          <p className="text-zinc-600 text-base md:text-lg">
            Escolhe o teu DJ favorito e vota com o teu código único
          </p>

          <div className="mt-5 inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-5 py-2 shadow-sm">
            {loadingVotes ? (
              <span className="text-sm font-semibold text-fuchsia-700 animate-pulse">
                A carregar votos...
              </span>
            ) : (
              <span className="text-sm font-semibold text-fuchsia-700">
                {totalVotes} votos já registados
              </span>
            )}
          </div>
        </motion.div>

        {/* GRID DJs */}
        {djs.length === 0 ? (
          <p className="text-zinc-500">Ainda não existem DJs.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {djs.map((dj, index) => (
              <motion.a
                key={dj.id}
                href={`/votar/${dj.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group relative h-[320px] rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(217,70,239,0.25)] transition-all duration-300"
              >
                {/* IMAGEM */}
                <img
                  src={dj.image_url}
                  alt={dj.name}
                  className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition duration-300" />

                {/* CONTEÚDO */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-white text-2xl md:text-3xl font-black tracking-wide drop-shadow-[0_4px_14px_rgba(0,0,0,0.65)] mb-4">
                    {dj.name}
                  </h2>

                  <div className="rounded-2xl px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 to-cyan-500 shadow-md group-hover:shadow-[0_0_24px_rgba(34,211,238,0.55)] transition-all duration-300">
                    Votar
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}