import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  const fileName = `${Date.now()}-${file.name}`

  await supabaseAdmin.storage
    .from('djs')
    .upload(fileName, file)

  const { data } = supabaseAdmin.storage
    .from('djs')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: data.publicUrl })
}