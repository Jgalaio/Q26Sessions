import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - listar DJs
export async function GET() {
  const { data, error } = await supabase
    .from('djs')
    .select('*')
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST - criar DJ
export async function POST(req: Request) {
  const { name, image_url } = await req.json()

  const { error } = await supabase
    .from('djs')
    .insert([{ name, image_url }])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE - remover DJ
export async function DELETE(req: Request) {
  const { id } = await req.json()

  const { error } = await supabase
    .from('djs')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}