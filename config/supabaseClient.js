import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = 'https://ytogcvqzqnzjfnxyqqip.supabase.co';
// TODO: Replace with your actual Supabase anon key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0b2djdnF6cW56amZueHlxcWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxODQxMzEsImV4cCI6MjA3MTc2MDEzMX0.HIdYgKaAPQ437yKCh0XFk7WQHK-bT_EMgEttmoLr7F0';

// Initialize Supabase client with AsyncStorage for better persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-App-Version': '1.0.0',
    },
  },
});

// Export the client as default for easier imports
export default supabase;
