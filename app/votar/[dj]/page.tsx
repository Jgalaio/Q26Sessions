'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'

export default function VotePage() {
  const { dj } = useParams()
  const router = useRouter()

  const [code, setCode] = useState('')
  const [djData, setDjData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  const scannerRef = useRef<any>(null)

  // ================= FETCH DJ =================
  useEffect(() => {
    fetch(`/api/djs/${dj}`)
      .then(res => res.json())
      .then(setDjData)
  }, [dj])

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
          setCode(match[0])
          stopScanner()
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

  // ================= VOTAR =================
  const handleVote = async () => {
    if (!code) {
      alert('Insere um código')
      return
    }

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
      alert('✅ Voto registado!')

      setTimeout(() => {
        router.push('/')
      }, 3000)
    }

    setLoading(false)
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

        {/* INPUT */}
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código"
          className="w-full border p-3 rounded mb-3 text-center tracking-widest"
        />

        {/* BOTÕES */}
        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full mb-3 py-3 bg-blue-600 text-white rounded"
          >
            📷 Scanner em tempo real
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="w-full mb-3 py-3 bg-red-600 text-white rounded"
          >
            ❌ Parar scanner
          </button>
        )}

        {/* CAMERA VIEW */}
        <div id="reader" className="w-full mb-3" />

        {/* VOTAR */}
        <button
          onClick={handleVote}
          className="w-full py-3 bg-black text-white rounded"
        >
          {loading ? 'A votar...' : 'Votar'}
        </button>

      </div>
    </main>
  )
}