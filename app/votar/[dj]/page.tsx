'use client'

import { use, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function VotePage({
  params,
}: {
  params: Promise<{ dj: string }>
}) {
  const { dj } = use(params)

  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submitVote = async () => {
    setMessage('')
    setLoading(true)

    try {
      const cleanCode = code.trim().toUpperCase()

      if (!cleanCode) {
        setMessage('Introduz um código.')
        setLoading(false)
        return
      }

      // 1) Verificar se votação está aberta
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single()

      if (!settingsData?.voting_open) {
        setMessage('A votação está encerrada.')
        setLoading(false)
        return
      }

      // 2) Verificar código
      const { data: codeData, error: codeError } = await supabase
        .from('vote_codes')
        .select('*')
        .eq('code', cleanCode)
        .single()

      if (codeError || !codeData) {
        setMessage('Código inválido.')
        setLoading(false)
        return
      }

      if (codeData.is_used) {
        setMessage('Este código já foi utilizado.')
        setLoading(false)
        return
      }

      // 3) Registar voto
      const { error: voteError } = await supabase.from('votes').insert([
        {
          code: cleanCode,
          dj_slug: dj,
        },
      ])

      if (voteError) {
        setMessage('Erro ao registar voto.')
        setLoading(false)
        return
      }

      // 4) Marcar código como usado
      const { error: updateError } = await supabase
        .from('vote_codes')
        .update({
          is_used: true,
          voted_dj_slug: dj,
          voted_at: new Date().toISOString(),
        })
        .eq('code', cleanCode)

      if (updateError) {
        setMessage('Erro ao atualizar código.')
        setLoading(false)
        return
      }

      setMessage('Voto registado com sucesso!')
      setCode('')
    } catch (error) {
      setMessage('Ocorreu um erro inesperado.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <h1 className="text-4xl font-black mb-4">
          Votar em {dj.toUpperCase()}
        </h1>

        <p className="text-zinc-400 mb-6">
          Introduz o teu código único para confirmar o voto.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: TEST-001"
          className="w-full rounded-2xl bg-zinc-900 border border-zinc-700 p-4 mb-4 outline-none"
        />

        <button
          onClick={submitVote}
          disabled={loading}
          className="w-full rounded-2xl p-4 font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'A validar...' : 'Confirmar voto'}
        </button>

        {message && (
          <p className="mt-4 text-center text-lg font-medium">{message}</p>
        )}
      </div>
    </main>
  )
}