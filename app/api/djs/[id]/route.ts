import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const identifier = decodeURIComponent(id)
  const supabaseAdmin = getSupabaseAdmin()

  const { data: byId, error: idError } = await supabaseAdmin
    .from('djs')
    .select('*')
    .eq('id', identifier)
    .maybeSingle()

  if (idError) {
    return NextResponse.json(
      { error: idError.message },
      { status: 500 }
    )
  }

  if (byId) {
    return NextResponse.json(byId)
  }

  const { data: bySlug, error: slugError } = await supabaseAdmin
    .from('djs')
    .select('*')
    .eq('slug', identifier)
    .maybeSingle()

  if (slugError) {
    return NextResponse.json(
      { error: slugError.message },
      { status: 500 }
    )
  }

  if (!bySlug) {
    return NextResponse.json(
      { error: 'DJ nÃ£o encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json(bySlug)
}
