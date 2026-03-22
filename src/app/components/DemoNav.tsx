import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Compass, X, ChevronRight, MonitorSmartphone, TestTube, LayoutDashboard, Minus } from 'lucide-react';

export function DemoNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedState = localStorage.getItem('gripfit-demonav-state');
        if (savedState) {
            const { open, min } = JSON.parse(savedState);
            setIsOpen(open);
            setIsMinimized(min);
        } else {
            setIsOpen(true);
        }
    }, []);

    const saveState = (open: boolean, min: boolean) => {
        setIsOpen(open);
        setIsMinimized(min);
        localStorage.setItem('gripfit-demonav-state', JSON.stringify({ open, min }));
    };

    if (isMinimized) {
        return (
            <div
                onClick={() => saveState(true, false)}
                className="fixed top-6 right-6 z-[9999] w-12 h-12 rounded-full bg-white shadow-[0_4px_24px_rgba(31,35,41,0.12)] border border-[#dee0e3] flex items-center justify-center cursor-pointer hover:shadow-[0_8px_28px_rgba(31,35,41,0.16)] transition-all group"
            >
                <Compass className="w-6 h-6 text-[#3370ff] group-hover:scale-110 transition-transform" />
            </div>
        );
    }

    const sections = [
        {
            title: 'ToC 用户端',
            icon: <MonitorSmartphone className="w-4 h-4" />,
            links: [
                { label: '欢迎首页', path: '/' },
                { label: '手部测量', path: '/hand-measure' },
                { label: '机型选择', path: '/phone-select' },
                { label: '握持手感报告', path: '/grip-report' },
            ]
        },
        {
            title: 'ToB 研究平台',
            icon: <TestTube className="w-4 h-4" />,
            links: [
                { label: '角色选择入口', path: '/tob/role-select' },
                { label: '人因工程师看板', path: '/tob/he/dashboard' },
                { label: 'ID 设计师看板', path: '/tob/id/dashboard' },
                { label: 'UX 设计师热力图', path: '/tob/ux/dashboard' },
            ]
        },
        {
            title: 'Admin 后台',
            icon: <LayoutDashboard className="w-4 h-4" />,
            links: [
                { label: '管理员看板', path: '/admin' },
                { label: '打分引擎设置', path: '/admin/scoring' },
            ]
        }
    ];

    return (
        <div className={`fixed top-6 right-6 z-[9999] transition-all duration-300 ${isOpen ? 'w-72' : 'w-12 h-12'}`}>
            {!isOpen ? (
                <div
                    onClick={() => saveState(true, false)}
                    className="w-12 h-12 rounded-full bg-white shadow-[0_4px_24px_rgba(31,35,41,0.12)] border border-[#dee0e3] flex items-center justify-center cursor-pointer hover:shadow-[0_8px_28px_rgba(31,35,41,0.16)] transition-all group"
                >
                    <Compass className="w-6 h-6 text-[#3370ff] group-hover:rotate-45 transition-transform" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-[0_8px_28px_rgba(31,35,41,0.12)] border border-[#dee0e3] overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-[#dee0e3] flex items-center justify-between bg-[#f8f9fa]">
                        <div className="flex items-center gap-2">
                            <Compass className="w-5 h-5 text-[#3370ff]" />
                            <span className="text-[14px] font-semibold text-[#1f2329]">全系统导航</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => saveState(false, true)}
                                className="p-1.5 rounded hover:bg-[#ebeced] text-[#8f959e] transition-colors"
                                title="最小化"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => saveState(false, false)}
                                className="p-1.5 rounded hover:bg-[#ebeced] text-[#8f959e] transition-colors"
                                title="折叠"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-3 max-h-[calc(100vh-120px)] overflow-y-auto">
                        {sections.map((section, idx) => (
                            <div key={idx} className="mb-4 last:mb-0">
                                <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[#646a73]">
                                    {section.icon}
                                    <span className="text-[12px] font-medium">{section.title}</span>
                                </div>
                                <div className="space-y-0.5">
                                    {section.links.map(link => {
                                        const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                                        return (
                                            <button
                                                key={link.path}
                                                onClick={() => navigate(link.path)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-colors group
                          ${isActive
                                                        ? 'bg-[#e1eaff] text-[#3370ff] font-medium'
                                                        : 'text-[#1f2329] hover:bg-[#f5f6f8]'}`}
                                            >
                                                <span>{link.label}</span>
                                                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
