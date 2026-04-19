'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ADMIN_DASHBOARD_PATH } from '@/lib/admin-auth'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erro no login')
      setLoading(false)
      return
    }

    router.push(ADMIN_DASHBOARD_PATH)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <h1 className="text-3xl font-black mb-4">Admin Login</h1>
        <p className="text-zinc-400 mb-6">
          Introduz a password para aceder ao painel.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl bg-zinc-900 border border-zinc-700 p-4 mb-4 outline-none"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-2xl p-4 font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>

        {error && (
          <p className="mt-4 text-center text-red-400">{error}</p>
        )}
      </div>
    </main>
  )
}
