import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Credenciales por defecto preconfiguradas para la Escuela
const DEFAULT_SUPABASE_URL = 'https://azuklqyteginollantmw.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dWtscXl0ZWdpbm9sbGFudG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MjA5NTQsImV4cCI6MjEwMzk5Njk1NH0.DphxyvIjowVfhD2cV_NFbcejpeOqFe036I1miI5fsuA';

// 1. Obtener desde variables de entorno (Vite)
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// 2. Obtener desde configuración manual en localStorage
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('paec_supabase_url') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('paec_supabase_key') || '' : '';

export function getActiveSupabaseCredentials(): { url: string; key: string } {
  const url = (envUrl && !envUrl.includes('TU_PROJECT_ID')) ? envUrl : (storedUrl || DEFAULT_SUPABASE_URL);
  const key = (envKey && !envKey.includes('TU_ANON_KEY')) ? envKey : (storedKey || DEFAULT_SUPABASE_KEY);
  return { url: url.trim(), key: key.trim() };
}

let activeCredentials = getActiveSupabaseCredentials();

export function checkIsConfigured(): boolean {
  const creds = getActiveSupabaseCredentials();
  return Boolean(creds.url && creds.key && creds.url.startsWith('https://'));
}

export let isSupabaseConfigured = checkIsConfigured();

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(activeCredentials.url, activeCredentials.key)
  : null;

export function updateSupabaseConfig(url: string, key: string): boolean {
  try {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (cleanUrl && cleanKey && cleanUrl.startsWith('https://')) {
      localStorage.setItem('paec_supabase_url', cleanUrl);
      localStorage.setItem('paec_supabase_key', cleanKey);
      supabase = createClient(cleanUrl, cleanKey);
      isSupabaseConfigured = true;
      return true;
    } else {
      localStorage.removeItem('paec_supabase_url');
      localStorage.removeItem('paec_supabase_key');
      // Revertir a las predeterminadas de la escuela
      supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
      isSupabaseConfigured = true;
      return false;
    }
  } catch (err) {
    console.error('Error al actualizar configuración Supabase:', err);
    return false;
  }
}
