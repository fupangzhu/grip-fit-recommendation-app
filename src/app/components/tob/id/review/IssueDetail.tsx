import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { IDIssueSeverity } from '../../ToBStore';
import { AlertTriangle, CheckCircle, Info, ArrowLeft, Lightbulb } from 'lucide-react';

const SEVERITY_CONFIG: Record<IDIssueSeverity, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  high: { label: '高风险', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle },
  medium: { label: '中风险', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Info },
  ok: { label: '通过', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', icon: CheckCircle },
};

export function ReviewIssueDetail() {
  const { id, issueId } = useParams<{ id: string; issueId: string }>();
  const { state } = useAppStore();
  const navigate = useNavigate();
  const review = state.idReviews.find(r => r.id === id);
  const issue = review?.issues.find(i => i.id === issueId);

  if (!review || !issue) return (
    <div className="p-8 text-center text-slate-500">
      <p>未找到问题记录</p>
      <button onClick={() => navigate('/tob/id/dashboard')} className="mt-4 text-teal-600 hover:underline text-sm">返回工作台</button>
    </div>
  );

  const cfg = SEVERITY_CONFIG[issue.severity];
  const Icon = cfg.icon;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate(`/tob/id/review/${id}/issues`)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} />返回问题清单
      </button>

      <div className={`flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg inline-flex ${cfg.bg}`}>
        <Icon size={14} className={cfg.color} />
        <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
      </div>

      <h1 className="text-xl font-semibold text-slate-800 mb-2">{issue.area}</h1>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">{issue.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="text-xs text-slate-500 mb-1">当前值</div>
          <div className="text-base font-semibold text-slate-800">{issue.currentValue}</div>
        </div>
        <div className={`border rounded-xl p-4 ${cfg.bg} ${cfg.border}`}>
          <div className={`text-xs mb-1 ${cfg.color}`}>推荐范围</div>
          <div className={`text-base font-semibold ${cfg.color}`}>{issue.recommendedRange}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-medium text-slate-700 mb-2">影响人群</div>
        <div className="flex gap-2">
          {issue.affectedPopulations.map(p => (
            <span key={p} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-lg">{p}</span>
          ))}
        </div>
      </div>

      {issue.recommendations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-700">优化建议</span>
          </div>
          <ul className="space-y-2">
            {issue.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {review.issues.indexOf(issue) > 0 && (
          <button onClick={() => {
            const prev = review.issues[review.issues.indexOf(issue) - 1];
            navigate(`/tob/id/review/${id}/issues/${prev.id}`);
          }} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            上一条
          </button>
        )}
        {review.issues.indexOf(issue) < review.issues.length - 1 && (
          <button onClick={() => {
            const next = review.issues[review.issues.indexOf(issue) + 1];
            navigate(`/tob/id/review/${id}/issues/${next.id}`);
          }} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            下一条
          </button>
        )}
      </div>
    </div>
  );
}

