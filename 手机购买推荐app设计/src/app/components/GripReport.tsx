import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Trophy, Heart, ShoppingCart, Share2, Download,
  ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, CheckCircle2, X,
  Sparkles, Ruler, Move3D,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAppContext, PhoneModel } from './AppContext';
import { useAuth } from './AuthContext';
import { saveReport } from '../../lib/api/reports';
import { addFavorite, removeFavorite, getUserFavorites } from '../../lib/api/favorites';
import { getFormulas, getPreferences } from '../../lib/api/scoring';
import type { ScoringFormula, CategoricalPreference } from '../../lib/api/scoring';
import { computeComfortScore } from '../../lib/scoring/comfortEngine';
import { allPhones as localPhones } from './phoneData';
import { IdealPhoneModel3D, computeIdealParams } from './IdealPhoneModel3D';

function calcSimilarity(phone: PhoneModel): number {
  const wDiff = Math.abs(72 - phone.width) / 10;
  const hDiff = Math.abs(152 - phone.height) / 25;
  const tDiff = Math.abs(8.2 - phone.thickness) / 3;
  const weightDiff = Math.abs(195 - phone.weight) / 50;
  return Math.round(Math.max(0, 100 - (wDiff + hDiff + tDiff + weightDiff) * 12));
}

function getPhoneScores(p: PhoneModel) {
  return {
    grip: p.gripScore, reach: p.reachScore, comfort: p.comfortScore,
    light: Math.round(Math.max(40, 100 - (p.weight - 140) / 1.5)),
    oneHand: Math.round(Math.max(40, 100 - (p.width - 65) * 3)),
    pocket: p.width <= 72 ? 88 : p.width <= 75 ? 75 : 60,
  };
}

// TODO: reachScore 和 gripScore(总体) 的动态计算公式待后续论文研究后补充
// 当前 reachScore 使用数据库/本地硬编码值
// gripScore(总体) = f(comfortScore, reachScore, ...) 公式组成待定

function getProsCons(p: PhoneModel) {
  const pros: string[] = [];
  const cons: string[] = [];
  if (p.weight <= 185) pros.push('轻量化机身');
  if (p.weight > 215) cons.push('机身偏重');
  if (p.width <= 72) pros.push('窄机身单手友好');
  if (p.width > 76) cons.push('较宽不便单手操作');
  if (p.thickness <= 7.5) pros.push('超薄手感');
  if (p.thickness > 9) cons.push('偏厚');
  if (p.gripScore >= 92) pros.push('握持手感出色');
  if (p.overallScore >= 90) pros.push('综合手感评分高');
  if (p.price > 8000) cons.push('价格较高');
  if (p.price <= 5000) pros.push('价格亲民');
  if (pros.length === 0) pros.push('均衡配置');
  if (cons.length === 0) cons.push('无明显短板');
  return { pros: pros.slice(0, 3), cons: cons.slice(0, 3) };
}

