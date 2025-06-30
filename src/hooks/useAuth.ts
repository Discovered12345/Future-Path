import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError);
          setLoading(false);
          return;
        }
        
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err : new Error('Unknown auth error'));
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null);
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
      } else if (event === 'USER_UPDATED' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      // Clear any local storage items related to the user
      localStorage.removeItem('futurepath_auth_token');
      
      // Force redirect to home page after successful sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      
      // If signOut fails, clear local state anyway
      setUser(null);
      setSession(null);
      
      // Still redirect to home page even if sign out failed
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signOut,
  };
}