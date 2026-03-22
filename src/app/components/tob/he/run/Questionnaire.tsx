import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Eye, QrCode, Download, Plus, GripVertical, Trash2, Check } from 'lucide-react';
import { useAppStore, RESEARCH_TYPE_LABELS } from '../../ToBStore';

const TEMPLATES = [
  { key: 'comfort', name: '握持舒适度主量表', types: ['comfort', 'form'], count: 18, duration: '约8分钟', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { key: 'semantic', name: '产品语义差异量表', types: ['comfort', 'form'], count: 12, duration: '约5分钟', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { key: 'thermal', name: '热感知评价量表', types: ['thermal'], count: 10, duration: '约4分钟', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { key: 'vibration', name: '振动感知量表', types: ['vibration'], count: 8, duration: '约3分钟', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { key: 'fatigue', name: '使用疲劳量表', types: ['comfort', 'thermal', 'touch', 'weight', 'form', 'vibration', 'acoustic'], count: 6, duration: '约2分钟', color: 'bg-green-50 border-green-200 text-green-700' },
  { key: 'acoustic', name: '音质主观评价量表', types: ['acoustic'], count: 15, duration: '约6分钟', color: 'bg-amber-50 border-amber-200 text-amber-700' },
];

const SAMPLE_QUESTIONS: Record<string, string[]> = {
  comfort: ['整体握持舒适度如何？（1–9分）', '单手操作时的稳定感？', '长时间握持后是否感到疲劳？', '拇指触达顶部区域的便捷程度？', '食指弯曲时的自然贴合度？'],
  thermal: ['长时间使用后机身温度是否舒适？', '您感觉设备最热的区域在哪里？', '高温是否影响了您的使用体验？'],
  vibration: ['振动强度是否适中？', '能否清晰区分不同的振动模式？', '振动反馈是否及时准确？'],
};

export function QuestionnairePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);

  const [selected, setSelected] = useState<string[]>(() => {
    if (!project) return [];
    return TEMPLATES.filter(t => t.types.some(type => project.researchTypes.includes(type as any))).map(t => t.key);
  });
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [distributeMethod, setDistributeMethod] = useState('qr');
  const [randomOrder, setRandomOrder] = useState(false);
  const [allowBack, setAllowBack] = useState(true);

  if (!project) return null;

  function toggleTemplate(key: string) {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  const totalQuestions = TEMPLATES.filter(t => selected.includes(t.key)).reduce((s, t) => s + t.count, 0);
  const canGoNext = selected.length > 0;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>H3-4 量表配置与生成</h2>
        <p className="text-slate-400 text-sm mt-0.5">系统已根据研究类型自动推荐量表，可按需调整</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Template selection */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>可用量表模板</h3>
            <div className="space-y-3">
              {TEMPLATES.map(t => {
                const isRelevant = t.types.some(type => project.researchTypes.includes(type as any));
                const isSelected = selected.includes(t.key);
                return (
                  <div key={t.key}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${isSelected ? `${t.color} border-opacity-100` : 'border-slate-100 bg-slate-50'} ${!isRelevant ? 'opacity-50' : ''}`}>
                    <div onClick={() => toggleTemplate(t.key)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-all ${isSelected ? 'border-current bg-current' : 'border-slate-300'}`}>
                      {isSelected && <Check size={11} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>{t.name}</span>
                        {isRelevant && <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">推荐</span>}
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>{t.count} 题</span>
                        <span>{t.duration}</span>
                      </div>
                    </div>
                    <button onClick={() => setPreviewKey(previewKey === t.key ? null : t.key)}
                      className="text-xs text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1">
                      <Eye size={13} /> 预览
                    </button>
                  </div>
                );
              })}
            </div>
            {totalQuestions > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">共 <span className="text-slate-800" style={{ fontWeight: 600 }}>{totalQuestions}</span> 题，预计 <span className="text-slate-800" style={{ fontWeight: 600 }}>{Math.round(totalQuestions * 0.45)}</span> 分钟</span>
                <button className="flex items-center gap-1.5 text-indigo-600 text-xs hover:underline"><Plus size={12} /> 添加自定义题目</button>
              </div>
            )}
          </div>

          {/* Preview panel */}
          {previewKey && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
                  {TEMPLATES.find(t => t.key === previewKey)?.name} — 题目预览
                </h3>
                <button onClick={() => setPreviewKey(null)} className="text-slate-400 hover:text-slate-600 text-xs">收起</button>
              </div>
              <div className="space-y-2">
                {(SAMPLE_QUESTIONS[previewKey] ?? ['Q1: 样例题目（1-9分）', 'Q2: 整体满意度评价', 'Q3: 与预期的差距']).map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-400 mt-0.5 w-6 flex-shrink-0">{i+1}.</span>
                    <span className="text-sm text-slate-700">{q}</span>
                  </div>
                ))}
                <p className="text-xs text-slate-400 pl-3">…共 {TEMPLATES.find(t => t.key === previewKey)?.count} 题</p>
              </div>
            </div>
          )}
        </div>

        {/* Distribution settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>发放设置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-2 block" style={{ fontWeight: 500 }}>发放方式</label>
                <div className="space-y-2">
                  {[{ key: 'qr', label: '二维码（现场扫描）', icon: <QrCode size={13} /> }, { key: 'link', label: '链接（发送给��试）' }, { key: 'tablet', label: '平板直接作答' }].map(m => (
                    <label key={m.key} className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg hover:bg-slate-50">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${distributeMethod === m.key ? 'border-indigo-500' : 'border-slate-300'}`}>
                        {distributeMethod === m.key && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                      </div>
                      <input type="radio" value={m.key} checked={distributeMethod === m.key} onChange={() => setDistributeMethod(m.key)} className="sr-only" />
                      <span className="text-sm text-slate-700">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                {[{ key: 'random', label: '随机题目顺序', value: randomOrder, set: setRandomOrder }, { key: 'back', label: '允许返回修改', value: allowBack, set: setAllowBack }].map(opt => (
                  <label key={opt.key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-700">{opt.label}</span>
                    <div onClick={() => opt.set(!opt.value)} className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${opt.value ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${opt.value ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {canGoNext && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>预览与导出</h3>
              <div className="space-y-2">
                <button className="w-full py-2.5 border border-indigo-200 text-indigo-600 rounded-xl text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"><Eye size={14} /> 在线预览量表</button>
                <button className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"><Download size={14} /> 导出 PDF 版本</button>
                <button className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"><QrCode size={14} /> 生成发放链接/二维码</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/setup`)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'collect' } } });
          navigate(`/tob/he/projects/${id}/run/collect`);
        }} disabled={!canGoNext}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-colors shadow-sm ${canGoNext ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          style={{ fontWeight: 500 }}>
          量表已就绪，开始数据采集 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
