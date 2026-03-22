import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Microscope, Pencil, MousePointer, ArrowRight, Smartphone } from 'lucide-react';
import { useAppStore, Role } from './ToBStore';

const ROLES: { key: Role; icon: ReactNode; title: string; subtitle: string; desc: string; color: string; bg: string; route: string }[] = [
  {
    key: 'he',
    icon: <Microscope size={36} />,
    title: '人因工程师',
    subtitle: 'Human Factors Engineer',
    desc: '负责实验设计、被试招募、数据采集与统计分析，管理完整的人因研究项目全流程',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
    route: '/tob/he/dashboard',
  },
  {
    key: 'id',
    icon: <Pencil size={36} />,
    title: 'ID 设计师',
    subtitle: 'Industrial Designer',
    desc: '负责外观形态参数研究，结合人因数据优化机身尺寸、圆角、厚度等物理设计参数',
    color: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200',
    route: '/tob/id/dashboard',
  },
  {
    key: 'ux',
    icon: <MousePointer size={36} />,
    title: '交互设计师',
    subtitle: 'UX Designer',
    desc: '负责屏幕交互、操控热区与手势设计，基于拇指触达数据优化界面布局',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    route: '/tob/ux/dashboard',
  },
];

export function RoleSelect() {
  const navigate = useNavigate();
  const { dispatch } = useAppStore();
  const [selected, setSelected] = useState<Role | null>(null);
  const [remember, setRemember] = useState(false);

  function handleEnter() {
    if (!selected) return;
    dispatch({ type: 'SET_ROLE', payload: selected });
    const role = ROLES.find(r => r.key === selected);
    if (role) navigate(role.route);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
          <Smartphone size={20} className="text-white" />
        </div>
        <div>
          <div className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>GripFit ToB</div>
          <div className="text-slate-400 text-sm">人因研究管理平台</div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-slate-900 mb-2" style={{ fontWeight: 700, fontSize: '1.8rem' }}>欢迎使用 GripFit ToB 研究平台</h1>
        <p className="text-slate-500">请选择你的职能角色，进入对应的工作视图</p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-3 gap-5 max-w-3xl w-full mb-8">
        {ROLES.map(role => (
          <button
            key={role.key}
            onClick={() => setSelected(role.key)}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${
              selected === role.key
                ? `${role.bg} border-current ${role.color} shadow-lg scale-[1.02]`
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {selected === role.key && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-current flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </div>
            )}
            <div className={`mb-4 ${selected === role.key ? role.color : 'text-slate-400'} transition-colors`}>
              {role.icon}
            </div>
            <div className="mb-1" style={{ fontWeight: 700, fontSize: '1.05rem' }}>{role.title}</div>
            <div className="text-xs text-slate-400 mb-3">{role.subtitle}</div>
            <p className="text-sm text-slate-500 leading-relaxed">{role.desc}</p>
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-6 max-w-3xl w-full justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600"
          />
          记住我的选择
        </label>
        <button
          onClick={handleEnter}
          disabled={!selected}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm transition-all duration-200 shadow-sm ${
            selected
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          style={{ fontWeight: 600 }}
        >
          进入工作台
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-12 text-xs text-slate-300">GripFit ToB · 人因研究管理平台 v2.0</div>
    </div>
  );
}
