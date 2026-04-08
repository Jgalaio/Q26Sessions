'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [totalVotes, setTotalVotes] = useState<number | null>(null)
  const [loadingVotes, setLoadingVotes] = useState(true)

  useEffect(() => {
    fetchVotes()
  }, [])

  const fetchVotes = async () => {
    const { count } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })

    setTotalVotes(count ?? 0)
    setLoadingVotes(false)
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* TÍTULO */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-14"
        >
          <img
            src="/tittle.png"
            alt="Purificação Sessions"
            className="mx-auto w-full max-w-[320px] object-contain mb-4"
          />

          <p className="text-zinc-600 text-base md:text-lg">
            Escolhe o teu DJ favorito e vota com o teu código único
          </p>

          <div className="mt-5  inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-5 py-2 shadow-sm mb-5">
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 ">
          {Array.from({ length: 10 }).map((_, i) => {
            const dj = `dj-${String(i + 1).padStart(3, '0')}`
            const djName = `DJ ${String(i + 1).padStart(3, '0')}`

            return (
              <motion.a
                key={dj}
                href={`/votar/${dj}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative h-[150px] w-[150px] rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(217,70,239,0.25)] transition-all duration-300"
              >
                {/* IMAGEM */}
                <img
                  src={`/djs/${dj}.jpg`}
                  alt={djName}
                  className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition duration-300" />

                {/* CONTEÚDO */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-white text-2xl md:text-3xl font-black tracking-wide drop-shadow-[0_4px_14px_rgba(0,0,0,0.65)] mb-4">
                    {djName}
                  </h2>

                  <div className="rounded-2xl px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 to-cyan-500 shadow-md group-hover:shadow-[0_0_24px_rgba(34,211,238,0.55)] transition-all duration-300">
                    Votar
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