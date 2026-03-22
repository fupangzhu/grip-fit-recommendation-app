import { useParams, NavLink, useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { FORM_FACTOR_LABELS } from '../../ToBStore';

const VIEWS = [
  { key: 'front', label: '正视图' },
  { key: 'side', label: '侧视图' },
  { key: 'top', label: '顶视图' },
  { key: 'iso', label: '等轴图' },
];

export function ModelFront() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppStore();
  const navigate = useNavigate();
  const model = state.idModels.find(m => m.id === id);

  if (!model) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>未找到底模</p>
        <button onClick={() => navigate('/tob/id/dashboard')} className="mt-4 text-teal-600 hover:underline text-sm">返回工作台</button>
      </div>
    );
  }

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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-slate-100 rounded-xl p-6 flex items-center justify-center min-h-96">
          <div className="relative">
            {/* SVG phone front view */}
            <svg width="180" height={Math.round(180 * d.height / d.width)} viewBox={`0 0 ${d.width} ${d.height}`}
              className="drop-shadow-lg">
              <rect x="0" y="0" width={d.width} height={d.height} rx={d.cornerRadius} ry={d.cornerRadius}
                fill="#1e293b" />
              <rect x={d.width * 0.04} y={d.height * 0.04} width={d.width * 0.92} height={d.height * 0.92}
                rx={d.cornerRadius * 0.6} ry={d.cornerRadius * 0.6} fill="#334155" />
              <rect x={d.width * 0.3} y={d.height * 0.015} width={d.width * 0.4} height={d.height * 0.015}
                rx="2" fill="#475569" />
            </svg>
            {/* P5 reach overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-rose-400/60 rounded"
              style={{ top: '0', height: '25%' }}
              title="P5 单手可达边界" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">尺寸参数</div>
            <div className="space-y-2">
              {[['宽度', `${d.width} mm`], ['高度', `${d.height} mm`], ['厚度', `${d.thickness} mm`], ['圆角', `${d.cornerRadius} mm`]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">握持覆盖率</div>
            <div className="space-y-2">
              {[['P5', model.coverageP5], ['P50', model.coverageP50], ['P95', model.coverageP95]].map(([p, v]) => (
                <div key={p}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">{p}</span>
                    <span className={`font-medium ${(v as number) >= 85 ? 'text-teal-600' : (v as number) >= 70 ? 'text-amber-600' : 'text-slate-400'}`}>{(v as number) > 0 ? `${v}%` : '—'}</span>
                  </div>
                  {(v as number) > 0 && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${(v as number) >= 85 ? 'bg-teal-500' : 'bg-amber-400'}`}
                        style={{ width: `${v}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

