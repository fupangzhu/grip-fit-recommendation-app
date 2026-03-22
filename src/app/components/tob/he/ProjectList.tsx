import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Filter, ArrowRight, Clock } from 'lucide-react';
import { useAppStore, STATUS_COLORS, STATUS_LABELS, RESEARCH_TYPE_LABELS, RESEARCH_TYPE_ICONS, ExperimentStatus, ResearchType, RUN_STEPS } from '../ToBStore';

const STATUS_FILTER: { key: ExperimentStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'draft', label: '规划中' },
  { key: 'recruiting', label: '招募被试' },
  { key: 'running', label: '实验进行中' },
  { key: 'analyzing', label: '数据分析中' },
  { key: 'completed', label: '已完成' },
  { key: 'archived', label: '已归档' },
];

export function HEProjectList() {
  const { state } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExperimentStatus | 'all'>('all');

  const filtered = state.heProjects.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch = !search || p.name.includes(search) || p.researchTypes.some(rt => RESEARCH_TYPE_LABELS[rt].includes(search));
    return matchStatus && matchSearch;
  });

  const stepLabel = (s: string) => RUN_STEPS.find(r => r.key === s)?.label ?? s;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>我的项目</h1>
          <p className="text-slate-400 text-sm mt-0.5">共 {state.heProjects.length} 个项目</p>
        </div>
        <button onClick={() => navigate('/tob/he/projects/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
          <Plus size={16} /> 新建项目
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索项目名称、研究类型…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTER.map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${statusFilter === f.key ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
              style={{ fontWeight: 500 }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(project => {
          const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed').length;
          return (
            <div key={project.id}
              onClick={() => navigate(`/tob/he/projects/${project.id}`)}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-slate-900 text-base" style={{ fontWeight: 600 }}>{project.name}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status]}`} style={{ fontWeight: 500 }}>{STATUS_LABELS[project.status]}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.researchTypes.map(rt => (
                      <span key={rt} className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100">
                        {RESEARCH_TYPE_ICONS[rt]} {RESEARCH_TYPE_LABELS[rt]}
                      </span>
                    ))}
                  </div>
                  {project.description && (
                    <p className="text-slate-500 text-sm mb-3 line-clamp-1">{project.description}</p>
                  )}
                  <div className="flex items-center gap-5 text-xs text-slate-400">
                    <span>当前步骤：<span className="text-indigo-600" style={{ fontWeight: 500 }}>{stepLabel(project.currentStep)}</span></span>
                    <span>👥 {confirmed}/{project.participantTarget} 人确认</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> 更新于 {project.updatedAt}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right min-w-28">
                  <div className="mb-2">
                    <div className="text-xs text-slate-400 mb-1">实验进度</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-700" style={{ fontWeight: 600 }}>{project.progress}%</span>
                    </div>
                  </div>
                  {project.deadline && (
                    <div className="text-xs text-slate-400">截止 {project.deadline}</div>
                  )}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-indigo-600 text-xs flex items-center justify-end gap-1" style={{ fontWeight: 500 }}>
                      查看详情 <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Filter size={32} className="mx-auto mb-3 text-slate-300" />
            <p>没有找到匹配的项目</p>
          </div>
        )}
      </div>
    </div>
  );
}

