import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowRight, Send, UserCheck, UserX, Clock, Filter, ChevronDown, Mail, Zap } from 'lucide-react';
import { useAppStore } from '../../ToBStore';
import type { ProjectParticipant } from '../../ToBStore';

const MOCK_POOL: Omit<ProjectParticipant, 'invitationStatus' | 'questProgress' | 'questTotal' | 'recordingStatus' | 'notes'>[] = [
  { code: 'P001', handLength: 178, handWidth: 80, thumbSpan: 95, gripHabit: 'onehand', ageGroup: '26-35' },
  { code: 'P002', handLength: 165, handWidth: 74, thumbSpan: 88, gripHabit: 'onehand', ageGroup: '18-25' },
  { code: 'P003', handLength: 182, handWidth: 84, thumbSpan: 100, gripHabit: 'twohand', ageGroup: '26-35' },
  { code: 'P004', handLength: 171, handWidth: 78, thumbSpan: 92, gripHabit: 'onehand', ageGroup: '36-45' },
  { code: 'P005', handLength: 176, handWidth: 81, thumbSpan: 96, gripHabit: 'onehand', ageGroup: '26-35' },
  { code: 'P006', handLength: 168, handWidth: 76, thumbSpan: 90, gripHabit: 'twohand', ageGroup: '18-25' },
  { code: 'P007', handLength: 183, handWidth: 85, thumbSpan: 102, gripHabit: 'twohand', ageGroup: '36-45' },
  { code: 'P008', handLength: 170, handWidth: 77, thumbSpan: 91, gripHabit: 'onehand', ageGroup: '26-35' },
  { code: 'P009', handLength: 174, handWidth: 79, thumbSpan: 94, gripHabit: 'onehand', ageGroup: '18-25' },
  { code: 'P010', handLength: 180, handWidth: 82, thumbSpan: 98, gripHabit: 'twohand', ageGroup: '26-35' },
];

