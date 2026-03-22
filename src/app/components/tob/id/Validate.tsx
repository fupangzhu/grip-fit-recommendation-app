import { useState } from 'react';
import { Positioning, FormFactor, GripStyle, calcParameters, POSITIONING_LABELS, FORM_FACTOR_LABELS } from '../ToBStore';
import { AlertTriangle, CheckCircle, Download, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const PARAM_KEYS = ['width', 'height', 'thickness', 'weight', 'cornerRadius'] as const;
const PARAM_LABELS: Record<string, string> = { width:'宽度', height:'高度', thickness:'厚度', weight:'重量', cornerRadius:'圆角半径' };
const PARAM_UNITS: Record<string, string> = { width:'mm', height:'mm', thickness:'mm', weight:'g', cornerRadius:'mm' };

export function IDValidate() {
  const [positioning, setPositioning] = useState<Positioning>('flagship');
  const [formFactor, setFormFactor] = useState<FormFactor>('bar');
  const [gripStyle] = useState<GripStyle>('onehand');
  const [measured, setMeasured] = useState<Record<string, string>>({});
  const [showReport, setShowReport] = useState(false);

  const idealParams = calcParameters(positioning, formFactor, gripStyle);

  function handleGenerate() { setShowReport(true); }
  function handleReset() { setMeasured({}); setShowReport(false); }

  type ParamKey = typeof PARAM_KEYS[number];
  
  const deviations = PARAM_KEYS.map(key => {
    const ideal = idealParams[key];
    const m = parseFloat(measured[key] ?? '');
    const diff = isNaN(m) ? null : parseFloat((m - ideal.recommended).toFixed(2));
    const pct = diff !== null ? parseFloat((Math.abs(diff) / ideal.recommended * 100).toFixed(1)) : null;
    const isOverTolerance = diff !== null && Math.abs(diff) > ideal.tolerance;
    return { key, label: PARAM_LABELS[key], unit: PARAM_UNITS[key], ideal: ideal.recommended, tolerance: ideal.tolerance, measured: isNaN(m) ? null : m, diff, pct, isOverTolerance };
  });

  const score = showReport ? Math.round(
    deviations.reduce((s, d) => {
      if (d.measured === null) return s + 80;
      if (!d.isOverTolerance) return s + 100;
      const excess = Math.abs(d.diff ?? 0) - d.tolerance;
      return s + Math.max(0, 100 - excess * 20);
    }, 0) / deviations.length
  ) : null;

  const overCount = deviations.filter(d => d.isOverTolerance).length;

  const chartData = deviations.map(d => ({
    label: d.label,
    measured: d.measured,
    ideal: d.ideal,
    diff: d.diff ?? 0,
    over: d.isOverTolerance,
  }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>D2 样机验证</h1>
          <p className="text-slate-400 text-sm mt-0.5">输入实测样机参数，与理想参数对比，生成偏差报告</p>
        </div>
        {showReport && (
          <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RotateCcw size={14} /> 发起新一轮验证
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>参考基准设置</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">产品定位</label>
                <select value={positioning} onChange={e => setPositioning(e.target.value as Positioning)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 bg-white">
                  {(['entry','mid','flagship','ultra'] as Positioning[]).map(p => <option key={p} value={p}>{POSITIONING_LABELS[p]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">手机形态</label>
                <select value={formFactor} onChange={e => setFormFactor(e.target.value as FormFactor)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 bg-white">
                  {(['bar','flip','fold'] as FormFactor[]).map(f => <option key={f} value={f}>{FORM_FACTOR_LABELS[f]}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>输入实测参数</h3>
            <div className="space-y-3">
              {PARAM_KEYS.map(key => {
                const ideal = idealParams[key];
                const val = parseFloat(measured[key] ?? '');
                const isOver = !isNaN(val) && Math.abs(val - ideal.recommended) > ideal.tolerance;
                return (
                  <div key={key}>
                    <label className="text-xs text-slate-500 mb-1 block">{PARAM_LABELS[key]} <span className="text-slate-400">（参考值 {ideal.recommended}{PARAM_UNITS[key]}）</span></label>
                    <div className="relative">
                      <input type="number" step="0.1" value={measured[key] ?? ''}
                        onChange={e => setMeasured(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={`${ideal.recommended}`}
                        className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition-all ${isOver ? 'border-red-400 bg-red-50 focus:ring-red-500/30' : 'border-slate-200 focus:ring-teal-500/30 focus:border-teal-400'}`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{PARAM_UNITS[key]}</span>
                    </div>
                    {isOver && <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1"><AlertTriangle size={10} />超出容差 ±{ideal.tolerance}{PARAM_UNITS[key]}</p>}
                  </div>
                );
              })}
            </div>
            <button onClick={handleGenerate}
              className="mt-4 w-full py-3 bg-teal-600 text-white rounded-xl text-sm hover:bg-teal-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
              生成偏差报告
            </button>
          </div>
        </div>

        {/* Report */}
        <div className="col-span-2 space-y-4">
          {showReport && score !== null ? (
            <>
              {/* Score header */}
              <div className={`rounded-2xl p-5 ${score >= 90 ? 'bg-green-600' : score >= 75 ? 'bg-indigo-600' : 'bg-red-600'} text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-80 mb-1">综合符合度评分</div>
                    <div style={{ fontWeight: 700, fontSize: '3rem' }}>{score}<span className="text-2xl">分</span></div>
                    <div className="text-sm opacity-80 mt-1">
                      {score >= 90 ? '✅ 各项参数符合标准，建议进入下一阶段' : score >= 75 ? '⚠️ 部分参数超标，建议修正后复测' : '❌ 多项参数超标，需要重新设计'}
                    </div>
                  </div>
                  <div className="text-right">
                    {overCount > 0 ? (
                      <div className="bg-red-500/30 rounded-xl p-3 text-center">
                        <div style={{ fontWeight: 700, fontSize: '1.8rem' }}>{overCount}</div>
                        <div className="text-xs opacity-80">项超标</div>
                      </div>
                    ) : (
                      <CheckCircle size={48} className="opacity-80" />
                    )}
                  </div>
                </div>
              </div>

              {/* Deviation chart */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>参数偏差可视化（实测值 − 理想值）</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis key="xaxis" dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis key="yaxis" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip key="tooltip" formatter={(v: number) => [`${v > 0 ? '+' : ''}${v}`, '偏差']} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <ReferenceLine key="zero-line" y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Bar key="bar-diff" dataKey="diff" name="偏差" radius={[4, 4, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={`cell-${i}`} fill={d.over ? '#ef4444' : '#14b8a6'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detail table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['参数','理想值','实测值','偏差','容差范围','判定'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-slate-500" style={{ fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {deviations.map(d => (
                      <tr key={d.key} className={d.isOverTolerance ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}>
                        <td className="px-4 py-3 text-slate-700" style={{ fontWeight: 500 }}>{d.label}</td>
                        <td className="px-4 py-3 text-slate-600">{d.ideal} {d.unit}</td>
                        <td className={`px-4 py-3 ${d.isOverTolerance ? 'text-red-600' : 'text-slate-600'}`} style={{ fontWeight: d.isOverTolerance ? 600 : 400 }}>{d.measured ?? '—'} {d.measured !== null ? d.unit : ''}</td>
                        <td className={`px-4 py-3 text-sm ${d.diff === null ? 'text-slate-300' : d.isOverTolerance ? 'text-red-600' : 'text-green-600'}`} style={{ fontWeight: 600 }}>
                          {d.diff !== null ? `${d.diff > 0 ? '+' : ''}${d.diff} ${d.unit}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">±{d.tolerance} {d.unit}</td>
                        <td className="px-4 py-3">
                          {d.measured === null ? <span className="text-xs text-slate-300">未输入</span>
                            : d.isOverTolerance
                              ? <span className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={11} />超标</span>
                              : <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={11} />合格</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm hover:bg-teal-700 transition-colors" style={{ fontWeight: 500 }}>
                  <Download size={15} /> 导出偏差报告
                </button>
                <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <RotateCcw size={15} /> 发起下一轮迭代
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
              <div className="text-center">
                <AlertTriangle size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">请在左侧填写实测参数后生成报告</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
