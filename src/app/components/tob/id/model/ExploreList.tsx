import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { ArrowLeft } from 'lucide-react';
import { FORM_FACTOR_LABELS } from '../../ToBStore';

const VARIANTS = [
  { key: 'narrow', label: '窄版方案', desc: '宽度 -2mm，适合 P5 小手群体', deltaW: -2, deltaH: 0, deltaT: 0 },
  { key: 'compact', label: '紧凑方案', desc: '高度 -5mm，单手可达性提升', deltaW: 0, deltaH: -5, deltaT: 0 },
  { key: 'slim', label: '超薄方案', desc: '厚度 -0.5mm，握感更轻薄', deltaW: 0, deltaH: 0, deltaT: -0.5 },
  { key: 'wide', label: '宽屏方案', desc: '宽度 +3mm，适合 P95 大手群体', deltaW: 3, deltaH: 0, deltaT: 0 },
];

export function ExploreList() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppStore();
  const navigate = useNavigate();
  const model = state.idModels.find(m => m.id === id);

  if (!model) return <div className="p-8 text-center text-slate-500">未找到底模</div>;

  return (
    <div className="p-8">
      <button onClick={() => navigate(`/tob/id/model/${id}/front`)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} />返回底模视图
      </button>

      <h1 className="text-xl font-semibold text-slate-800 mb-1">探索变体方案</h1>
      <p className="text-sm text-slate-500 mb-6">基于《{model.name}》生成的尺寸变体，对比各方案握持覆盖率变化。</p>

      <div className="grid grid-cols-2 gap-4">
        {VARIANTS.map(v => {
          const d = model.dimensions;
          return (
            <button key={v.key} onClick={() => navigate(`/tob/id/model/${id}/explore/${v.key}`)}
              className="text-left p-5 bg-white border border-slate-100 rounded-xl hover:border-teal-300 hover:shadow-sm transition-all group">
              <div className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-teal-700">{v.label}</div>
              <div className="text-xs text-slate-500 mb-3">{v.desc}</div>
              <div className="flex gap-4 text-xs">
                <span className="text-slate-400">宽 <span className="font-medium text-slate-700">{(d.width + v.deltaW).toFixed(1)} mm</span></span>
                <span className="text-slate-400">高 <span className="font-medium text-slate-700">{(d.height + v.deltaH).toFixed(1)} mm</span></span>
                <span className="text-slate-400">厚 <span className="font-medium text-slate-700">{(d.thickness + v.deltaT).toFixed(1)} mm</span></span>
              </div>
              <div className="text-xs text-slate-400 mt-2">{FORM_FACTOR_LABELS[d.formFactor]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

