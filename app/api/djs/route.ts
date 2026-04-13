import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('djs')
    .select('*')
    .order('created_at')

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { name, image_url } = await req.json()

  await supabaseAdmin.from('djs').insert([
    { name, image_url },
  ])

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()

  await supabaseAdmin.from('djs').delete().eq('id', id)

  return NextResponse.json({ success: true })
}