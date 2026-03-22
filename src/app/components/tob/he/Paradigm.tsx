import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Check, Users } from 'lucide-react';
import { useAppStore, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ResearchType, HEProject, RunStep } from '../ToBStore';

type Paradigm = { key: string; name: string; desc: string; flow: string; sampleRange: string; duration: string };

const PARADIGMS: Partial<Record<ResearchType, Paradigm[]>> = {
  comfort: [
    { key: 'likert', name: '主观量表评定', desc: '使用 Likert 量表 / SD 语义差异量表，被试握持后评分', flow: '握持样机 → 量表作答 → 重复3次', sampleRange: '20–30人', duration: '60–90分钟/人' },
    { key: 'bodymap', name: '身体地图标注', desc: '被试在数字人体图上标注不适部位', flow: '握持样机 → 标注不适位置 → 半结构访谈', sampleRange: '15–25人', duration: '45–60分钟/人' },
    { key: 'compare', name: '比较判断法', desc: '多款样机两两对比，产出偏好排序', flow: '样机A vs B → 偏好评分 → 全排列', sampleRange: '25–35人', duration: '90分钟/人' },
    { key: 'fatigue', name: '持续握持疲劳测试', desc: '指定时长握持后评估疲劳程度', flow: '连续握持15min → 疲劳量表 → 恢复后重测', sampleRange: '20–25人', duration: '120分钟/人' },
  ],
  thermal: [
    { key: 'thermalscale', name: '温度主观感受量表', desc: '不同使用时长下的主观热感评分', flow: '使用5/10/15min → 热感量表 → 记录皮肤温度', sampleRange: '20–30人', duration: '60分钟/人' },
    { key: 'thermalrange', name: '热舒适区间评定', desc: '确定被试认为"舒适"的温度上下限', flow: '热感受训练 → 舒适阈值标定 → 区间确认', sampleRange: '15–20人', duration: '45分钟/人' },
  ],
  acoustic: [
    { key: 'audioqual', name: '音质主观评价', desc: 'ITU-T P.800 等标准化主观听音实验', flow: '参考音频校准 → 各条件播放 → ACR评分', sampleRange: '20–30人', duration: '60分钟/人' },
    { key: 'clarity', name: '通话清晰度评定', desc: '特定语料下的主观清晰度评分', flow: '安静/噪音环境各测一次 → MOS评分', sampleRange: '20–25人', duration: '45分钟/人' },
  ],
  vibration: [
    { key: 'vibscale', name: '振动强度感知量表', desc: '对不同马达参数的强度偏好与识别率', flow: '盲测振动样本 → 强度评分 → 偏好排序', sampleRange: '20–30人', duration: '60分钟/人' },
    { key: 'texture', name: '触觉纹理辨别', desc: '被试区分不同振动模式的准确率', flow: '振动模式训练 → 盲测辨别 → 记录正确率', sampleRange: '15–20人', duration: '45分钟/人' },
  ],
  touch: [
    { key: 'touchscale', name: '触控手感量表', desc: '针对屏幕触感、边框手感的主观评分', flow: '触控操作任务 → 手感量表 → 偏好访谈', sampleRange: '20–25人', duration: '50分钟/人' },
  ],
  weight: [
    { key: 'weightperc', name: '重量感知量表', desc: '主观重量感受与持握疲劳综合评估', flow: '握持标准时长 → 重量感知评分 → 疲劳评估', sampleRange: '20–30人', duration: '60分钟/人' },
  ],
  form: [
    { key: 'formfit', name: '形态适配性量表', desc: '整机尺寸与用户手型的匹配度综合评估', flow: '握持样机 → 适配性量表 → 手型测量', sampleRange: '25–35人', duration: '50分钟/人' },
  ],
};

