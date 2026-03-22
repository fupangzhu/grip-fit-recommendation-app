import { useNavigate } from 'react-router';
import { Bell, CheckCircle, Box, ScanSearch, ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { useAppStore } from '../ToBStore';

const notifications = [
  { id: 1, from: '张研究员（人因工程师）', msg: '「X Ultra 振动感知量化实验」研究结论已同步，建议查阅宽度参数', time: '1小时前', isNew: true },
  { id: 2, from: '系统通知', msg: '「旗舰机握持舒适度研究」被试确认已达50%，数据即将可用', time: '3小时前', isNew: true },
  { id: 3, from: '张研究员（人因工程师）', msg: '「Lite S6 形态适配研究」完整报告已归档，建议查阅', time: '昨天', isNew: false },
];

const latestConclusions = [
  { project: 'X Ultra 振动感知量化实验', key: '机身宽度建议控制在 73mm 以内', score: 87 },
  { project: 'Lite S6 形态适配研究', key: '圆角 R 值 10–12mm 用户接受度最高', score: 91 },
];

export function IDDashboard() {
  const navigate = useNavigate();
  const { state } = useAppStore();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>ID 设计师工作台</h1>
        <p className="text-slate-400 text-sm mt-0.5">李设计师 · {new Date().toLocaleDateString('zh-CN')}</p>
      </div>

      {/* Two main path cards */}
      <div className="grid grid-cols-2 gap-5">
        <div
          onClick={() => navigate('/tob/id/model/new/population')}
          className="group relative bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Box size={24} className="text-white" />
          </div>
          <h2 className="text-white mb-1" style={{ fontWeight: 700, fontSize: '1.1rem' }}>从零构建精模</h2>
          <p className="text-teal-100 text-sm leading-relaxed">
            选择目标用户人群与手机形态属性，系统自动生成参数化底模，可直接导出 STEP 或发送打印机。
          </p>
          <div className="mt-4 flex items-center gap-1 text-teal-200 text-sm" style={{ fontWeight: 500 }}>
            开始建模 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/tob/id/review/upload')}
          className="group relative bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <ScanSearch size={24} className="text-white" />
          </div>
          <h2 className="text-white mb-1" style={{ fontWeight: 700, fontSize: '1.1rem' }}>快速方案评审</h2>
          <p className="text-violet-100 text-sm leading-relaxed">
            上传已有方案（STEP / FBX），一键分析不同人群的人因风险，快速定位需要修改的区域。
          </p>
          <div className="mt-4 flex items-center gap-1 text-violet-200 text-sm" style={{ fontWeight: 500 }}>
            上传方案 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent models */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Box size={15} className="text-teal-600" />
              <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>最近精模</h2>
            </div>
            <span className="text-xs text-slate-400">{state.idModels.length} 个底模</span>
          </div>
          <div className="divide-y divide-slate-50">
            {state.idModels.slice(0, 3).map(m => (
              <div
                key={m.id}
                onClick={() => navigate(`/tob/id/model/${m.id}/front`)}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Box size={14} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-800 text-sm truncate" style={{ fontWeight: 500 }}>{m.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <Clock size={10} />{m.createdAt}
                    <span className="text-slate-200">·</span>
                    <span>P50覆盖率 {m.coverageP50}%</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ScanSearch size={15} className="text-violet-600" />
              <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>最近评审</h2>
            </div>
            <span className="text-xs text-slate-400">{state.idReviews.length} 份报告</span>
          </div>
          <div className="divide-y divide-slate-50">
            {state.idReviews.slice(0, 3).map(r => {
              const highCount = r.issues.filter(i => i.severity === 'high').length;
              const medCount = r.issues.filter(i => i.severity === 'medium').length;
              return (
                <div
                  key={r.id}
                  onClick={() => navigate(`/tob/id/review/${r.id}/overview`)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ScanSearch size={14} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-800 text-sm truncate" style={{ fontWeight: 500 }}>{r.name}</div>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <Clock size={10} className="text-slate-400" />
                      <span className="text-slate-400">{r.uploadedAt}</span>
                      {highCount > 0 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md">{highCount} 高风险</span>}
                      {medCount > 0 && <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md">{medCount} 需注意</span>}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-teal-600" />
            <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>来自人因团队的消息</h2>
            <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">2 条未读</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${n.isNew ? 'bg-teal-50/20' : ''}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isNew ? 'bg-teal-500' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-400 mb-0.5">{n.from}</div>
                <p className="text-slate-700 text-sm">{n.msg}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{n.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest HE conclusions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>最新研究结论摘要</h2>
          <span className="text-xs text-slate-400">来自人因工程师</span>
        </div>
        <div className="space-y-3">
          {latestConclusions.map((c, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
              <CheckCircle size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-slate-400 mb-1">{c.project}</div>
                <p className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>{c.key}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-slate-400 mb-0.5">覆盖率评分</div>
                <div className="text-teal-600" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{c.score}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

