import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, MapPin, Users, Cpu, Check, CalendarDays, Download } from 'lucide-react';
import { useAppStore, mockLabs } from '../../ToBStore';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const DAYS = ['周一 3/24', '周二 3/25', '周三 3/26', '周四 3/27', '周五 3/28', '下周一 3/31', '下周二 4/1'];

const BOOKED_SLOTS = new Set(['lab-1_周二 3/25_09:00', 'lab-1_周二 3/25_10:00', 'lab-2_周三 3/26_14:00']);

export function LabPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.heProjects.find(p => p.id === id);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  if (!project) return null;

  const confirmed = project.participants.filter(p => p.invitationStatus === 'confirmed');

  function toggleSlot(labId: string, day: string, time: string) {
    if (!selectedLab || selectedLab !== labId) return;
    const key = `${labId}_${day}_${time}`;
    if (BOOKED_SLOTS.has(key)) return;
    setBookedSlots(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>H3-2 实验室安排</h2>
        <p className="text-slate-400 text-sm mt-0.5">已确认被试 {confirmed.length} 人 · 选择实验室并安排排期</p>
      </div>

      {/* Lab cards */}
      <div>
        <h3 className="text-slate-700 text-sm mb-3" style={{ fontWeight: 600 }}>实验室资源库</h3>
        <div className="grid grid-cols-3 gap-4">
          {mockLabs.map(lab => (
            <div key={lab.id}
              onClick={() => lab.available && setSelectedLab(lab.id === selectedLab ? null : lab.id)}
              className={`bg-white rounded-2xl border-2 p-5 transition-all ${
                !lab.available ? 'opacity-50 cursor-not-allowed border-slate-100' :
                selectedLab === lab.id ? 'border-indigo-400 bg-indigo-50 cursor-pointer' : 'border-slate-100 cursor-pointer hover:border-slate-200'
              }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-slate-800 text-sm mb-1" style={{ fontWeight: 600 }}>{lab.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={11} />{lab.location}
                  </div>
                </div>
                {selectedLab === lab.id && <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                {!lab.available && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">已占用</span>}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                <Users size={11} /> 容纳 {lab.capacity} 人
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1.5" style={{ fontWeight: 500 }}>设备配置</div>
                <div className="flex flex-wrap gap-1">
                  {lab.equipment.map(e => (
                    <span key={e} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">{e}</span>
                  ))}
                </div>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl text-xs transition-colors border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                {selectedLab === lab.id ? '已选择' : '一键预约'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule grid */}
      {selectedLab && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>排期规划</h3>
              <p className="text-slate-400 text-xs mt-0.5">点击时间槽进行预约，灰色=已占用</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
              <Download size={12} /> 导出 PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-slate-500 w-20">时间</th>
                  {DAYS.map(d => (
                    <th key={d} className="px-3 py-2.5 text-center text-slate-500 whitespace-nowrap">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {TIME_SLOTS.map(time => (
                  <tr key={time} className="hover:bg-slate-50/30">
                    <td className="px-4 py-2.5 text-slate-500" style={{ fontWeight: 500 }}>{time}</td>
                    {DAYS.map(day => {
                      const key = `${selectedLab}_${day}_${time}`;
                      const isBooked = BOOKED_SLOTS.has(key);
                      const isSelected = bookedSlots.has(key);
                      return (
                        <td key={day} className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => toggleSlot(selectedLab, day, time)}
                            className={`w-full py-1.5 rounded-lg transition-all text-xs ${
                              isBooked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                              isSelected ? 'bg-indigo-500 text-white' :
                              'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                            }`}>
                            {isBooked ? '占用' : isSelected ? '已约' : '可用'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookedSlots.size > 0 && (
            <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex items-center justify-between">
              <span className="text-green-700 text-xs"><span style={{ fontWeight: 600 }}>已预约 {bookedSlots.size} 个时间段</span>，共可安排约 {bookedSlots.size * 2} 人次</span>
              <button className="text-xs text-green-700 border border-green-300 rounded-lg px-3 py-1 hover:bg-green-100 transition-colors" style={{ fontWeight: 500 }}>
                <CalendarDays size={11} className="inline mr-1" />同步至日历
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/tob/he/projects/${id}/run/participants`)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={15} /> 上一步
        </button>
        <button onClick={() => {
          dispatch({ type: 'UPDATE_HE_PROJECT', payload: { id: id!, updates: { currentStep: 'setup' } } });
          navigate(`/tob/he/projects/${id}/run/setup`);
        }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
          下一步：环境搭建 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
