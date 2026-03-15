import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { api } from '../lib/api';
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
  phone?: string;
  nationality?: string;
  preferred_country?: string;
  education_level?: string;
  gpa?: number;
  english_score?: number;
  english_test_type?: string;
  study_level?: string;
  preferred_subject?: string;
  budget_min?: number;
  budget_max?: number;
  intake?: string;
  profile_completion: number;
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

  const fetchProfile = async () => {
    try {
      const data = await api.get('/api/profile');
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user as User | null);
      if (session?.user) fetchProfile();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user as User | null);
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'student' } }
    });
    if (error) throw error;
    
    // Create profile via API
    try {
      await api.post('/api/auth/signup', { email, password, name });
    } catch (err) {
      console.log('Profile creation handled by trigger or already exists');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