export function HEParadigm() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const { wizard } = state;

  const [selectedParadigms, setSelectedParadigms] = useState<Record<ResearchType, string>>({} as any);
  const [expandedType, setExpandedType] = useState<ResearchType | null>(wizard.researchTypes[0] ?? null);
  const [expandedParadigm, setExpandedParadigm] = useState<string | null>(null);

  if (wizard.researchTypes.length === 0) return <Navigate to="/tob/he/projects/new" replace />;

  function toggleParadigm(rt: ResearchType, key: string) {
    const isSelecting = selectedParadigms[rt] !== key;
    setSelectedParadigms(prev => ({ ...prev, [rt]: isSelecting ? key : '' }));

    // Auto-advance to the next unselected research type for better UX
    if (isSelecting) {
      const nextUnselected = wizard.researchTypes.find(type => type !== rt && !selectedParadigms[type]);
      if (nextUnselected) {
        setExpandedType(nextUnselected);
        setExpandedParadigm(null);
      }
    }
  }

  const allSelected = wizard.researchTypes.every(rt => selectedParadigms[rt]);
  const totalMin = wizard.researchTypes.reduce((s, rt) => {
    const p = (PARADIGMS[rt] ?? []).find(pp => pp.key === selectedParadigms[rt]);
    return s + (p ? parseInt(p.sampleRange) : 0);
  }, 0);
  const sampleEst = totalMin > 0 ? `建议 ${totalMin}–${totalMin + 10} 人` : '请先选择范式';

  function handleCreate() {
    const paradigmNames = wizard.researchTypes.map(rt => {
      const p = (PARADIGMS[rt] ?? []).find(pp => pp.key === selectedParadigms[rt]);
      return p?.name ?? '';
    }).filter(Boolean).join(' + ');

    dispatch({ type: 'SET_WIZARD', payload: { paradigm: paradigmNames } });
    const newId = `he-${Date.now()}`;
    const newProject: HEProject = {
      id: newId, name: wizard.name, status: 'draft',
      researchTypes: wizard.researchTypes, formFactor: wizard.formFactor,
      paradigm: paradigmNames, startDate: wizard.startDate, period: wizard.period,
      description: wizard.description, createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0], currentStep: 'participants' as RunStep,
      participants: [], participantTarget: totalMin > 0 ? totalMin + 5 : 20,
      deadline: wizard.startDate ? new Date(new Date(wizard.startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
      memberCount: 1, progress: 5,
    };
    dispatch({ type: 'ADD_HE_PROJECT', payload: newProject });
    dispatch({ type: 'RESET_WIZARD' });
    navigate(`/tob/he/projects/${newId}`);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Steps */}
      <div className="flex items-center gap-3 mb-7">
        {['填写项目信息', '选择实验范式'].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm ${i === 1 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i === 1 ? 'bg-white text-indigo-600' : 'bg-indigo-200 text-indigo-700'}`} style={{ fontWeight: 700 }}>{i + 1}</span>
              {s}
            </div>
            {i < 1 && <ArrowRight size={14} className="text-slate-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Left: selected types */}
        <div>
          <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>已选研究类型</h3>
          <div className="space-y-2">
            {wizard.researchTypes.map(rt => (
              <button key={rt} onClick={() => setExpandedType(rt === expandedType ? null : rt)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${expandedType === rt ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                <span>{RESEARCH_TYPE_ICONS[rt]}</span>
                <span className="flex-1 text-sm" style={{ fontWeight: 500 }}>{RESEARCH_TYPE_LABELS[rt]}</span>
                {selectedParadigms[rt] && <Check size={14} className="text-green-500 flex-shrink-0" />}
              </button>
            ))}
          </div>

          <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-indigo-600" />
              <span className="text-indigo-700 text-xs" style={{ fontWeight: 600 }}>被试量估算</span>
            </div>
            <div className="text-indigo-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{sampleEst}</div>
            <p className="text-indigo-500 text-xs mt-1">根据所选范式计算</p>
          </div>
        </div>

        {/* Right: paradigms */}
        <div className="col-span-3">
          {expandedType ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{RESEARCH_TYPE_ICONS[expandedType]}</span>
                <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>{RESEARCH_TYPE_LABELS[expandedType]} — 可用实验范式</h3>
              </div>
              <div className="space-y-3">
                {(PARADIGMS[expandedType] ?? []).map(p => (
                  <div key={p.key}
                    className={`bg-white rounded-xl border-2 transition-all ${selectedParadigms[expandedType] === p.key ? 'border-indigo-400' : 'border-slate-100'}`}>
                    <div className="flex items-start gap-4 p-4">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer ${selectedParadigms[expandedType] === p.key ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}
                        onClick={() => toggleParadigm(expandedType, p.key)}>
                        {selectedParadigms[expandedType] === p.key && <Check size={11} className="text-white" />}
                      </div>
                      <div className="flex-1 cursor-pointer" onClick={() => toggleParadigm(expandedType, p.key)}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>{p.name}</span>
                          <div className="flex gap-3 text-xs text-slate-400">
                            <span>样本量 {p.sampleRange}</span>
                            <span>约 {p.duration}</span>
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm">{p.desc}</p>
                      </div>
                      <button onClick={() => setExpandedParadigm(expandedParadigm === p.key ? null : p.key)}
                        className="text-slate-400 hover:text-indigo-500 transition-colors flex-shrink-0">
                        {expandedParadigm === p.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    {expandedParadigm === p.key && (
                      <div className="px-4 pb-4 pt-0 ml-9 border-t border-slate-50">
                        <div className="bg-slate-50 rounded-lg p-3 mt-3">
                          <div className="text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>实验流程简述</div>
                          <p className="text-xs text-slate-600">{p.flow}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              请在左侧选择研究类型查看可用实验范式
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button onClick={() => navigate('/tob/he/projects/new')}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={handleCreate} disabled={!allSelected}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm transition-colors shadow-sm min-w-[200px] ${allSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          style={{ fontWeight: 500 }}>
          {allSelected ? <>创建项目并进入工作空间 <ArrowRight size={16} /></> : '请先为所有研究类型选择范式'}
        </button>
      </div>
    </div>
  );
}

