import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../ToBStore';

const ENV_PARAMS = [
  { label: '室温要求', default: '22±2°C', note: '影响热控制实验结果' },
  { label: '照明亮度', default: '500 lux', note: '标准办公室照明' },
  { label: '背景噪音上限', default: '≤40 dB', note: '声学实验需更低' },
  { label: '摄像机角度', default: '45°正面 + 侧面', note: '录制握持姿势' },
  { label: '录音设备放置', default: '距被试 30cm', note: '—' },
];

const CHECKLIST: { phase: string; items: string[] }[] = [
  {
    phase: '实验前',
    items: ['检查室内温度并记录', '校准压力测量设备', '启动录音录像设备并测试', '在桌面摆放知情同意书与指导语', '准备样机并确认编号与状态'],
  },
  {
    phase: '被试到达时',
    items: ['引导被试阅读并签署知情同意书', '简要说明实验流程（≤5分钟）', '确认被试已理解评分规则', '记录被试手型参数（手长/手宽/虎口）'],
  },
  {
    phase: '实验进行中',
    items: ['启动录像并确认拍摄角度', '计时并记录关键节点', '如被试提出不适立即中止并记录', '确保量表按序作答'],
  },
  {
    phase: '实验结束后',
    items: ['保存录像并备份', '导出量表作答数据', '向被试致谢并发放报酬', '清洁实验区域并重置设备'],
  },
];

const DEVICES = [
  { name: '摄像头', status: 'connected' as const },
  { name: '录音模块', status: 'connected' as const },
  { name: '压力板', status: 'disconnected' as const },
];

export function SetupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [envParams, setEnvParams] = useState<Record<string, string>>(
    Object.fromEntries(ENV_PARAMS.map(p => [p.label, p.default]))
  );
  const [deviceStatus, setDeviceStatus] = useState(DEVICES);

  if (!project) return null;

  const total = CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const doneCount = checked.size;
  // 只需完成「实验前」阶段的至少 3 项即可进入下一步（降低 demo 门槛）
  const allRequired = CHECKLIST[0].items.filter(item => checked.has(item)).length >= 3;

  function toggle(item: string) {
    setChecked(prev => { const next = new Set(prev); next.has(item) ? next.delete(item) : next.add(item); return next; });
  }

  function retryDevice(name: string) {
    setDeviceStatus(prev => prev.map(d => d.name === name ? { ...d, status: 'connected' } : d));
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>H3-3 实验环境搭建指导</h2>
          <p className="text-slate-400 text-sm mt-0.5">Checklist {doneCount}/{total} 项已完成</p>
        </div>
        <div className="h-12 w-12">
          <svg viewBox="0 0 36 36" className="rotate-[-90deg]">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
              strokeDasharray={`${(doneCount/total)*100} 100`} strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Env params */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>环境标准参数（可编辑）</h3>
          <div className="space-y-3">
            {ENV_PARAMS.map(p => (
              <div key={p.label}>
                <label className="text-xs text-slate-500 mb-1 block">{p.label}</label>
                <input type="text" value={envParams[p.label]} onChange={e => setEnvParams(prev => ({ ...prev, [p.label]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
                <p className="text-xs text-slate-400 mt-0.5">{p.note}</p>
              </div>
            ))}
          </div>

          {/* Device status */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <h4 className="text-slate-700 text-xs mb-3" style={{ fontWeight: 600 }}>设备连接状态</h4>
            <div className="space-y-2">
              {deviceStatus.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <div className={`w-2 h-2 rounded-full ${d.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {d.name}
                  </div>
                  {d.status === 'disconnected' ? (
                    <button onClick={() => retryDevice(d.name)} className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                      <RefreshCw size={11} /> 重试
                    </button>
                  ) : (
                    <span className="text-xs text-green-600">已连接</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="col-span-2 space-y-4">
          {CHECKLIST.map(phase => (
            <div key={phase.phase} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>{phase.phase}</h3>
              <div className="space-y-2">
                {phase.items.map(item => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <div onClick={() => toggle(item)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${checked.has(item) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 group-hover:border-indigo-300'}`}>
                      {checked.has(item) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-sm leading-relaxed ${checked.has(item) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/lab`)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={15} /> 上一步
        </button>
        <div className="flex items-center gap-3">
          {!allRequired && <p className="text-amber-600 text-xs">请至少完成「实验前」阶段的 3 项清单</p>}
          <button onClick={() => {
            dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'questionnaire' } } });
            navigate(`/tob/he/projects/${id}/run/questionnaire`);
          }}
            disabled={!allRequired}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-colors shadow-sm ${allRequired ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            style={{ fontWeight: 500 }}>
            清单完成，下一步：量表配置 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
