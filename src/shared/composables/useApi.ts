import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'
const { VITE_SUPABASE_URL, VITE_SUPABASE_KEY } = import.meta.env
const db = createClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_KEY)
export const useApi = () => {
  return db;
}
