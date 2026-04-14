'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'

export default function VotePage() {
  const { dj } = useParams()
  const router = useRouter()

  const [djData, setDjData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)

  const scannerRef = useRef<any>(null)

  // ================= FETCH DJ =================
  useEffect(() => {
    fetch(`/api/djs/${dj}`)
      .then(res => res.json())
      .then(setDjData)
  }, [dj])

  // ================= SOM =================
  const beep = () => {
    const audio = new Audio('/beep.mp3')
    audio.play()
  }

  // ================= AUTO VOTE =================
  const autoVote = async (code: string) => {
    if (loading) return

    setLoading(true)

    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        dj_id: dj,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
    } else {
      beep()
      alert('✅ Voto registado!')

      setTimeout(() => {
        router.push('/')
      }, 2000)
    }

    setLoading(false)
  }

  // ================= START SCANNER =================
  const startScanner = async () => {
    setScanning(true)

    const scanner = new Html5Qrcode("reader")
    scannerRef.current = scanner

    await scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250,
      },
      (decodedText) => {
        const match = decodedText.match(/PS-[A-Z0-9]{4}-\d{6}/)

        if (match) {
          const code = match[0]

          // 🚫 evitar repetir scans
          if (code === lastScan) return

          setLastScan(code)

          stopScanner()
          autoVote(code)
        }
      },
      () => {}
    )
  }

  // ================= STOP =================
  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
      setScanning(false)
    }
  }

  if (!djData) return <p className="p-6">A carregar...</p>

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">

      <div className="max-w-sm w-full text-center">

        <img
          src={djData.image_url}
          className="w-full h-60 object-cover rounded-xl mb-4"
        />

        <h1 className="text-2xl font-bold mb-4">
          {djData.name}
        </h1>

        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full py-4 bg-blue-600 text-white rounded text-lg"
          >
            📷 Iniciar Scanner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="w-full py-4 bg-red-600 text-white rounded text-lg"
          >
            ❌ Parar Scanner
          </button>
        )}

        {/* CAMERA */}
        <div id="reader" className="w-full mt-4" />

        {loading && (
          <p className="mt-4 font-bold">
            A registar voto...
          </p>
        )}

      </div>
    </main>
  )
}