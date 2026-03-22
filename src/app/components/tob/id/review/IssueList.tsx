import { useParams, useNavigate, NavLink } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { IDIssueSeverity } from '../../ToBStore';
import { AlertTriangle, CheckCircle, Info, ChevronRight } from 'lucide-react';

const REVIEW_TABS = [
  { key: 'overview', label: '概览' },
  { key: 'heatmap/front', label: '热力图（正面）' },
  { key: 'heatmap/side', label: '热力图（侧面）' },
  { key: 'issues', label: '问题清单' },
];

const SEVERITY_CONFIG: Record<IDIssueSeverity, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  high: { label: '高风险', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle },
  medium: { label: '中风险', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Info },
  ok: { label: '通过', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', icon: CheckCircle },
};

export function ReviewIssueList() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppStore();
  const navigate = useNavigate();
  const review = state.idReviews.find(r => r.id === id);

  if (!review) return (
    <div className="p-8 text-center text-slate-500">
      <p>未找到评审记录</p>
      <button onClick={() => navigate('/tob/id/dashboard')} className="mt-4 text-teal-600 hover:underline text-sm">返回工作台</button>
    </div>
  );

  const grouped = {
    high: review.issues.filter(i => i.severity === 'high'),
    medium: review.issues.filter(i => i.severity === 'medium'),
    ok: review.issues.filter(i => i.severity === 'ok'),
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-slate-400 mb-1">{review.fileName} · {review.uploadedAt}</div>
          <h1 className="text-lg font-semibold text-slate-800">{review.name}</h1>
        </div>
        <button onClick={() => navigate(`/tob/id/review/${id}/export`)}
          className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          导出报告
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-100">
        {REVIEW_TABS.map(t => (
          <NavLink key={t.key} to={`/tob/id/review/${id}/${t.key}`}
            className={({ isActive }) => `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </NavLink>
        ))}
      </div>

      <div className="space-y-6">
        {(['high', 'medium', 'ok'] as IDIssueSeverity[]).map(sev => {
          const issues = grouped[sev];
          if (issues.length === 0) return null;
          const cfg = SEVERITY_CONFIG[sev];
          const Icon = cfg.icon;
          return (
            <div key={sev}>
              <div className={`flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg inline-flex ${cfg.bg}`}>
                <Icon size={14} className={cfg.color} />
                <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label} · {issues.length} 项</span>
              </div>
              <div className="space-y-2">
                {issues.map(issue => (
                  <button key={issue.id} onClick={() => navigate(`/tob/id/review/${id}/issues/${issue.id}`)}
                    className={`w-full text-left flex items-start justify-between gap-4 p-4 bg-white border rounded-xl hover:border-teal-300 transition-colors ${cfg.border}`}>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800 mb-1">{issue.area}</div>
                      <div className="text-xs text-slate-500 line-clamp-2">{issue.description}</div>
                      <div className="flex gap-1 mt-2">
                        {issue.affectedPopulations.map(p => (
                          <span key={p} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{p}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

