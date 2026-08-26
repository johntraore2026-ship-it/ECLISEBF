import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from localStorage override OR build-time import.meta.env
const getCredential = (key: string): string => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored && stored.trim() !== '') {
        return stored.trim();
      }
    } catch {
      // Ignore localStorage access errors if restricted
    }
  }
  const envVal = import.meta.env[key];
  if (envVal && typeof envVal === 'string' && envVal.trim() !== '') {
    return envVal.trim();
  }
  return '';
};

export const getActiveSupabaseConfig = () => {
  const url = getCredential('VITE_SUPABASE_URL');
  const key = getCredential('VITE_SUPABASE_ANON_KEY');
  const isCustomStored = typeof window !== 'undefined' && Boolean(localStorage.getItem('VITE_SUPABASE_URL'));
  return {
    url,
    key,
    isCustomStored,
    isFromEnv: Boolean(import.meta.env.VITE_SUPABASE_URL)
  };
};

const activeConfig = getActiveSupabaseConfig();

export const supabaseUrl = activeConfig.url;
export const supabaseAnonKey = activeConfig.key;

// Check if credentials are provided and non-empty
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl.startsWith('http')
);

// Save runtime credentials to localStorage
export function saveRuntimeSupabaseConfig(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('VITE_SUPABASE_URL', url.trim());
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
    window.location.reload();
  }
}

// Clear runtime credentials from localStorage
export function clearRuntimeSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('VITE_SUPABASE_URL');
    localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
    window.location.reload();
  }
}

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

export const SUPABASE_CONFIG_MESSAGE = "Configuration Supabase requise. Veuillez renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans vos variables d'environnement ou dans l'interface de l'application.";

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
 * Quick check to verify if Supabase tables exist and are reachable
 */
export async function checkSupabaseTablesExist(): Promise<{ tablesExist: boolean; message?: string }> {
  if (!isSupabaseConfigured) {
    return { tablesExist: false, message: 'Clés Supabase non renseignées' };
  }
  try {
    const { error } = await supabase.from('churches').select('id').limit(1);
    if (error) {
      if (isTableMissingError(error)) {
        return { tablesExist: false, message: 'Script SQL requis (tables introuvables)' };
      }
      // If error is permissions or auth (e.g. RLS requirement), table exists!
      return { tablesExist: true, message: 'Tables détectées' };
    }
    return { tablesExist: true, message: 'Tables détectées' };
  } catch (err: any) {
    return { tablesExist: false, message: err?.message || 'Erreur lors de la vérification' };
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
