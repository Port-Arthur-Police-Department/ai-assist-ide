import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the CORRECT project credentials
const SUPABASE_URL = 'https://kcdpdexzzoxaifabcqet.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZHBkZXh6em94YWlmYWJjcWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNTc2MTgsImV4cCI6MjA3ODczMzYxOH0.1UpK0nife4Je1UD_S57UVy-tMkLJLYQL7kwUGIFRFxk';

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
