import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * 用户认证 API
 */

/** 注册新用户 */
export async function signUp(email: string, password: string, username?: string) {
    if (!isSupabaseConfigured()) {
        return { data: null, error: { message: 'Supabase 未配置' } };
    }
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username: username || email.split('@')[0] },
        },
    });
    return { data, error };
}

/** 登录 */
export async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
        return { data: null, error: { message: 'Supabase 未配置' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

/** 退出登录 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

/** 获取当前用户 */
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/** 获取当前 session */
export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

/** 监听认证状态变化 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
}

/** 获取用户 profile */
export async function getUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

/** 更新用户 profile */
export async function updateUserProfile(userId: string, updates: { username?: string; avatar_url?: string }) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
}
