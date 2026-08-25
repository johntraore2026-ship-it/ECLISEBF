import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are provided and non-empty
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl.startsWith('http')
);

// Centralized Supabase Client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(
      // Fallback placeholder so app loads without crashing before environment variables are set
      'https://placeholder-project.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

export const SUPABASE_CONFIG_MESSAGE = "Configuration Supabase requise. Veuillez renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans vos variables d'environnement.";

/**
 * Helper to check if a Supabase error is caused by a missing table, relation, or schema cache issue
 */
export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error.details || error || '').toLowerCase();
  const code = String(error.code || '').toLowerCase();
  return (
    code === '42p01' ||
    code.startsWith('pgrst') ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    msg.includes('does not exist') ||
    msg.includes('not found') ||
    msg.includes('404')
  );
}

/**
 * Validates that Supabase is ready for live requests.
 * Throws a formatted error if configuration is missing.
 */
export function ensureSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_CONFIG_MESSAGE);
  }
}

/**
 * Helper to get storage public URL or handle fallback
 */
export function getStorageFileUrl(bucket: string, path: string): string {
  if (!isSupabaseConfigured || !path) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
