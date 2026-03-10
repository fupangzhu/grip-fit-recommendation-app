import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { fetchAllPhones } from '../../../lib/api/phones';
import { addPhone, updatePhone, deletePhone, deletePhones } from '../../../lib/api/phones';
import type { PhoneModel } from '../AppContext';
import { useAdminTheme, useThemeTokens } from './AdminThemeContext';

const PAGE_SIZE = 12;

// ─── Phone Form Modal ───
const EMPTY_PHONE: Omit<PhoneModel, 'id'> = {
    name: '', brand: '', image: '', width: 70, height: 150, thickness: 8,
    weight: 180, screenSize: 6.1, price: 3999, gripScore: 0, reachScore: 0,
    comfortScore: 0, overallScore: 0, material: '', features: [],
    backMaterial: 'glass', cameraPosition: 'center', cameraShape: 'rectangle',
    cameraBumpHeight: 2, battery: 4000, storage: '128GB', formFactor: 'bar', cornerRadius: 40,
};

function PhoneFormModal({
    phone,
    onClose,
    onSaved,
}: {
    phone: PhoneModel | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!phone;
    const [form, setForm] = useState<Omit<PhoneModel, 'id'>>(
        phone ? { ...phone } : { ...EMPTY_PHONE }
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';

    const set = (k: keyof Omit<PhoneModel, 'id'>, v: any) =>
        setForm(prev => ({ ...prev, [k]: v }));

    const handleSave = async () => {
        if (!form.name.trim() || !form.brand.trim()) {
            setError('机型名称和品牌不能为空');
            return;
        }
        setSaving(true);
        setError('');
        if (isEdit) {
            const { error: e } = await updatePhone(phone!.id, form);
            if (e) { setError(e.message || '保存失败'); setSaving(false); return; }
        } else {
            const { error: e } = await addPhone(form);
            if (e) { setError(e.message || '添加失败'); setSaving(false); return; }
        }
        onSaved();
        onClose();
    };

    const inputCls = `w-full ${t.inputBg} border ${t.inputBorder} rounded-lg px-3 py-2 text-[13px] ${t.inputText} outline-none ${t.inputFocusBorder}`;
    const labelCls = `text-[11px] ${t.tableHeaderText} uppercase tracking-wider mb-1 block`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className={`${t.modalBg} border ${t.modalBorder} rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl`}>
                <div className={`flex items-center justify-between p-5 border-b ${t.borderColor}`}>
                    <h2 className={`text-[16px] font-semibold ${t.textPrimary}`}>{isEdit ? '编辑机型' : '新增机型'}</h2>
                    <button onClick={onClose} className={`p-2 rounded-lg ${t.collapseHover} ${t.paginationText}`}><X className="w-4 h-4" /></button>
                </div>

                <div className="overflow-y-auto flex-1 p-5 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className={labelCls}>机型名称 *</label>
                        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="如：iPhone 16 Pro" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>品牌 *</label>
                        <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="如：Apple" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>价格 (元)</label>
                        <input type="number" value={form.price} onChange={e => set('price', +e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>宽度 (mm)</label>
                        <input type="number" value={form.width} onChange={e => set('width', +e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>高度 (mm)</label>
                        <input type="number" value={form.height} onChange={e => set('height', +e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>厚度 (mm)</label>
                        <input type="number" step="0.1" value={form.thickness} onChange={e => set('thickness', +e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>重量 (g)</label>
                        <input type="number" value={form.weight} onChange={e => set('weight', +e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>屏幕尺寸 (英寸)</label>
                        <input type="number" step="0.1" value={form.screenSize} onChange={e => set('screenSize', +e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>电池 (mAh)</label>
                        <input type="number" value={form.battery} onChange={e => set('battery', +e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>存储规格</label>
                        <input value={form.storage} onChange={e => set('storage', e.target.value)} placeholder="如：256GB" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>整体评分</label>
                        <input type="number" step="0.1" min="0" max="100" value={form.overallScore} onChange={e => set('overallScore', +e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>材质</label>
                        <input value={form.material} onChange={e => set('material', e.target.value)} placeholder="如：钛合金" className={inputCls} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelCls}>图片 URL</label>
                        <input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." className={inputCls} />
                    </div>
                </div>

                {error && (
                    <div className="mx-5 mb-3 flex items-center gap-2 text-red-500 text-[12px] bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
                    </div>
                )}

                <div className={`flex gap-3 p-5 border-t ${t.borderColor}`}>
                    <button onClick={onClose} className={`flex-1 px-4 py-2.5 rounded-lg border ${t.accentBorder} ${t.textMuted} text-[13px] ${t.collapseHover} transition-colors`}>
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2
                            ${isWire ? 'bg-black text-white border border-black hover:bg-black/80' : 'bg-violet-600 text-white hover:bg-violet-500'}`}
                    >
                        {saving ? '保存中...' : <><Check className="w-4 h-4" />保存</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm ───
function DeleteConfirmModal({
    count,
    onConfirm,
    onClose,
    loading,
}: {
    count: number;
    onConfirm: () => void;
    onClose: () => void;
    loading: boolean;
}) {
    const t = useThemeTokens();
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className={`${t.modalBg} border border-red-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center`}>
                <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className={`text-[16px] font-semibold ${t.textPrimary} mb-2`}>确认删除</h3>
                <p className={`text-[13px] ${t.textMuted} mb-6`}>将删除选中的 <span className="text-red-500 font-bold">{count}</span> 款机型，此操作不可撤销。</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className={`flex-1 px-4 py-2.5 rounded-lg border ${t.accentBorder} ${t.textMuted} text-[13px] ${t.collapseHover}`}>取消</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-[13px] hover:bg-red-500 disabled:opacity-50">
                        {loading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main ───
export function AdminPhones() {
    const [phones, setPhones] = useState<PhoneModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showForm, setShowForm] = useState(false);
    const [formPhone, setFormPhone] = useState<PhoneModel | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const t = useThemeTokens();
    const { theme } = useAdminTheme();
    const isWire = theme === 'wireframe';

    const load = async () => {
        setLoading(true);
        const data = await fetchAllPhones();
        setPhones(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const filtered = phones.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selected.size === paged.length) setSelected(new Set());
        else setSelected(new Set(paged.map(p => p.id)));
    };

    const handleDelete = async () => {
        setDeleting(true);
        await deletePhones(Array.from(selected));
        setSelected(new Set());
        setShowDeleteConfirm(false);
        setDeleting(false);
        await load();
    };

    const handleSingleDelete = async (id: string) => {
        if (!confirm('确认删除此机型？')) return;
        await deletePhone(id);
        await load();
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className={`text-[20px] font-bold ${t.textPrimary}`}>机型管理</h1>
                    <p className={`text-[13px] ${t.textMuted} mt-0.5`}>共 {phones.length} 款机型</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textPlaceholder}`} />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="搜索机型/品牌..."
                            className={`${t.inputBg} border ${t.inputBorder} rounded-lg pl-9 pr-4 py-2 text-[13px] ${t.inputText} outline-none ${t.inputFocusBorder} w-[200px]`}
                        />
                    </div>
                    {selected.size > 0 && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> 删除 {selected.size} 项
                        </button>
                    )}
                    <button
                        onClick={() => { setFormPhone(null); setShowForm(true); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors
                            ${isWire ? 'border border-black/30 text-black hover:bg-black/5' : 'bg-violet-600 text-white hover:bg-violet-500'}`}
                    >
                        <Plus className="w-4 h-4" /> 新增机型
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl overflow-hidden`}>
                <table className="w-full">
                    <thead>
                        <tr className={`border-b ${t.borderColor}`}>
                            <th className="px-4 py-3.5 w-[40px]">
                                <input
                                    type="checkbox"
                                    checked={selected.size === paged.length && paged.length > 0}
                                    onChange={selectAll}
                                    className="w-4 h-4 rounded"
                                />
                            </th>
                            {['机型', '品牌', '尺寸', '重量', '价格', '评分', '操作'].map(h => (
                                <th key={h} className={`px-4 py-3.5 text-left text-[11px] font-medium ${t.tableHeaderText} uppercase tracking-wider`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className={`text-center py-16 ${t.textMuted} text-sm`}>加载中...</td></tr>
                        ) : paged.length === 0 ? (
                            <tr><td colSpan={8} className={`text-center py-16 ${t.textMuted} text-sm`}>暂无机型数据</td></tr>
                        ) : (
                            paged.map(phone => (
                                <tr key={phone.id} className={`border-b ${t.borderColor} ${t.tableRowHover} transition-colors`}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(phone.id)}
                                            onChange={() => toggleSelect(phone.id)}
                                            className="w-4 h-4 rounded"
                                        />
                                    </td>
                                    <td className={`px-4 py-3 text-[13px] font-medium ${t.textSecondary}`}>{phone.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[12px] ${isWire ? 'border border-black/20 text-black/70' : 'bg-indigo-500/10 text-indigo-400'}`}>{phone.brand}</span>
                                    </td>
                                    <td className={`px-4 py-3 text-[12px] ${t.textMuted}`}>{phone.width}×{phone.height}mm</td>
                                    <td className={`px-4 py-3 text-[12px] ${t.textMuted}`}>{phone.weight}g</td>
                                    <td className={`px-4 py-3 text-[12px] ${t.textMuted}`}>¥{phone.price.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-14 h-1.5 rounded-full overflow-hidden ${isWire ? 'border border-black/20' : 'bg-white/10'}`}>
                                                <div
                                                    className={`h-full rounded-full ${isWire ? 'bg-black/40' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`}
                                                    style={{ width: `${Math.min(100, phone.overallScore)}%` }}
                                                />
                                            </div>
                                            <span className={`text-[12px] ${t.textMuted}`}>{phone.overallScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => { setFormPhone(phone); setShowForm(true); }}
                                                className={`p-1.5 rounded-lg transition-colors ${t.paginationHover} ${t.paginationText} ${isWire ? 'hover:text-black' : 'hover:text-violet-400'}`}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleSingleDelete(phone.id)}
                                                className={`p-1.5 rounded-lg transition-colors ${t.paginationHover} ${t.paginationText} hover:text-red-500`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={`flex items-center justify-between px-5 py-3 border-t ${t.borderColor}`}>
                        <span className={`text-[12px] ${t.textPlaceholder}`}>第 {page} / {totalPages} 页，共 {filtered.length} 条</span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={`p-1.5 rounded-lg ${t.paginationHover} ${t.paginationText} disabled:opacity-30`}>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={`p-1.5 rounded-lg ${t.paginationHover} ${t.paginationText} disabled:opacity-30`}>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <PhoneFormModal
                    phone={formPhone}
                    onClose={() => setShowForm(false)}
                    onSaved={load}
                />
            )}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    count={selected.size}
                    onConfirm={handleDelete}
                    onClose={() => setShowDeleteConfirm(false)}
                    loading={deleting}
                />
            )}
        </div>
    );
}
