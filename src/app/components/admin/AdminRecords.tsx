import React, { useEffect, useState, useCallback } from 'react';
import { Ruler, FileText, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { getAllMeasurements, getAllReports, type AdminMeasurement, type AdminReport } from '../../../lib/api/admin';
import { useAdminTheme, useThemeTokens } from './AdminThemeContext';

const PAGE_SIZE = 15;

type Tab = 'measurements' | 'reports';

// ─── Report Detail Modal ───
function ReportDetailModal({ report, onClose }: { report: AdminReport; onClose: () => void }) {
    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className={`${t.modalBg} border ${t.modalBorder} rounded-2xl w-full max-w-lg max-h-[75vh] overflow-hidden flex flex-col shadow-2xl`}>
                <div className={`flex items-center justify-between p-5 border-b ${t.borderColor}`}>
                    <div>
                        <h2 className={`text-[15px] font-semibold ${t.textPrimary}`}>推荐报告详情</h2>
                        <p className={`text-[11px] ${t.textMuted} mt-0.5`}>{report.username} · {new Date(report.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-lg ${t.collapseHover} ${t.paginationText}`}><X className="w-4 h-4" /></button>
                </div>
                <div className="overflow-y-auto flex-1 p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`${isWire ? 'border border-black/15' : 'bg-white/[0.03] border border-white/[0.04]'} rounded-lg p-3`}>
                            <p className={`text-[11px] ${t.textMuted}`}>预设方案</p>
                            <p className={`text-[13px] ${t.textSecondary} mt-0.5`}>{report.presetUsed || '自定义'}</p>
                        </div>
                        <div className={`${isWire ? 'border border-black/15' : 'bg-white/[0.03] border border-white/[0.04]'} rounded-lg p-3`}>
                            <p className={`text-[11px] ${t.textMuted}`}>选择机型数</p>
                            <p className={`text-[13px] ${t.textSecondary} mt-0.5`}>{report.selectedPhoneIds.length} 款</p>
                        </div>
                    </div>
                    <div>
                        <p className={`text-[12px] font-semibold ${t.tableHeaderText} uppercase tracking-wider mb-2`}>排名结果</p>
                        {report.rankedResults.length === 0 ? (
                            <p className={`${t.textPlaceholder} text-xs py-3`}>无排名数据</p>
                        ) : (
                            <div className="space-y-2">
                                {report.rankedResults.slice(0, 8).map((r: any, i: number) => (
                                    <div key={i} className={`flex items-center gap-3 ${isWire ? 'border border-black/15' : 'bg-white/[0.03] border border-white/[0.04]'} rounded-lg px-3 py-2.5`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0
                                            ${isWire
                                                ? 'border border-black/30 text-black/60'
                                                : i === 0 ? 'bg-yellow-500/20 text-yellow-400'
                                                    : i === 1 ? 'bg-slate-400/20 text-slate-400'
                                                        : i === 2 ? 'bg-orange-400/20 text-orange-400'
                                                            : 'bg-white/[0.05] text-white/40'
                                            }`}>{i + 1}</span>
                                        <span className={`text-[13px] ${t.textSecondary} flex-1`}>{r.name || r.phoneId || r.id}</span>
                                        {r.totalScore !== undefined && (
                                            <span className={`text-[12px] font-medium ${isWire ? 'text-black/70' : 'text-violet-400'}`}>{Number(r.totalScore).toFixed(1)} 分</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main ───
export function AdminRecords() {
    const [tab, setTab] = useState<Tab>('measurements');
    const [measurements, setMeasurements] = useState<AdminMeasurement[]>([]);
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [totalM, setTotalM] = useState(0);
    const [totalR, setTotalR] = useState(0);
    const [pageM, setPageM] = useState(1);
    const [pageR, setPageR] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);

    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';

    const loadMeasurements = useCallback(async (p: number) => {
        setLoading(true);
        const res = await getAllMeasurements(p, PAGE_SIZE);
        setMeasurements(res.measurements);
        setTotalM(res.total);
        setLoading(false);
    }, []);

    const loadReports = useCallback(async (p: number) => {
        setLoading(true);
        const res = await getAllReports(p, PAGE_SIZE);
        setReports(res.reports);
        setTotalR(res.total);
        setLoading(false);
    }, []);

    useEffect(() => { loadMeasurements(pageM); }, [pageM, loadMeasurements]);
    useEffect(() => { loadReports(pageR); }, [pageR, loadReports]);

    // hand size badge - wire mode: just black border; dark mode: color-coded
    const handSizeBadge = (size: string) => {
        if (isWire) return 'border border-black/25 text-black/70';
        const map: Record<string, string> = {
            XS: 'bg-slate-500/10 text-slate-400',
            S: 'bg-blue-500/10 text-blue-400',
            M: 'bg-violet-500/10 text-violet-400',
            L: 'bg-amber-500/10 text-amber-400',
            XL: 'bg-red-500/10 text-red-400',
        };
        return map[size] || 'bg-white/[0.05] text-white/50';
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className={`text-[20px] font-bold ${t.textPrimary}`}>测量 & 报告</h1>
                <p className={`text-[13px] ${t.textMuted} mt-0.5`}>查看所有用户的测量记录和推荐报告</p>
            </div>

            {/* Tabs */}
            <div className={`flex gap-1 ${isWire ? 'border border-black/20 rounded-xl' : 'bg-white/[0.04] rounded-xl'} p-1 w-fit mb-5`}>
                {([
                    { key: 'measurements', label: '测量记录', icon: Ruler, count: totalM },
                    { key: 'reports', label: '推荐报告', icon: FileText, count: totalR },
                ] as const).map(({ key, label, icon: Icon, count }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all
                            ${tab === key
                                ? isWire
                                    ? 'bg-black text-white'
                                    : 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                : `${t.textMuted} ${t.navHoverBg} ${t.navHoverText}`
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full
                            ${tab === key
                                ? 'bg-white/20'
                                : isWire ? 'border border-black/15 text-black/50' : 'bg-white/[0.06]'
                            }`}>
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Measurements Table */}
            {tab === 'measurements' && (
                <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl overflow-hidden`}>
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${t.borderColor}`}>
                                {['用户', '手长', '手宽', '拇指长', '张开跨度', '尺码', '时间'].map(h => (
                                    <th key={h} className={`px-5 py-3.5 text-left text-[11px] font-medium ${t.tableHeaderText} uppercase tracking-wider`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className={`text-center py-16 ${t.textMuted} text-sm`}>加载中...</td></tr>
                            ) : measurements.length === 0 ? (
                                <tr><td colSpan={7} className={`text-center py-16 ${t.textMuted} text-sm`}>暂无测量数据</td></tr>
                            ) : measurements.map(m => (
                                <tr key={m.id} className={`border-b ${t.borderColor} ${t.tableRowHover} transition-colors`}>
                                    <td className={`px-5 py-3.5 text-[13px] ${t.textSecondary}`}>{m.username}</td>
                                    <td className={`px-5 py-3.5 text-[13px] ${t.textMuted}`}>{m.handLength} mm</td>
                                    <td className={`px-5 py-3.5 text-[13px] ${t.textMuted}`}>{m.handWidth} mm</td>
                                    <td className={`px-5 py-3.5 text-[13px] ${t.textMuted}`}>{m.thumbLength} mm</td>
                                    <td className={`px-5 py-3.5 text-[13px] ${t.textMuted}`}>{m.thumbSpan} mm</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${handSizeBadge(m.handSize)}`}>
                                            {m.handSize}
                                        </span>
                                    </td>
                                    <td className={`px-5 py-3.5 text-[12px] ${t.textMuted}`}>
                                        {new Date(m.createdAt).toLocaleDateString('zh-CN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {Math.ceil(totalM / PAGE_SIZE) > 1 && (
                        <div className={`flex items-center justify-between px-5 py-3 border-t ${t.borderColor}`}>
                            <span className={`text-[12px] ${t.textPlaceholder}`}>第 {pageM} / {Math.ceil(totalM / PAGE_SIZE)} 页</span>
                            <div className="flex gap-2">
                                <button disabled={pageM <= 1} onClick={() => setPageM(p => p - 1)} className={`p-1.5 rounded-lg ${t.paginationHover} ${t.paginationText} disabled:opacity-30`}>
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button disabled={pageM >= Math.ceil(totalM / PAGE_SIZE)} onClick={() => setPageM(p => p + 1)} className={`p-1.5 rounded-lg ${t.paginationHover} ${t.paginationText} disabled:opacity-30`}>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Reports Table */}
            {tab === 'reports' && (
                <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl overflow-hidden`}>
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${t.borderColor}`}>
                                {['用户', '选择机型数', '推荐结果数', '使用预设', '时间', '操作'].map(h => (
                                    <th key={h} className={`px-5 py-3.5 text-left text-[11px] font-medium ${t.tableHeaderText} uppercase tracking-wider`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className={`text-center py-16 ${t.textMuted} text-sm`}>加载中...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan={6} className={`text-center py-16 ${t.textMuted} text-sm`}>暂无报告数据</td></tr>
                            ) : reports.map(r => (
                                <tr key={r.id} className={`border-b ${t.borderColor} ${t.tableRowHover} transition-colors`}>
                                    <td className={`px-5 py-3.5 text-[13px] ${t.textSecondary}`}>{r.username}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[12px] ${isWire ? 'border border-black/20 text-black/70' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {r.selectedPhoneIds.length} 款
                                        </span>
                                    </td>
                                    <td className={`px-5 py-3.5 text-[13px] ${t.textMuted}`}>{r.rankedResults.length} 条</td>
                                    <td className="px-5 py-3.5">
                                        {r.presetUsed ? (
                                            <span className={`px-2.5 py-0.5 rounded-full text-[12px] ${isWire ? 'border border-black/20 text-black/70' : 'bg-violet-500/10 text-violet-400'}`}>{r.presetUsed}</span>
                                        ) : (
                                            <span className={`text-[12px] ${t.textPlaceholder}`}>自定义</span>
                                        )}
                                    </td>
                                    <td className={`px-5 py-3.5 text-[12px] ${t.textMuted}`}>
                                        {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button
                                            onClick={() => setSelectedReport(r)}
                                            className={`flex items-center gap-1 text-[12px] transition-colors ${isWire ? 'text-black/60 underline hover:text-black' : 'text-violet-400 hover:text-violet-300'}`}
                                        >
                                            <Eye className="w-3.5 h-3.5" /> 查看
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {Math.ceil(totalR / PAGE_SIZE) > 1 && (
                        <div className={`flex items-center justify-between px-5 py-3 border-t ${t.borderColor}`}>
                            <span className={`text-[12px] ${t.textPlaceholder}`}>第 {pageR} / {Math.ceil(totalR / PAGE_SIZE)} 页</span>
                            <div className="flex gap-2">
                                <button disabled={pageR <= 1} onClick={() => setPageR(p => p - 1)} className={`p-1.5 rounded-lg ${t.paginationHover} ${t.paginationText} disabled:opacity-30`}>
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button disabled={pageR >= Math.ceil(totalR / PAGE_SIZE)} onClick={() => setPageR(p => p + 1)} className={`p-1.5 rounded-lg ${t.paginationHover} ${t.paginationText} disabled:opacity-30`}>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedReport && (
                <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
            )}
        </div>
    );
}
