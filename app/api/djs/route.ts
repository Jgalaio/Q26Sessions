import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin()

  const { data } = await supabaseAdmin
    .from('djs')
    .select('*')
    .order('created_at')

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { name, image_url } = (await req.json()) as {
    name: string
    image_url: string
  }
  const supabaseAdmin = getSupabaseAdmin()
  const payload = [{ name, image_url }]

  await supabaseAdmin.from('djs').insert(payload as never)

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  const supabaseAdmin = getSupabaseAdmin()

  await supabaseAdmin.from('djs').delete().eq('id', id)

  return NextResponse.json({ success: true })
}
