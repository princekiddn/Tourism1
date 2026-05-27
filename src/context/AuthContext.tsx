import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, Wishlist } from '../lib/database.types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  isAdmin: boolean;
  wishlist: Wishlist[];
  toggleWishlist: (itemType: 'destination' | 'hotel' | 'package', itemId: string) => Promise<void>;
  isInWishlist: (itemType: 'destination' | 'hotel' | 'package', itemId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data);
  };

  const fetchWishlist = async (userId: string) => {
    const { data } = await supabase.from('wishlists').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setWishlist(data || []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([fetchProfile(session.user.id), fetchWishlist(session.user.id)]).finally(() => setLoading(false));
      } else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await Promise.all([fetchProfile(session.user.id), fetchWishlist(session.user.id)]);
          setLoading(false);
        })();
      } else { setProfile(null); setWishlist([]); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    return { error: error as Error | null };
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (!error) await fetchProfile(user.id);
    return { error: error as Error | null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error as Error | null };
  };

  const toggleWishlist = async (itemType: 'destination' | 'hotel' | 'package', itemId: string) => {
    if (!user) return;
    const existing = wishlist.find(w => w.item_type === itemType && w.item_id === itemId);
    if (existing) {
      const { error } = await supabase.from('wishlists').delete().eq('id', existing.id);
      if (!error) setWishlist(prev => prev.filter(w => w.id !== existing.id));
    } else {
      const { data, error } = await supabase.from('wishlists').insert({ user_id: user.id, item_type: itemType, item_id: itemId }).select().maybeSingle();
      if (!error && data) setWishlist(prev => [data, ...prev]);
    }
  };

  const isInWishlist = (itemType: 'destination' | 'hotel' | 'package', itemId: string) => {
    return wishlist.some(w => w.item_type === itemType && w.item_id === itemId);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile, resetPassword, updatePassword, isAdmin: profile?.role === 'admin', wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