export function GripReport() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { selectedPhones, handData, measurementId, customParams } = useAppContext();
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [scoringFormulas, setScoringFormulas] = useState<ScoringFormula[]>([]);
  const [scoringPrefs, setScoringPrefs] = useState<CategoricalPreference[]>([]);

  // Load scoring formulas
  useEffect(() => {
    Promise.all([
      getFormulas('comfort'),
      getPreferences('comfort'),
    ]).then(([formulas, prefs]) => {
      setScoringFormulas(formulas);
      setScoringPrefs(prefs);
    });
  }, []);

  // Sync favorites from Supabase
  useEffect(() => {
    if (isLoggedIn && user) {
      getUserFavorites(user.id).then(ids => {
        setLiked(new Set(ids));
      });
    }
  }, [isLoggedIn, user]);

  // Save report to Supabase on mount
  useEffect(() => {
    if (isLoggedIn && user && selectedPhones.length > 0) {
      const saveToDb = async () => {
        setSavingReport(true);
        try {
          await saveReport(user.id, {
            measurementId: measurementId || undefined,
            selectedPhoneIds: selectedPhones.map(p => p.id),
            rankedResults: rankedPhones,
            presetUsed: customParams.gripStyle || undefined,
          });
        } catch (err) {
          console.error('[GripFit] 保存报告失败:', err);
        } finally {
          setSavingReport(false);
        }
      };
      saveToDb();
    }
  }, [isLoggedIn, user]); // Only once on mount if data exists

  const rankedPhones = useMemo(() => {
    const phones = selectedPhones.length > 0 ? selectedPhones : localPhones.slice(0, 6);
    return phones.map((p: PhoneModel) => ({ ...p, similarity: calcSimilarity(p) })).sort((a: any, b: any) => b.similarity - a.similarity);
  }, [selectedPhones]);

  const radarData = useMemo(() => {
    const dims = ['握持感', '可达性', '舒适度', '轻便性', '单手操控', '口袋友好'];
    const keys = ['grip', 'reach', 'comfort', 'light', 'oneHand', 'pocket'] as const;
    return dims.map((label, i) => {
      const entry: Record<string, any> = { subject: label };
      rankedPhones.slice(0, 4).forEach((p) => {
        const scores = getPhoneScores(p);
        // Dynamic comfort score if formulas are configured
        if (keys[i] === 'comfort' && scoringFormulas.length > 0) {
          entry[p.id] = computeComfortScore(p, handData, scoringFormulas, scoringPrefs);
        } else {
          entry[p.id] = scores[keys[i]];
        }
      });
      return entry;
    });
  }, [rankedPhones, scoringFormulas, scoringPrefs, handData]);

  const barData = useMemo(() =>
    rankedPhones.slice(0, 6).map((p) => ({
      name: p.name.length > 8 ? p.name.slice(0, 8) + '...' : p.name,
      综合手感: p.overallScore,
      匹配度: p.similarity,
    })),
    [rankedPhones]
  );

  const radarColors = ['#3370ff', '#7b61ff', '#34c759', '#ff9f0a'];

  // ─── 理想手感模型参数（由手部数据驱动）───
  const idealParams = useMemo(() => computeIdealParams(
    handData.handLength,
    handData.handWidth,
    handData.thumbLength,
    handData.thumbSpan,
    customParams.gripStyle,
    customParams.preferredMaterial,
  ), [handData, customParams]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12px] text-[#8f959e] mb-3">
          <span className="cursor-pointer hover:text-[#3370ff]" onClick={() => navigate('/')}>首页</span>
          <span>/</span>
          <span className="text-[#1f2329]">手感报告</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[24px] text-[#1f2329] mb-2" style={{ fontWeight: 600 }}>手感综合报告</h1>
            <p className="text-[14px] text-[#8f959e]">
              基于你的手部数据和配置偏好，综合对比分析推荐机型
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8e8ed] text-[12px] text-[#646a73] hover:bg-[#f5f6f8]">
              <Share2 className="w-3 h-3" /> 分享
            </button>
            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3370ff] text-[12px] text-[#3370ff] hover:bg-[#3370ff]/5 transition-colors"
            >
              <Download className="w-3 h-3" /> 导出报告
            </button>
          </div>
        </div>
      </div>

      {/* ─── 理想手感模型展示区 ─── */}
      <div className="mb-8 rounded-2xl overflow-hidden border border-[#e8e8ed] bg-gradient-to-br from-[#0a0a1a] via-[#10103a] to-[#080820] shadow-xl">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-white/90">你的理想手感模型</h2>
              <p className="text-[10px] text-white/35">根据你的手部生理数据，AI 推算的最优手机形态</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <Move3D className="w-3 h-3" />
            <span>PBR 物理渲染 · 可交互旋转</span>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0">
          {/* 左：3D 模型 */}
          <div className="relative">
            <Suspense fallback={
              <div className="flex items-center justify-center" style={{ height: 400 }}>
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-indigo-400/50 border-t-indigo-400 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[11px] text-white/30">3D 场景加载中...</p>
                </div>
              </div>
            }>
              <IdealPhoneModel3D
                params={idealParams}
                height={400}
                showLabels={true}
                className="rounded-none"
              />
            </Suspense>
          </div>

          {/* 右：参数说明面板 */}
          <div className="border-l border-white/[0.07] p-5 flex flex-col justify-between">
            <div>
              <p className="text-[11px] text-white/40 uppercase tracking-wider mb-4">推算关键参数</p>

              {/* 4 个核心参数卡片 */}
              <div className="space-y-3">
                {[
                  {
                    icon: '⟷',
                    label: '最优机身宽度',
                    value: `${idealParams.width} mm`,
                    desc: `基于虎口跨度 ${handData.thumbSpan}mm · 单手握持舒适区`,
                    color: '#6366f1',
                  },
                  {
                    icon: '↕',
                    label: '理想机身高度',
                    value: `${idealParams.height} mm`,
                    desc: `基于手长 ${handData.handLength}mm · 拇指可达上边缘`,
                    color: '#8b5cf6',
                  },
                  {
                    icon: '◻',
                    label: '舒适握持圆角',
                    value: `R${idealParams.cornerRadius} mm`,
                    desc: `基于拇指长 ${handData.thumbLength}mm · 自然曲率贴合`,
                    color: '#3b82f6',
                  },
                  {
                    icon: '≡',
                    label: '适宜机身厚度',
                    value: `${idealParams.thickness} mm`,
                    desc: `平衡握感与便携性的最优区间`,
                    color: '#06b6d4',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[13px] font-bold"
                      style={{ background: `${item.color}22`, color: item.color }}
                    >{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-white/50">{item.label}</span>
                        <span className="text-[14px] font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                      </div>
                      <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 与最佳匹配机型的对比 */}
            {rankedPhones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.07]">
                <p className="text-[10px] text-white/35 mb-2">最佳匹配机型接近度</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-white/50">{rankedPhones[0]?.name}</span>
                      <span className="text-indigo-300 font-semibold">{rankedPhones[0]?.similarity ?? '--'}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{ width: `${rankedPhones[0]?.similarity ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-white/20 mt-2">
                  接近度 = 现有机型与你理想尺寸的加权相似度
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-[#e8e8ed] p-5">
          <h3 className="text-[14px] text-[#1f2329] mb-1" style={{ fontWeight: 600 }}>多维手感雷达图</h3>
          <p className="text-[11px] text-[#8f959e] mb-3">各机型六维手感评分对比</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#e8e8ed" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8f959e', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8e8ed', fontSize: 11 }} />
                {rankedPhones.slice(0, 4).map((p: any, idx: number) => (
                  <Radar key={p.id} name={p.name} dataKey={p.id}
                    stroke={radarColors[idx]} fill={radarColors[idx]}
                    fillOpacity={idx === 0 ? 0.15 : 0.05} strokeWidth={idx === 0 ? 2.5 : 1.5}
                    strokeDasharray={idx === 0 ? '' : '4 3'} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {rankedPhones.slice(0, 4).map((p: any, idx: number) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <div className="w-3 h-[3px] rounded" style={{ backgroundColor: radarColors[idx] }} />
                <span className="text-[10px] text-[#8f959e]">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-[#e8e8ed] p-5">
          <h3 className="text-[14px] text-[#1f2329] mb-1" style={{ fontWeight: 600 }}>评分柱状对比</h3>
          <p className="text-[11px] text-[#8f959e] mb-3">综合手感 vs 配置匹配度</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f5" />
                <XAxis dataKey="name" tick={{ fill: '#8f959e', fontSize: 10 }} axisLine={{ stroke: '#f0f1f5' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#c9cdd4', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8e8ed', fontSize: 11 }} />
                <Bar dataKey="综合手感" fill="#3370ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="匹配度" fill="#34c759" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#3370ff]" /><span className="text-[10px] text-[#8f959e]">综合手感</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#34c759]" /><span className="text-[10px] text-[#8f959e]">配置匹配度</span></div>
          </div>
        </div>
      </div>

      {/* ─── Spec Comparison Table ─── */}
      <div className="bg-white rounded-xl border border-[#e8e8ed] p-5 mb-6 overflow-x-auto">
        <h3 className="text-[14px] text-[#1f2329] mb-4" style={{ fontWeight: 600 }}>规格对比表</h3>
        <table className="w-full text-[12px] min-w-[600px]">
          <thead>
            <tr className="border-b border-[#f0f1f5]">
              <th className="text-left py-2 text-[#8f959e]" style={{ fontWeight: 500 }}>参数</th>
              {rankedPhones.slice(0, 4).map((p: any, idx: number) => (
                <th key={p.id} className="text-center py-2" style={{ fontWeight: 500 }}>
                  <span className="text-[#1f2329]">{p.name}</span>
                  {idx === 0 && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-[#ffd60a]/15 text-[#b8960a]">推荐</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: '尺寸', key: (p: PhoneModel) => `${p.width}×${p.height}mm` },
              { label: '厚度', key: (p: PhoneModel) => `${p.thickness}mm` },
              { label: '重量', key: (p: PhoneModel) => `${p.weight}g` },
              { label: '屏幕', key: (p: PhoneModel) => `${p.screenSize}"` },
              { label: '材质', key: (p: PhoneModel) => p.material },
              { label: '背板', key: (p: PhoneModel) => p.backMaterial || '—' },
              { label: '后摄形状', key: (p: PhoneModel) => p.cameraShape || '—' },
              { label: '后摄凸起', key: (p: PhoneModel) => p.cameraBumpHeight ? `${p.cameraBumpHeight}mm` : '—' },
              { label: '电池', key: (p: PhoneModel) => p.battery ? `${p.battery}mAh` : '—' },
              { label: '价格', key: (p: PhoneModel) => `¥${p.price.toLocaleString()}` },
              { label: '综合评分', key: (p: PhoneModel) => `${p.overallScore}分` },
            ].map((row) => (
              <tr key={row.label} className="border-b border-[#f5f6f8] hover:bg-[#fafbfc]">
                <td className="py-2 text-[#8f959e]">{row.label}</td>
                {rankedPhones.slice(0, 4).map((p: any) => (
                  <td key={p.id} className="text-center py-2 text-[#1f2329] tabular-nums">{row.key(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Phone Cards with Pros/Cons ─── */}
      <h3 className="text-[14px] text-[#1f2329] mb-4" style={{ fontWeight: 600 }}>详细评估与购买推荐</h3>
      <div className="space-y-4 mb-6">
        {rankedPhones.map((phone: any, idx: number) => {
          const { pros, cons } = getProsCons(phone);
          const expanded = expandedPhone === phone.id;
          return (
            <div key={phone.id} className="bg-white rounded-xl border border-[#e8e8ed] overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#fafbfc]"
                onClick={() => setExpandedPhone(expanded ? null : phone.id)}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[12px] ${idx === 0 ? 'bg-[#ffd60a]/15 text-[#b8960a]' :
                  idx === 1 ? 'bg-[#c0c0c0]/15 text-[#808080]' :
                    idx === 2 ? 'bg-[#cd7f32]/15 text-[#8b5e20]' :
                      'bg-[#f5f6f8] text-[#c9cdd4]'
                  }`} style={{ fontWeight: 700 }}>
                  {idx === 0 ? <Trophy className="w-4 h-4 text-[#ffd60a]" /> : idx + 1}
                </div>
                <ImageWithFallback src={phone.image} alt={phone.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#1f2329]" style={{ fontWeight: 500 }}>{phone.name}</span>
                    <span className="text-[11px] text-[#8f959e]">{phone.brand}</span>
                  </div>
                  <div className="flex gap-3 text-[11px] text-[#8f959e] mt-0.5">
                    <span>{phone.width}×{phone.height}mm</span>
                    <span>{phone.weight}g</span>
                    <span>¥{phone.price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-center shrink-0 mr-2">
                  <div className="text-[18px] tabular-nums" style={{
                    fontWeight: 700,
                    color: phone.similarity >= 80 ? '#34c759' : phone.similarity >= 60 ? '#ff9f0a' : '#f54a45',
                  }}>{phone.similarity}%</div>
                  <div className="text-[9px] text-[#8f959e]">匹配度</div>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-[#8f959e]" /> : <ChevronDown className="w-4 h-4 text-[#8f959e]" />}
              </div>

              {expanded && (
                <div className="px-5 pb-5 border-t border-[#f0f1f5] pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pros */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ThumbsUp className="w-3.5 h-3.5 text-[#34c759]" />
                        <span className="text-[12px] text-[#34c759]" style={{ fontWeight: 500 }}>优势</span>
                      </div>
                      <ul className="space-y-1.5">
                        {pros.map((p) => (
                          <li key={p} className="flex items-start gap-1.5 text-[12px] text-[#646a73]">
                            <span className="text-[#34c759] mt-0.5">✓</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Cons */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ThumbsDown className="w-3.5 h-3.5 text-[#f54a45]" />
                        <span className="text-[12px] text-[#f54a45]" style={{ fontWeight: 500 }}>劣势</span>
                      </div>
                      <ul className="space-y-1.5">
                        {cons.map((c) => (
                          <li key={c} className="flex items-start gap-1.5 text-[12px] text-[#646a73]">
                            <span className="text-[#f54a45] mt-0.5">✗</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#f0f1f5]">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3370ff] text-white text-[12px] hover:bg-[#2b5bdb]" style={{ fontWeight: 500 }}>
                      <ShoppingCart className="w-3 h-3" /> 查看购买渠道
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const isLiked = liked.has(phone.id);
                        const newLiked = new Set(liked);

                        if (isLiked) {
                          newLiked.delete(phone.id);
                          if (isLoggedIn && user) await removeFavorite(user.id, phone.id);
                        } else {
                          newLiked.add(phone.id);
                          if (isLoggedIn && user) await addFavorite(user.id, phone.id);
                        }
                        setLiked(newLiked);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e8e8ed] text-[12px] text-[#646a73] hover:bg-[#f5f6f8]">
                      <Heart className={`w-3 h-3 ${liked.has(phone.id) ? 'text-[#f54a45] fill-[#f54a45]' : ''}`} />
                      {liked.has(phone.id) ? '已收藏' : '收藏'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e8e8ed]">
        <button onClick={() => navigate('/grip-preview')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#e8e8ed] text-[14px] text-[#646a73] hover:bg-[#f5f6f8] transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回手感预览
        </button>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-lg bg-[#3370ff] text-white text-[14px] hover:bg-[#2b5bdb] transition-colors"
          style={{ fontWeight: 500 }}>
          返回首页
        </button>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowDownloadModal(false); setDownloaded(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-[420px] border border-[#e8e8ed]">
            <button
              onClick={() => { setShowDownloadModal(false); setDownloaded(false); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#f5f6f8] text-[#8f959e]"
            >
              <X className="w-4 h-4" />
            </button>

            {!downloaded ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-[#3370ff]/8 flex items-center justify-center mb-5">
                  <Download className="w-6 h-6 text-[#3370ff]" />
                </div>
                <h3 className="text-[16px] text-[#1f2329] mb-1" style={{ fontWeight: 600 }}>导出手感报告</h3>
                <p className="text-[12px] text-[#8f959e] mb-6" style={{ lineHeight: 1.7 }}>
                  将生成包含雷达图对比、规格参数、优劣分析和购买建议的完整PDF报告
                </p>
                <div className="space-y-2 mb-6">
                  {[
                    `推荐机型：${rankedPhones[0]?.name || '—'}`,
                    `综合匹配度：${rankedPhones[0]?.similarity ?? '—'}分`,
                    `手部数据：手长 ${handData.handLength}mm · 手宽 ${handData.handWidth}mm`,
                    '包含：6维雷达图 + 规格对比表 + 优劣分析',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3370ff]" />
                      <span className="text-[12px] text-[#646a73]">{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setDownloading(true);
                    setTimeout(() => {
                      setDownloading(false);
                      setDownloaded(true);
                      window.print();
                    }, 1500);
                  }}
                  disabled={downloading}
                  className="w-full py-2.5 rounded-lg text-white text-[13px] transition-colors"
                  style={{ fontWeight: 500, background: downloading ? '#8fb8ff' : '#3370ff' }}
                >
                  {downloading ? '生成中...' : '下载 PDF 报告'}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#34c759]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-[#34c759]" />
                </div>
                <h3 className="text-[16px] text-[#1f2329] mb-2" style={{ fontWeight: 600 }}>报告已生成</h3>
                <p className="text-[12px] text-[#8f959e] mb-6">你的手感报告已准备好，请在打印对话框中选择"另存为PDF"</p>
                <button
                  onClick={() => { setShowDownloadModal(false); setDownloaded(false); }}
                  className="px-6 py-2 rounded-lg bg-[#f5f6f8] text-[#646a73] text-[13px] hover:bg-[#e8e8ed] transition-colors"
                >
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}