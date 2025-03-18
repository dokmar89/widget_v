import { createClient } from 'npm:@supabase/supabase-js'
import { Database } from './types.ts'

export const createServerSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  
  return createClient<Database>(supabaseUrl, supabaseKey)
}

export const createClientSupabaseClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization') || ''
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  })
}