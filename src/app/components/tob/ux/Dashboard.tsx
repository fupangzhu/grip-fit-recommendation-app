import { useNavigate } from 'react-router';
import { Map, ArrowRight, Bell, CheckCircle, Layers } from 'lucide-react';

const notifications = [
  { from: '张研究员（人因工程师）', msg: '「X Ultra 振动感知实验」拇指可达性数据已同步，建议更新热区图', time: '2小时前', isNew: true },
  { from: '李设计师（ID设计师）', msg: '旗舰机宽度确认为 71mm，请更新触达热区基准', time: '昨天', isNew: false },
];

const latestResearch = [
  { project: 'X Ultra 振动感知量化', insight: '拇指可达性得分较低（M=4.8/9），高度需降低 3–5mm', urgent: true },
  { project: 'Lite S6 形态适配研究', insight: '单手握持场景下，顶部30%区域困难触达占比63%', urgent: false },
];

export function UXDashboard() {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>交互设计师工作台</h1>
        <p className="text-slate-400 text-sm mt-0.5">王设计师 · {new Date().toLocaleDateString('zh-CN')}</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <Bell size={15} className="text-amber-600" />
          <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>消息通知</h2>
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">1 条未读</span>
        </div>
        <div className="divide-y divide-slate-50">
          {notifications.map((n, i) => (
            <div key={i} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 cursor-pointer ${n.isNew ? 'bg-amber-50/20' : ''}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isNew ? 'bg-amber-500' : 'bg-transparent'}`} />
              <div className="flex-1">
                <div className="text-xs text-slate-400 mb-0.5">{n.from}</div>
                <p className="text-slate-700 text-sm">{n.msg}</p>
              </div>
              <span className="text-xs text-slate-400">{n.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest research */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-slate-800 text-sm mb-4" style={{ fontWeight: 600 }}>最新交互研究结论</h2>
        <div className="space-y-3">
          {latestResearch.map((r, i) => (
            <div key={i} className={`p-4 rounded-xl border ${r.urgent ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-start gap-3">
                <CheckCircle size={15} className={`flex-shrink-0 mt-0.5 ${r.urgent ? 'text-amber-500' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs text-slate-400 mb-1">{r.project}</div>
                  <p className={`text-sm ${r.urgent ? 'text-amber-800' : 'text-slate-700'}`} style={{ fontWeight: 500 }}>{r.insight}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Map, label: '触达热区工具', desc: '基于手型百分位数据，生成拇指触达热力图，导出设计参考', to: '/tob/ux/heatmap', color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { icon: Layers, label: '查看最新交互研究结论', desc: '浏览人因团队同步的可达性数据与交互研究报告', to: '/tob/ux/heatmap', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
        ].map(card => (
          <div key={card.label} onClick={() => navigate(card.to)}
            className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all group ${card.color}`}>
            <card.icon size={24} className="mb-3" />
            <div className="mb-1 text-sm" style={{ fontWeight: 600 }}>{card.label}</div>
            <p className="text-xs opacity-70 leading-relaxed">{card.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontWeight: 500 }}>
              进入 <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
