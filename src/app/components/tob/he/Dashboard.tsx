import { useNavigate } from 'react-router';
import { Plus, TrendingUp, Clock, CheckCircle, Users, AlertCircle, CalendarDays, ArrowRight } from 'lucide-react';
import { useAppStore, STATUS_COLORS, STATUS_LABELS, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ExperimentStatus, HEProject } from '../ToBStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const qualityData = [
  { month: '10月', planned: 20, actual: 18, returnRate: 92, validity: 88 },
  { month: '11月', planned: 25, actual: 22, returnRate: 88, validity: 85 },
  { month: '12月', planned: 18, actual: 17, returnRate: 94, validity: 91 },
  { month: '1月', planned: 22, actual: 20, returnRate: 90, validity: 87 },
  { month: '2月', planned: 20, actual: 19, returnRate: 95, validity: 93 },
  { month: '3月', planned: 28, actual: 21, returnRate: 89, validity: 86 },
];

const timeline = [
  { date: '明天', label: '旗舰机握持研究', note: '被试确认截止 (已确认5/20)', urgent: true },
  { date: '后天', label: 'Fold Z4 热控研究', note: '实验室A 预约时间 14:00', urgent: false },
  { date: '3月25日', label: 'Nova Flip 触控研究', note: '环境搭建核查', urgent: false },
  { date: '4月1日', label: 'Fold Z4 热控研究', note: '数据采集截止', urgent: false },
  { date: '4月10日', label: 'Nova Flip 触控研究', note: '被试确认截止', urgent: false },
];

const KANBAN_COLS: { key: ExperimentStatus; label: string; color: string }[] = [
  { key: 'draft',     label: '规划中',    color: 'bg-slate-400' },
  { key: 'recruiting',label: '招募被试',  color: 'bg-blue-500' },
  { key: 'running',   label: '实验进行中', color: 'bg-indigo-500' },
  { key: 'analyzing', label: '数据分析中', color: 'bg-violet-500' },
];

function ProjectCard({ project, onClick }: { project: HEProject; onClick: () => void }) {
  const stepLabels: Record<string, string> = {
    participants: 'H3-1 被试筛选', lab: 'H3-2 实验室安排', setup: 'H3-3 环境搭建',
    questionnaire: 'H3-4 量表配置', collect: 'H3-5 数据采集', analysis: 'H3-6 分析结论',
  };
  const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed').length;
  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-slate-100 p-4 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="text-slate-800 text-sm mb-1 truncate" style={{ fontWeight: 600 }}>{project.name}</div>
          <div className="flex flex-wrap gap-1">
            {project.researchTypes.map(rt => (
              <span key={rt} className="text-xs bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md">
                {RESEARCH_TYPE_ICONS[rt]}{RESEARCH_TYPE_LABELS[rt]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-xs text-indigo-600 mb-2.5">{stepLabels[project.currentStep]}</div>
      <div className="mb-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>进度</span><span>{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>👥 {confirmed}/{project.participantTarget}</span>
        {project.deadline && <span className={`${new Date(project.deadline) <= new Date('2026-04-05') ? 'text-red-500' : ''}`}>⏰ {project.deadline}</span>}
      </div>
    </div>
  );
}

export function HEDashboard() {
  const { state } = useAppStore();
  const navigate = useNavigate();
  const { heProjects } = state;

  const activeCount = heProjects.filter(p => p.status === 'running' || p.status === 'recruiting').length;
  const completedCount = heProjects.filter(p => p.status === 'completed').length;
  const totalParticipants = heProjects.reduce((s, p) => s + p.participants.filter(pp => pp.invitationStatus === 'confirmed').length, 0);
  const pendingTasks = heProjects.filter(p => p.status !== 'completed' && p.status !== 'archived').length;

  const statCards = [
    { label: '本月进行中实验', value: activeCount, change: '+1', up: true, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
    { label: '待处理任务', value: pendingTasks, change: '需关注', up: false, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
    { label: '本月已完成实验', value: completedCount, change: `完成率 ${Math.round((completedCount/(heProjects.length||1))*100)}%`, up: true, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: '总被试参与人次', value: totalParticipants, change: '累计', up: true, icon: Users, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>工作看板</h1>
          <p className="text-slate-400 text-sm mt-0.5">2026年3月 · 张研究员的工作台</p>
        </div>
        <button onClick={() => navigate('/tob/he/projects/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
          <Plus size={16} /> 新建项目
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon size={18} />
              </div>
            </div>
            <div className="text-slate-900 mb-1" style={{ fontWeight: 700, fontSize: '1.8rem' }}>{c.value}</div>
            <div className="text-slate-500 text-sm">{c.label}</div>
            <div className={`text-xs mt-1 ${c.up ? 'text-green-600' : 'text-amber-600'}`}>{c.change}</div>
          </div>
        ))}
      </div>

      {/* Kanban + Timeline */}
      <div className="grid grid-cols-4 gap-5">
        {/* Kanban board — 3 cols */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>项目进度看板</h2>
            <button onClick={() => navigate('/tob/he/projects')} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              查看全部 <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {KANBAN_COLS.map(col => {
              const projects = heProjects.filter(p => p.status === col.key);
              return (
                <div key={col.key} className="bg-slate-100/60 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="text-slate-600 text-xs" style={{ fontWeight: 600 }}>{col.label}</span>
                    <span className="ml-auto text-xs bg-white text-slate-500 px-1.5 py-0.5 rounded-full">{projects.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {projects.map(p => (
                      <ProjectCard key={p.id} project={p} onClick={() => navigate(`/tob/he/projects/${p.id}`)} />
                    ))}
                    {projects.length === 0 && (
                      <div className="text-xs text-slate-400 text-center py-4">暂无项目</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="col-span-1">
          <h2 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>近期任务时间线</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0 group">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${item.urgent ? 'bg-red-500' : 'bg-indigo-300'}`} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/tob/he/projects')}>
                  <div className={`text-xs mb-0.5 ${item.urgent ? 'text-red-600' : 'text-slate-400'}`} style={{ fontWeight: 600 }}>{item.date}</div>
                  <div className="text-slate-700 text-xs truncate" style={{ fontWeight: 500 }}>{item.label}</div>
                  <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>实验完成质量指标</h2>
            <p className="text-slate-400 text-xs mt-0.5">近6个月计划被试数 vs 实际参与数 / 量表回收率 / 数据有效率</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={qualityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis key="xaxis" dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis key="yaxis" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip key="tooltip" contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend key="legend" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <Line key="line-planned" type="monotone" dataKey="planned" name="计划被试数" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line key="line-actual" type="monotone" dataKey="actual" name="实际参与数" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
            <Line key="line-returnRate" type="monotone" dataKey="returnRate" name="量表回收率%" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            <Line key="line-validity" type="monotone" dataKey="validity" name="数据有效率%" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
