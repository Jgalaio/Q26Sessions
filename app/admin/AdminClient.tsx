'use client'

import { useEffect, useState } from 'react'

export default function AdminClient() {
  const [djs, setDjs] = useState<any[]>([])
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchDjs()
  }, [])

  const fetchDjs = async () => {
    const res = await fetch('/api/djs')
    const data = await res.json()
    setDjs(data)
  }

  const handleAdd = async () => {
    if (!name || !file) return

    // upload imagem
    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const uploadData = await uploadRes.json()

    // criar DJ
    await fetch('/api/djs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        image_url: uploadData.url,
      }),
    })

    setName('')
    setFile(null)
    fetchDjs()
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/djs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    fetchDjs()
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-6">Admin DJs</h1>

      {/* ADICIONAR */}
      <div className="mb-8 space-y-3">
        <input
          type="text"
          placeholder="Nome do DJ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Adicionar DJ
        </button>
      </div>

      {/* LISTA */}
      <div className="grid grid-cols-2 gap-4">
        {djs.map((dj) => (
          <div key={dj.id} className="border p-3 rounded">
            <img src={dj.image_url} className="h-32 w-full object-cover mb-2" />
            <p className="font-bold">{dj.name}</p>

            <button
              onClick={() => handleDelete(dj.id)}
              className="mt-2 text-red-500"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}