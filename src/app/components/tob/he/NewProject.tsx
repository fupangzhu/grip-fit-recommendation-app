import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, X, Plus, Check } from 'lucide-react';
import { useAppStore, ResearchType, FormFactor, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, RESEARCH_TYPE_DESC, FORM_FACTOR_LABELS } from '../ToBStore';

const PRESET_TYPES: ResearchType[] = ['comfort', 'thermal', 'acoustic', 'vibration', 'touch', 'weight', 'form'];

export function HENewProject() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const { wizard } = state;

  const [name, setName] = useState(wizard.name);
  const [types, setTypes] = useState<ResearchType[]>(wizard.researchTypes);
  const [formFactor, setFormFactor] = useState<FormFactor>(wizard.formFactor);
  const [startDate, setStartDate] = useState(wizard.startDate);
  const [period, setPeriod] = useState(wizard.period);
  const [description, setDescription] = useState(wizard.description);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customType, setCustomType] = useState('');

  function toggleType(t: ResearchType) {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = '请填写项目名称';
    if (types.length === 0) e.types = '请至少选择一种研究类型';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    dispatch({ type: 'SET_WIZARD', payload: { name, researchTypes: types, formFactor, startDate, period, description } });
    navigate('/tob/he/projects/new/paradigm');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Steps */}
      <div className="flex items-center gap-3 mb-7">
        {['填写项目信息', '选择实验范式'].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i === 0 ? 'bg-white text-indigo-600' : 'bg-slate-200 text-slate-500'}`} style={{ fontWeight: 700 }}>{i + 1}</span>
              {s}
            </div>
            {i < 1 && <ArrowRight size={14} className="text-slate-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-slate-900 mb-5" style={{ fontWeight: 700, fontSize: '1.05rem' }}>项目基础信息</h2>

            <div className="mb-5">
              <label className="text-sm text-slate-700 mb-1.5 block" style={{ fontWeight: 500 }}>项目名称 <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="例：旗舰机握持舒适度研究 2026"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="mb-5">
              <label className="text-sm text-slate-700 mb-2 block" style={{ fontWeight: 500 }}>目标手机形态 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {(['bar', 'flip', 'fold'] as FormFactor[]).map(f => (
                  <button key={f} onClick={() => setFormFactor(f)}
                    className={`relative py-3 px-4 rounded-xl border-2 text-sm transition-all ${formFactor === f ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {formFactor === f && <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"><Check size={9} className="text-white" /></div>}
                    <div style={{ fontWeight: 600 }}>{FORM_FACTOR_LABELS[f]}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{f === 'bar' ? '传统直板' : f === 'flip' ? '上下竖折' : '左右横折'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-sm text-slate-700 mb-1.5 block" style={{ fontWeight: 500 }}>预计开始时间</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-sm text-slate-700 mb-1.5 block" style={{ fontWeight: 500 }}>预计周期</label>
                <select value={period} onChange={e => setPeriod(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white">
                  {['1周', '2周', '1月', '自定义'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-1.5 block" style={{ fontWeight: 500 }}>项目说明</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder="描述研究目标、背景及预期产出…"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/tob/he/dashboard')}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
            <button onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
              下一步：选择实验范式 <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Research types */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-900 mb-1 text-sm" style={{ fontWeight: 700 }}>研究类型 <span className="text-red-500">*</span></h3>
            <p className="text-slate-400 text-xs mb-4">可多选，支持自定义添加</p>
            {errors.types && <p className="text-red-500 text-xs mb-3">{errors.types}</p>}
            <div className="space-y-2">
              {PRESET_TYPES.map(t => (
                <button key={t} onClick={() => toggleType(t)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${types.includes(t) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'}`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${types.includes(t) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                    {types.includes(t) && <Check size={11} className="text-white" />}
                  </div>
                  <div>
                    <div className="text-sm text-slate-700" style={{ fontWeight: 500 }}>
                      {RESEARCH_TYPE_ICONS[t]} {RESEARCH_TYPE_LABELS[t]}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{RESEARCH_TYPE_DESC[t]}</div>
                  </div>
                </button>
              ))}
            </div>
            {/* Selected summary */}
            {types.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-2">已选 {types.length} 种</div>
                <div className="flex flex-wrap gap-1">
                  {types.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {RESEARCH_TYPE_LABELS[t]}
                      <button onClick={() => toggleType(t)} className="text-indigo-500 hover:text-indigo-700"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

