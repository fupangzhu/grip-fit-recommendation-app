import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Hand, ArrowRight, User, LogIn, Clock, ChevronRight,
  Scan, Info, X, Shield, RefreshCw, UserPlus
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { getUserMeasurements, MeasurementRecord } from '../../lib/api/measurements';
import { getUserReports, ReportRecord } from '../../lib/api/reports';
import { fetchAllPhones } from '../../lib/api/phones';

interface HistoryItem {
  id: string;
  date: string;
  handLength: number;
  handWidth: number;
  topPhone: string;
  score: number;
  tag: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, profile, login, register, logout, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading2, setAuthLoading2] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      loadHistory(user.id);
    } else {
      setHistory([]);
    }
  }, [isLoggedIn, user]);

  const loadHistory = async (userId: string) => {
    setHistoryLoading(true);
    try {
      const [measurements, reports] = await Promise.all([
        getUserMeasurements(userId),
        getUserReports(userId),
      ]);
      const phones = await fetchAllPhones();

      const items: HistoryItem[] = measurements.slice(0, 10).map((m) => {
        const matchingReport = reports.find(r => r.measurementId === m.id);
        let topPhone = '—';
        let score = 0;
        if (matchingReport && matchingReport.rankedResults.length > 0) {
          const topResult = matchingReport.rankedResults[0];
          const phone = phones.find(p => p.id === topResult.id);
          topPhone = phone?.name || topResult.name || '—';
          score = topResult.similarity || topResult.overallScore || 0;
        }
        return {
          id: m.id,
          date: new Date(m.createdAt).toLocaleDateString('zh-CN'),
          handLength: m.handLength,
          handWidth: m.handWidth,
          topPhone,
          score,
          tag: matchingReport ? '已完成' : '仅测量',
        };
      });
      setHistory(items);
    } catch (err) {
      console.error('加载历史记录失败:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAuth = async () => {
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('请填写邮箱和密码');
      return;
    }
    setAuthLoading2(true);
    try {
      if (authMode === 'login') {
        const { error } = await login(email, password);
        if (error) {
          setAuthError(error.message || '登录失败');
        } else {
          setShowLogin(false);
          setEmail('');
          setPassword('');
        }
      } else {
        const { error } = await register(email, password, username || undefined);
        if (error) {
          setAuthError(error.message || '注册失败');
        } else {
          setShowLogin(false);
          setEmail('');
          setPassword('');
          setUsername('');
        }
      }
    } finally {
      setAuthLoading2(false);
    }
  };

  const handleStartScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      navigate('/hand-measure');
    }, 600);
  };

  const displayName = profile?.username || user?.email?.split('@')[0] || '';

  return (
    <div className="relative min-h-screen w-full bg-[#f5f6f8] overflow-x-hidden flex flex-col font-sans text-[#1f2329]">

      {/* ── TOP BAR ── */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-5 bg-white border-b border-[#e8e8ed] z-10 shadow-sm relative shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#3370ff] to-[#5580ff] shadow-sm">
            <Hand className="w-4 h-4 text-white" />
          </div>
          <span className="text-[16px] font-bold tracking-widest text-[#1f2329] uppercase">
            GripFit
          </span>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#34c759]/10 border border-[#34c759]/20 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
            <span className="text-[10px] font-medium text-[#34c759] tracking-wider uppercase">System Online</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/about')}
            className="flex items-center gap-1.5 text-[13px] text-[#646a73] hover:text-[#3370ff] transition-colors"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">功能介绍</span>
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3 pl-4 border-l border-[#e8e8ed]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f1f5] text-[13px] text-[#1f2329] font-medium border border-[#dee0e3]">
                <User className="w-4 h-4 text-[#8f959e]" />
                {displayName}
              </div>
              <button
                onClick={logout}
                className="text-[13px] text-[#8f959e] hover:text-[#f54a45] transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-[#dee0e3] bg-white text-[13px] text-[#1f2329] hover:bg-[#f0f1f5] hover:border-[#bdc1c6] transition-all ml-2 shadow-sm font-medium"
            >
              <LogIn className="w-4 h-4 text-[#8f959e]" />
              登录与同步
            </button>
          )}
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-6 z-0 pb-32 pt-16">

        {/* Decorative subtle background blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#3370ff]/10 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-[#34c759]/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="flex flex-col items-center max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#3370ff]/10 border border-[#3370ff]/20">
            <span className="text-[12px] font-semibold tracking-wider text-[#3370ff] uppercase">Ergonomics-Driven Matching</span>
          </div>

          <h1 className="text-[48px] sm:text-[56px] font-bold text-[#1f2329] leading-tight mb-6 tracking-tight">
            找到最适合
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3370ff] to-[#5580ff]">
              你手
            </span>
            的手机
          </h1>

          <p className="text-[15px] sm:text-[17px] text-[#646a73] mb-12 max-w-xl leading-relaxed">
            基于精准的手部几何数据与握持姿态分析，融合人因工程算法，为您匹配手感最佳的机型并提供定制化购买建议。
          </p>

          <button
            onClick={handleStartScan}
            disabled={scanning}
            className="group relative flex items-center justify-center gap-3 w-[260px] h-[56px] rounded-xl bg-[#3370ff] hover:bg-[#2b5bdb] text-white text-[16px] font-medium transition-all shadow-[0_8px_24px_rgba(51,112,255,0.25)] hover:shadow-[0_12px_32px_rgba(51,112,255,0.35)] disabled:opacity-80 disabled:cursor-wait overflow-hidden"
          >
            {scanning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Scan className="w-5 h-5" />
            )}
            {scanning ? '初始化算法引擎...' : '开始测量匹对'}
            {!scanning && (
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            )}
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          </button>
        </div>
      </main>

      {/* ── BOTTOM HISTORY BAR ── */}
      <div className="w-full bg-white border-t border-[#e8e8ed] px-8 py-5 shrink-0 z-10 shadow-[0_-4px_24px_rgba(31,35,41,0.04)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#8f959e]" />
            <span className="text-[13px] font-semibold text-[#1f2329] tracking-wide">历史测量与匹配记录</span>
            {isLoggedIn && (
              <span className="text-[11px] text-[#34c759] bg-[#34c759]/10 px-2 py-0.5 rounded ml-2 font-medium">云端同步已开启</span>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 shrink-0 scrollbar-hide">
            {historyLoading ? (
              <div className="flex items-center justify-center gap-2 w-[260px] h-[86px] rounded-xl bg-[#f5f6f8] border border-[#e8e8ed]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#3370ff]" />
                <span className="text-[13px] text-[#646a73]">加载数据中...</span>
              </div>
            ) : history.length > 0 ? (
              history.map((record) => (
                <div
                  key={record.id}
                  className="group shrink-0 flex items-center gap-3 w-[260px] p-3 rounded-xl bg-white border border-[#e8e8ed] hover:border-[#3370ff]/40 hover:shadow-[0_4px_16px_rgba(51,112,255,0.08)] transition-all cursor-pointer"
                  onClick={() => navigate('/grip-report')}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#f0f4ff] flex items-center justify-center shrink-0">
                    <Hand className="w-5 h-5 text-[#3370ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#8f959e] font-mono mb-0.5">{record.date}</div>
                    <div className="text-[14px] text-[#1f2329] font-semibold truncate leading-tight mb-1">{record.topPhone}</div>
                    <div className="text-[12px] text-[#646a73]">
                      {record.score > 0 ? <span className="text-[#3370ff] font-medium">匹配 {record.score}分</span> : `手长 ${record.handLength}mm`}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#bdc1c6] group-hover:text-[#3370ff] transition-colors shrink-0" />
                </div>
              ))
            ) : null}

            {!isLoggedIn && (
              <div
                className="shrink-0 flex flex-col items-center justify-center gap-2 w-[200px] h-[86px] rounded-xl bg-[#f8f9fa] border border-dashed border-[#bdc1c6] hover:bg-[#f0f4ff] hover:border-[#3370ff]/40 cursor-pointer transition-all group"
                onClick={() => setShowLogin(true)}
              >
                <LogIn className="w-4 h-4 text-[#8f959e] group-hover:text-[#3370ff]" />
                <span className="text-[12px] text-[#646a73] font-medium group-hover:text-[#3370ff]">登录同步历史记录</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogin(false)} />

          <div className="relative w-full max-w-[380px] rounded-2xl bg-white shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-[#f5f6f8] text-[#8f959e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#f0f4ff] flex items-center justify-center">
                {authMode === 'login' ? <User className="w-5 h-5 text-[#3370ff]" /> : <UserPlus className="w-5 h-5 text-[#3370ff]" />}
              </div>
              <h2 className="text-[20px] font-bold text-[#1f2329]">
                {authMode === 'login' ? '登录 GripFit' : '注册账号'}
              </h2>
            </div>

            <p className="text-[13px] text-[#646a73] mb-6">
              {authMode === 'login' ? '登入并同步您的多端手部测量与报告数据' : '创建新账号以永久保存您的评测记录'}
            </p>

            <div className="flex gap-1 mb-5 p-1 rounded-lg bg-[#f5f6f8]">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-1.5 rounded-md text-[13px] font-medium transition-all ${authMode === 'login' ? 'bg-white text-[#1f2329] shadow-sm' : 'text-[#8f959e] hover:text-[#646a73]'}`}
              >
                密码登录
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 py-1.5 rounded-md text-[13px] font-medium transition-all ${authMode === 'register' ? 'bg-white text-[#1f2329] shadow-sm' : 'text-[#8f959e] hover:text-[#646a73]'}`}
              >
                新用户注册
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {authMode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#1f2329]">用户名 (可选)</label>
                  <input
                    type="text"
                    placeholder="输入昵称"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#dee0e3] bg-white text-[14px] text-[#1f2329] placeholder-[#8f959e] focus:border-[#3370ff] focus:ring-2 focus:ring-[#3370ff]/20 outline-none transition-all"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#1f2329]">邮箱</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#dee0e3] bg-white text-[14px] text-[#1f2329] placeholder-[#8f959e] focus:border-[#3370ff] focus:ring-2 focus:ring-[#3370ff]/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#1f2329]">密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#dee0e3] bg-white text-[14px] text-[#1f2329] placeholder-[#8f959e] focus:border-[#3370ff] focus:ring-2 focus:ring-[#3370ff]/20 outline-none transition-all"
                />
              </div>
            </div>

            {authError && (
              <div className="mb-4 px-3 py-2.5 rounded-lg bg-[#f54a45]/10 border border-[#f54a45]/20 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#f54a45] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#f54a45] leading-snug">{authError}</span>
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={authLoading2}
              className="w-full py-2.5 rounded-lg bg-[#3370ff] hover:bg-[#2b5bdb] text-white text-[14px] font-medium transition-colors mb-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
            >
              {authLoading2 ? <RefreshCw className="w-4 h-4 animate-spin" /> : (authMode === 'login' ? '立即登录' : '注册账号')}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8f959e]">
              <Shield className="w-3 h-3" />
              <span>GripFit 承诺保护您的隐私，不收集生物特征数据。</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
