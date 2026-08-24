import { createClient } from '@supabase/supabase-js'

// Cliente publico (validar tokens)


export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Cliente admin (para operaciones seguras)
export const admin_supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
)