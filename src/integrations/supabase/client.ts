import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add validation
if (!SUPABASE_URL) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
