import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Video, Mic, AlertTriangle, CheckCircle, Clock, Play, FileEdit } from 'lucide-react';
import { useAppStore } from '../../ToBStore';

export function CollectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);
  const [warnings] = useState([
    { type: 'warning', msg: 'P004 量表作答时间异常（47秒完成18题），建议复测' },
    { type: 'warning', msg: '摄像头2 录像中断，请检查连接' },
  ]);

  if (!project) return null;

  const participants = project.participants;
  const done = participants.filter(p => p.recordingStatus === 'done');
  const inProgress = participants.filter(p => p.recordingStatus === 'recording');
  const pending = participants.filter(p => p.recordingStatus === 'pending');
  const allDone = done.length === participants.length && participants.length > 0;

  const collectTypes = [
    { label: '量表作答', status: 'active', detail: `进行中（${done.length}/${participants.length} 人已完成）`, icon: FileEdit },
    { label: '录像录制', status: 'active', detail: '正在录制（摄像头 1, 2）', icon: Video },
    { label: '录音采集', status: 'active', detail: '录音中（音量计正常）', icon: Mic },
    { label: '压力数据', status: 'idle', detail: '未接入（可选）', icon: AlertTriangle },
  ];

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>H3-5 数据采集</h2>
        <p className="text-slate-400 text-sm mt-0.5">实验进行中 · 实时监控采集状态</p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <AlertTriangle size={16} className="flex-shrink-0 text-amber-500" />
              {w.msg}
            </div>
          ))}
        </div>
      )}

      {/* Collect status */}
      <div className="grid grid-cols-4 gap-3">
        {collectTypes.map(ct => (
          <div key={ct.label} className={`rounded-2xl border p-4 ${ct.status === 'active' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${ct.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-sm text-slate-700" style={{ fontWeight: 600 }}>{ct.label}</span>
            </div>
            <p className={`text-xs ${ct.status === 'active' ? 'text-green-700' : 'text-slate-400'}`}>{ct.detail}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-700 text-sm" style={{ fontWeight: 600 }}>总体采集进度</span>
          <span className="text-sm text-slate-500">已完成 <span className="text-indigo-600" style={{ fontWeight: 700 }}>{done.length}</span> / {participants.length} 人</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(done.length / (participants.length || 1)) * 100}%` }} />
        </div>
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />已完成 {done.length}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />进行中 {inProgress.length}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />待开始 {pending.length}</span>
        </div>
      </div>

      {/* Participant table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>被试实验进度跟踪</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['被试编号', '当前阶段', '量表进度', '录像状态', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-500" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {participants.slice(0, 15).map((p, i) => {
                const phase = p.recordingStatus === 'done' ? '已完成' : p.recordingStatus === 'recording' ? '实验中' : '等待中';
                return (
                  <tr key={i} className={`hover:bg-slate-50/50 ${p.recordingStatus === 'recording' ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-3 text-slate-700" style={{ fontWeight: 500 }}>{p.code}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.recordingStatus === 'done' ? 'bg-green-100 text-green-700' : p.recordingStatus === 'recording' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{phase}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(p.questProgress / (p.questTotal || 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{p.questProgress}/{p.questTotal}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.recordingStatus === 'done' ? (
                        <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} />已保存</span>
                      ) : p.recordingStatus === 'recording' ? (
                        <span className="text-xs text-blue-600 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />录制中</span>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} />待开始</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.recordingStatus === 'done' ? (
                        <button className="text-xs text-indigo-600 hover:underline">查看→</button>
                      ) : p.recordingStatus === 'pending' ? (
                        <button className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"><Play size={10} />开始</button>
                      ) : (
                        <button className="text-xs text-slate-400 hover:underline">标注</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/questionnaire`)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'analysis' } } });
          navigate(`/tob/he/projects/${id}/run/analysis`);
        }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
          {allDone ? '所有数据已采集，进入分析' : `进入分析（${done.length}/${participants.length}已采集）`} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
