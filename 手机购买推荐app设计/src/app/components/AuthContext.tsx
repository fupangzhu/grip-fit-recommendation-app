import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut, getUserProfile } from '../../lib/api/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: { username: string; avatar_url?: string } | null;
    isLoggedIn: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: any }>;
    register: (email: string, password: string, username?: string) => Promise<{ error: any }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<{ username: string; avatar_url?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // 加载用户 profile
    const loadProfile = async (userId: string) => {
        const { data } = await getUserProfile(userId);
        if (data) {
            setProfile({ username: data.username, avatar_url: data.avatar_url });
        }
    };

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        // 获取初始 session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                loadProfile(s.user.id);
            }
            setLoading(false);
        });

        // 监听认证状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                loadProfile(s.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        const { error } = await apiSignIn(email, password);
        return { error };
    };

    const register = async (email: string, password: string, username?: string) => {
        const { error } = await apiSignUp(email, password, username);
        return { error };
    };

    const logout = async () => {
        await apiSignOut();
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                isLoggedIn: !!user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
