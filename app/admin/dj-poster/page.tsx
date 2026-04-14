'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function DjPosterPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetchDjs()
  }, [])

  const fetchDjs = async () => {
    const res = await fetch('/api/djs')
    const djs = await res.json()

    const baseUrl = window.location.origin

    const result = await Promise.all(
      djs.map(async (dj: any) => {
        const url = `${baseUrl}/votar/${dj.slug || dj.id}`
        const qr = await QRCode.toDataURL(url)

        return {
          ...dj,
          qr,
        }
      })
    )

    setItems(result)
  }

  return (
    <main className="bg-black text-white">

      {/* BOTÃO */}
      <div className="p-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-white text-black font-bold rounded-xl"
        >
          🖨️ Imprimir Posters
        </button>
      </div>

      {/* POSTERS */}
      {items.map((dj, i) => (
        <div
          key={i}
          className="h-screen flex flex-col items-center justify-between p-10 text-center print:break-after-page"
        >

          {/* HEADER */}
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              VOTA NO TEU DJ
            </h1>

            <p className="opacity-70 mt-2 text-lg">
              Quarentões 26 Sessions
            </p>
          </div>

          {/* IMAGEM */}
          <img
            src={dj.image_url}
            className="w-[300px] h-[300px] object-cover rounded-3xl shadow-2xl"
          />

          {/* NOME */}
          <h2 className="text-4xl font-black tracking-wide">
            {dj.name}
          </h2>

          {/* QR */}
          <div className="bg-white p-6 rounded-2xl">
            <img src={dj.qr} className="w-48" />
          </div>

          {/* FOOTER */}
          <p className="opacity-60">
            📱 Faz scan e vota
          </p>

        </div>
      ))}

    </main>
  )
}