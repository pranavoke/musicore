import { createClient } from '@supabase/supabase-js'

// Uses service_role key — bypasses RLS. Only use in server-side code.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
