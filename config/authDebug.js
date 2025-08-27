// Debug utility for authentication state
import { supabase } from './supabaseClient';

export const debugAuth = {
  // Check current session
  async checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('🔍 Current session check:');
      console.log('  Session exists:', !!session);
      console.log('  User:', session?.user?.email || 'None');
      console.log('  Access token exists:', !!session?.access_token);
      console.log('  Refresh token exists:', !!session?.refresh_token);
      console.log('  Expires at:', session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A');
      if (error) console.log('  Error:', error.message);
      return session;
    } catch (err) {
      console.log('❌ Session check failed:', err.message);
      return null;
    }
  },

  // Clear all stored authentication data
  async clearAuth() {
    try {
      await supabase.auth.signOut();
      console.log('🧹 Authentication data cleared');
    } catch (err) {
      console.log('❌ Failed to clear auth:', err.message);
    }
  },

  // Force refresh session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      console.log('🔄 Session refresh:');
      console.log('  Success:', !error);
      console.log('  New session:', !!data.session);
      if (error) console.log('  Error:', error.message);
      return data.session;
    } catch (err) {
      console.log('❌ Session refresh failed:', err.message);
      return null;
    }
  }
};

// Log authentication events
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`🔄 Auth Event: ${event}`);
  if (session?.user) {
    console.log(`   User: ${session.user.email}`);
    console.log(`   Token expires: ${new Date(session.expires_at * 1000)}`);
  }
});
