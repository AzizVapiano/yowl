import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      // Si l'utilisateur vient de s'inscrire, on vérifie que son profil existe
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!profile) {
          // Si le profil n'existe pas, on le crée avec les metadata de l'utilisateur
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              username: session.user.user_metadata.username,
              created_at: new Date().toISOString()
            }]);
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    // Vérifie d'abord si le nom d'utilisateur est déjà pris
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error('Failed to check username availability');
    }

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Procède à l'inscription si le nom d'utilisateur est disponible
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username // Stocke le nom d'utilisateur dans les metadata
        }
      }
    });

    if (signUpError) throw signUpError;

    if (data.user) {
      // Crée immédiatement le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          username,
          created_at: new Date().toISOString()
        }]);

      if (profileError) {
        // Si la création du profil échoue, on nettoie l'utilisateur auth
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create profile');
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}