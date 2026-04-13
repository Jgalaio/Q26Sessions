'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function VotePage() {
  const params = useParams()
  const router = useRouter()
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

    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-black">
        A carregar...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >

        {/* CARD */}
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl p-4">

          {/* IMAGEM */}
          <div className="relative mb-4 rounded-2xl overflow-hidden">
            <img
              src={dj.image_url}
              className="w-full h-[260px] object-cover"
            />

            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-3xl font-black text-white drop-shadow">
                {dj.name}
              </h1>
            </div>
          </div>

          {/* SUCESSO */}
          {success ? (
            <div className="text-center p-4 bg-green-50 border border-green-300 rounded-xl">
              <p className="text-xl font-bold text-green-600">
                ✅ Voto registado!
              </p>

              <p className="text-sm text-zinc-600 mt-2">
                A redirecionar...
              </p>
            </div>
          ) : (
            <>
              {/* INPUT */}
              <input
                placeholder="Código de voto"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-300 mb-3 outline-none focus:ring-2 focus:ring-fuchsia-500"
              />

              {/* BOTÃO */}
              <button
                onClick={handleVote}
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-fuchsia-500 to-cyan-500"
              >
                {submitting ? 'A votar...' : 'Votar'}
              </button>

              {/* ERRO */}
              {message && (
                <p className="mt-3 text-center text-red-500">
                  {message}
                </p>
              )}
            </>
          )}

        </div>

      </motion.div>
    </main>
  )
}