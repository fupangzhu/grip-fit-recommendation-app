import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  Hand,
  Smartphone,
  Home,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  Menu,
  Sparkles,
  LayoutGrid,
  FileText,
} from 'lucide-react';
import { useAppContext } from './AppContext';

const navItems = [
  { path: '/', label: '首页', icon: Home, step: 0 },
  { path: '/hand-measure', label: '手部测量', icon: Hand, step: 1 },
  { path: '/phone-select', label: '机型选择', icon: Smartphone, step: 2 },
  { path: '/model-presets', label: '模型预设', icon: LayoutGrid, step: 3 },
  { path: '/grip-preview', label: '手感预览', icon: Sparkles, step: 4 },
  { path: '/grip-report', label: '手感报告', icon: FileText, step: 5 },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStep } = useAppContext();

  const isActive = (path: string) => location.pathname === path;

  // Full-screen pages: no sidebar
  const isFullScreen = location.pathname === '/' || location.pathname === '/about';
  if (isFullScreen) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50 h-full bg-white border-r border-[#e8e8ed] flex flex-col
          transition-all duration-200 ease-in-out
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-[56px] px-4 border-b border-[#e8e8ed] ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3370ff] to-[#2b5bdb] flex items-center justify-center">
                <Hand className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] text-[#1f2329]" style={{ fontWeight: 600 }}>
                GripFit
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3370ff] to-[#2b5bdb] flex items-center justify-center">
              <Hand className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto">
          <div className={`mb-3 px-2 ${collapsed ? 'hidden' : ''}`}>
            <span className="text-[11px] text-[#8f959e] uppercase tracking-wider">功能模块</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const completed = item.step > 0 && item.step < currentStep;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-[9px] rounded-lg mb-[2px] transition-all duration-150
                  ${active
                    ? 'bg-[#3370ff]/10 text-[#3370ff]'
                    : 'text-[#646a73] hover:bg-[#f0f1f5] hover:text-[#1f2329]'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <div className="relative">
                  <Icon className={`w-[18px] h-[18px] ${active ? 'text-[#3370ff]' : ''}`} />
                  {completed && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#34c759]" />
                  )}
                </div>
                {!collapsed && (
                  <>
                    <span className="text-[14px] flex-1 text-left">{item.label}</span>
                    {item.step > 0 && (
                      <span
                        className={`text-[11px] px-[6px] py-[1px] rounded-full ${
                          completed
                            ? 'bg-[#34c759]/10 text-[#34c759]'
                            : active
                            ? 'bg-[#3370ff]/10 text-[#3370ff]'
                            : 'bg-[#f0f1f5] text-[#8f959e]'
                        }`}
                      >
                        {completed ? '✓' : `${item.step}`}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#e8e8ed] p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#8f959e] hover:bg-[#f0f1f5] hover:text-[#646a73] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-[13px]">收起菜单</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-[56px] bg-white border-b border-[#e8e8ed] flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-[#f0f1f5] text-[#646a73]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center bg-[#f5f6f8] rounded-lg px-3 py-[6px] w-[320px]">
              <Search className="w-4 h-4 text-[#8f959e] mr-2" />
              <input
                type="text"
                placeholder="搜索手机型号、品牌..."
                className="bg-transparent border-none outline-none text-[13px] text-[#1f2329] placeholder-[#8f959e] w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-[#f0f1f5] text-[#646a73] transition-colors">
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2 rounded-lg hover:bg-[#f0f1f5] text-[#646a73] transition-colors relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full bg-[#f54a45]" />
            </button>
            <button className="p-2 rounded-lg hover:bg-[#f0f1f5] text-[#646a73] transition-colors">
              <Settings className="w-[18px] h-[18px]" />
            </button>
            <div className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#3370ff] to-[#6694ff] flex items-center justify-center cursor-pointer">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}