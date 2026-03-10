import { supabase, isSupabaseConfigured } from '../supabase';
import type { HandData } from '../../app/components/AppContext';

/**
 * 手部测量记录 API
 */

export interface MeasurementRecord {
    id: string;
    userId: string;
    handLength: number;
    handWidth: number;
    thumbLength: number;
    indexLength: number;
    middleLength: number;
    thumbSpan: number;
    handSize: string;
    createdAt: string;
}

function dbToMeasurement(row: any): MeasurementRecord {
    return {
        id: row.id,
        userId: row.user_id,
        handLength: row.hand_length,
        handWidth: row.hand_width,
        thumbLength: row.thumb_length,
        indexLength: row.index_length,
        middleLength: row.middle_length,
        thumbSpan: row.thumb_span,
        handSize: row.hand_size,
        createdAt: row.created_at,
    };
}

/** 保存手部测量数据 */
export async function saveMeasurement(userId: string, handData: HandData) {
    if (!isSupabaseConfigured()) {
        return { data: null, error: { message: 'Supabase 未配置' } };
    }

    const { data, error } = await supabase
        .from('measurements')
        .insert({
            user_id: userId,
            hand_length: handData.handLength,
            hand_width: handData.handWidth,
            thumb_length: handData.thumbLength,
            index_length: handData.indexLength,
            middle_length: handData.middleLength,
            thumb_span: handData.thumbSpan,
            hand_size: handData.handSize,
        })
        .select()
        .single();

    return { data: data ? dbToMeasurement(data) : null, error };
}

/** 获取用户的所有测量记录（最新在前） */
export async function getUserMeasurements(userId: string): Promise<MeasurementRecord[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[GripFit] 获取测量记录失败:', error);
        return [];
    }

    return (data || []).map(dbToMeasurement);
}

/** 获取最近一次测量 */
export async function getLatestMeasurement(userId: string): Promise<MeasurementRecord | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;
    return dbToMeasurement(data);
}
