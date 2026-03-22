import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { ArrowLeft } from 'lucide-react';

const VARIANT_META: Record<string, { label: string; deltaW: number; deltaH: number; deltaT: number; coverDelta: [number, number, number] }> = {
  narrow:  { label: '窄版方案',  deltaW: -2,   deltaH: 0,   deltaT: 0,    coverDelta: [6.5, 1.2, -0.8] },
  compact: { label: '紧凑方案', deltaW: 0,   deltaH: -5,  deltaT: 0,    coverDelta: [4.2, 0.5, -0.3] },
  slim:    { label: '超薄方案',  deltaW: 0,   deltaH: 0,   deltaT: -0.5, coverDelta: [1.0, 0.8, 0.5] },
  wide:    { label: '宽屏方案',  deltaW: 3,   deltaH: 0,   deltaT: 0,    coverDelta: [-3.1, 1.0, 2.8] },
};

export function ExploreVariant() {
  const { id, variant } = useParams<{ id: string; variant: string }>();
  const { state } = useAppStore();
  const navigate = useNavigate();
  const model = state.idModels.find(m => m.id === id);
  const meta = VARIANT_META[variant ?? ''];

  if (!model || !meta) return <div className="p-8 text-center text-slate-500">未找到变体</div>;

  const d = model.dimensions;
  const newW = d.width + meta.deltaW;
  const newH = d.height + meta.deltaH;
  const newT = d.thickness + meta.deltaT;
  const [d5, d50, d95] = meta.coverDelta;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={() => navigate(`/tob/id/model/${id}/explore`)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} />返回变体列表
      </button>

      <h1 className="text-xl font-semibold text-slate-800 mb-1">{meta.label}</h1>
      <p className="text-sm text-slate-500 mb-6">基于《{model.name}》</p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">尺寸对比</div>
          <div className="space-y-2 text-sm">
            {[['宽度', d.width, newW, 'mm'], ['高度', d.height, newH, 'mm'], ['厚度', d.thickness, newT, 'mm']].map(([k, orig, nv, unit]) => (
              <div key={k as string} className="flex justify-between items-center">
                <span className="text-slate-500">{k}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through text-xs">{(orig as number).toFixed(1)}</span>
                  <span className="font-semibold text-teal-700">{(nv as number).toFixed(1)} {unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">覆盖率变化</div>
          <div className="space-y-2">
            {([['P5', model.coverageP5, d5], ['P50', model.coverageP50, d50], ['P95', model.coverageP95, d95]] as [string, number, number][]).map(([p, orig, delta]) => (
              <div key={p} className="flex justify-between text-sm items-center">
                <span className="text-slate-500">{p}</span>
                <div className="flex items-center gap-2">
                  {orig > 0 && <span className="text-slate-400 text-xs">{orig}%</span>}
                  <span className={`font-semibold ${delta > 0 ? 'text-teal-600' : delta < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {delta > 0 ? '+' : ''}{delta}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(`/tob/id/model/${id}/explore`)}
          className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
          返回对比其他变体
        </button>
        <button className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          以此变体创建新底模
        </button>
      </div>
    </div>
  );
}