export function Participants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);

  const [handLengthRange, setHandLengthRange] = useState([160, 195]);
  const [handWidthRange, setHandWidthRange] = useState([70, 92]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (!project) return null;

  const participants = project.participants;
  const confirmed = participants.filter(p => p.invitationStatus === 'confirmed');
  const sent = participants.filter(p => p.invitationStatus === 'sent');
  const declined = participants.filter(p => p.invitationStatus === 'declined');
  const noReply = participants.filter(p => p.invitationStatus === 'noReply');
  const displayList = showAll ? participants : participants.slice(0, 8);

  const statusMap: Record<string, { label: string; color: string; icon: ReactNode }> = {
    confirmed: { label: '已确认', color: 'bg-green-100 text-green-700', icon: <UserCheck size={12} /> },
    sent:      { label: '已发送', color: 'bg-blue-100 text-blue-700',  icon: <Send size={12} /> },
    declined:  { label: '已拒绝', color: 'bg-red-100 text-red-600',    icon: <UserX size={12} /> },
    noReply:   { label: '未回复', color: 'bg-slate-100 text-slate-500', icon: <Clock size={12} /> },
  };

  function canGoNext() { return confirmed.length >= 1; }

  /** 一键模拟招募：批量生成确认状态的模拟被试 */
  function quickRecruit() {
    const count = project.participantTarget || 10;
    const newParticipants: ProjectParticipant[] = MOCK_POOL.slice(0, Math.min(count, MOCK_POOL.length)).map(base => ({
      ...base,
      invitationStatus: 'confirmed',
      questProgress: 0,
      questTotal: 18,
      recordingStatus: 'pending',
      notes: '',
    }));
    // Fill remaining with auto-generated if target > pool size
    for (let i = newParticipants.length; i < count; i++) {
      const base = MOCK_POOL[i % MOCK_POOL.length];
      newParticipants.push({
        ...base,
        code: `P${String(i + 1).padStart(3, '0')}`,
        handLength: base.handLength + Math.floor(Math.random() * 6) - 3,
        handWidth: base.handWidth + Math.floor(Math.random() * 4) - 2,
        thumbSpan: base.thumbSpan + Math.floor(Math.random() * 4) - 2,
        invitationStatus: i < Math.ceil(count * 0.7) ? 'confirmed' : i < Math.ceil(count * 0.85) ? 'sent' : 'noReply',
        questProgress: 0,
        questTotal: 18,
        recordingStatus: 'pending',
        notes: '',
      });
    }
    dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { participants: newParticipants } } });
  }

  /** 一键确认：将所有「已发送」改为「已确认」 */
  function confirmAll() {
    const updated = participants.map(p =>
      p.invitationStatus === 'sent' ? { ...p, invitationStatus: 'confirmed' as const } : p
    );
    dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { participants: updated } } });
  }

  function goNext() {
    dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'lab', status: 'running' } } });
    navigate(`/tob/he/projects/${id}/run/lab`);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>H3-1 被试筛选与邀请</h2>
          <p className="text-slate-400 text-sm mt-0.5">已确认 {confirmed.length}/{project.participantTarget} 人</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {[
            { label: '已确认', count: confirmed.length, color: 'text-green-600' },
            { label: '已发送', count: sent.length, color: 'text-blue-600' },
            { label: '已拒绝', count: declined.length, color: 'text-red-600' },
            { label: '未回复', count: noReply.length, color: 'text-slate-500' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={`${s.color} text-lg`} style={{ fontWeight: 700 }}>{s.count}</div>
              <div className="text-slate-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 空状态：快速招募提示 */}
      {participants.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-amber-800 text-sm" style={{ fontWeight: 600 }}>当前项目暂无被试数据</p>
            <p className="text-amber-600 text-xs mt-0.5">点击右侧按钮一键从被试数据库中快速筛选并模拟招募，快速进入实验流程</p>
          </div>
          <button
            onClick={quickRecruit}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm hover:bg-amber-600 transition-colors shadow-sm whitespace-nowrap"
            style={{ fontWeight: 500 }}>
            <Zap size={14} /> 一键模拟招募
          </button>
        </div>
      )}

      {/* 有被试但未全部确认 */}
      {participants.length > 0 && sent.length > 0 && confirmed.length < project.participantTarget && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-blue-700 text-sm">有 <span style={{ fontWeight: 600 }}>{sent.length}</span> 位被试已收到邀请，可一键模拟确认</p>
          <button
            onClick={confirmAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors"
            style={{ fontWeight: 500 }}>
            <UserCheck size={12} /> 模拟全部确认
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        {/* Filters */}
        <div className="col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={15} className="text-slate-500" />
            <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>筛选条件</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-2 block" style={{ fontWeight: 500 }}>手长范围：{handLengthRange[0]}–{handLengthRange[1]} mm</label>
              <div className="space-y-2">
                <input type="range" min={150} max={210} value={handLengthRange[0]} onChange={e => setHandLengthRange([+e.target.value, handLengthRange[1]])} className="w-full h-1.5 appearance-none bg-slate-200 rounded-full accent-indigo-600" />
                <input type="range" min={150} max={210} value={handLengthRange[1]} onChange={e => setHandLengthRange([handLengthRange[0], +e.target.value])} className="w-full h-1.5 appearance-none bg-slate-200 rounded-full accent-indigo-600" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block" style={{ fontWeight: 500 }}>手宽范围：{handWidthRange[0]}–{handWidthRange[1]} mm</label>
              <div className="space-y-2">
                <input type="range" min={60} max={100} value={handWidthRange[0]} onChange={e => setHandWidthRange([+e.target.value, handWidthRange[1]])} className="w-full h-1.5 appearance-none bg-slate-200 rounded-full accent-indigo-600" />
                <input type="range" min={60} max={100} value={handWidthRange[1]} onChange={e => setHandWidthRange([handWidthRange[0], +e.target.value])} className="w-full h-1.5 appearance-none bg-slate-200 rounded-full accent-indigo-600" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block" style={{ fontWeight: 500 }}>握持习惯</label>
              <div className="flex gap-2">
                {['单手为主', '双手为主'].map(g => (
                  <button key={g} className="flex-1 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block" style={{ fontWeight: 500 }}>年龄段</label>
              <div className="flex flex-wrap gap-1">
                {['18–25', '26–35', '36–45'].map(a => (
                  <button key={a} className="px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">{a}</button>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">
                <span style={{ fontWeight: 600 }}>符合条件：{participants.length > 0 ? participants.length : Math.floor(handLengthRange[1] - handLengthRange[0])} 人</span>
                <br /><span className="text-indigo-500">占数据库约 {Math.round(((handLengthRange[1] - handLengthRange[0]) / 60) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Participant preview */}
        <div className="col-span-2 space-y-4">
          {/* Status table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>被试状态跟踪</h3>
              <button onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 transition-colors" style={{ fontWeight: 500 }}>
                <Mail size={12} /> 一键邀请
              </button>
            </div>
            {participants.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">
                暂无被试数据，请先点击「一键模拟招募」
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['编号','手长','手宽','虎口','邀请状态','备注'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayList.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-700" style={{ fontWeight: 500 }}>{p.code}</td>
                        <td className="px-4 py-3 text-slate-600">{p.handLength} mm</td>
                        <td className="px-4 py-3 text-slate-600">{p.handWidth} mm</td>
                        <td className="px-4 py-3 text-slate-600">{p.thumbSpan} mm</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusMap[p.invitationStatus]?.color}`}>
                            {statusMap[p.invitationStatus]?.icon}
                            {statusMap[p.invitationStatus]?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {participants.length > 8 && (
              <div className="px-5 py-3 border-t border-slate-50">
                <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                  {showAll ? '收起' : `查看全部 ${participants.length} 人`} <ChevronDown size={12} className={showAll ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-700 text-sm" style={{ fontWeight: 500 }}>确认进度</span>
              <span className="text-sm text-slate-600">已确认 <span className="text-indigo-600" style={{ fontWeight: 700 }}>{confirmed.length}</span> / 目标 {project.participantTarget} 人</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, (confirmed.length / project.participantTarget) * 100)}%` }} />
            </div>
            {confirmed.length < project.participantTarget && (
              <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                ⚠️ 还需 {project.participantTarget - confirmed.length} 人确认才能达到目标
                {confirmed.length === 0 && <span>，请先完成被试招募</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex justify-end">
        <button onClick={goNext}
          disabled={!canGoNext()}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-colors shadow-sm ${canGoNext() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          style={{ fontWeight: 500 }}>
          下一步：安排实验室 <ArrowRight size={16} />
        </button>
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-slate-900 mb-4" style={{ fontWeight: 700 }}>生成邀请信息</h3>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed mb-4">
              您好！我们正在开展《{project.name}》研究项目，诚邀您参与本次实验。实验时间约60-90分钟，地点为人因实验室A，报酬100元。请回复本消息确认参与意愿。感谢您的支持！
            </div>
            <div className="flex gap-2 mb-4">
              {['站内消息', '邮件', '微信分享'].map(m => (
                <button key={m} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">{m}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600">取消</button>
              <button onClick={() => { setShowInviteModal(false); }}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors" style={{ fontWeight: 500 }}>发送邀请</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

