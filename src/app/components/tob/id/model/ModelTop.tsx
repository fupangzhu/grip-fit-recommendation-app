import { useParams, NavLink, useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { FORM_FACTOR_LABELS } from '../../ToBStore';

const VIEWS = [
  { key: 'front', label: '正视图' },
  { key: 'side', label: '侧视图' },
  { key: 'top', label: '顶视图' },
  { key: 'iso', label: '等轴图' },
];

export function ModelTop() {
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
        <svg width="280" height={Math.round(280 * d.thickness / d.width)} viewBox={`0 0 ${d.width} ${d.thickness}`}
          className="drop-shadow-lg">
          <rect x="0" y="0" width={d.width} height={d.thickness}
            rx={d.cornerRadius * 0.3} ry={d.cornerRadius * 0.3} fill="#1e293b" />
        </svg>
        <div className="ml-8 text-sm text-slate-500">
          <p>宽度：<span className="font-semibold text-slate-800">{d.width} mm</span></p>
          <p className="mt-1">厚度：<span className="font-semibold text-slate-800">{d.thickness} mm</span></p>
        </div>
      </div>
    </div>
  );
}

