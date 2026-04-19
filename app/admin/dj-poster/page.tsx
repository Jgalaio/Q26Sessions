'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { Dj } from '@/lib/types'

type PosterItem = Dj & {
  qr: string
}

export default function DjPosterPage() {
  const [items, setItems] = useState<PosterItem[]>([])

  useEffect(() => {
    let isMounted = true

    const loadDjs = async () => {
      try {
        const res = await fetch('/api/djs')
        const djs = (await res.json()) as Dj[]
        const baseUrl = window.location.origin

        const result = await Promise.all(
          djs.map(async (dj) => {
            const url = `${baseUrl}/votar/${dj.slug || dj.id}`
            const qr = await QRCode.toDataURL(url)

            return {
              ...dj,
              qr,
            }
          })
        )

        if (isMounted) {
          setItems(result)
        }
      } catch (error) {
        console.error('Erro ao gerar posters:', error)
      }
    }

    void loadDjs()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="bg-black text-white">
      <div className="p-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-white px-6 py-3 font-bold text-black"
        >
          Imprimir posters A3
        </button>
      </div>

      {items.map((dj) => (
        <div
          key={dj.id}
          className="relative flex h-[420mm] w-full flex-col items-center justify-between p-16 text-center print:break-after-page"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-black to-cyan-600/30 blur-3xl" />

          <img src="/logo.png" alt="Logo" className="z-10 w-40" />

          <div className="z-10">
            <h1 className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-7xl font-black text-transparent">
              VOTA NO TEU DJ
            </h1>

            <p className="mt-3 text-2xl opacity-70">Quarentoes 26 Sessions</p>
          </div>

          <div className="z-10">
            <img
              src={dj.image_url}
              alt={dj.name}
              className="h-[500px] w-[500px] rounded-[40px] border-8 border-white object-cover shadow-2xl"
            />

            <h2 className="mt-6 text-6xl font-black">{dj.name}</h2>
          </div>

          <div className="z-10 rounded-3xl bg-white p-8 shadow-2xl">
            <img src={dj.qr} alt={`QR para votar no DJ ${dj.name}`} className="w-72" />
          </div>

          <div className="z-10">
            <p className="text-3xl font-bold">Faz scan e vota</p>
            <p className="mt-2 opacity-60">Escolhe o teu DJ favorito</p>
          </div>
        </div>
      ))}
    </main>
  )
}
