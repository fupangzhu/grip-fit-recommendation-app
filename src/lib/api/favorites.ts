import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * 收藏 API
 */

/** 添加收藏 */
export async function addFavorite(userId: string, phoneId: string) {
    if (!isSupabaseConfigured()) {
        return { data: null, error: { message: 'Supabase 未配置' } };
    }

    const { data, error } = await supabase
        .from('favorites')
        .upsert({ user_id: userId, phone_id: phoneId }, { onConflict: 'user_id,phone_id' })
        .select()
        .single();

    return { data, error };
}

/** 取消收藏 */
export async function removeFavorite(userId: string, phoneId: string) {
    if (!isSupabaseConfigured()) {
        return { error: { message: 'Supabase 未配置' } };
    }

    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('phone_id', phoneId);

    return { error };
}

/** 获取用户所有收藏的手机 ID */
export async function getUserFavorites(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('favorites')
        .select('phone_id')
        .eq('user_id', userId);

    if (error) {
        console.error('[GripFit] 获取收藏失败:', error);
        return [];
    }

    return (data || []).map(row => row.phone_id);
}

/** 检查是否已收藏 */
export async function isFavorited(userId: string, phoneId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('phone_id', phoneId)
        .single();

    return !!data;
}
