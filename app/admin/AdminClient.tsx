'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Vote = {
  id: string
  code: string
  dj_slug: string
  created_at: string
}

export default function AdminClient() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [votingOpen, setVotingOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchVotes()
    fetchSettings()
  }, [])

  const fetchVotes = async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setVotes(data)
    }

    setLoading(false)
  }

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (data) {
      setVotingOpen(data.voting_open)
    }
  }

  const toggleVoting = async () => {
    const newValue = !votingOpen

    await supabase
      .from('settings')
      .update({
        voting_open: newValue,
        updated_at: new Date().toISOString(),
      })
      .neq('id', '')

    setVotingOpen(newValue)
  }

  const logout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const rankingMap = votes.reduce<Record<string, number>>((acc, vote) => {
    acc[vote.dj_slug] = (acc[vote.dj_slug] || 0) + 1
    return acc
  }, {})

  const ranking = Object.entries(rankingMap).sort((a, b) => b[1] - a[1])

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-5xl font-black">Admin</h1>
          <button
            onClick={logout}
            className="rounded-xl px-4 py-2 bg-zinc-800 hover:bg-zinc-700"
          >
            Sair
          </button>
        </div>

        <div className="mb-8">
          <button
            onClick={toggleVoting}
            className={`rounded-2xl px-6 py-4 font-bold ${
              votingOpen
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {votingOpen ? 'Fechar votação' : 'Abrir votação'}
          </button>

          <p className="mt-3 text-zinc-400">
            Estado atual: {votingOpen ? '🟢 Aberta' : '🔴 Fechada'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold mb-4">Ranking</h2>

            {ranking.length === 0 ? (
              <p className="text-zinc-400">Ainda sem votos.</p>
            ) : (
              <div className="space-y-3">
                {ranking.map(([dj, total], index) => (
                  <div
                    key={dj}
                    className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4"
                  >
                    <span className="font-bold">
                      {index + 1}. {dj.toUpperCase()}
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {total} votos
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold mb-4">Resumo</h2>
            <p className="text-lg mb-2">
              Total de votos: <strong>{votes.length}</strong>
            </p>
            <p className="text-zinc-400">
              Atualiza ao recarregar a página.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold mb-4">Lista de votos</h2>

          {loading ? (
            <p>A carregar...</p>
          ) : votes.length === 0 ? (
            <p className="text-zinc-400">Ainda não existem votos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">DJ</th>
                    <th className="p-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((vote) => (
                    <tr key={vote.id} className="border-b border-zinc-900">
                      <td className="p-3">{vote.code}</td>
                      <td className="p-3">{vote.dj_slug.toUpperCase()}</td>
                      <td className="p-3">
                        {new Date(vote.created_at).toLocaleString('pt-PT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}