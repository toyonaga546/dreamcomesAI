import { createClient } from '@supabase/supabase-js'

// クライアント側に安全な supabase ヘルパー
export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY

  if (!supabaseUrl || !supabaseKey) return null

  return createClient(supabaseUrl, supabaseKey)
}

const supabaseClient = getSupabase()
const fallbackAuth = {
  // 同期的に呼んでもわかるように Promise を返す形でエラーを投げる
  signUp: async () => {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_API_KEY')
  },
  signInWithPassword: async () => {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_API_KEY')
  },
  getUser: async () => ({ data: { user: null } }),
  getSession: async () => ({ data: { session: null } }),
  signOut: async () => ({ error: new Error('Supabase is not configured') }),
}

export const supabase = supabaseClient ?? { auth: fallbackAuth }