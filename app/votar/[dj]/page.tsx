'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function VotePage() {
  const params = useParams()
  const djId = params.dj as string

  const [dj, setDj] = useState<any>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchDj()
  }, [])

  const fetchDj = async () => {
    const res = await fetch(`/api/djs/${djId}`)
    const data = await res.json()
    setDj(data)
    setLoading(false)
  }

  const handleVote = async () => {
    if (!code) {
      setMessage('Introduce o código')
      return
    }

    setSubmitting(true)
    setMessage('')

    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, dj_id: djId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  // LOADING
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl">
          A carregar DJ...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >

        {/* IMAGEM */}
        <div className="relative mb-6 rounded-3xl overflow-hidden shadow-2xl">
          <img
            src={dj.image_url}
            className="w-full h-[320px] object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-black text-center drop-shadow-lg">
              {dj.name}
            </h1>
          </div>
        </div>

        {/* SUCESSO */}
        {success ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-6 bg-green-500/10 border border-green-500 rounded-2xl"
          >
            <p className="text-2xl font-bold mb-2">
              ✅ Voto registado!
            </p>

            <p className="text-sm text-zinc-300">
              Obrigado pela tua participação
            </p>
          </motion.div>
        ) : (
          <>
            {/* INPUT */}
            <input
              placeholder="Código de voto"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700 mb-4 outline-none focus:ring-2 focus:ring-fuchsia-500"
            />

            {/* BOTÃO */}
            <button
              onClick={handleVote}
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-fuchsia-500 to-cyan-500 shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            >
              {submitting ? 'A votar...' : 'Votar'}
            </button>

            {/* MENSAGEM */}
            {message && (
              <p className="mt-4 text-center text-red-400 font-medium">
                {message}
              </p>
            )}
          </>
        )}
      </motion.div>
    </main>
  )
}