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
