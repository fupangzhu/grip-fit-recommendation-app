import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
    LayoutDashboard,
    Users,
    Smartphone,
    ClipboardList,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu,
    Shield,
    Bell,
    Home,
    Sun,
    Moon,
} from 'lucide-react';
import { AdminThemeProvider, useAdminTheme, useThemeTokens } from './AdminThemeContext';

const adminNavItems = [
    { path: '/admin', label: '看板总览', icon: LayoutDashboard, exact: true },
    { path: '/admin/users', label: '用户管理', icon: Users },
    { path: '/admin/phones', label: '机型管理', icon: Smartphone },
    { path: '/admin/records', label: '测量 & 报告', icon: ClipboardList },
    { path: '/admin/scoring', label: '评分配置', icon: Settings },
];

// ─── Inner layout (has access to theme context) ───────────────────────────────
function AdminLayoutInner() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggle } = useAdminTheme();
    const t = useThemeTokens();

    const isWireframe = theme === 'wireframe';

    const isActive = (item: { path: string; exact?: boolean }) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className={`flex h-screen ${t.pageBg}`}>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static z-50 h-full flex flex-col
          ${t.sidebarBg} border-r ${t.borderColor}
          transition-all duration-200 ease-in-out
          ${collapsed ? 'w-[68px]' : 'w-[220px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className={`flex items-center h-[56px] px-4 border-b ${t.borderColor} shrink-0 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isWireframe ? 'border-2 border-black/40 bg-transparent' : 'bg-gradient-to-br from-violet-500 to-indigo-600'}`}>
                        <Shield className={`w-4 h-4 ${isWireframe ? 'text-black/70' : 'text-white'}`} />
                    </div>
                    {!collapsed && (
                        <div>
                            <div className={`text-[13px] font-semibold ${t.textPrimary} leading-none`}>GripFit</div>
                            <div className={`text-[10px] ${t.logoSubtitle} mt-0.5`}>管理后台</div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
                    {!collapsed && (
                        <p className={`text-[10px] ${t.sidebarLabel} uppercase tracking-wider px-3 mb-2`}>管理功能</p>
                    )}
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <button
                                key={item.path}
                                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                                title={collapsed ? item.label : undefined}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm
                  ${active
                                        ? `${t.navActiveBg} ${t.navActiveText}`
                                        : `${t.textMuted} ${t.navHoverBg} ${t.navHoverText}`
                                    }
                  ${collapsed ? 'justify-center' : ''}
                  ${isWireframe && active ? 'border border-black/20' : ''}
                `}
                            >
                                <Icon className={`w-[17px] h-[17px] shrink-0 ${active ? (isWireframe ? 'text-black' : 'text-violet-400') : ''}`} />
                                {!collapsed && <span className="text-[13px]">{item.label}</span>}
                                {!collapsed && active && (
                                    <span className={`ml-auto w-1.5 h-1.5 rounded-full ${t.navDot}`} />
                                )}
                            </button>
                        );
                    })}

                    {/* Divider */}
                    <div className={`my-2 border-t ${t.borderColor}`} />

                    {/* Back to App */}
                    <button
                        onClick={() => navigate('/')}
                        title={collapsed ? '返回前台' : undefined}
                        className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
              ${t.collapseText} ${t.collapseHover}
              ${collapsed ? 'justify-center' : ''}
            `}
                    >
                        <Home className="w-[17px] h-[17px] shrink-0" />
                        {!collapsed && <span className="text-[13px]">返回前台</span>}
                    </button>
                </nav>

                {/* Bottom collapse */}
                <div className={`border-t ${t.borderColor} p-2`}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${t.collapseText} ${t.collapseHover} transition-colors`}
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        {!collapsed && <span className="text-[12px]">收起菜单</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className={`h-[56px] ${t.headerBg} border-b ${t.borderColor} flex items-center justify-between px-4 lg:px-6 shrink-0`}>
                    <div className="flex items-center gap-3">
                        <button
                            className={`lg:hidden p-1.5 rounded-lg ${t.collapseHover} ${t.paginationText}`}
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={`text-[14px] font-semibold ${t.textSecondary}`}>管理控制台</h1>
                            <p className={`text-[11px] ${t.textMuted}`}>
                                {adminNavItems.find(i => isActive(i))?.label ?? '总览'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* ─── Theme Toggle Button ─────────────────────────────── */}
                        <button
                            id="admin-theme-toggle"
                            onClick={toggle}
                            title={isWireframe ? '切换到深色主题' : '切换到线框原型模式'}
                            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
                border transition-all duration-200
                ${isWireframe
                                    ? 'bg-black text-white border-black hover:bg-black/80'
                                    : `${t.refreshBg} ${t.refreshBorder} ${t.refreshText} ${t.refreshHoverBg}`
                                }
              `}
                        >
                            {isWireframe ? (
                                <>
                                    <Moon className="w-3.5 h-3.5" />
                                    <span>深色模式</span>
                                </>
                            ) : (
                                <>
                                    <Sun className="w-3.5 h-3.5" />
                                    <span>线框模式</span>
                                </>
                            )}
                        </button>

                        <button className={`p-2 rounded-lg ${t.collapseHover} ${t.paginationText} transition-colors relative`}>
                            <Bell className="w-[17px] h-[17px]" />
                        </button>

                        <div className={`ml-1 flex items-center gap-2 px-3 py-1.5 rounded-lg ${t.accentBg} border ${t.accentBorder}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isWireframe ? 'border border-black/40 bg-transparent' : 'bg-gradient-to-br from-violet-500 to-indigo-600'}`}>
                                <Shield className={`w-3 h-3 ${isWireframe ? 'text-black/70' : 'text-white'}`} />
                            </div>
                            <span className={`text-[12px] ${t.accentText} font-medium`}>管理员</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className={`flex-1 overflow-y-auto ${t.pageBg}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

// ─── Exported wrapper with provider ──────────────────────────────────────────
export function AdminLayout() {
    return (
        <AdminThemeProvider>
            <AdminLayoutInner />
        </AdminThemeProvider>
    );
}
