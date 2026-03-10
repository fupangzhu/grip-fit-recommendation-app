import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
    ArrowLeft, Save, Plus, Trash2, Settings2, BarChart3,
    ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import {
    getFormulas, upsertFormula, deleteFormula,
    getPreferences, upsertPreference, deletePreference,
    type ScoringFormula, type CategoricalPreference,
} from '../../lib/api/scoring';
import {
    PHONE_PARAM_OPTIONS, USER_GROUP_OPTIONS, CATEGORY_OPTIONS,
} from '../../lib/scoring/comfortEngine';

// ─── Types ───

interface FormulaRow {
    id?: string;
    userGroup: string;
    phoneParam: string;
    coeffA: number;
    coeffB: number;
    coeffC: number;
    description: string;
    isNew?: boolean;
}

interface PrefRow {
    id?: string;
    userGroup: string;
    category: string;
    categoryValue: string;
    preferenceScore: number;
    isNew?: boolean;
}

type TabId = 'formulas' | 'preferences';

// ─── Component ───

export function AdminScoringPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('formulas');
    const [formulas, setFormulas] = useState<FormulaRow[]>([]);
    const [prefs, setPrefs] = useState<PrefRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // ─── Load Data ───
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [formulaData, prefData] = await Promise.all([
                getFormulas('comfort'),
                getPreferences('comfort'),
            ]);
            setFormulas(formulaData.map(f => ({
                id: f.id, userGroup: f.userGroup, phoneParam: f.phoneParam,
                coeffA: f.coeffA, coeffB: f.coeffB, coeffC: f.coeffC,
                description: f.description,
            })));
            setPrefs(prefData.map(p => ({
                id: p.id, userGroup: p.userGroup, category: p.category,
                categoryValue: p.categoryValue, preferenceScore: p.preferenceScore,
            })));
        } catch (err) {
            console.error('[Admin] 加载配置失败:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ─── Formula Handlers ───
    const addFormulaRow = () => {
        setFormulas([...formulas, {
            userGroup: 'default', phoneParam: 'width',
            coeffA: 0, coeffB: 0, coeffC: 50,
            description: '', isNew: true,
        }]);
    };

    const updateFormula = (index: number, field: keyof FormulaRow, value: any) => {
        const updated = [...formulas];
        (updated[index] as any)[field] = value;
        setFormulas(updated);
    };

    const removeFormula = async (index: number) => {
        const row = formulas[index];
        if (row.id) {
            await deleteFormula(row.id);
        }
        setFormulas(formulas.filter((_, i) => i !== index));
    };

    // ─── Preference Handlers ───
    const addPrefRow = () => {
        setPrefs([...prefs, {
            userGroup: 'default', category: 'camera_shape',
            categoryValue: CATEGORY_OPTIONS['camera_shape'].values[0],
            preferenceScore: 50, isNew: true,
        }]);
    };

    const updatePref = (index: number, field: keyof PrefRow, value: any) => {
        const updated = [...prefs];
        (updated[index] as any)[field] = value;
        setPrefs(updated);
    };

    const removePref = async (index: number) => {
        const row = prefs[index];
        if (row.id) {
            await deletePreference(row.id);
        }
        setPrefs(prefs.filter((_, i) => i !== index));
    };

    // ─── Save All ───
    const handleSaveAll = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            // Save formulas
            for (const f of formulas) {
                const { error } = await upsertFormula({
                    scoreType: 'comfort',
                    userGroup: f.userGroup,
                    phoneParam: f.phoneParam,
                    coeffA: f.coeffA,
                    coeffB: f.coeffB,
                    coeffC: f.coeffC,
                    description: f.description,
                });
                if (error) throw error;
            }
            // Save preferences
            for (const p of prefs) {
                const { error } = await upsertPreference({
                    scoreType: 'comfort',
                    userGroup: p.userGroup,
                    category: p.category,
                    categoryValue: p.categoryValue,
                    preferenceScore: p.preferenceScore,
                });
                if (error) throw error;
            }
            setSaveStatus('success');
            await loadData(); // Reload to get IDs
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error('[Admin] 保存失败:', err);
            // 提示用户这通常是因为权限(RLS)问题
            alert('保存失败！可能的原因：\n1. Supabase 中的 RLS（行级安全）策略阻止了修改。\n2. 唯一键冲突。请检查控制台获取详细错误。');
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setSaving(false);
        }
    };

    // ─── Preview Calculation ───
    const previewCalc = (f: FormulaRow, x: number) => {
        return (f.coeffA * x * x + f.coeffB * x + f.coeffC).toFixed(2);
    };

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'formulas', label: '二次回归公式', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'preferences', label: '分类偏好配置', icon: <Settings2 className="w-4 h-4" /> },
    ];

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-[12px] text-[#8f959e] mb-3">
                    <span className="cursor-pointer hover:text-[#3370ff]" onClick={() => navigate('/')}>首页</span>
                    <span>/</span>
                    <span className="text-[#1f2329]">评分公式管理</span>
                </div>
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-[24px] text-[#1f2329] mb-2" style={{ fontWeight: 600 }}>
                            评分公式配置
                        </h1>
                        <p className="text-[14px] text-[#8f959e]">
                            配置 comfortScore 的计算公式。其他评分 (reachScore, gripScore) 的公式待后续研究。
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8e8ed] text-[12px] text-[#646a73] hover:bg-[#f5f6f8] transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" /> 返回
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-[12px] transition-colors"
                            style={{
                                fontWeight: 500,
                                background: saving ? '#8fb8ff' : saveStatus === 'success' ? '#34c759' : saveStatus === 'error' ? '#f54a45' : '#3370ff',
                            }}
                        >
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                saveStatus === 'success' ? <CheckCircle2 className="w-3 h-3" /> :
                                    saveStatus === 'error' ? <AlertCircle className="w-3 h-3" /> :
                                        <Save className="w-3 h-3" />}
                            {saving ? '保存中...' : saveStatus === 'success' ? '已保存' : saveStatus === 'error' ? '保存失败' : '保存全部'}
                        </button>
                    </div>
                </div>
            </div>

            {/* TODO Notice */}
            <div className="bg-[#fff8e6] border border-[#ffd60a]/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#b8960a] mt-0.5 shrink-0" />
                    <div className="text-[12px] text-[#8b7a2f]" style={{ lineHeight: 1.7 }}>
                        <strong>TODO:</strong> 目前仅支持 <code className="bg-[#ffd60a]/15 px-1 rounded">comfortScore</code> 的公式编辑。
                        <code className="bg-[#ffd60a]/15 px-1 rounded">reachScore</code> 和总体 <code className="bg-[#ffd60a]/15 px-1 rounded">gripScore</code>
                        的公式组成需要参考论文后确定，后续将按相同模式扩展。
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#f0f1f5] p-1 rounded-lg mb-6 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] transition-all ${activeTab === tab.id
                            ? 'bg-white text-[#1f2329] shadow-sm'
                            : 'text-[#646a73] hover:text-[#1f2329]'
                            }`}
                        style={{ fontWeight: activeTab === tab.id ? 500 : 400 }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-[#3370ff] animate-spin" />
                    <span className="ml-2 text-[14px] text-[#8f959e]">加载配置中...</span>
                </div>
            ) : activeTab === 'formulas' ? (
                /* ═══ Formulas Tab ═══ */
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-[16px] text-[#1f2329]" style={{ fontWeight: 600 }}>
                                二次回归公式 <span className="text-[12px] text-[#8f959e] ml-2" style={{ fontWeight: 400 }}>f(x) = a·x² + b·x + c</span>
                            </h2>
                            <p className="text-[12px] text-[#8f959e] mt-1">
                                每行定义一个参数维度的公式：人群分类 × 手机参数 → 系数(a, b, c)
                            </p>
                        </div>
                        <button
                            onClick={addFormulaRow}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#3370ff] text-[12px] text-[#3370ff] hover:bg-[#3370ff]/5 transition-colors"
                        >
                            <Plus className="w-3 h-3" /> 新增公式
                        </button>
                    </div>

                    {formulas.length === 0 ? (
                        <div className="bg-white rounded-xl border border-[#e8e8ed] p-10 text-center">
                            <BarChart3 className="w-8 h-8 text-[#c9cdd4] mx-auto mb-3" />
                            <p className="text-[14px] text-[#8f959e]">暂无公式配置</p>
                            <p className="text-[12px] text-[#c9cdd4] mt-1">点击"新增公式"开始添加</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-[#e8e8ed] overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-[140px_160px_90px_90px_90px_1fr_40px] gap-2 px-4 py-3 bg-[#f9fafb] border-b border-[#f0f1f5] text-[11px] text-[#8f959e]" style={{ fontWeight: 500 }}>
                                <span>人群分类</span>
                                <span>参数维度</span>
                                <span>系数 a</span>
                                <span>系数 b</span>
                                <span>常数 c</span>
                                <span>备注</span>
                                <span></span>
                            </div>
                            {/* Rows */}
                            {formulas.map((f, idx) => (
                                <div
                                    key={f.id || `new-${idx}`}
                                    className={`grid grid-cols-[140px_160px_90px_90px_90px_1fr_40px] gap-2 px-4 py-2.5 border-b border-[#f5f6f8] items-center ${f.isNew ? 'bg-[#3370ff]/3' : 'hover:bg-[#fafbfc]'
                                        }`}
                                >
                                    <select
                                        value={f.userGroup}
                                        onChange={e => updateFormula(idx, 'userGroup', e.target.value)}
                                        className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] text-[#1f2329] bg-white outline-none focus:border-[#3370ff]"
                                    >
                                        {USER_GROUP_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={f.phoneParam}
                                        onChange={e => updateFormula(idx, 'phoneParam', e.target.value)}
                                        className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] text-[#1f2329] bg-white outline-none focus:border-[#3370ff]"
                                    >
                                        {PHONE_PARAM_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        step="any"
                                        value={f.coeffA}
                                        onChange={e => updateFormula(idx, 'coeffA', parseFloat(e.target.value) || 0)}
                                        className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] text-[#1f2329] text-center tabular-nums outline-none focus:border-[#3370ff] w-full"
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        value={f.coeffB}
                                        onChange={e => updateFormula(idx, 'coeffB', parseFloat(e.target.value) || 0)}
                                        className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] text-[#1f2329] text-center tabular-nums outline-none focus:border-[#3370ff] w-full"
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        value={f.coeffC}
                                        onChange={e => updateFormula(idx, 'coeffC', parseFloat(e.target.value) || 0)}
                                        className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] text-[#1f2329] text-center tabular-nums outline-none focus:border-[#3370ff] w-full"
                                    />
                                    <input
                                        type="text"
                                        value={f.description}
                                        onChange={e => updateFormula(idx, 'description', e.target.value)}
                                        placeholder="描述..."
                                        className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] text-[#646a73] outline-none focus:border-[#3370ff] w-full"
                                    />
                                    <button
                                        onClick={() => removeFormula(idx)}
                                        className="p-1.5 rounded-md hover:bg-[#f54a45]/10 text-[#c9cdd4] hover:text-[#f54a45] transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Preview Section */}
                    {formulas.length > 0 && (
                        <div className="bg-white rounded-xl border border-[#e8e8ed] p-4">
                            <button
                                onClick={() => setExpandedSection(expandedSection === 'preview' ? null : 'preview')}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <h3 className="text-[13px] text-[#1f2329]" style={{ fontWeight: 500 }}>
                                    公式预览 <span className="text-[11px] text-[#8f959e] ml-1">输入 x 值查看计算结果</span>
                                </h3>
                                {expandedSection === 'preview'
                                    ? <ChevronUp className="w-4 h-4 text-[#8f959e]" />
                                    : <ChevronDown className="w-4 h-4 text-[#8f959e]" />}
                            </button>
                            {expandedSection === 'preview' && (
                                <div className="mt-3 pt-3 border-t border-[#f0f1f5]">
                                    <div className="space-y-2">
                                        {formulas.map((f, idx) => {
                                            const paramLabel = PHONE_PARAM_OPTIONS.find(o => o.value === f.phoneParam)?.label || f.phoneParam;
                                            return (
                                                <div key={idx} className="flex items-center gap-3 text-[12px]">
                                                    <span className="text-[#8f959e] w-[200px] shrink-0">{paramLabel}:</span>
                                                    <span className="text-[#646a73] tabular-nums">
                                                        f(x) = {f.coeffA}x² + {f.coeffB}x + {f.coeffC}
                                                    </span>
                                                    <span className="text-[#8f959e]">→</span>
                                                    <span className="text-[#8f959e]">x=70:</span>
                                                    <span className="text-[#3370ff] tabular-nums" style={{ fontWeight: 500 }}>{previewCalc(f, 70)}</span>
                                                    <span className="text-[#8f959e]">x=75:</span>
                                                    <span className="text-[#3370ff] tabular-nums" style={{ fontWeight: 500 }}>{previewCalc(f, 75)}</span>
                                                    <span className="text-[#8f959e]">x=80:</span>
                                                    <span className="text-[#3370ff] tabular-nums" style={{ fontWeight: 500 }}>{previewCalc(f, 80)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* ═══ Preferences Tab ═══ */
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-[16px] text-[#1f2329]" style={{ fontWeight: 600 }}>
                                分类偏好配置
                            </h2>
                            <p className="text-[12px] text-[#8f959e] mt-1">
                                为非线性的分类变量（如摄像模组形状）设定不同人群的偏好得分 (0-100)
                            </p>
                        </div>
                        <button
                            onClick={addPrefRow}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#3370ff] text-[12px] text-[#3370ff] hover:bg-[#3370ff]/5 transition-colors"
                        >
                            <Plus className="w-3 h-3" /> 新增偏好
                        </button>
                    </div>

                    {/* Group by category */}
                    {Object.entries(CATEGORY_OPTIONS).map(([catKey, catInfo]) => {
                        const categoryPrefs = prefs.filter(p => p.category === catKey);
                        if (categoryPrefs.length === 0 && prefs.filter(p => p.isNew && p.category === catKey).length === 0) {
                            return null;
                        }
                        return (
                            <div key={catKey} className="bg-white rounded-xl border border-[#e8e8ed] overflow-hidden">
                                <div className="px-4 py-3 bg-[#f9fafb] border-b border-[#f0f1f5]">
                                    <h3 className="text-[13px] text-[#1f2329]" style={{ fontWeight: 500 }}>
                                        {catInfo.label}
                                        <span className="text-[11px] text-[#8f959e] ml-2" style={{ fontWeight: 400 }}>
                                            {categoryPrefs.length} 条配置
                                        </span>
                                    </h3>
                                </div>
                                <div className="grid grid-cols-[140px_180px_100px_40px] gap-2 px-4 py-2 text-[11px] text-[#8f959e] border-b border-[#f5f6f8]" style={{ fontWeight: 500 }}>
                                    <span>人群分类</span>
                                    <span>选项</span>
                                    <span>偏好得分</span>
                                    <span></span>
                                </div>
                                {categoryPrefs.map((p, idx) => {
                                    const globalIdx = prefs.indexOf(p);
                                    return (
                                        <div
                                            key={p.id || `new-${globalIdx}`}
                                            className={`grid grid-cols-[140px_180px_100px_40px] gap-2 px-4 py-2 border-b border-[#f5f6f8] items-center ${p.isNew ? 'bg-[#3370ff]/3' : 'hover:bg-[#fafbfc]'
                                                }`}
                                        >
                                            <select
                                                value={p.userGroup}
                                                onChange={e => updatePref(globalIdx, 'userGroup', e.target.value)}
                                                className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] bg-white outline-none focus:border-[#3370ff]"
                                            >
                                                {USER_GROUP_OPTIONS.map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={p.categoryValue}
                                                onChange={e => updatePref(globalIdx, 'categoryValue', e.target.value)}
                                                className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] bg-white outline-none focus:border-[#3370ff]"
                                            >
                                                {catInfo.values.map(v => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
                                            </select>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={p.preferenceScore}
                                                    onChange={e => updatePref(globalIdx, 'preferenceScore', parseFloat(e.target.value) || 0)}
                                                    className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] text-center tabular-nums outline-none focus:border-[#3370ff] w-full"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removePref(globalIdx)}
                                                className="p-1.5 rounded-md hover:bg-[#f54a45]/10 text-[#c9cdd4] hover:text-[#f54a45] transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Show ungrouped prefs (new ones with any category) */}
                    {prefs.filter(p => !Object.keys(CATEGORY_OPTIONS).includes(p.category)).length > 0 && (
                        <div className="bg-white rounded-xl border border-[#e8e8ed] p-4">
                            <h3 className="text-[13px] text-[#8f959e] mb-2" style={{ fontWeight: 500 }}>其他分类</h3>
                            {prefs.filter(p => !Object.keys(CATEGORY_OPTIONS).includes(p.category)).map((p, idx) => {
                                const globalIdx = prefs.indexOf(p);
                                return (
                                    <div key={globalIdx} className="flex items-center gap-2 mb-2">
                                        <input
                                            value={p.category}
                                            onChange={e => updatePref(globalIdx, 'category', e.target.value)}
                                            className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] outline-none w-[120px]"
                                            placeholder="分类..."
                                        />
                                        <input
                                            value={p.categoryValue}
                                            onChange={e => updatePref(globalIdx, 'categoryValue', e.target.value)}
                                            className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] outline-none w-[140px]"
                                            placeholder="选项..."
                                        />
                                        <input
                                            type="number"
                                            min={0} max={100}
                                            value={p.preferenceScore}
                                            onChange={e => updatePref(globalIdx, 'preferenceScore', parseFloat(e.target.value) || 0)}
                                            className="px-2 py-1.5 rounded-md border border-[#e8e8ed] text-[12px] text-center tabular-nums outline-none w-[80px]"
                                        />
                                        <button
                                            onClick={() => removePref(globalIdx)}
                                            className="p-1.5 rounded-md hover:bg-[#f54a45]/10 text-[#c9cdd4] hover:text-[#f54a45]"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {prefs.length === 0 && (
                        <div className="bg-white rounded-xl border border-[#e8e8ed] p-10 text-center">
                            <Settings2 className="w-8 h-8 text-[#c9cdd4] mx-auto mb-3" />
                            <p className="text-[14px] text-[#8f959e]">暂无偏好配置</p>
                            <p className="text-[12px] text-[#c9cdd4] mt-1">点击"新增偏好"开始添加</p>
                        </div>
                    )}
                </div>
            )}

            {/* SQL Reference */}
            <div className="mt-8 bg-white rounded-xl border border-[#e8e8ed] p-4">
                <button
                    onClick={() => setExpandedSection(expandedSection === 'sql' ? null : 'sql')}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="text-[13px] text-[#1f2329]" style={{ fontWeight: 500 }}>
                        建表 SQL <span className="text-[11px] text-[#8f959e] ml-1">请在 Supabase Dashboard 执行</span>
                    </h3>
                    {expandedSection === 'sql'
                        ? <ChevronUp className="w-4 h-4 text-[#8f959e]" />
                        : <ChevronDown className="w-4 h-4 text-[#8f959e]" />}
                </button>
                {expandedSection === 'sql' && (
                    <pre className="mt-3 pt-3 border-t border-[#f0f1f5] text-[11px] text-[#646a73] bg-[#f9fafb] rounded-lg p-4 overflow-x-auto" style={{ lineHeight: 1.7 }}>
                        {`-- 二次回归公式表
