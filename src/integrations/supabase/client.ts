import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add validation
if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('placeholder')) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
