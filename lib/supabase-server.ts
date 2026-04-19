import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type SupabaseAdminClient = SupabaseClient<Database>
type SupabaseServerClient = SupabaseClient<Database>

let supabaseAdmin: SupabaseAdminClient | null = null
let supabaseServer: SupabaseServerClient | null = null
let hasWarnedMissingServiceRole = false

function getSupabaseUrl() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    throw new Error('Missing Supabase URL environment variable.')
  }

  return supabaseUrl
}

export function getSupabaseServer() {
  if (supabaseServer) {
    return supabaseServer
  }

  const supabaseUrl = getSupabaseUrl()
  const serverKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serverKey) {
    throw new Error('Missing Supabase server key environment variable.')
  }

  supabaseServer = createClient<Database>(supabaseUrl, serverKey)

  return supabaseServer
}

export function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  const supabaseUrl = getSupabaseUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    if (!hasWarnedMissingServiceRole) {
      console.warn(
        'SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to the public Supabase key on the server.'
      )
      hasWarnedMissingServiceRole = true
    }

    return getSupabaseServer()
  }

  supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey)

  return supabaseAdmin
}
