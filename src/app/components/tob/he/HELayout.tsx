import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, FolderOpen, Plus, Users, Archive, Settings, Smartphone, Bell, ChevronRight, LogOut } from 'lucide-react';

const navItems = [
  { to: '/tob/he/dashboard', label: '工作看板', icon: LayoutDashboard, end: true },
  { to: '/tob/he/projects', label: '我的项目', icon: FolderOpen },
  { to: '/tob/he/projects/new', label: '新建项目', icon: Plus },
];

const bottomItems = [
  { label: '被试库', icon: Users },
  { label: '数据归档', icon: Archive },
  { label: '系统设置', icon: Settings },
];

export function HELayout() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Smartphone size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm" style={{ fontWeight: 600 }}>GripFit ToB</div>
            <div className="text-slate-400 text-xs">人因工程师</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="text-slate-500 text-xs px-3 mb-2 mt-1 uppercase tracking-wider">工作区</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
          <div className="pt-4">
            <div className="text-slate-500 text-xs px-3 mb-2 uppercase tracking-wider">工具</div>
            {bottomItems.map(item => (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors">
                <item.icon size={16} />
                {item.label}
              </div>
            ))}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            onClick={() => navigate('/tob/role-select')}>
            <LogOut size={16} />
            切换角色
          </div>
          <div className="flex items-center gap-3 px-3 pt-3">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>张</div>
            <div>
              <div className="text-white text-xs" style={{ fontWeight: 500 }}>张研究员</div>
              <div className="text-slate-500 text-xs">人因工程师</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <span>GripFit</span>
            <ChevronRight size={14} />
            <span className="text-slate-700">人因工程师</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