CREATE TABLE scoring_formulas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score_type TEXT NOT NULL DEFAULT 'comfort',
  user_group TEXT NOT NULL DEFAULT 'default',
  phone_param TEXT NOT NULL,
  coeff_a FLOAT NOT NULL DEFAULT 0,
  coeff_b FLOAT NOT NULL DEFAULT 0,
  coeff_c FLOAT NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(score_type, user_group, phone_param)
);

-- 分类偏好表
CREATE TABLE categorical_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score_type TEXT NOT NULL DEFAULT 'comfort',
  user_group TEXT NOT NULL DEFAULT 'default',
  category TEXT NOT NULL,
  category_value TEXT NOT NULL,
  preference_score FLOAT NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(score_type, user_group, category, category_value)
);

-- RLS (可选: 按需开启)
ALTER TABLE scoring_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorical_preferences ENABLE ROW LEVEL SECURITY;

-- ======== 权限策略 ========
-- 删除旧的限制策略 (防冲突)
DROP POLICY IF EXISTS "Anyone can read formulas" ON scoring_formulas;
DROP POLICY IF EXISTS "Authenticated users can modify formulas" ON scoring_formulas;
DROP POLICY IF EXISTS "Enable ALL operations for everyone on formulas" ON scoring_formulas;

DROP POLICY IF EXISTS "Anyone can read preferences" ON categorical_preferences;
DROP POLICY IF EXISTS "Authenticated users can modify preferences" ON categorical_preferences;
DROP POLICY IF EXISTS "Enable ALL operations for everyone on preferences" ON categorical_preferences;

-- 创建新策略：允许所有人读取和修改 (开发测试用)
CREATE POLICY "Enable ALL operations for everyone on formulas"
  ON scoring_formulas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable ALL operations for everyone on preferences"
  ON categorical_preferences FOR ALL USING (true) WITH CHECK (true);`}
                    </pre>
                )}
            </div>
        </div>
    );
}
