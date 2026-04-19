'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ADMIN_LOGIN_PATH } from '@/lib/admin-auth'
import type { Dj, RankedDj, Settings } from '@/lib/types'

type Tab = 'djs' | 'ranking' | 'control'

type ApiResponse = {
  error?: string
  success?: boolean
  total?: number
  url?: string
}

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>('djs')
  const [djs, setDjs] = useState<Dj[]>([])
  const [ranking, setRanking] = useState<RankedDj[]>([])
  const [votingOpen, setVotingOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newDjName, setNewDjName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [totalCodes, setTotalCodes] = useState(1000)
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    void fetchAll()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('votes-pro')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        () => {
          void fetchRanking()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchAll() {
    await Promise.all([fetchDjs(), fetchRanking(), fetchSettings()])
  }

  async function fetchDjs() {
    const res = await fetch('/api/djs')
    const data = (await res.json()) as Dj[]
    setDjs(data || [])
  }

  async function fetchRanking() {
    const res = await fetch('/api/ranking')
    const data = (await res.json()) as RankedDj[]
    setRanking(data || [])
  }

  async function fetchSettings() {
    const res = await fetch('/api/settings')
    const data = (await res.json()) as Settings | null
    setVotingOpen(data?.voting_open ?? true)
  }

  async function deleteDj(id: string) {
    await fetch('/api/djs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    await fetchAll()
  }

  async function updateName(id: string) {
    if (!editingName.trim()) {
      alert('Preenche o nome do DJ')
      return
    }

    const res = await fetch('/api/djs/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editingName.trim() }),
    })

    const data = (await res.json()) as ApiResponse

    if (!res.ok) {
      alert(data.error || 'Erro ao atualizar DJ')
      return
    }

    setEditingId(null)
    setEditingName('')
    await fetchAll()
  }

  async function handleAdd() {
    if (!newDjName.trim() || !file) {
      alert('Preenche nome e imagem')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const uploadData = (await uploadRes.json()) as ApiResponse

    if (!uploadRes.ok || !uploadData.url) {
      alert(uploadData.error || 'Erro ao fazer upload da imagem')
      return
    }

    const createRes = await fetch('/api/djs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newDjName.trim(),
        image_url: uploadData.url,
      }),
    })

    const createData = (await createRes.json()) as ApiResponse

    if (!createRes.ok) {
      alert(createData.error || 'Erro ao criar DJ')
      return
    }

    setNewDjName('')
    setFile(null)
    await fetchAll()
  }

  async function toggleVoting() {
    const nextValue = !votingOpen

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voting_open: nextValue }),
    })

    const data = (await res.json()) as ApiResponse

    if (!res.ok) {
      alert(data.error || 'Erro ao atualizar o estado da votacao')
      return
    }

    setVotingOpen(nextValue)
  }

  async function resetVotes() {
    const confirmReset = confirm(
      'ATENCAO!\n\nIsto vai apagar TODOS os votos.\n\nContinuar?'
    )

    if (!confirmReset) {
      return
    }

    setResetLoading(true)

    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
      })

      const data = (await res.json()) as ApiResponse

      if (!res.ok) {
        alert(data.error || 'Erro ao fazer reset')
        return
      }

      alert('Votos resetados com sucesso')
      await fetchAll()
    } catch (error) {
      console.error(error)
      alert('Erro ao fazer reset')
    } finally {
      setResetLoading(false)
    }
  }

  async function handleGenerateCodes() {
    setLoadingCodes(true)

    try {
      const res = await fetch('/api/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: totalCodes }),
      })

      const data = (await res.json()) as ApiResponse

      if (!res.ok) {
        alert(data.error || 'Erro ao gerar codigos')
        return
      }

      alert(`${data.total || totalCodes} codigos criados!`)
    } catch (error) {
      console.error(error)
      alert('Erro ao gerar codigos')
    } finally {
      setLoadingCodes(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin-logout', { method: 'POST' })
    window.location.href = ADMIN_LOGIN_PATH
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black">Admin Panel</h1>

        <div className="flex gap-2">
          <a
            href="/live"
            target="_blank"
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-2 font-bold text-white"
            rel="noreferrer"
          >
            LIVE
          </a>

          <a
            href="/admin/analytics"
            className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
          >
            Analytics
          </a>

          <a
            href="/admin/dj-qrcodes"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white"
          >
            QR DJs
          </a>

          <a
            href="/admin/dj-poster"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
          >
            Poster DJs
          </a>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-3">
        <button onClick={() => setTab('djs')} className={tabBtn(tab === 'djs')}>
          DJs
        </button>
        <button
          onClick={() => setTab('ranking')}
          className={tabBtn(tab === 'ranking')}
        >
          Ranking
        </button>
        <button
          onClick={() => setTab('control')}
          className={tabBtn(tab === 'control')}
        >
          Controlo
        </button>
      </div>

      {tab === 'djs' && (
        <div>
          <div className="mb-8 rounded-xl border p-4">
            <h3 className="mb-3 font-bold">Adicionar DJ</h3>

            <input
              placeholder="Nome do DJ"
              value={newDjName}
              onChange={(event) => setNewDjName(event.target.value)}
              className="mb-3 w-full rounded border p-2"
            />

            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="mb-3"
            />

            <button
              onClick={handleAdd}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Adicionar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {djs.map((dj) => (
              <div key={dj.id} className="rounded-xl border p-3">
                <img
                  src={dj.image_url}
                  alt={dj.name}
                  className="mb-2 h-40 w-full rounded object-cover"
                />

                {editingId === dj.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      className="mb-2 w-full border p-2"
                    />
                    <button onClick={() => void updateName(dj.id)}>
                      Guardar
                    </button>
                  </>
                ) : (
                  <p className="font-bold">{dj.name}</p>
                )}

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(dj.id)
                      setEditingName(dj.name)
                    }}
                  >
                    Editar
                  </button>

                  <button onClick={() => void deleteDj(dj.id)}>Apagar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'ranking' && (
        <div className="space-y-3">
          {ranking.map((dj, index) => (
            <div
              key={dj.id}
              className="flex items-center gap-4 rounded-xl border p-3"
            >
              <div className="w-10 font-black">#{index + 1}</div>
              <img
                src={dj.image_url}
                alt={dj.name}
                className="h-12 w-12 rounded object-cover"
              />
              <div className="flex-1">{dj.name}</div>
              <div className="font-bold">{dj.votes}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'control' && (
        <div className="space-y-6">
          <div className="rounded-xl border p-6">
            <h2 className="mb-2 text-xl font-bold">Estado da votacao</h2>

            <p className="mb-4">
              <span className={votingOpen ? 'text-green-500' : 'text-red-500'}>
                {votingOpen ? 'ABERTA' : 'FECHADA'}
              </span>
            </p>

            <button
              onClick={toggleVoting}
              className="rounded-xl bg-black px-6 py-3 text-white"
            >
              {votingOpen ? 'Fechar votacao' : 'Abrir votacao'}
            </button>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="mb-2 text-xl font-bold">Reset</h2>

            <button
              onClick={resetVotes}
              className="w-full rounded-xl bg-red-500 px-6 py-3 text-white"
            >
              {resetLoading ? 'A resetar...' : 'Resetar votos'}
            </button>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="mb-3 text-xl font-bold">Gerar codigos</h2>

            <input
              type="number"
              value={totalCodes}
              onChange={(event) => setTotalCodes(Number(event.target.value))}
              className="mb-4 w-full rounded border p-3"
            />

            <button
              onClick={handleGenerateCodes}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-white"
            >
              {loadingCodes ? 'A gerar...' : 'Gerar codigos'}
            </button>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="mb-3 text-xl font-bold">Impressao de senhas</h2>

            <a
              href="/admin/print"
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded-xl bg-purple-600 px-6 py-3 text-center text-white"
            >
              Abrir impressao de codigos
            </a>
          </div>
        </div>
      )}
    </main>
  )
}

function tabBtn(active: boolean) {
  return `rounded-xl px-4 py-2 font-bold ${
    active ? 'bg-black text-white' : 'bg-zinc-200'
  }`
}
