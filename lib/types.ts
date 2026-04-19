export interface Dj {
  id: string
  name: string
  image_url: string
  slug?: string | null
  created_at?: string | null
}

export interface RankedDj extends Dj {
  votes: number
}

export interface AnalyticsDj extends RankedDj {
  percent: number
}

export interface AnalyticsData {
  totalVotes: number
  stats: AnalyticsDj[]
}

export interface Settings {
  id: number
  voting_open: boolean
}

export interface VoteCode {
  code: string
  used: boolean
  distributed?: boolean
}
