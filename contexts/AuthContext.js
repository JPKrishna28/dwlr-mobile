import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext({
  user: null,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session) {
          console.log('✅ Found existing session for user:', session.user.email);
          if (mounted) {
            setUser(session.user);
          }
        } else {
          console.log('ℹ️  No existing session found');
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Unexpected error getting initial session:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with enhanced logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (session?.user) {
          console.log('✅ User authenticated:', session.user.email);
        } else {
          console.log('❌ User signed out or session expired');
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🚪 Signing out user...');
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('🔄 Refreshing authentication state...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error refreshing auth:', error);
        setUser(null);
        return;
      }

      if (session?.user) {
        console.log('✅ Auth refreshed for user:', session.user.email);
        setUser(session.user);
      } else {
        console.log('ℹ️  No active session found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Unexpected error refreshing auth:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    signOut,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
