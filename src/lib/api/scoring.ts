import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * 评分公式配置 API
 * 管理二次回归公式和分类偏好配置
 */

// ─── 类型定义 ───

export interface ScoringFormula {
    id: string;
    scoreType: string;       // e.g. 'comfort'
    userGroup: string;       // e.g. 'male_18_25_small_hand'
    phoneParam: string;      // e.g. 'width', 'height', 'weight'
    coeffA: number;          // 二次项系数
    coeffB: number;          // 一次项系数
    coeffC: number;          // 常数项
    description: string;
    updatedAt: string;
}

export interface CategoricalPreference {
    id: string;
    scoreType: string;
    userGroup: string;
    category: string;        // e.g. 'camera_shape'
    categoryValue: string;   // e.g. '方形岛', '圆形岛'
    preferenceScore: number; // 0-100
    updatedAt: string;
}

// ─── DB → Model 映射 ───

function dbToFormula(row: any): ScoringFormula {
    return {
        id: row.id,
        scoreType: row.score_type,
        userGroup: row.user_group,
        phoneParam: row.phone_param,
        coeffA: row.coeff_a,
        coeffB: row.coeff_b,
        coeffC: row.coeff_c,
        description: row.description || '',
        updatedAt: row.updated_at,
    };
}

function dbToPreference(row: any): CategoricalPreference {
    return {
        id: row.id,
        scoreType: row.score_type,
        userGroup: row.user_group,
        category: row.category,
        categoryValue: row.category_value,
        preferenceScore: row.preference_score,
        updatedAt: row.updated_at,
    };
}

// ─── 二次回归公式 CRUD ───

/** 获取指定评分类型的所有公式 */
export async function getFormulas(scoreType: string): Promise<ScoringFormula[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('scoring_formulas')
        .select('*')
        .eq('score_type', scoreType)
        .order('user_group')
        .order('phone_param');

    if (error) {
        console.error('[GripFit] 获取公式失败:', error);
        return [];
    }
    return (data || []).map(dbToFormula);
}

/** 新增或更新公式（upsert） */
export async function upsertFormula(formula: Omit<ScoringFormula, 'id' | 'updatedAt'>) {
    if (!isSupabaseConfigured()) {
        return { data: null, error: { message: 'Supabase 未配置' } };
    }

    const { data, error } = await supabase
        .from('scoring_formulas')
        .upsert({
            score_type: formula.scoreType,
            user_group: formula.userGroup,
            phone_param: formula.phoneParam,
            coeff_a: formula.coeffA,
            coeff_b: formula.coeffB,
            coeff_c: formula.coeffC,
            description: formula.description,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'score_type,user_group,phone_param' })
        .select()
        .single();

    return { data: data ? dbToFormula(data) : null, error };
}

/** 删除公式 */
export async function deleteFormula(id: string) {
    if (!isSupabaseConfigured()) {
        return { error: { message: 'Supabase 未配置' } };
    }
    const { error } = await supabase
        .from('scoring_formulas')
        .delete()
        .eq('id', id);
    return { error };
}

// ─── 分类偏好 CRUD ───

/** 获取指定评分类型的所有分类偏好 */
export async function getPreferences(scoreType: string): Promise<CategoricalPreference[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('categorical_preferences')
        .select('*')
        .eq('score_type', scoreType)
        .order('user_group')
        .order('category')
        .order('category_value');

    if (error) {
        console.error('[GripFit] 获取偏好配置失败:', error);
        return [];
    }
    return (data || []).map(dbToPreference);
}

/** 新增或更新偏好 */
export async function upsertPreference(pref: Omit<CategoricalPreference, 'id' | 'updatedAt'>) {
    if (!isSupabaseConfigured()) {
        return { data: null, error: { message: 'Supabase 未配置' } };
    }

    const { data, error } = await supabase
        .from('categorical_preferences')
        .upsert({
            score_type: pref.scoreType,
            user_group: pref.userGroup,
            category: pref.category,
            category_value: pref.categoryValue,
            preference_score: pref.preferenceScore,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'score_type,user_group,category,category_value' })
        .select()
        .single();

    return { data: data ? dbToPreference(data) : null, error };
}

/** 删除偏好 */
export async function deletePreference(id: string) {
    if (!isSupabaseConfigured()) {
        return { error: { message: 'Supabase 未配置' } };
    }
    const { error } = await supabase
        .from('categorical_preferences')
        .delete()
        .eq('id', id);
    return { error };
}
