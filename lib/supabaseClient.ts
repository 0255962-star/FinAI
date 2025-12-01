import { createClient } from '@supabase/supabase-js';

// Safe access for environments where import.meta.env might not be fully defined
// @ts-ignore
const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;

const getEnv = (key: string, fallback: string) => {
  return (env && env[key]) ? env[key] : fallback;
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://your-project.supabase.co');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 'your-anon-key');

// Check if we are using the placeholder values
export const isMockMode = SUPABASE_URL === 'https://your-project.supabase.co';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);