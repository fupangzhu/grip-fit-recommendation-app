import React, { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, X, User, Ruler, FileText, Calendar } from 'lucide-react';
import { getAllUsers, type AdminUser } from '../../../lib/api/admin';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { useAdminTheme, useThemeTokens } from './AdminThemeContext';

const PAGE_SIZE = 15;

// ─── User Detail Modal ───
function UserDetailModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
    const [measurements, setMeasurements] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';

    useEffect(() => {
        if (!isSupabaseConfigured()) { setLoading(false); return; }
        Promise.all([
            supabase.from('measurements').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        ]).then(([m, r]) => {
            setMeasurements(m.data || []);
            setReports(r.data || []);
            setLoading(false);
        });
    }, [user.id]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className={`${t.modalBg} border ${t.modalBorder} rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${t.borderColor}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWire ? 'border border-black/30' : 'bg-violet-500/20'}`}>
                            <User className={`w-5 h-5 ${isWire ? 'text-black/60' : 'text-violet-400'}`} />
                        </div>
                        <div>
                            <p className={`text-[15px] font-semibold ${t.textPrimary}`}>{user.username}</p>
                            <p className={`text-[11px] ${t.textMuted}`}>{user.id.slice(0, 8)}...</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-lg ${t.collapseHover} ${t.paginationText} transition-colors`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-5 space-y-5">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Calendar, label: '注册时间', value: new Date(user.createdAt).toLocaleDateString('zh') },
                            { icon: Ruler, label: '测量次数', value: `${user.measurementCount} 次` },
                            { icon: FileText, label: '报告数量', value: `${user.reportCount} 份` },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className={`${isWire ? 'bg-transparent border border-black/15' : 'bg-white/[0.03] border border-white/[0.04]'} rounded-xl p-3 text-center`}>
                                <Icon className={`w-4 h-4 ${isWire ? 'text-black/50' : 'text-violet-400'} mx-auto mb-1.5`} />
                                <p className={`text-[11px] ${t.textMuted}`}>{label}</p>
                                <p className={`text-[14px] font-semibold ${t.textPrimary} mt-0.5`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <p className={`${t.textMuted} text-sm text-center py-6`}>加载中...</p>
                    ) : (
                        <>
                            {/* Recent Measurements */}
                            <div>
                                <p className={`text-[12px] font-semibold ${t.tableHeaderText} uppercase tracking-wider mb-2`}>最近测量记录</p>
                                {measurements.length === 0 ? (
                                    <p className={`${t.textPlaceholder} text-xs py-3`}>暂无测量记录</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {measurements.map((m) => (
                                            <div key={m.id} className={`${isWire ? 'border border-black/15' : 'bg-white/[0.03] border border-white/[0.04]'} rounded-lg px-3 py-2 text-[12px] flex items-center justify-between`}>
                                                <span className={t.textSecondary}>手长 {m.hand_length}mm，手宽 {m.hand_width}mm，尺码 <span className={isWire ? 'font-bold' : 'text-violet-400'}>{m.hand_size}</span></span>
                                                <span className={t.textMuted}>{new Date(m.created_at).toLocaleDateString('zh')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent Reports */}
                            <div>
                                <p className={`text-[12px] font-semibold ${t.tableHeaderText} uppercase tracking-wider mb-2`}>最近推荐报告</p>
                                {reports.length === 0 ? (
                                    <p className={`${t.textPlaceholder} text-xs py-3`}>暂无报告</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {reports.map((r) => (
                                            <div key={r.id} className={`${isWire ? 'border border-black/15' : 'bg-white/[0.03] border border-white/[0.04]'} rounded-lg px-3 py-2 text-[12px] flex items-center justify-between`}>
                                                <span className={t.textSecondary}>选了 {r.selected_phone_ids?.length ?? 0} 款机型，排名结果 {r.ranked_results?.length ?? 0} 条</span>
                                                <span className={t.textMuted}>{new Date(r.created_at).toLocaleDateString('zh')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main ───
export function AdminUsers() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';

    const load = useCallback(async (p: number) => {
        setLoading(true);
        const res = await getAllUsers(p, PAGE_SIZE);
        setUsers(res.users);
        setTotal(res.total);
        setLoading(false);
    }, []);

    useEffect(() => { load(page); }, [page, load]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const filtered = search
        ? users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
        : users;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className={`text-[20px] font-bold ${t.textPrimary}`}>用户管理</h1>
                    <p className={`text-[13px] ${t.textMuted} mt-0.5`}>共 {total} 位注册用户</p>
                </div>
                <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textPlaceholder}`} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="搜索用户名..."
                        className={`${t.inputBg} border ${t.inputBorder} rounded-lg pl-9 pr-4 py-2 text-[13px] ${t.inputText} placeholder:${t.textPlaceholder} outline-none ${t.inputFocusBorder} w-[240px]`}
                    />
                </div>
            </div>

            {/* Table */}
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl overflow-hidden`}>
                <table className="w-full">
                    <thead>
                        <tr className={`border-b ${t.borderColor}`}>
                            {['用户名', '注册时间', '测量次数', '报告次数', '操作'].map(h => (
                                <th key={h} className={`px-5 py-3.5 text-left text-[11px] font-medium ${t.tableHeaderText} uppercase tracking-wider`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className={`text-center py-16 ${t.textMuted} text-sm`}>加载中...</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={`text-center py-16 ${t.textMuted} text-sm`}>暂无用户数据</td>
                            </tr>
                        ) : (
                            filtered.map((user) => (
                                <tr
                                    key={user.id}
                                    className={`border-b ${t.borderColor} ${t.tableRowHover} transition-colors`}
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${isWire ? 'border border-black/25 text-black/60' : 'bg-violet-500/20 text-violet-400'}`}>
                                                {user.username.slice(0, 1).toUpperCase()}
                                            </div>
                                            <span className={`text-[13px] ${t.textSecondary}`}>{user.username}</span>
                                        </div>
                                    </td>
                                    <td className={`px-5 py-3.5 text-[13px] ${t.textMuted}`}>
                                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${t.badgeMeasure}`}>
                                            {user.measurementCount} 次
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${t.badgeReport}`}>
                                            {user.reportCount} 份
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className={`text-[12px] transition-colors ${isWire ? 'text-black/60 underline hover:text-black' : 'text-violet-400 hover:text-violet-300'}`}
                                        >
                                            查看详情
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={`flex items-center justify-between px-5 py-3 border-t ${t.borderColor}`}>
                        <span className={`text-[12px] ${t.textPlaceholder}`}>第 {page} / {totalPages} 页</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className={`p-1.5 rounded-lg ${t.paginationHover} ${t.paginationText} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className={`p-1.5 rounded-lg ${t.paginationHover} ${t.paginationText} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedUser && (
                <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </div>
    );
}
