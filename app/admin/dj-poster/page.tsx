'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function DjPosterPage() {
  const [djs, setDjs] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetchDjs()
  }, [])

  useEffect(() => {
    generateQR()
  }, [djs])

  const fetchDjs = async () => {
    const res = await fetch('/api/djs')
    const data = await res.json()
    setDjs(data || [])
  }

  const generateQR = async () => {
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

    setItems(result)
  }

  return (
    <main className="bg-black min-h-screen p-6 text-white">

      {/* BOTÃO PRINT */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-white text-black font-bold rounded-xl"
        >
          🖨️ Imprimir Poster
        </button>
      </div>

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black tracking-widest bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
          VOTA NO TEU DJ
        </h1>

        <p className="text-lg opacity-70 mt-2">
          Quarentões 26 Sessions
        </p>
      </div>

      {/* GRID FESTIVAL */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

        {items.map((dj, i) => (
          <div
            key={i}
            className="bg-zinc-900 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden"
          >

            {/* glow */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition duration-500 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 blur-xl" />

            {/* IMAGE */}
            <img
              src={dj.image_url}
              className="w-full h-48 object-cover rounded-2xl mb-4"
            />

            {/* NAME */}
            <h2 className="text-2xl font-black tracking-wide mb-4">
              {dj.name}
            </h2>

            {/* QR */}
            <div className="bg-white p-3 rounded-xl inline-block">
              <img src={dj.qr} className="w-32" />
            </div>

            {/* LABEL */}
            <p className="text-xs mt-3 opacity-60">
              Scan para votar
            </p>

          </div>
        ))}

      </div>

    </main>
  )
}