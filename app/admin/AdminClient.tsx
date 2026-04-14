'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Tab = 'djs' | 'ranking' | 'control'

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>('djs')

  const [djs, setDjs] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [votingOpen, setVotingOpen] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [totalCodes, setTotalCodes] = useState(1000)
  const [loadingCodes, setLoadingCodes] = useState(false)

  const [resetLoading, setResetLoading] = useState(false)

  // ================= INIT =================
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = () => {
    fetchDjs()
    fetchRanking()
    fetchSettings()
  }

  // ================= DJs =================
  const fetchDjs = async () => {
    const res = await fetch('/api/djs')
    const data = await res.json()
    setDjs(data || [])
  }

  const deleteDj = async (id: string) => {
    await fetch('/api/djs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchDjs()
  }

  const updateName = async (id: string) => {
    await fetch('/api/djs/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: newName }),
    })

    setEditingId(null)
    setNewName('')
    fetchDjs()
  }

  const handleAdd = async () => {
    if (!newName || !file) {
      alert('Preenche nome e imagem')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const uploadData = await uploadRes.json()

    await fetch('/api/djs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        image_url: uploadData.url,
      }),
    })

    setNewName('')
    setFile(null)
    fetchDjs()
  }

  // ================= RANKING =================
  const fetchRanking = async () => {
    const res = await fetch('/api/ranking')
    const data = await res.json()
    setRanking(data || [])
  }

  useEffect(() => {
    const channel = supabase
      .channel('votes-pro')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => fetchRanking()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ================= SETTINGS =================
  const fetchSettings = async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    setVotingOpen(data.voting_open)
  }

  const toggleVoting = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voting_open: !votingOpen }),
    })

    setVotingOpen(!votingOpen)
  }

  // ================= RESET (CORRIGIDO) =================
  const resetVotes = async () => {
    const confirmReset = confirm(
      '⚠️ ATENÇÃO!\n\nIsto vai apagar TODOS os votos.\n\nContinuar?'
    )

    if (!confirmReset) return

    setResetLoading(true)

    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
      } else {
        alert('✅ Votos resetados com sucesso')

        // 🔥 reload completo
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao fazer reset')
    }

    setResetLoading(false)
  }

  // ================= GERAR CÓDIGOS =================
  const handleGenerateCodes = async () => {
    setLoadingCodes(true)

    try {
      const res = await fetch('/api/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: totalCodes }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
      } else {
        alert(`✅ ${data.total} códigos criados!`)
      }
    } catch {
      alert('Erro ao gerar códigos')
    }

    setLoadingCodes(false)
  }

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' })
    window.location.href = '/admin-login'
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Admin Panel</h1>

        <div className="flex gap-2">
          <a
            href="/live"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold"
          >
            🎥 LIVE
          </a>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-xl"
          >
            Logout
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => setTab('djs')} className={tabBtn(tab === 'djs')}>DJs</button>
        <button onClick={() => setTab('ranking')} className={tabBtn(tab === 'ranking')}>Ranking</button>
        <button onClick={() => setTab('control')} className={tabBtn(tab === 'control')}>Controlo</button>
      </div>

      {/* CONTROL */}
      {tab === 'control' && (
        <div className="space-y-6">

          {/* RESET */}
          <div className="p-6 border rounded-xl">
            <h2 className="text-xl font-bold mb-2">Reset</h2>

            <button
              onClick={resetVotes}
              className="px-6 py-3 bg-red-500 text-white rounded-xl w-full"
            >
              {resetLoading ? 'A resetar...' : '🔥 Resetar votos'}
            </button>
          </div>

        </div>
      )}
    </main>
  )
}

function tabBtn(active: boolean) {
  return `px-4 py-2 rounded-xl font-bold ${
    active ? 'bg-black text-white' : 'bg-zinc-200'
  }`
}