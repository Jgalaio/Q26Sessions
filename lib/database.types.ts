import type { Dj, Settings, VoteCode } from '@/lib/types'

type VoteRow = {
  id?: string
  code: string
  dj_id: string
  ip: string
  created_at?: string | null
}

type DjsTable = {
  Row: Dj
  Insert: {
    id?: string
    name: string
    image_url: string
    slug?: string | null
    created_at?: string | null
  }
  Update: {
    id?: string
    name?: string
    image_url?: string
    slug?: string | null
    created_at?: string | null
  }
  Relationships: []
}

type VoteCodesTable = {
  Row: VoteCode & { created_at?: string | null }
  Insert: {
    code: string
    used?: boolean
    distributed?: boolean
    created_at?: string | null
  }
  Update: {
    code?: string
    used?: boolean
    distributed?: boolean
    created_at?: string | null
  }
  Relationships: []
}

type VotesTable = {
  Row: VoteRow
  Insert: VoteRow
  Update: Partial<VoteRow>
  Relationships: []
}

type SettingsTable = {
  Row: Settings
  Insert: Settings
  Update: Partial<Settings>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      djs: DjsTable
      vote_codes: VoteCodesTable
      votes: VotesTable
      settings: SettingsTable
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
}
