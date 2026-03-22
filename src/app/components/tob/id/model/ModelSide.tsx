import { useParams, NavLink, useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { FORM_FACTOR_LABELS } from '../../ToBStore';

const VIEWS = [
  { key: 'front', label: '正视图' },
  { key: 'side', label: '侧视图' },
  { key: 'top', label: '顶视图' },
  { key: 'iso', label: '等轴图' },
];

export function ModelSide() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppStore();
  const navigate = useNavigate();
  const model = state.idModels.find(m => m.id === id);

  if (!model) return <div className="p-8 text-center text-slate-500">未找到底模</div>;

  const d = model.dimensions;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-slate-400 mb-1">{FORM_FACTOR_LABELS[d.formFactor]} · {model.createdAt}</div>
          <h1 className="text-lg font-semibold text-slate-800">{model.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/tob/id/model/${id}/explore`)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            探索变体
          </button>
          <button onClick={() => navigate(`/tob/id/model/${id}/export`)}
            className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            导出报告
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-100">
        {VIEWS.map(v => (
          <NavLink key={v.key} to={`/tob/id/model/${id}/${v.key}`}
            className={({ isActive }) => `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {v.label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center justify-center bg-white border border-slate-100 rounded-xl p-12 min-h-96">
        <svg width={Math.round(80 * d.thickness / 10)} height="320" viewBox={`0 0 ${d.thickness * 8} ${d.height * 1.6}`}
          className="drop-shadow-lg">
          <rect x="0" y="0" width={d.thickness * 8} height={d.height * 1.6}
            rx={d.cornerRadius * 0.5} ry={d.cornerRadius * 0.5} fill="#1e293b" />
        </svg>
        <div className="ml-8 text-sm text-slate-500">
          <p>厚度：<span className="font-semibold text-slate-800">{d.thickness} mm</span></p>
          <p className="mt-1">高度：<span className="font-semibold text-slate-800">{d.height} mm</span></p>
        </div>
      </div>
    </div>
  );
}

