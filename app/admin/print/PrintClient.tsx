'use client'

import { useEffect, useState } from 'react'

export default function PrintClient() {
  const [codes, setCodes] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])

  const [start, setStart] = useState(1)
  const [end, setEnd] = useState(100)

  const [onlyAvailable, setOnlyAvailable] = useState(true)

  useEffect(() => {
    fetchCodes()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [codes, start, end, onlyAvailable])

  const fetchCodes = async () => {
    const res = await fetch('/api/codes')
    const data = await res.json()
    setCodes(data)
  }

  const applyFilter = () => {
    let list = [...codes]

    if (onlyAvailable) {
      list = list.filter(c => !c.distributed)
    }

    const slice = list.slice(start - 1, end)
    setFiltered(slice)
  }

  const markAsDistributed = async () => {
    const codesToUpdate = filtered.map(c => c.code)

    await fetch('/api/codes/distribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: codesToUpdate }),
    })

    alert('✅ Marcados como distribuídos')

    fetchCodes()
  }

  return (
    <main className="bg-white flex flex-col items-center p-4 font-mono">

      {/* CONTROLOS */}
      <div className="mb-4 print:hidden flex flex-wrap gap-2 items-center">

        <input
          type="number"
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
          className="border p-2 w-20"
        />

        <span>até</span>

        <input
          type="number"
          value={end}
          onChange={(e) => setEnd(Number(e.target.value))}
          className="border p-2 w-20"
        />

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white rounded"
        >
          🖨️ Imprimir
        </button>

        <button
          onClick={markAsDistributed}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          ✅ Marcar como entregue
        </button>

        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={() => setOnlyAvailable(!onlyAvailable)}
          />
          Só não entregues
        </label>

      </div>

      {/* TALÕES */}
      <div className="flex flex-col gap-4">

        {filtered.map((item, i) => (
          <div
            key={i}
            className={`w-[260px] border px-3 py-2 text-center ${
              item.distributed ? 'bg-red-100' : 'bg-white'
            }`}
          >

            <p className="text-[10px]">
              VOTA NO TEU DJ PREFERIDO
            </p>

            <p className="text-[9px] text-gray-600">
              Quarentões 26 Sessions
            </p>

            <p className="text-[10px]">
              --------------------
            </p>

            <p className="text-xl font-bold tracking-[0.3em]">
              {item.code}
            </p>

            <p className="text-[10px]">
              --------------------
            </p>

            <p className="text-[9px]">
              {item.distributed ? 'ENTREGUE' : 'DISPONÍVEL'}
            </p>

            <div className="border-t border-dashed border-black text-[9px] mt-1">
              ✂ cortar aqui
            </div>

          </div>
        ))}

      </div>
    </main>
  )
}