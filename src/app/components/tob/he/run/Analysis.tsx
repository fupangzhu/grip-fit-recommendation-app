import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, AlertTriangle, BarChart2, Download, Copy, RefreshCw, Send } from 'lucide-react';
import { useAppStore } from '../../ToBStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const scoreData = [
  { condition: '握持舒适', mean: 6.2, error: 1.4 },
  { condition: '单手操作', mean: 5.8, error: 1.6 },
  { condition: '拇指可达', mean: 4.8, error: 1.2 },
  { condition: '握持稳定', mean: 7.1, error: 0.9 },
  { condition: '重量感知', mean: 6.5, error: 1.1 },
];

const radarData = [
  { dim: '整体舒适', score: 69, fullMark: 100 },
  { dim: '单手操控', score: 64, fullMark: 100 },
  { dim: '拇指触达', score: 53, fullMark: 100 },
  { dim: '握持稳定', score: 79, fullMark: 100 },
  { dim: '重量感知', score: 72, fullMark: 100 },
  { dim: '外观形态', score: 81, fullMark: 100 },
];

const preprocessLog = [
  { status: 'ok', msg: '量表数据导入：20份，有效19份（剔除P015：作答时间极端异常）' },
  { status: 'ok', msg: '录像数据匹配：19段视频已与被试ID关联' },
  { status: 'ok', msg: '缺失值处理：2处空值已用均值填充，已标注' },
  { status: 'ok', msg: '信度检验（Cronbach α）：0.87（量表内部一致性良好）' },
  { status: 'warn', msg: 'P008 握持压力数据存在离群值，已自动标注，建议人工核查' },
];

const defaultConclusion = `本次实验共收集19名有效被试（手长 M=178.3mm, SD=8.1mm）对样机A的握持舒适度评分数据。

主要发现：
1. 整体握持舒适度均分 6.2/9（SD=1.4），处于中等偏上水平（高于中性值5，p=0.003）。
2. 握持宽度与整体舒适度显著负相关（r=-0.68, p<0.001），即机身越宽，主观舒适度越低；建议将机身宽度控制在73mm以内。
3. 拇指可达性得分较低（M=4.8/9），为本次设计的主要痛点；建议在维持屏占比的前提下降低整机高度约3–5mm。`;

export function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);
  const [conclusion, setConclusion] = useState(defaultConclusion);
  const [saved, setSaved] = useState(false);

  if (!project) return null;

  const done = project.participants.filter(p => p.recordingStatus === 'done').length;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>H3-6 数据分析与结论</h2>
        <p className="text-slate-400 text-sm mt-0.5">基于 {done} 份有效数据进行分析</p>
      </div>

      {/* Preprocessing */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>数据预处理（自动执行）</h3>
        <div className="space-y-2">
          {preprocessLog.map((log, i) => (
            <div key={i} className={`flex items-start gap-3 text-sm p-2.5 rounded-lg ${log.status === 'ok' ? 'bg-green-50' : 'bg-amber-50'}`}>
              {log.status === 'ok' ? <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" /> : <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />}
              <span className={log.status === 'ok' ? 'text-green-800' : 'text-amber-800'}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>各维度评分均值（含误差棒）</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis key="xaxis" dataKey="condition" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 9]} />
              <Tooltip key="tooltip" contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar key="bar-mean" dataKey="mean" name="均值" fill="#6366f1" radius={[6, 6, 0, 0]}>
                <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#4338ca" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>多维度得分雷达图</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid key="polar-grid" stroke="#f1f5f9" />
              <PolarAngleAxis key="polar-angle" dataKey="dim" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis key="polar-radius" angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
              <Radar key="radar-score" name="得分" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>推断统计摘要</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['维度', '均值 M', '标准差 SD', 't检验', 'p值', '效应量 d', '结论'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs text-slate-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { dim: '握持舒适', m: '6.2', sd: '1.4', t: 't(18)=3.74', p: '0.003 ✅', d: '0.86', note: '显著高于中性' },
                { dim: '拇指可达', m: '4.8', sd: '1.2', t: 't(18)=-0.71', p: '0.483', d: '0.17', note: '与中性无显著差异' },
                { dim: '握持稳定', m: '7.1', sd: '0.9', t: 't(18)=5.88', p: '<0.001 ✅✅', d: '1.35', note: '显著高于中性' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 text-slate-700" style={{ fontWeight: 500 }}>{row.dim}</td>
                  <td className="px-4 py-2.5 text-slate-600">{row.m}/9</td>
                  <td className="px-4 py-2.5 text-slate-600">{row.sd}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{row.t}</td>
                  <td className="px-4 py-2.5 text-xs"><span className={row.p.includes('✅') ? 'text-green-600' : 'text-slate-400'}>{row.p}</span></td>
                  <td className="px-4 py-2.5 text-slate-600">{row.d}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Conclusion */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>AI 辅助结论生成</h3>
            <p className="text-slate-400 text-xs mt-0.5">【草稿结论，供审核修改】</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors"><RefreshCw size={12} />重新生成</button>
            <button onClick={() => navigator.clipboard?.writeText(conclusion)} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors"><Copy size={12} />复制全文</button>
          </div>
        </div>
        <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={10}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none" />
      </div>

      {/* Final actions */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
        <h3 className="text-slate-700 text-sm mb-4" style={{ fontWeight: 600 }}>项目完成操作</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
            <Download size={15} /> 导出完整研究报告（PDF）
          </button>
          <button onClick={() => setSaved(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-colors ${saved ? 'bg-green-100 text-green-700' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`} style={{ fontWeight: 500 }}>
            {saved ? <><CheckCircle size={15} />已保存到数据库</> : <><BarChart2 size={15} />保存到数据库</>}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-violet-200 bg-violet-50 text-violet-700 rounded-xl text-sm hover:bg-violet-100 transition-colors" style={{ fontWeight: 500 }}>
            <Send size={15} /> 将结论同步给设计团队
          </button>
        </div>
        {saved && (
          <p className="text-green-600 text-xs mt-3">✅ 实验结论已归档，ID设计师与UX设计师将在工作台收到通知。</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/collect`)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { status: 'completed', progress: 100 } } });
          navigate(`/tob/he/projects/${id}`);
        }}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
          <CheckCircle size={16} /> 完成实验，返回项目详情
        </button>
      </div>
    </div>
  );
}
