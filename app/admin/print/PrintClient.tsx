'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { VoteCode } from '@/lib/types'

type PrintMode = 'ticket' | 'a4-12' | 'a4-24'

type PrintableVoteCode = VoteCode & {
  qr: string
}

function filterCodes(
  codes: VoteCode[],
  start: number,
  end: number,
  onlyAvailable: boolean
) {
  let list = [...codes]

  if (onlyAvailable) {
    list = list.filter((code) => !code.distributed)
  }

  return list.slice(start - 1, end)
}

export default function PrintClient() {
  const [codes, setCodes] = useState<VoteCode[]>([])
  const [filtered, setFiltered] = useState<VoteCode[]>([])
  const [items, setItems] = useState<PrintableVoteCode[]>([])
  const [start, setStart] = useState(1)
  const [end, setEnd] = useState(100)
  const [onlyAvailable, setOnlyAvailable] = useState(true)
  const [mode, setMode] = useState<PrintMode>('ticket')

  useEffect(() => {
    let isMounted = true

    const loadCodes = async () => {
      try {
        const res = await fetch('/api/codes')
        const data = (await res.json()) as VoteCode[]

        if (isMounted) {
          setCodes(data || [])
        }
      } catch (error) {
        console.error('Erro ao carregar codigos:', error)
      }
    }

    void loadCodes()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setFiltered(filterCodes(codes, start, end, onlyAvailable))
  }, [codes, start, end, onlyAvailable])

  useEffect(() => {
    let isMounted = true

    const loadQrs = async () => {
      const result = await Promise.all(
        filtered.map(async (code) => {
          const qr = await QRCode.toDataURL(code.code)

          return {
            ...code,
            qr,
          }
        })
      )

      if (isMounted) {
        setItems(result)
      }
    }

    void loadQrs()

    return () => {
      isMounted = false
    }
  }, [filtered])

  async function refreshCodes() {
    const res = await fetch('/api/codes')
    const data = (await res.json()) as VoteCode[]
    setCodes(data || [])
  }

  async function markAsDistributed() {
    const codesToUpdate = filtered.map((code) => code.code)

    if (codesToUpdate.length === 0) {
      return
    }

    await fetch('/api/codes/distribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: codesToUpdate }),
    })

    alert('Marcados como distribuidos')
    await refreshCodes()
  }

  return (
    <main className="bg-white p-4 font-mono">
      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        <input
          type="number"
          value={start}
          onChange={(event) => setStart(Number(event.target.value))}
          className="w-20 border p-2"
        />

        <span>ate</span>

        <input
          type="number"
          value={end}
          onChange={(event) => setEnd(Number(event.target.value))}
          className="w-20 border p-2"
        />

        <select
          value={mode}
          onChange={(event) => setMode(event.target.value as PrintMode)}
          className="border p-2"
        >
          <option value="ticket">Talao termico</option>
          <option value="a4-12">A4 (3x4 - 12)</option>
          <option value="a4-24">A4 (4x6 - 24)</option>
        </select>

        <button
          onClick={() => window.print()}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Imprimir
        </button>

        <button
          onClick={markAsDistributed}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Marcar como entregue
        </button>

        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={() => setOnlyAvailable(!onlyAvailable)}
          />
          So nao entregues
        </label>
      </div>

      {mode === 'ticket' && (
        <div className="flex flex-col items-center gap-4">
          {items.map((item) => (
            <div
              key={item.code}
              className={`w-[260px] border px-3 py-2 text-center ${
                item.distributed ? 'bg-red-100' : 'bg-white'
              }`}
            >
              <p className="text-[10px] font-bold">VOTA NO TEU DJ PREFERIDO</p>

              <p className="mb-1 text-[9px] text-gray-600">
                Quarentoes 26 Sessions
              </p>

              <img
                src={item.qr}
                alt={`QR do codigo ${item.code}`}
                className="mx-auto mb-2 w-24"
              />

              <p className="text-sm font-bold tracking-widest">{item.code}</p>

              <p className="text-[8px]">
                {item.distributed ? 'ENTREGUE' : 'DISPONIVEL'}
              </p>

              <div className="mt-2 border-t border-dashed border-black text-[8px]">
                cortar
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === 'a4-12' && (
        <div>
          {Array.from({ length: Math.ceil(items.length / 12) }).map(
            (_, pageIndex) => {
              const pageItems = items.slice(pageIndex * 12, (pageIndex + 1) * 12)

              return (
                <div
                  key={`a4-12-${pageIndex}`}
                  className="mb-6 grid grid-cols-3 gap-4 print:mb-0 print:break-after-page"
                >
                  {pageItems.map((item) => (
                    <div
                      key={item.code}
                      className={`border p-3 text-center ${
                        item.distributed ? 'bg-red-100' : 'bg-white'
                      }`}
                      style={{ height: '240px' }}
                    >
                      <p className="text-[10px] font-bold">
                        VOTA NO TEU DJ PREFERIDO
                      </p>

                      <p className="mb-2 text-[9px] text-gray-600">
                        Quarentoes 26 Sessions
                      </p>

                      <img
                        src={item.qr}
                        alt={`QR do codigo ${item.code}`}
                        className="mx-auto mb-3 w-24"
                      />

                      <p className="text-sm font-bold tracking-[0.2em]">
                        {item.code}
                      </p>

                      <p className="mt-1 text-[9px]">
                        {item.distributed ? 'ENTREGUE' : 'DISPONIVEL'}
                      </p>

                      <div className="mt-2 border-t border-dashed border-black text-[9px]">
                        cortar aqui
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          )}
        </div>
      )}

      {mode === 'a4-24' && (
        <div>
          {Array.from({ length: Math.ceil(items.length / 24) }).map(
            (_, pageIndex) => {
              const pageItems = items.slice(pageIndex * 24, (pageIndex + 1) * 24)

              return (
                <div
                  key={`a4-24-${pageIndex}`}
                  className="mb-6 grid grid-cols-4 gap-3 print:mb-0 print:break-after-page"
                >
                  {pageItems.map((item) => (
                    <div
                      key={item.code}
                      className={`border p-2 text-center ${
                        item.distributed ? 'bg-red-100' : 'bg-white'
                      }`}
                      style={{ height: '160px' }}
                    >
                      <p className="text-[8px]">VOTA NO TEU DJ</p>

                      <p className="mb-1 text-[7px] text-gray-600">
                        Q26 Sessions
                      </p>

                      <img
                        src={item.qr}
                        alt={`QR do codigo ${item.code}`}
                        className="mx-auto mb-1 w-16"
                      />

                      <p className="text-[9px] font-bold tracking-widest">
                        {item.code}
                      </p>

                      <div className="mt-1 border-t border-dashed border-black text-[7px]">
                        cortar
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          )}
        </div>
      )}
    </main>
  )
}
