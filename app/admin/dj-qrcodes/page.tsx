'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { Dj } from '@/lib/types'

type DjQrItem = Dj & {
  qr: string
  url: string
}

export default function DjQRCodesPage() {
  const [items, setItems] = useState<DjQrItem[]>([])

  useEffect(() => {
    let isMounted = true

    const loadItems = async () => {
      try {
        const res = await fetch('/api/djs')
        const data = (await res.json()) as Dj[]
        const baseUrl = window.location.origin

        const result = await Promise.all(
          data.map(async (dj) => {
            const url = `${baseUrl}/votar/${dj.slug || dj.id}`
            const qr = await QRCode.toDataURL(url)

            return {
              ...dj,
              qr,
              url,
            }
          })
        )

        if (isMounted) {
          setItems(result)
        }
      } catch (error) {
        console.error('Erro a gerar QR codes:', error)
      }
    }

    void loadItems()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="bg-white p-6">
      <div className="mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Imprimir QR Codes
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {items.map((dj) => (
          <div
            key={dj.id}
            className="flex h-[400px] flex-col items-center border p-4 text-center"
          >
            <p className="mb-2 text-lg font-bold">VOTA NO TEU DJ</p>

            <img
              src={dj.image_url}
              alt={dj.name}
              className="mb-3 h-32 w-32 rounded-xl object-cover"
            />

            <h2 className="mb-3 text-xl font-black">{dj.name}</h2>

            <img
              src={dj.qr}
              alt={`QR para votar no DJ ${dj.name}`}
              className="mb-2 w-40"
            />

            <p className="break-all text-xs opacity-60">{dj.url}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
