import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase, { supabaseEnabled } from '../lib/supabase';
import { api } from '../lib/api';
import { useActivityTracker } from '../hooks/useActivityTracker';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  user_metadata?: { name?: string; role?: string };
}

interface Profile {
  id: number;
  user_id: string;
  name: string;
  email: string;
  profile_picture_url?: string;
  phone?: string;
  nationality?: string;
  preferred_country?: string;
  education_level?: string;
  gpa?: number;
  gpa_scale?: number;
  academic_system?: string;
  english_score?: number;
  english_test_type?: string;
  medium_of_instruction?: string;
  last_education_year?: number;
  study_level?: string;
  preferred_subject?: string;
  preferred_intake_name?: string;
  preferred_intake_year?: number;
  budget_min?: number;
  budget_max?: number;
  intake?: string;
  profile_completion: number;
  profile_status?: 'complete' | 'incomplete';
  validation_errors?: Record<string, string>;
  blocking_reasons?: string[];
  improvement_flags?: string[];
  completion_details?: {
    required_fields?: string[];
    valid_required_fields?: string[];
    missing_required_fields?: string[];
  };
  document_requirements?: string[];
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const authBypass = import.meta.env.VITE_AUTH_BYPASS === 'true' && import.meta.env.DEV;

  // Track user activity when logged in
  const { markOffline } = useActivityTracker({ 
    enabled: !!user && !authBypass,
    heartbeatInterval: 60000 // 1 minute
  });

  const ensureSupabaseEnabled = () => {
    if (!supabaseEnabled) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await api.get('/api/profile');
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfile(null);
      return null;
    }
  };

  const syncSession = async (session: Session | null) => {
    setUser(session?.user as User | null);

    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    await fetchProfile();
    setLoading(false);
  };

  useEffect(() => {
    if (authBypass) {
      queueMicrotask(() => {
        const demoUser: User = { id: 'local-demo', email: 'admin@studyglobal.com' };
        const demoProfile: Profile = {
          id: 0,
          user_id: 'local-demo',
          name: 'Admin (Bypass)',
          email: 'admin@studyglobal.com',
          profile_completion: 100,
          role: 'admin',
          created_at: new Date().toISOString()
        };
        setUser(demoUser);
        setProfile(demoProfile);
        setLoading(false);
      });
      return;
    }
    if (!supabaseEnabled) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      void syncSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      void syncSession(session);
    });

    return () => subscription.unsubscribe();
  }, [authBypass]);

  const signIn = async (email: string, password: string) => {
    if (authBypass) {
      setUser({ id: 'local-demo', email });
      setProfile({
        id: 0,
        user_id: 'local-demo',
        name: 'Admin (Bypass)',
        email,
        profile_completion: 100,
        role: 'admin',
        created_at: new Date().toISOString()
      });
      return;
    }
    ensureSupabaseEnabled();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (authBypass) {
      setUser({ id: 'local-demo', email });
      setProfile({
        id: 0,
        user_id: 'local-demo',
        name,
        email,
        profile_completion: 40,
        role: 'student',
        created_at: new Date().toISOString()
      });
      return;
    }
    ensureSupabaseEnabled();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'student' } }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (authBypass) {
      setUser(null);
      setProfile(null);
      return;
    }
    ensureSupabaseEnabled();
    // Mark user as offline before signing out
    await markOffline();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const sendPasswordReset = async (email: string) => {
    ensureSupabaseEnabled();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    ensureSupabaseEnabled();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile, sendPasswordReset, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
