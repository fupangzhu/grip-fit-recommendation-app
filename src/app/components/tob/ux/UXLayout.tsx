import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Map, Smartphone, Bell, ChevronRight, LogOut } from 'lucide-react';

const navItems = [
  { to: '/tob/ux/dashboard', label: '工作台', icon: LayoutDashboard, end: true },
  { to: '/tob/ux/heatmap', label: '触达热区工具', icon: Map },
];

export function UXLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Smartphone size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm" style={{ fontWeight: 600 }}>GripFit ToB</div>
            <div className="text-amber-400 text-xs">交互设计师</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <div className="text-slate-500 text-xs px-3 mb-2 mt-1 uppercase tracking-wider">工具</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <item.icon size={16} />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors" onClick={() => navigate('/tob/role-select')}>
            <LogOut size={16} />切换角色
          </div>
          <div className="flex items-center gap-3 px-3 pt-3">
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>王</div>
            <div>
              <div className="text-white text-xs" style={{ fontWeight: 500 }}>王设计师</div>
              <div className="text-slate-500 text-xs">交互设计师</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <span>GripFit</span><ChevronRight size={14} /><span className="text-slate-700">交互设计师</span>
          </div>
          <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
