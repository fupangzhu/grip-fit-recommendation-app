import React, { createContext, useContext, useState } from 'react';

export type AdminTheme = 'dark' | 'wireframe';

interface AdminThemeContextValue {
    theme: AdminTheme;
    toggle: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
    theme: 'dark',
    toggle: () => { },
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<AdminTheme>('dark');
    const toggle = () => setTheme(t => (t === 'dark' ? 'wireframe' : 'dark'));
    return (
        <AdminThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </AdminThemeContext.Provider>
    );
}

export function useAdminTheme() {
    return useContext(AdminThemeContext);
}

// ─── Theme token maps ───────────────────────────────────────────────────────
// Each key is a CSS-var-like name; values differ per theme.
// Components import `useThemeTokens()` to get the right class strings.

export interface ThemeTokens {
    // layout
    pageBg: string;
    sidebarBg: string;
    headerBg: string;
    borderColor: string;
    // cards / panels
    cardBg: string;
    cardBorder: string;
    // text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textPlaceholder: string;
    // interactive
    navActiveBg: string;
    navActiveText: string;
    navHoverBg: string;
    navHoverText: string;
    // accent
    accentBg: string;
    accentBorder: string;
    accentText: string;
    // badge
    badgeUser: string;
    badgeMeasure: string;
    badgeReport: string;
    // table
    tableRowHover: string;
    tableHeaderText: string;
    // stat icon colors
    icon1: string;
    icon2: string;
    icon3: string;
    icon4: string;
    icon5: string;
    // chart axis / grid
    chartGrid: string;
    chartAxis: string;
    chartTooltipBg: string;
    chartTooltipBorder: string;
    // refresh / small button
    refreshBg: string;
    refreshBorder: string;
    refreshText: string;
    refreshHoverBg: string;
    // input
    inputBg: string;
    inputBorder: string;
    inputFocusBorder: string;
    inputText: string;
    // modal
    modalBg: string;
    modalBorder: string;
    // section accent stripe
    sectionStripe: string;
    // pagination button
    paginationHover: string;
    paginationText: string;
    // logo subtitle
    logoSubtitle: string;
    // collapse button
    collapseText: string;
    collapseHover: string;
    // indicator dot in nav
    navDot: string;
    // overview tag in sidebar
    sidebarLabel: string;
}

const dark: ThemeTokens = {
    pageBg: 'bg-[#0f1117]',
    sidebarBg: 'bg-[#13151c]',
    headerBg: 'bg-[#13151c]',
    borderColor: 'border-white/[0.06]',
    cardBg: 'bg-[#13151c]',
    cardBorder: 'border-white/[0.06]',
    textPrimary: 'text-white',
    textSecondary: 'text-white/80',
    textMuted: 'text-white/40',
    textPlaceholder: 'text-white/30',
    navActiveBg: 'bg-violet-500/15',
    navActiveText: 'text-violet-300',
    navHoverBg: 'hover:bg-white/[0.05]',
    navHoverText: 'hover:text-white/80',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/20',
    accentText: 'text-violet-300',
    badgeUser: 'bg-violet-500/20 text-violet-400',
    badgeMeasure: 'bg-blue-500/10 text-blue-400',
    badgeReport: 'bg-emerald-500/10 text-emerald-400',
    tableRowHover: 'hover:bg-white/[0.02]',
    tableHeaderText: 'text-white/40',
    icon1: 'bg-violet-500/80',
    icon2: 'bg-indigo-500/80',
    icon3: 'bg-blue-500/80',
    icon4: 'bg-cyan-500/80',
    icon5: 'bg-pink-500/80',
    chartGrid: 'rgba(255,255,255,0.05)',
    chartAxis: 'rgba(255,255,255,0.3)',
    chartTooltipBg: '#1e2030',
    chartTooltipBorder: 'rgba(255,255,255,0.1)',
    refreshBg: 'bg-violet-500/10',
    refreshBorder: 'border-violet-500/20',
    refreshText: 'text-violet-300',
    refreshHoverBg: 'hover:bg-violet-500/20',
    inputBg: 'bg-white/[0.05]',
    inputBorder: 'border-white/[0.08]',
    inputFocusBorder: 'focus:border-violet-500/50',
    inputText: 'text-white',
    modalBg: 'bg-[#1a1d27]',
    modalBorder: 'border-white/10',
    sectionStripe: 'bg-violet-500',
    paginationHover: 'hover:bg-white/[0.06]',
    paginationText: 'text-white/40',
    logoSubtitle: 'text-violet-400',
    collapseText: 'text-white/30',
    collapseHover: 'hover:bg-white/[0.05] hover:text-white/60',
    navDot: 'bg-violet-400',
    sidebarLabel: 'text-white/30',
};

const wireframe: ThemeTokens = {
    pageBg: 'bg-white',
    sidebarBg: 'bg-white',
    headerBg: 'bg-white',
    borderColor: 'border-black/20',
    cardBg: 'bg-white',
    cardBorder: 'border-black/15',
    textPrimary: 'text-black',
    textSecondary: 'text-black/80',
    textMuted: 'text-black/50',
    textPlaceholder: 'text-black/35',
    navActiveBg: 'bg-black/10',
    navActiveText: 'text-black',
    navHoverBg: 'hover:bg-black/[0.05]',
    navHoverText: 'hover:text-black/80',
    accentBg: 'bg-black/5',
    accentBorder: 'border-black/20',
    accentText: 'text-black',
    badgeUser: 'bg-transparent text-black border border-black/25',
    badgeMeasure: 'bg-transparent text-black border border-black/25',
    badgeReport: 'bg-transparent text-black border border-black/25',
    tableRowHover: 'hover:bg-black/[0.03]',
    tableHeaderText: 'text-black/50',
    icon1: 'bg-black/8 border border-black/20',
    icon2: 'bg-black/8 border border-black/20',
    icon3: 'bg-black/8 border border-black/20',
    icon4: 'bg-black/8 border border-black/20',
    icon5: 'bg-black/8 border border-black/20',
    chartGrid: 'rgba(0,0,0,0.08)',
    chartAxis: 'rgba(0,0,0,0.45)',
    chartTooltipBg: '#ffffff',
    chartTooltipBorder: 'rgba(0,0,0,0.15)',
    refreshBg: 'bg-transparent',
    refreshBorder: 'border-black/25',
    refreshText: 'text-black/70',
    refreshHoverBg: 'hover:bg-black/[0.05]',
    inputBg: 'bg-transparent',
    inputBorder: 'border-black/20',
    inputFocusBorder: 'focus:border-black/60',
    inputText: 'text-black',
    modalBg: 'bg-white',
    modalBorder: 'border-black/20',
    sectionStripe: 'bg-black/50',
    paginationHover: 'hover:bg-black/[0.05]',
    paginationText: 'text-black/50',
    logoSubtitle: 'text-black/50',
    collapseText: 'text-black/40',
    collapseHover: 'hover:bg-black/[0.05] hover:text-black/70',
    navDot: 'bg-black/60',
    sidebarLabel: 'text-black/40',
};

export function useThemeTokens(): ThemeTokens {
    const { theme } = useAdminTheme();
    return theme === 'dark' ? dark : wireframe;
}
