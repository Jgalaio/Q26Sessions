import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST() {
  await supabaseAdmin.from('votes').delete().neq('id', '')
  return NextResponse.json({ success: true })
}