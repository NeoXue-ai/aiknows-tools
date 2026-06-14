// Hand-written types matching supabase/migrations/20260614000001_init.sql
// Run `pnpm dlx supabase gen types typescript --local` to regenerate from schema.

export type ToolStatus = 'pending' | 'approved' | 'rejected'
export type PricingType = 'free' | 'freemium' | 'paid' | 'enterprise'
export type DirectoryStatus = 'active' | 'dead' | 'unknown'
export type SubmissionType = 'free' | 'paid' | 'both'
export type LinkType = 'dofollow' | 'nofollow'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Category {
  slug: string
  name: string
  description: string | null
  display_order: number | null
  created_at: string
}

export interface Tool {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  url: string
  logo_url: string | null
  screenshot_url: string | null
  primary_category: string
  tags: string[]
  pricing_type: PricingType | null
  pricing_detail: string | null
  is_featured: boolean
  is_verified: boolean
  status: ToolStatus
  submitter_email: string | null
  submitted_at: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Directory {
  id: string
  slug: string
  name: string
  url: string
  dr: number | null
  submission_type: SubmissionType | null
  paid_price: string | null
  link_type: LinkType | null
  listing_speed: string | null
  niche_focus: string | null
  submit_url: string | null
  notes: string | null
  status: DirectoryStatus
  last_checked: string | null
  last_verified: string | null
  created_at: string
}

export interface Submission {
  id: string
  tool_name: string
  tool_url: string
  description: string | null
  category: string | null
  pricing_type: PricingType | null
  submitter_email: string
  logo_url: string | null
  screenshot_url: string | null
  status: SubmissionStatus
  rejection_reason: string | null
  reviewed_at: string | null
  created_at: string
}