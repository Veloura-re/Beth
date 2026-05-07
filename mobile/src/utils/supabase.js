import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Robust environment variable resolution with fallbacks for local dev stability
const getEnv = (key, fallback) => {
  const value = process.env[key];
  if (!value) return fallback;
  // Strip potential literal quotes (common issue in Expo/RN .env parsing)
  return value.replace(/^["']|["']$/g, '').trim();
};

const SUPABASE_URL = getEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://jwfdxhblkmbmdetifxlj.supabase.co');
const SUPABASE_ANON_KEY = getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZmR4aGJsa21ibWRldGlmeGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjAwMjIsImV4cCI6MjA5MjQzNjAyMn0.2FNoJYlDYwgI7kFs-TJwI-5OuWGeA6IQB_xBXEdVxiQ');

if (__DEV__) {
  console.info(`[SUPABASE] Initializing with URL: ${SUPABASE_URL}`);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
