import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router';
import { ArrowLeft, Play, FileText, Users, Database, Beaker, Clock, BarChart2 } from 'lucide-react';
import { useAppStore, STATUS_COLORS, STATUS_LABELS, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, FORM_FACTOR_LABELS, RUN_STEPS } from '../ToBStore';

const TABS = [
  { key: 'progress', label: '实验进度', icon: Play },
  { key: 'report',   label: '研究报告', icon: BarChart2 },
  { key: 'subjects', label: '被试记录', icon: Users },
  { key: 'rawdata',  label: '原始数据', icon: Database },
] as const;
type TabKey = typeof TABS[number]['key'];

export function HEProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('progress');

  const project = state.heProjects.find(p => p.id === id);
  if (!project) return <Navigate to="/tob/he/projects" replace />;

  const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed').length;
  const done = project.participants.filter(p => p.recordingStatus === 'done').length;

  function goToStep(step: string) {
    navigate(`/tob/he/projects/${id}/run/${step}`);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => navigate('/tob/he/projects')} className="mt-1 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>{project.name}</h1>
            <span className={`text-sm px-3 py-1 rounded-full ${STATUS_COLORS[project.status]}`} style={{ fontWeight: 500 }}>{STATUS_LABELS[project.status]}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
            <span>{FORM_FACTOR_LABELS[project.formFactor]}</span>
            {project.researchTypes.map(rt => (
              <span key={rt} className="flex items-center gap-1">{RESEARCH_TYPE_ICONS[rt]}{RESEARCH_TYPE_LABELS[rt]}</span>
            ))}
            <span className="flex items-center gap-1"><Clock size={13} />更新于 {project.updatedAt}</span>
            <span>👥 {project.memberCount} 人团队</span>
          </div>
          {project.paradigm && <p className="text-slate-400 text-sm mt-1.5">实验范式：{project.paradigm}</p>}
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">综合进度</div>
          <div className="text-indigo-600" style={{ fontWeight: 700, fontSize: '1.6rem' }}>{project.progress}<span className="text-base">%</span></div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '目标被试数', value: project.participantTarget, unit: '人' },
          { label: '已确认被试', value: confirmed, unit: '人' },
          { label: '已采集数据', value: done, unit: '份' },
          { label: '截止日期', value: project.deadline || '—', unit: '' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <div className="text-slate-500 text-xs mb-1">{s.label}</div>
            <div className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.4rem' }}>
              {s.value}<span className="text-sm text-slate-400 ml-1">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'progress' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-slate-800 mb-5 text-sm" style={{ fontWeight: 700 }}>实验执行步骤</h2>
          <div className="space-y-3">
            {RUN_STEPS.map((step, i) => {
              const stepIndex = RUN_STEPS.findIndex(s => s.key === project.currentStep);
              const isDone = i < stepIndex;
              const isCurrent = step.key === project.currentStep;
              const isPending = i > stepIndex;
              return (
                <div key={step.key}
                  onClick={() => !isPending && goToStep(step.key)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCurrent ? 'border-indigo-400 bg-indigo-50 cursor-pointer hover:bg-indigo-100' : isDone ? 'border-green-200 bg-green-50 cursor-pointer hover:bg-green-100' : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${isCurrent ? 'bg-indigo-600 text-white' : isDone ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                    style={{ fontWeight: 700 }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm ${isCurrent ? 'text-indigo-800' : isDone ? 'text-green-800' : 'text-slate-500'}`} style={{ fontWeight: 600 }}>
                      H3-{i + 1} {step.label}
                    </div>
                    {isCurrent && <div className="text-xs text-indigo-500 mt-0.5">当前步骤 · 点击进入</div>}
                    {isDone && <div className="text-xs text-green-600 mt-0.5">已完成</div>}
                  </div>
                  {(isCurrent || isDone) && (
                    <span className={`text-xs px-2.5 py-1 rounded-full ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-green-100 text-green-700'}`}>
                      {isCurrent ? '进入 →' : '已完成'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {project.status === 'completed' ? (
            <div>
              <h2 className="text-slate-800 mb-4 text-sm" style={{ fontWeight: 700 }}>研究报告 · {project.name}</h2>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-4">
                <div className="text-indigo-700 text-xs mb-2" style={{ fontWeight: 600 }}>✅ 最新结论摘要</div>
                <p className="text-indigo-600 text-sm leading-relaxed">
                  本研究共采集 {project.participants.length} 名有效被试数据。研究结论显示当前样机方案在用户群体中取得良好反馈，主要指标均达成研究预期目标。建议设计团队参考数据推进下一阶段工作。
                </p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors">下载完整报告 PDF</button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText size={40} className="mx-auto mb-3 text-slate-300" />
              <p>研究报告将在实验完成并通过分析后自动生成</p>
              <p className="text-sm mt-1">当前进度：{project.progress}%</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-slate-800 text-sm" style={{ fontWeight: 700 }}>被试完整记录 ({project.participants.length}人)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['编号','手长(mm)','手宽(mm)','虎口(mm)','握持习惯','年龄段','邀请状态','数据状态'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {project.participants.slice(0, 20).map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-700" style={{ fontWeight: 500 }}>{p.code}</td>
                    <td className="px-4 py-3 text-slate-600">{p.handLength}</td>
                    <td className="px-4 py-3 text-slate-600">{p.handWidth}</td>
                    <td className="px-4 py-3 text-slate-600">{p.thumbSpan}</td>
                    <td className="px-4 py-3 text-slate-600">{p.gripHabit === 'onehand' ? '单手为主' : '双手为主'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.ageGroup}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.invitationStatus === 'confirmed' ? 'bg-green-100 text-green-700' : p.invitationStatus === 'sent' ? 'bg-blue-100 text-blue-700' : p.invitationStatus === 'declined' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {p.invitationStatus === 'confirmed' ? '已确认' : p.invitationStatus === 'sent' ? '已发送' : p.invitationStatus === 'declined' ? '已拒绝' : '未回复'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.recordingStatus === 'done' ? 'bg-green-100 text-green-700' : p.recordingStatus === 'recording' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.recordingStatus === 'done' ? '已完成' : p.recordingStatus === 'recording' ? '进行中' : '待开始'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rawdata' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-slate-800 mb-4 text-sm" style={{ fontWeight: 700 }}>原始数据</h2>
          <div className="space-y-3">
            {['量表回答数据 (CSV)', '录像文件列表', '录音文件列表', '手型测量原始记录'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
                <button className="text-xs text-indigo-600 hover:underline">下载</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

