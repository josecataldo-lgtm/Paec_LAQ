import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase (Vite prefix VITE_)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('TU_PROJECT_ID') &&
  !supabaseAnonKey.includes('TU_ANON_KEY')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
