import { useState } from 'react';
import { Positioning, GripStyle, FormFactor, calcParameters, POSITIONING_LABELS, GRIP_STYLE_LABELS, FORM_FACTOR_LABELS, POSITIONING_COLORS } from '../ToBStore';
import { Save, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';

function normalCDF(x: number, mean: number, std: number): number {
  const z = (x - mean) / std;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  let p = 1 - phi * poly;
  if (z < 0) p = 1 - p;
  return Math.min(99, Math.max(1, p * 100));
}

function genCurve(mean: number) {
  const data = [];
  for (let w = mean - 6; w <= mean + 6; w += 0.5)
    data.push({ width: parseFloat(w.toFixed(1)), coverage: parseFloat(normalCDF(w, mean, 2.8).toFixed(1)) });
  return data;
}

const HAND_DATA: Record<Positioning, { size: string; pct: number }[]> = {
  entry:    [{ size:'XS',pct:12 },{ size:'S',pct:21 },{ size:'M',pct:38 },{ size:'L',pct:19 },{ size:'XL',pct:10 }],
  mid:      [{ size:'XS',pct:8  },{ size:'S',pct:22 },{ size:'M',pct:42 },{ size:'L',pct:20 },{ size:'XL',pct:8  }],
  flagship: [{ size:'XS',pct:5  },{ size:'S',pct:18 },{ size:'M',pct:40 },{ size:'L',pct:27 },{ size:'XL',pct:10 }],
  ultra:    [{ size:'XS',pct:3  },{ size:'S',pct:14 },{ size:'M',pct:38 },{ size:'L',pct:30 },{ size:'XL',pct:15 }],
};
const COLORS = ['#818cf8','#6366f1','#4f46e5','#4338ca','#3730a3'];

export function IDParams() {
  const [positioning, setPositioning] = useState<Positioning>('flagship');
  const [formFactor, setFormFactor] = useState<FormFactor>('bar');
  const [gripStyle, setGripStyle] = useState<GripStyle>('onehand');
  const [saved, setSaved] = useState(false);

  const params = calcParameters(positioning, formFactor, gripStyle);
  const curveData = genCurve(params.width.recommended);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>D1 参数参考工具</h1>
          <p className="text-slate-400 text-sm mt-0.5">基于人因数据库，交互探索物理参数与人群覆盖率的关系</p>
        </div>
        <button onClick={() => setSaved(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${saved ? 'bg-teal-100 text-teal-700' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
          style={{ fontWeight: 500 }}>
          <Save size={15} />{saved ? '已保存方案' : '保存为设计参数方案'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>参数配置</h3>
        <div className="grid grid-cols-3 gap-5">
          <div>
            <label className="text-xs text-slate-500 mb-2 block" style={{ fontWeight: 500 }}>产品定位</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['entry','mid','flagship','ultra'] as Positioning[]).map(p => (
                <button key={p} onClick={() => setPositioning(p)}
                  className={`py-2 px-3 rounded-lg text-xs transition-all ${positioning === p ? `${POSITIONING_COLORS[p]} border border-current` : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  style={{ fontWeight: positioning === p ? 600 : 400 }}>{POSITIONING_LABELS[p]}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block" style={{ fontWeight: 500 }}>手机形态</label>
            <div className="flex flex-col gap-1.5">
              {(['bar','flip','fold'] as FormFactor[]).map(f => (
                <button key={f} onClick={() => setFormFactor(f)}
                  className={`py-2 px-3 rounded-lg text-xs transition-all text-left ${formFactor === f ? 'bg-teal-100 text-teal-700 border border-teal-300' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  style={{ fontWeight: formFactor === f ? 600 : 400 }}>{FORM_FACTOR_LABELS[f]}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block" style={{ fontWeight: 500 }}>握持风格</label>
            <div className="flex flex-col gap-1.5">
              {(['onehand','twohand','mixed'] as GripStyle[]).map(g => (
                <button key={g} onClick={() => setGripStyle(g)}
                  className={`py-2 px-3 rounded-lg text-xs transition-all text-left ${gripStyle === g ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  style={{ fontWeight: gripStyle === g ? 600 : 400 }}>{GRIP_STYLE_LABELS[g]}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Coverage curve */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>宽度 × 人群覆盖率曲线</h3>
          <p className="text-xs text-slate-400 mb-4">X轴为机身宽度(mm)，Y轴为能舒适握持的用户比例</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={curveData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="idCovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis key="xaxis" dataKey="width" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}mm`} />
              <YAxis key="yaxis" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip key="tooltip" formatter={(v: number) => [`${v.toFixed(1)}%`, '覆盖率']} labelFormatter={l => `宽度 ${l}mm`} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Area key="area-coverage" type="monotone" dataKey="coverage" stroke="#14b8a6" strokeWidth={2.5} fill="url(#idCovGrad)" dot={false} />
              <ReferenceLine key="ref-recommended" x={params.width.recommended} stroke="#6366f1" strokeDasharray="4 3" strokeWidth={1.5}
                label={{ value: `推荐 ${params.width.recommended}mm`, fontSize: 10, fill: '#6366f1', position: 'top' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hand size distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>目标用户手型分布</h3>
          <p className="text-xs text-slate-400 mb-4">基于 <span className="text-teal-600" style={{ fontWeight: 600 }}>{POSITIONING_LABELS[positioning]}</span> 定位用户群体，N=10,000</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={HAND_DATA[positioning]} barCategoryGap="20%">
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis key="xaxis" dataKey="size" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip key="tooltip" formatter={(v: number) => [`${v}%`, '占比']} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar key="bar-pct" dataKey="pct" radius={[6, 6, 0, 0]}>
                {HAND_DATA[positioning].map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Param table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>推荐参数汇总</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {Object.entries(params).map(([key, p]) => {
            const label: Record<string, string> = { width:'宽度', height:'高度', thickness:'厚度', weight:'重量', cornerRadius:'圆角半径' };
            return (
              <div key={key} className="px-5 py-4 flex items-center gap-4">
                <span className="text-slate-500 text-sm w-20">{label[key]}</span>
                <span className="text-indigo-600" style={{ fontWeight: 700, fontSize: '1.2rem' }}>{p.recommended}<span className="text-slate-400 text-sm ml-1">{p.unit}</span></span>
                <span className="text-slate-400 text-xs">范围 [{p.min} – {p.max}]</span>
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.coverage}%`, backgroundColor: p.coverage >= 90 ? '#22c55e' : p.coverage >= 80 ? '#6366f1' : '#f59e0b' }} />
                  </div>
                </div>
                <span className="text-xs w-12 text-right" style={{ fontWeight: 600, color: p.coverage >= 90 ? '#16a34a' : p.coverage >= 80 ? '#4f46e5' : '#d97706' }}>{p.coverage}%</span>
                <div className="flex items-center gap-1 text-xs text-slate-400"><Info size={11} />覆盖率</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
