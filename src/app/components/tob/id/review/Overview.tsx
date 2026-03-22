import { useParams, useNavigate, NavLink } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const REVIEW_TABS = [
  { key: 'overview', label: '概览' },
  { key: 'heatmap/front', label: '热力图（正面）' },
  { key: 'heatmap/side', label: '热力图（侧面）' },
  { key: 'issues', label: '问题清单' },
];

const SEVERITY_CONFIG = {
  high: { label: '高风险', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', icon: AlertTriangle },
  medium: { label: '中风险', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Info },
  ok: { label: '通过', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200', icon: CheckCircle },
};

export function ReviewOverview() {
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

  const highCount = review.issues.filter(i => i.severity === 'high').length;
  const medCount = review.issues.filter(i => i.severity === 'medium').length;
  const okCount = review.issues.filter(i => i.severity === 'ok').length;

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

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">提取宽度</div>
          <div className="text-2xl font-bold text-slate-800">{review.extractedWidth} <span className="text-sm font-normal text-slate-500">mm</span></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">提取高度</div>
          <div className="text-2xl font-bold text-slate-800">{review.extractedHeight} <span className="text-sm font-normal text-slate-500">mm</span></div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">提取厚度</div>
          <div className="text-2xl font-bold text-slate-800">{review.extractedThickness} <span className="text-sm font-normal text-slate-500">mm</span></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {([['high', highCount], ['medium', medCount], ['ok', okCount]] as const).map(([sev, count]) => {
          const cfg = SEVERITY_CONFIG[sev];
          const Icon = cfg.icon;
          return (
            <div key={sev} className={`border rounded-xl p-4 ${cfg.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={cfg.color} />
                <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className={`text-2xl font-bold ${cfg.color}`}>{count}</div>
              <div className="text-xs text-slate-500 mt-0.5">项问题</div>
            </div>
          );
        })}
      </div>

      {review.issues.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-slate-700">主要问题预览</div>
            <button onClick={() => navigate(`/tob/id/review/${id}/issues`)}
              className="text-xs text-teal-600 hover:text-teal-700">查看全部 →</button>
          </div>
          <div className="space-y-3">
            {review.issues.slice(0, 3).map(issue => {
              const cfg = SEVERITY_CONFIG[issue.severity];
              const Icon = cfg.icon;
              return (
                <button key={issue.id} onClick={() => navigate(`/tob/id/review/${id}/issues/${issue.id}`)}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <Icon size={14} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                  <div>
                    <div className="text-sm font-medium text-slate-700">{issue.area}</div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{issue.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

