import { useParams, useNavigate, NavLink } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { IDIssueSeverity } from '../../ToBStore';

const REVIEW_TABS = [
  { key: 'overview', label: '概览' },
  { key: 'heatmap/front', label: '热力图（正面）' },
  { key: 'heatmap/side', label: '热力图（侧面）' },
  { key: 'issues', label: '问题清单' },
];

const SEVERITY_COLORS: Record<IDIssueSeverity, string> = {
  high: 'rgba(239,68,68,0.35)',
  medium: 'rgba(245,158,11,0.3)',
  ok: 'rgba(20,184,166,0.2)',
};

const SEVERITY_BORDER: Record<IDIssueSeverity, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  ok: '#14b8a6',
};

export function ReviewHeatmapSide() {
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

  const sideIssues = review.issues.filter(i => i.zone.view === 'side');

  // Side view: width = thickness, height = height
  const SVG_W = 60;
  const SVG_H = Math.round(SVG_W * review.extractedHeight / review.extractedThickness);

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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-slate-100 rounded-xl p-8 flex items-center justify-center">
          <div className="relative inline-block">
            <svg width={SVG_W * 2} height={Math.min(SVG_H * 2, 500)} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="drop-shadow-lg">
              <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="4" ry="4" fill="#1e293b" />
              {sideIssues.map(issue => (
                <rect
                  key={issue.id}
                  x={issue.zone.x * SVG_W}
                  y={issue.zone.y * SVG_H}
                  width={issue.zone.w * SVG_W}
                  height={issue.zone.h * SVG_H}
                  fill={SEVERITY_COLORS[issue.severity]}
                  stroke={SEVERITY_BORDER[issue.severity]}
                  strokeWidth="0.8"
                  rx="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tob/id/review/${id}/issues/${issue.id}`)}
                />
              ))}
            </svg>
          </div>
          {sideIssues.length === 0 && (
            <p className="ml-8 text-sm text-slate-400">侧视图无高亮问题区域</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">图例</div>
          {([['high', '高风险区域', SEVERITY_BORDER.high], ['medium', '中风险区域', SEVERITY_BORDER.medium], ['ok', '通过区域', SEVERITY_BORDER.ok]] as const).map(([s, label, color]) => (
            <div key={s} className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-4 h-4 rounded border-2 flex-shrink-0" style={{ borderColor: color, background: SEVERITY_COLORS[s] }} />
              {label}
            </div>
          ))}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400">
            点击区域查看详细问题
          </div>
          {sideIssues.map(issue => (
            <button key={issue.id}
              onClick={() => navigate(`/tob/id/review/${id}/issues/${issue.id}`)}
              className="w-full text-left text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SEVERITY_BORDER[issue.severity] }} />
                <span className="text-slate-700 font-medium">{issue.area}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

