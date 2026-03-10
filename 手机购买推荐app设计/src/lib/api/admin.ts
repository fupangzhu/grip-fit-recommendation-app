import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * 管理后台专用 API
 * 提供跨用户的全量数据查询（需管理员权限）
 */

// ─── Types ───

export interface DashboardStats {
    totalUsers: number;
    totalPhones: number;
    totalMeasurements: number;
    totalReports: number;
    totalFavorites: number;
}

export interface TrendPoint {
    date: string;
    count: number;
}

export interface TopFavorite {
    phoneId: string;
    phoneName: string;
    count: number;
}

export interface BrandDistribution {
    brand: string;
    count: number;
}

export interface HandSizeDistribution {
    handSize: string;
    count: number;
}

export interface AdminUser {
    id: string;
    username: string;
    avatarUrl?: string;
    createdAt: string;
    measurementCount: number;
    reportCount: number;
}

export interface AdminMeasurement {
    id: string;
    userId: string;
    username: string;
    handLength: number;
    handWidth: number;
    thumbLength: number;
    indexLength: number;
    middleLength: number;
    thumbSpan: number;
    handSize: string;
    createdAt: string;
}

export interface AdminReport {
    id: string;
    userId: string;
    username: string;
    measurementId: string | null;
    selectedPhoneIds: string[];
    rankedResults: any[];
    presetUsed: string | null;
    createdAt: string;
}

// ─── Stats ───

/** 获取仪表盘统计数据 */
export async function getStats(): Promise<DashboardStats> {
    const defaults: DashboardStats = {
        totalUsers: 0, totalPhones: 0,
        totalMeasurements: 0, totalReports: 0, totalFavorites: 0,
    };
    if (!isSupabaseConfigured()) return defaults;

    try {
        const [users, phones, measurements, reports, favorites] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('phones').select('id', { count: 'exact', head: true }),
            supabase.from('measurements').select('id', { count: 'exact', head: true }),
            supabase.from('reports').select('id', { count: 'exact', head: true }),
            supabase.from('favorites').select('id', { count: 'exact', head: true }),
        ]);

        return {
            totalUsers: users.count ?? 0,
            totalPhones: phones.count ?? 0,
            totalMeasurements: measurements.count ?? 0,
            totalReports: reports.count ?? 0,
            totalFavorites: favorites.count ?? 0,
        };
    } catch (err) {
        console.error('[Admin] 获取统计失败:', err);
        return defaults;
    }
}

// ─── Trends ───

/** 获取近 N 天的注册/测量/报告趋势 */
export async function getRecentActivity(days: number = 30): Promise<{
    userTrend: TrendPoint[];
    measurementTrend: TrendPoint[];
    reportTrend: TrendPoint[];
}> {
    const empty = { userTrend: [], measurementTrend: [], reportTrend: [] };
    if (!isSupabaseConfigured()) return empty;

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    try {
        const [usersRes, measurementsRes, reportsRes] = await Promise.all([
            supabase.from('profiles').select('created_at').gte('created_at', sinceISO).order('created_at'),
            supabase.from('measurements').select('created_at').gte('created_at', sinceISO).order('created_at'),
            supabase.from('reports').select('created_at').gte('created_at', sinceISO).order('created_at'),
        ]);

        return {
            userTrend: aggregateByDate(usersRes.data || [], days),
            measurementTrend: aggregateByDate(measurementsRes.data || [], days),
            reportTrend: aggregateByDate(reportsRes.data || [], days),
        };
    } catch (err) {
        console.error('[Admin] 获取趋势失败:', err);
        return empty;
    }
}

/** 按日期聚合记录数 */
function aggregateByDate(rows: { created_at: string }[], days: number): TrendPoint[] {
    const map = new Map<string, number>();

    // 初始化所有日期
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        map.set(key, 0);
    }

    for (const row of rows) {
        const key = row.created_at.slice(0, 10);
        map.set(key, (map.get(key) || 0) + 1);
    }

    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

// ─── Rankings ───

/** 获取热门收藏 TOP N */
export async function getTopFavorites(limit: number = 5): Promise<TopFavorite[]> {
    if (!isSupabaseConfigured()) return [];

    try {
        // 获取所有收藏并在客户端聚合
        const { data: favData } = await supabase.from('favorites').select('phone_id');
        const { data: phoneData } = await supabase.from('phones').select('id, name');

        if (!favData || !phoneData) return [];

        const phoneMap = new Map(phoneData.map(p => [p.id, p.name]));
        const countMap = new Map<string, number>();
        for (const f of favData) {
            countMap.set(f.phone_id, (countMap.get(f.phone_id) || 0) + 1);
        }

        return Array.from(countMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([phoneId, count]) => ({
                phoneId,
                phoneName: phoneMap.get(phoneId) || phoneId,
                count,
            }));
    } catch (err) {
        console.error('[Admin] 获取热门收藏失败:', err);
        return [];
    }
}

