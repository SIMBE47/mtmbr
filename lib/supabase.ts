import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Copy .env.example to .env.local and fill in your Supabase project URL and anon key.\n' +
    'Get them from: supabase.com → Project → Settings → API'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
