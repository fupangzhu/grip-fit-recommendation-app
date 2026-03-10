import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * 推荐报告 API
 */

export interface ReportRecord {
    id: string;
    userId: string;
    measurementId: string | null;
    selectedPhoneIds: string[];
    rankedResults: any[];
    presetUsed: string | null;
    createdAt: string;
}

function dbToReport(row: any): ReportRecord {
    return {
        id: row.id,
        userId: row.user_id,
        measurementId: row.measurement_id,
        selectedPhoneIds: row.selected_phone_ids || [],
        rankedResults: row.ranked_results || [],
        presetUsed: row.preset_used,
        createdAt: row.created_at,
    };
}

/** 保存推荐报告 */
export async function saveReport(
    userId: string,
    reportData: {
        measurementId?: string;
        selectedPhoneIds: string[];
        rankedResults: any[];
        presetUsed?: string;
    }
) {
    if (!isSupabaseConfigured()) {
        return { data: null, error: { message: 'Supabase 未配置' } };
    }

    const { data, error } = await supabase
        .from('reports')
        .insert({
            user_id: userId,
            measurement_id: reportData.measurementId || null,
            selected_phone_ids: reportData.selectedPhoneIds,
            ranked_results: reportData.rankedResults,
            preset_used: reportData.presetUsed || null,
        })
        .select()
        .single();

    return { data: data ? dbToReport(data) : null, error };
}

/** 获取用户的所有报告（最新在前） */
export async function getUserReports(userId: string): Promise<ReportRecord[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[GripFit] 获取报告失败:', error);
        return [];
    }

    return (data || []).map(dbToReport);
}