/** 获取品牌分布 */
export async function getBrandDistribution(): Promise<BrandDistribution[]> {
    if (!isSupabaseConfigured()) return [];

    try {
        const { data } = await supabase.from('phones').select('brand');
        if (!data) return [];

        const countMap = new Map<string, number>();
        for (const row of data) {
            countMap.set(row.brand, (countMap.get(row.brand) || 0) + 1);
        }

        return Array.from(countMap.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([brand, count]) => ({ brand, count }));
    } catch (err) {
        console.error('[Admin] 获取品牌分布失败:', err);
        return [];
    }
}

/** 获取手掌尺寸分布 */
export async function getHandSizeDistribution(): Promise<HandSizeDistribution[]> {
    if (!isSupabaseConfigured()) return [];

    try {
        const { data } = await supabase.from('measurements').select('hand_size');
        if (!data) return [];

        const countMap = new Map<string, number>();
        for (const row of data) {
            const size = row.hand_size || 'unknown';
            countMap.set(size, (countMap.get(size) || 0) + 1);
        }

        return Array.from(countMap.entries())
            .map(([handSize, count]) => ({ handSize, count }));
    } catch (err) {
        console.error('[Admin] 获取手掌尺寸分布失败:', err);
        return [];
    }
}

// ─── Users ───

/** 获取所有用户（分页） */
export async function getAllUsers(page: number = 1, pageSize: number = 20): Promise<{
    users: AdminUser[];
    total: number;
}> {
    if (!isSupabaseConfigured()) return { users: [], total: 0 };

    try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: profiles, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (!profiles) return { users: [], total: 0 };

        // 获取每个用户的测量和报告计数
        const userIds = profiles.map(p => p.id);
        const [measurementCounts, reportCounts] = await Promise.all([
            getCountsByUser('measurements', userIds),
            getCountsByUser('reports', userIds),
        ]);

        const users: AdminUser[] = profiles.map(p => ({
            id: p.id,
            username: p.username || '未命名',
            avatarUrl: p.avatar_url,
            createdAt: p.created_at,
            measurementCount: measurementCounts.get(p.id) || 0,
            reportCount: reportCounts.get(p.id) || 0,
        }));

        return { users, total: count ?? 0 };
    } catch (err) {
        console.error('[Admin] 获取用户列表失败:', err);
        return { users: [], total: 0 };
    }
}

/** 辅助：获取某表各 user_id 的记录数 */
async function getCountsByUser(table: string, userIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (userIds.length === 0) return map;

    try {
        const { data } = await supabase
            .from(table)
            .select('user_id')
            .in('user_id', userIds);

        if (data) {
            for (const row of data) {
                map.set(row.user_id, (map.get(row.user_id) || 0) + 1);
            }
        }
    } catch { /* ignore */ }

    return map;
}

// ─── Measurements ───

/** 获取全量测量记录（分页） */
export async function getAllMeasurements(page: number = 1, pageSize: number = 20): Promise<{
    measurements: AdminMeasurement[];
    total: number;
}> {
    if (!isSupabaseConfigured()) return { measurements: [], total: 0 };

    try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count } = await supabase
            .from('measurements')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (!data) return { measurements: [], total: 0 };

        // 获取关联的用户名
        const userIds = [...new Set(data.map(d => d.user_id))];
        const usernameMap = await getUsernameMap(userIds);

        const measurements: AdminMeasurement[] = data.map(row => ({
            id: row.id,
            userId: row.user_id,
            username: usernameMap.get(row.user_id) || '未知用户',
            handLength: row.hand_length,
            handWidth: row.hand_width,
            thumbLength: row.thumb_length,
            indexLength: row.index_length,
            middleLength: row.middle_length,
            thumbSpan: row.thumb_span,
            handSize: row.hand_size,
            createdAt: row.created_at,
        }));

        return { measurements, total: count ?? 0 };
    } catch (err) {
        console.error('[Admin] 获取测量记录失败:', err);
        return { measurements: [], total: 0 };
    }
}

// ─── Reports ───

/** 获取全量推荐报告（分页） */
export async function getAllReports(page: number = 1, pageSize: number = 20): Promise<{
    reports: AdminReport[];
    total: number;
}> {
    if (!isSupabaseConfigured()) return { reports: [], total: 0 };

    try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count } = await supabase
            .from('reports')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (!data) return { reports: [], total: 0 };

        const userIds = [...new Set(data.map(d => d.user_id))];
        const usernameMap = await getUsernameMap(userIds);

        const reports: AdminReport[] = data.map(row => ({
            id: row.id,
            userId: row.user_id,
            username: usernameMap.get(row.user_id) || '未知用户',
            measurementId: row.measurement_id,
            selectedPhoneIds: row.selected_phone_ids || [],
            rankedResults: row.ranked_results || [],
            presetUsed: row.preset_used,
            createdAt: row.created_at,
        }));

        return { reports, total: count ?? 0 };
    } catch (err) {
        console.error('[Admin] 获取报告失败:', err);
        return { reports: [], total: 0 };
    }
}

// ─── Helpers ───

/** 批量获取用户名映射 */
async function getUsernameMap(userIds: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (userIds.length === 0) return map;

    try {
        const { data } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds);

        if (data) {
            for (const row of data) {
                map.set(row.id, row.username || '未命名');
            }
        }
    } catch { /* ignore */ }

    return map;
}
