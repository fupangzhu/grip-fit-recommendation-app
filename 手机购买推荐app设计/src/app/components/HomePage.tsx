import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Hand, ArrowRight, User, LogIn, Clock, ChevronRight,
  Scan, Activity, Info, Wifi, Eye, X, Shield, RefreshCw, UserPlus
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { getUserMeasurements, MeasurementRecord } from '../../lib/api/measurements';
import { getUserReports, ReportRecord } from '../../lib/api/reports';
import { fetchAllPhones } from '../../lib/api/phones';
import type { PhoneModel } from './AppContext';

// Floating HUD data points for sci-fi feel
const hudPoints = [
  { label: 'HAND_LEN', value: '182mm', x: '12%', y: '38%' },
  { label: 'GRIP_FORCE', value: '87%', x: '78%', y: '35%' },
  { label: 'MATCH_RATE', value: '94.2%', x: '10%', y: '62%' },
  { label: 'DB_MODELS', value: '2,347', x: '80%', y: '60%' },
];

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
  const [tick, setTick] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTick(v => (v + 1) % 100), 80);
    return () => clearInterval(t);
  }, []);

  // 登录后加载历史记录
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

      // 将测量记录和报告组合为历史条目
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
    <div className="relative h-screen w-full overflow-hidden" style={{ background: '#070a0e' }}>

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(74,144,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,144,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Corner bracket decorations ── */}
      {[
        'top-[72px] left-8 border-l border-t',
        'top-[72px] right-8 border-r border-t',
        'bottom-[160px] left-8 border-l border-b',
        'bottom-[160px] right-8 border-r border-b',
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-10 h-10 pointer-events-none ${cls}`}
          style={{ borderColor: 'rgba(51,112,255,0.25)' }}
        />
      ))}

      {/* ── Scan line ── */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none transition-all"
        style={{
          top: `${(tick / 100) * 100}%`,
          background: 'linear-gradient(90deg, transparent, rgba(51,112,255,0.4), transparent)',
          opacity: 0.5,
        }}
      />

      {/* ── Background phone images ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Left blurred phone */}
        <div
          className="absolute"
          style={{ left: '6%', top: '50%', transform: 'translateY(-52%) rotate(-15deg)' }}
        >
          <img
            src="https://images.unsplash.com/photo-1615921899048-652a7b645f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500"
            alt=""
            className="object-contain"
            style={{ height: '340px', opacity: 0.12, filter: 'blur(2px) saturate(0.5)' }}
          />
        </div>
        {/* Main center phone */}
        <div style={{ transform: 'translateY(-4%)' }}>
          <img
            src="https://images.unsplash.com/photo-1603313011186-4711e7f8e477?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900"
            alt=""
            className="object-contain"
            style={{ height: '600px', opacity: 0.55, filter: 'saturate(0.6)' }}
          />
        </div>
        {/* Right blurred phone */}
        <div
          className="absolute"
          style={{ right: '6%', top: '50%', transform: 'translateY(-52%) rotate(15deg)' }}
        >
          <img
            src="https://images.unsplash.com/photo-1615921899048-652a7b645f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500"
            alt=""
            className="object-contain"
            style={{ height: '340px', opacity: 0.12, filter: 'blur(2px) saturate(0.5)' }}
          />
        </div>
      </div>

      {/* ── Radial vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 65% at 50% 44%, transparent 20%, rgba(7,10,14,0.88) 75%)',
        }}
      />
      {/* ── Bottom gradient ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '280px',
          background: 'linear-gradient(to top, #070a0e 45%, transparent)',
        }}
      />

      {/* ── Floating HUD data points ── */}
      {hudPoints.map((pt) => (
        <div
          key={pt.label}
          className="absolute hidden lg:flex flex-col pointer-events-none"
          style={{ left: pt.x, top: pt.y }}
        >
          <span
            className="font-mono tracking-widest"
            style={{ fontSize: '9px', color: 'rgba(74,144,255,0.35)' }}
          >
            {pt.label}
          </span>
          <span
            className="font-mono"
            style={{ fontSize: '11px', color: 'rgba(74,144,255,0.55)', fontWeight: 600 }}
          >
            {pt.value}
          </span>
          <div
            style={{ width: '40px', height: '1px', background: 'rgba(74,144,255,0.2)', marginTop: '3px' }}
          />
        </div>
      ))}

      {/* ── Targeting circle around center phone ── */}
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{
          left: '50%',
          top: '44%',
          transform: 'translate(-50%,-50%)',
          width: '260px',
          height: '260px',
          border: '1px solid rgba(51,112,255,0.15)',
          borderRadius: '50%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: '1px solid rgba(51,112,255,0.08)',
            borderRadius: '50%',
          }}
        />
        {/* tick marks */}
        {[0, 90, 180, 270].map(deg => (
          <div
            key={deg}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '8px',
              height: '1px',
              background: 'rgba(74,144,255,0.3)',
              transform: `rotate(${deg}deg) translateX(125px)`,
              transformOrigin: '0 0',
            }}
          />
        ))}
      </div>

      {/* ══════ TOP BAR ══════ */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-4 z-30">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#3370ff,#2b5bdb)' }}
          >
            <Hand className="w-3.5 h-3.5 text-white" />
          </div>
          <span
            className="text-white/90 tracking-[0.12em] uppercase"
            style={{ fontSize: '13px', fontWeight: 700 }}
          >
            GripFit
          </span>
          <div
            className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              border: '1px solid rgba(74,222,128,0.2)',
              background: 'rgba(74,222,128,0.06)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            <span
              className="font-mono tracking-widest"
              style={{ fontSize: '9px', color: 'rgba(74,222,128,0.7)' }}
            >
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/about')}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.08em',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <Info className="w-3 h-3" />
            功能介绍
          </button>
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 rounded-lg"
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.65)',
                  padding: '7px 14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <User className="w-3.5 h-3.5" />
                {displayName}
              </div>
              <button
                onClick={logout}
                className="rounded-lg transition-all"
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  padding: '7px 10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="flex items-center gap-2 rounded-lg transition-all"
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.65)',
                padding: '7px 14px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={e => {
                const t = e.currentTarget;
                t.style.background = 'rgba(255,255,255,0.1)';
                t.style.borderColor = 'rgba(255,255,255,0.18)';
              }}
              onMouseLeave={e => {
                const t = e.currentTarget;
                t.style.background = 'rgba(255,255,255,0.05)';
                t.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              登录 / 同步数据
            </button>
          )}
        </div>
      </header>

      {/* ══════ CENTER CTA ══════ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
        {/* Divider line with label */}
        <div className="flex items-center gap-3 mb-5">
          <div
            style={{ width: '48px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(74,144,255,0.5))' }}
          />
          <span
            className="font-mono tracking-[0.28em] uppercase"
            style={{ fontSize: '10px', color: 'rgba(74,144,255,0.55)' }}
          >
            Ergonomics-Driven Matching
          </span>
          <div
            style={{ width: '48px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(74,144,255,0.5))' }}
          />
        </div>

        {/* Main title */}
        <h1
          className="text-center text-white mb-3"
          style={{ fontSize: '44px', fontWeight: 300, lineHeight: 1.18, letterSpacing: '0.01em' }}
        >
          找到最适合
          <span
            style={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4a90ff 10%, #7b61ff 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            你手
          </span>
          的手机
        </h1>
        <p
          className="text-center mb-10"
          style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}
        >
          精准手部数据分析 · 智能握持匹配 · 科学人体工学推荐
        </p>

        {/* Main CTA */}
        <button
          onClick={handleStartScan}
          disabled={scanning}
          className="group relative flex items-center gap-3 rounded-xl transition-all duration-300"
          style={{
            padding: '13px 36px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            background: scanning
              ? 'rgba(51,112,255,0.7)'
              : 'linear-gradient(135deg, #3370ff, #5580ff)',
            boxShadow: '0 0 32px rgba(51,112,255,0.3), 0 4px 16px rgba(51,112,255,0.2)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {scanning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Scan className="w-4 h-4" />
          )}
          {scanning ? '初始化扫描...' : '开始手部测量'}
          {!scanning && (
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            />
          )}
          {/* shimmer */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
            }}
          />
        </button>

        <button
          onClick={() => navigate('/about')}
          className="mt-5 transition-colors"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
        >
          了解功能介绍 →
        </button>
      </div>

      {/* ══════ BOTTOM HISTORY ══════ */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-8 pb-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <span
              className="tracking-[0.22em] uppercase font-mono"
              style={{ fontSize: '9px', color: 'rgba(255,255,255,0.22)' }}
            >
              历史测量记录
            </span>
            {isLoggedIn && (
              <span
                className="font-mono"
                style={{ fontSize: '9px', color: 'rgba(74,144,255,0.45)', marginLeft: '6px' }}
              >
                · 云端已同步
              </span>
            )}
          </div>
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {historyLoading ? (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: 'rgba(74,144,255,0.5)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>加载历史记录...</span>
              </div>
            ) : history.length > 0 ? (
              history.map((record) => (
                <div
                  key={record.id}
                  className="shrink-0 group cursor-pointer flex items-center gap-3 rounded-xl transition-all duration-200"
                  style={{
                    width: '240px',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(12px)',
                  }}
                  onClick={() => navigate('/grip-report')}
                  onMouseEnter={e => {
                    const t = e.currentTarget;
                    t.style.background = 'rgba(51,112,255,0.07)';
                    t.style.borderColor = 'rgba(51,112,255,0.18)';
                  }}
                  onMouseLeave={e => {
                    const t = e.currentTarget;
                    t.style.background = 'rgba(255,255,255,0.035)';
                    t.style.borderColor = 'rgba(255,255,255,0.07)';
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(51,112,255,0.12)' }}
                  >
                    <Hand className="w-3.5 h-3.5" style={{ color: '#4a90ff' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-mono mb-0.5"
                      style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)' }}
                    >
                      {record.date}
                    </div>
                    <div
                      className="truncate"
                      style={{ fontSize: '12px', color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}
                    >
                      {record.topPhone}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(74,144,255,0.55)', marginTop: '2px' }}>
                      {record.score > 0 ? `手感匹配 ${record.score}分` : `手长 ${record.handLength}mm`}
                    </div>
                  </div>
                  <ChevronRight
                    className="w-3 h-3 shrink-0 transition-colors group-hover:text-[#4a90ff]/50"
                    style={{ color: 'rgba(255,255,255,0.12)' }}
                  />
                </div>
              ))
            ) : null}
            {/* Login prompt card */}
            {!isLoggedIn && (
              <div
                className="shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  width: '150px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.07)',
                }}
                onClick={() => setShowLogin(true)}
                onMouseEnter={e => {
                  const t = e.currentTarget;
                  t.style.background = 'rgba(255,255,255,0.05)';
                  t.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget;
                  t.style.background = 'rgba(255,255,255,0.02)';
                  t.style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <LogIn className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.18)' }} />
                <span
                  className="text-center leading-relaxed"
                  style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)' }}
                >
                  登录查看<br />更多记录
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ LOGIN / REGISTER MODAL ══════ */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setShowLogin(false)}
          />
          <div
            className="relative w-full max-w-[360px] rounded-2xl shadow-2xl"
            style={{
              padding: '36px 32px',
              background: 'rgba(13,18,28,0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Corner deco */}
            {['top-4 left-4 border-l border-t', 'top-4 right-4 border-r border-t', 'bottom-4 left-4 border-l border-b', 'bottom-4 right-4 border-r border-b'].map((c, i) => (
              <div key={i} className={`absolute w-4 h-4 pointer-events-none ${c}`} style={{ borderColor: 'rgba(51,112,255,0.3)' }} />
            ))}
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-8 transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(51,112,255,0.15)' }}
              >
                {authMode === 'login' ? (
                  <User className="w-4 h-4" style={{ color: '#4a90ff' }} />
                ) : (
                  <UserPlus className="w-4 h-4" style={{ color: '#4a90ff' }} />
                )}
              </div>
              <span className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>
                {authMode === 'login' ? '登录 GripFit' : '注册 GripFit'}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', marginBottom: '16px', paddingLeft: '42px' }}>
              {authMode === 'login' ? '同步你的手部测量数据和历史记录' : '创建账号开始使用'}
            </p>

            {/* Login / Register tab */}
            <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className="flex-1 py-1.5 rounded-md text-center transition-all"
                style={{
                  fontSize: '12px',
                  color: authMode === 'login' ? '#fff' : 'rgba(255,255,255,0.4)',
                  background: authMode === 'login' ? 'rgba(51,112,255,0.3)' : 'transparent',
                }}
              >
                登录
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className="flex-1 py-1.5 rounded-md text-center transition-all"
                style={{
                  fontSize: '12px',
                  color: authMode === 'register' ? '#fff' : 'rgba(255,255,255,0.4)',
                  background: authMode === 'register' ? 'rgba(51,112,255,0.3)' : 'transparent',
                }}
              >
                注册
              </button>
            </div>

            {authMode === 'register' && (
              <input
                type="text"
                placeholder="用户名（可选）"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full rounded-lg outline-none transition-all mb-3"
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(51,112,255,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            )}
            <input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className="w-full rounded-lg outline-none transition-all mb-3"
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(51,112,255,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className="w-full rounded-lg outline-none transition-all mb-3"
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(51,112,255,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />

            {/* Error message */}
            {authError && (
              <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(245,74,69,0.1)', border: '1px solid rgba(245,74,69,0.2)' }}>
                <span style={{ fontSize: '11px', color: '#f54a45' }}>{authError}</span>
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={authLoading2}
              className="w-full rounded-lg text-white transition-opacity hover:opacity-90 mb-3"
              style={{
                padding: '11px',
                fontSize: '13px',
                fontWeight: 500,
                background: authLoading2 ? '#8fb8ff' : 'linear-gradient(135deg, #3370ff, #5580ff)',
              }}
            >
              {authLoading2 ? '处理中...' : authMode === 'login' ? '登录并同步数据' : '注册账号'}
            </button>
            <div className="flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.18)' }} />
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
                GripFit 不收集任何个人生物识别信息
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
