import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ytogcvqzqnzjfnxyqqip.supabase.co';
// TODO: Replace with your actual Supabase anon key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0b2djdnF6cW56amZueHlxcWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxODQxMzEsImV4cCI6MjA3MTc2MDEzMX0.HIdYgKaAPQ437yKCh0XFk7WQHK-bT_EMgEttmoLr7F0';

// Initialize Supabase client with real-time enabled and auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export the client as default for easier imports
export default supabase;
