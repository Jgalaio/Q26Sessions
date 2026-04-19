'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'
import type { Dj } from '@/lib/types'

export default function VotePage() {
  const params = useParams<{ dj: string | string[] }>()
  const router = useRouter()
  const djId = Array.isArray(params.dj) ? params.dj[0] : params.dj

  const [djData, setDjData] = useState<Dj | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [loadingVote, setLoadingVote] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadDj = async () => {
      try {
        const res = await fetch(`/api/djs/${djId}`)
        const data = (await res.json()) as Partial<Dj> & { error?: string }

        if (!isMounted) {
          return
        }

        if (!res.ok || 'error' in data) {
          setLoadError(
            'error' in data && data.error
              ? data.error
              : 'Nao foi possivel carregar este DJ.'
          )
          return
        }

        setDjData(data as Dj)
        setLoadError('')
      } catch (error) {
        console.error('Erro ao carregar DJ:', error)

        if (isMounted) {
          setLoadError('Nao foi possivel carregar este DJ.')
        }
      } finally {
        if (isMounted) {
          setPageLoading(false)
        }
      }
    }

    void loadDj()

    return () => {
      isMounted = false
    }
  }, [djId])

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current
      scannerRef.current = null

      if (!scanner) {
        return
      }

      void (async () => {
        try {
          await scanner.stop()
        } catch {}

        try {
          await scanner.clear()
        } catch {}
      })()
    }
  }, [])

  function feedback() {
    const audio = new Audio('/beep.mp3')
    void audio.play().catch(() => undefined)

    if (navigator.vibrate) {
      navigator.vibrate(150)
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current

    if (!scanner) {
      setScanning(false)
      return
    }

    scannerRef.current = null
    try {
      await scanner.stop()
    } catch {}

    try {
      await scanner.clear()
    } catch {}
    setScanning(false)
  }

  async function autoVote(code: string) {
    if (loadingVote) {
      return
    }

    setLoadingVote(true)

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          dj_id: djId,
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        alert(data.error || 'Nao foi possivel registar o voto.')
        return
      }

      feedback()
      setSuccess(true)

      setTimeout(() => {
        router.push('/')
      }, 2000)
    } finally {
      setLoadingVote(false)
    }
  }

  async function startScanner() {
    if (scanning || !djId) {
      return
    }

    setScanning(true)

    try {
      const scanner = new Html5Qrcode('reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: 260 },
        (decodedText) => {
          const match = decodedText.match(/PS-[A-Z0-9]{4}-\d{6}/)

          if (!match) {
            return
          }

          const code = match[0]

          if (code === lastScan) {
            return
          }

          setLastScan(code)
          void stopScanner()
          void autoVote(code)
        },
        () => {}
      )
    } catch (error) {
      console.error('Erro ao iniciar scanner:', error)
      setScanning(false)
      alert('Nao foi possivel iniciar a camara.')
    }
  }

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <p className="text-zinc-500">A carregar DJ...</p>
      </main>
    )
  }

  if (loadError || !djData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 p-6 text-center shadow-xl">
          <p className="mb-4 text-lg font-bold text-zinc-800">
            {loadError || 'DJ nao encontrado.'}
          </p>

          <button
            onClick={() => router.push('/')}
            className="rounded-xl bg-black px-5 py-3 text-white"
          >
            Voltar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-2xl">
          <div className="group relative">
            <img
              src={djData.image_url}
              alt={djData.name}
              className="h-64 w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />

            <h1 className="absolute bottom-4 left-4 text-2xl font-black tracking-wide text-white">
              {djData.name}
            </h1>
          </div>

          <div className="space-y-4 p-5">
            {success && (
              <div className="rounded-xl bg-green-500 p-3 text-center font-bold text-white animate-pulse">
                VOTO REGISTADO
              </div>
            )}

            {loadingVote && (
              <div className="animate-pulse text-center text-gray-500">
                A registar voto...
              </div>
            )}

            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 py-4 text-lg font-bold text-white shadow-lg shadow-fuchsia-500/30 transition-all duration-300 hover:scale-105"
              >
                SCAN E VOTAR
              </button>
            ) : (
              <button
                onClick={() => void stopScanner()}
                className="w-full rounded-xl bg-red-500 py-4 font-bold text-white"
              >
                PARAR
              </button>
            )}

            <div className="relative">
              <div
                id="reader"
                className={`w-full overflow-hidden rounded-xl ${
                  scanning ? 'block' : 'hidden'
                }`}
              />

              {scanning && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="h-1 w-full animate-[scan_2s_linear_infinite] bg-red-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(250px);
          }
        }
      `}</style>
    </main>
  )
}
