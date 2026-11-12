export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** False until .env.local is filled in, so the rest of the site keeps working before setup. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
