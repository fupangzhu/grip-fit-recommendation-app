import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Users, Smartphone, Ruler, FileText, Heart, RefreshCw } from 'lucide-react';
import {
    getStats,
    getRecentActivity,
    getTopFavorites,
    getBrandDistribution,
    getHandSizeDistribution,
    type DashboardStats,
    type TrendPoint,
    type TopFavorite,
    type BrandDistribution,
    type HandSizeDistribution,
} from '../../../lib/api/admin';
import { useAdminTheme, useThemeTokens } from './AdminThemeContext';

// ─── Palette ─────────────────────────────────────────────────────────────────
const CHART_COLORS_DARK = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const CHART_COLORS_WIRE = ['#000000', '#444444', '#888888', '#aaaaaa', '#cccccc', '#222222', '#666666'];

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    iconClass,
    sub,
}: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    iconClass: string;
    sub?: string;
}) {
    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';
    return (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-5 flex items-start gap-4 ${isWire ? 'shadow-none' : ''}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
                <Icon className={`w-5 h-5 ${isWire ? 'text-black/70' : 'text-white'}`} />
            </div>
            <div>
                <p className={`text-[12px] ${t.textMuted} mb-1`}>{label}</p>
                <p className={`text-[26px] font-bold ${t.textPrimary} leading-none`}>{value}</p>
                {sub && <p className={`text-[11px] ${t.textPlaceholder} mt-1`}>{sub}</p>}
            </div>
        </div>
    );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
    const t = useThemeTokens();
    return (
        <h2 className={`text-[14px] font-semibold ${t.textSecondary} mb-4 flex items-center gap-2`}>
            <span className={`w-1 h-4 ${t.sectionStripe} rounded-full inline-block`} />
            {children}
        </h2>
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';
    if (!active || !payload?.length) return null;
    return (
        <div
            className={`border rounded-lg p-3 text-xs shadow-xl`}
            style={{
                background: t.chartTooltipBg,
                borderColor: t.chartTooltipBorder,
            }}
        >
            <p className={`${t.textMuted} mb-1`}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: isWire ? '#000' : p.color }} className="font-medium">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [trends, setTrends] = useState<{
        userTrend: TrendPoint[];
        measurementTrend: TrendPoint[];
        reportTrend: TrendPoint[];
    } | null>(null);
    const [topFavorites, setTopFavorites] = useState<TopFavorite[]>([]);
    const [brandDist, setBrandDist] = useState<BrandDistribution[]>([]);
    const [handDist, setHandDist] = useState<HandSizeDistribution[]>([]);
    const [loading, setLoading] = useState(true);

    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';
    const COLORS = isWire ? CHART_COLORS_WIRE : CHART_COLORS_DARK;

    const loadData = async () => {
        setLoading(true);
        const [s, tr, fav, brand, hand] = await Promise.all([
            getStats(),
            getRecentActivity(14),
            getTopFavorites(5),
            getBrandDistribution(),
            getHandSizeDistribution(),
        ]);
        setStats(s);
        setTrends(tr);
        setTopFavorites(fav);
        setBrandDist(brand);
        setHandDist(hand);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    // Merge trend data
    const mergedTrend = trends?.userTrend.map((u, i) => ({
        date: u.date.slice(5),
        新用户: u.count,
        测量: trends.measurementTrend[i]?.count ?? 0,
        报告: trends.reportTrend[i]?.count ?? 0,
    })) ?? [];

    const handDistLabels: Record<string, string> = {
        XS: '超小', S: '小', M: '中', L: '大', XL: '超大', unknown: '未知',
    };

    // Chart stroke colors
    const areaColors = isWire
        ? { user: '#000000', measure: '#555555', report: '#aaaaaa' }
        : { user: '#8b5cf6', measure: '#3b82f6', report: '#10b981' };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-[22px] font-bold ${t.textPrimary}`}>看板总览</h1>
                    <p className={`text-[13px] ${t.textMuted} mt-0.5`}>实时数据监控与分析</p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] transition-colors disabled:opacity-50
            ${t.refreshBg} ${t.refreshBorder} ${t.refreshText} ${t.refreshHoverBg}`}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    刷新数据
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={Users} label="注册用户" value={stats?.totalUsers ?? '—'} iconClass={t.icon1} />
                <StatCard icon={Smartphone} label="机型数量" value={stats?.totalPhones ?? '—'} iconClass={t.icon2} />
                <StatCard icon={Ruler} label="测量记录" value={stats?.totalMeasurements ?? '—'} iconClass={t.icon3} />
                <StatCard icon={FileText} label="推荐报告" value={stats?.totalReports ?? '—'} iconClass={t.icon4} />
                <StatCard icon={Heart} label="总收藏数" value={stats?.totalFavorites ?? '—'} iconClass={t.icon5} />
            </div>

            {/* Trend Chart */}
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-5`}>
                <SectionTitle>近 14 天活动趋势</SectionTitle>
                {mergedTrend.length === 0 && !loading ? (
                    <p className={`${t.textPlaceholder} text-sm text-center py-10`}>暂无趋势数据</p>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={mergedTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gUser" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={areaColors.user} stopOpacity={isWire ? 0.12 : 0.3} />
                                    <stop offset="95%" stopColor={areaColors.user} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gMeasure" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={areaColors.measure} stopOpacity={isWire ? 0.12 : 0.3} />
                                    <stop offset="95%" stopColor={areaColors.measure} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gReport" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={areaColors.report} stopOpacity={isWire ? 0.12 : 0.3} />
                                    <stop offset="95%" stopColor={areaColors.report} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray={isWire ? '4 4' : '3 3'} stroke={t.chartGrid} />
                            <XAxis dataKey="date" tick={{ fill: t.chartAxis, fontSize: 11 }} axisLine={isWire} tickLine={isWire} />
                            <YAxis tick={{ fill: t.chartAxis, fontSize: 11 }} axisLine={isWire} tickLine={isWire} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, color: t.chartAxis }} />
                            <Area type="monotone" dataKey="新用户" stroke={areaColors.user} strokeWidth={isWire ? 1.5 : 2} fill="url(#gUser)" dot={isWire ? { r: 2, fill: areaColors.user } : false} />
                            <Area type="monotone" dataKey="测量" stroke={areaColors.measure} strokeWidth={isWire ? 1.5 : 2} fill="url(#gMeasure)" dot={isWire ? { r: 2, fill: areaColors.measure } : false} />
                            <Area type="monotone" dataKey="报告" stroke={areaColors.report} strokeWidth={isWire ? 1.5 : 2} fill="url(#gReport)" dot={isWire ? { r: 2, fill: areaColors.report } : false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Top Favorites */}
                <div className={`lg:col-span-1 ${t.cardBg} border ${t.cardBorder} rounded-xl p-5`}>
                    <SectionTitle>热门收藏 TOP 5</SectionTitle>
                    {topFavorites.length === 0 ? (
                        <p className={`${t.textPlaceholder} text-sm text-center py-6`}>暂无数据</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topFavorites} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                <XAxis type="number" tick={{ fill: t.chartAxis, fontSize: 11 }} axisLine={isWire} tickLine={isWire} allowDecimals={false} />
                                <YAxis type="category" dataKey="phoneName" tick={{ fill: t.chartAxis, fontSize: 11 }} axisLine={isWire} tickLine={isWire} width={90} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="收藏数" radius={isWire ? [0, 0, 0, 0] : [0, 4, 4, 0]}>
                                    {topFavorites.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Brand Distribution */}
                <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-5`}>
                    <SectionTitle>品牌分布</SectionTitle>
                    {brandDist.length === 0 ? (
                        <p className={`${t.textPlaceholder} text-sm text-center py-6`}>暂无数据</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={brandDist}
                                        dataKey="count"
                                        nameKey="brand"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={isWire ? 0 : 45}
                                        outerRadius={70}
                                        paddingAngle={isWire ? 1 : 2}
                                        strokeWidth={isWire ? 1 : 0}
                                        stroke={isWire ? '#000' : 'transparent'}
                                    >
                                        {brandDist.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                                {brandDist.slice(0, 6).map((b, i) => (
                                    <div key={b.brand} className={`flex items-center gap-1 text-[11px] ${t.textMuted}`}>
                                        <span className={`w-2 h-2 ${isWire ? 'rounded-none border border-black/30' : 'rounded-full'} inline-block`} style={{ background: COLORS[i % COLORS.length] }} />
                                        {b.brand} ({b.count})
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Hand Size Distribution */}
                <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-5`}>
                    <SectionTitle>手掌尺寸分布</SectionTitle>
                    {handDist.length === 0 ? (
                        <p className={`${t.textPlaceholder} text-sm text-center py-6`}>暂无数据</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={handDist}
                                        dataKey="count"
                                        nameKey="handSize"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={isWire ? 0 : 45}
                                        outerRadius={70}
                                        paddingAngle={isWire ? 1 : 2}
                                        strokeWidth={isWire ? 1 : 0}
                                        stroke={isWire ? '#000' : 'transparent'}
                                    >
                                        {handDist.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                                {handDist.map((h, i) => (
                                    <div key={h.handSize} className={`flex items-center gap-1 text-[11px] ${t.textMuted}`}>
                                        <span className={`w-2 h-2 ${isWire ? 'rounded-none border border-black/30' : 'rounded-full'} inline-block`} style={{ background: COLORS[i % COLORS.length] }} />
                                        {handDistLabels[h.handSize] || h.handSize} ({h.count})
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
