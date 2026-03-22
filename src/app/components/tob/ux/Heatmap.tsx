import { useState, useRef } from 'react';
import { Download, RefreshCw, Info } from 'lucide-react';

type Hand = 'right' | 'left' | 'both';
type Percentile = '5th' | '25th' | '50th' | '75th' | '95th';

// Phone dimensions in SVG coords
const PHONE_W = 160;
const PHONE_H = 320;
const PHONE_X = 60;
const PHONE_Y = 20;

// Heatmap zones definition: [x%, y%, radius%, opacity, label]
// Based on thumb reach from bottom-center grip point
function getHeatZones(hand: Hand, pct: Percentile) {
  const base = pct === '5th' ? 0.55 : pct === '25th' ? 0.65 : pct === '50th' ? 0.75 : pct === '95th' ? 0.95 : 0.85;
  const side = hand === 'right' ? 1 : hand === 'left' ? -1 : 0;
  const thumbX = PHONE_X + PHONE_W * (0.5 + side * 0.1);
  const thumbY = PHONE_Y + PHONE_H * 0.82;
  const reachY = thumbY - PHONE_H * base;

  return {
    easy: { cx: thumbX + side * PHONE_W * 0.05, cy: thumbY - PHONE_H * 0.25, rx: PHONE_W * 0.38, ry: PHONE_H * 0.22, opacity: 0.55, label: '高频触达' },
    medium: { cx: thumbX + side * PHONE_W * 0.08, cy: thumbY - PHONE_H * 0.42, rx: PHONE_W * 0.3, ry: PHONE_H * 0.18, opacity: 0.35, label: '中频触达' },
    hard: { cx: thumbX + side * PHONE_W * 0.06, cy: thumbY - PHONE_H * 0.58, rx: PHONE_W * 0.22, ry: PHONE_H * 0.14, opacity: 0.2, label: '困难触达' },
    reachY,
  };
}

const PERCENTILE_LABELS: Record<Percentile, string> = {
  '5th': '5th 百分位（小手）', '25th': '25th 百分位', '50th': '50th 百分位（中等）',
  '75th': '75th 百分位', '95th': '95th 百分位（大手）',
};

const ZONE_COLORS = { easy: '#f59e0b', medium: '#6366f1', hard: '#3b82f6' };

export function UXHeatmap() {
  const [hand, setHand] = useState<Hand>('right');
  const [percentile, setPercentile] = useState<Percentile>('50th');
  const [showGuide, setShowGuide] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const zones = getHeatZones(hand, percentile);

  function handleExport() {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const data = new XMLSerializer().serializeToString(svg);
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
    const a = document.createElement('a');
    a.href = url; a.download = `heatmap_${hand}_${percentile}.svg`; a.click();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>U1 触达热区工具</h1>
          <p className="text-slate-400 text-sm mt-0.5">基于手型百分位数据，生成拇指触达热力图，标注高/中/困难触达区</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGuide(!showGuide)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Info size={14} />{showGuide ? '隐藏说明' : '显示说明'}
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm hover:bg-amber-700 transition-colors" style={{ fontWeight: 500 }}>
            <Download size={14} /> 导出 SVG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>手型百分位区间</h3>
            <div className="space-y-1.5">
              {(['5th','25th','50th','75th','95th'] as Percentile[]).map(p => (
                <button key={p} onClick={() => setPercentile(p)}
                  className={`w-full py-2 px-3 rounded-xl text-xs text-left transition-all ${percentile === p ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'border border-slate-100 text-slate-600 hover:border-slate-200'}`}
                  style={{ fontWeight: percentile === p ? 600 : 400 }}>
                  {PERCENTILE_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>握持手势</h3>
            <div className="space-y-1.5">
              {[{ key: 'right', label: '右手握持' }, { key: 'left', label: '左手握持' }, { key: 'both', label: '双手切换' }].map(h => (
                <button key={h.key} onClick={() => setHand(h.key as Hand)}
                  className={`w-full py-2 px-3 rounded-xl text-xs text-left transition-all ${hand === h.key ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'border border-slate-100 text-slate-600 hover:border-slate-200'}`}
                  style={{ fontWeight: hand === h.key ? 600 : 400 }}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>图例说明</h3>
            <div className="space-y-2">
              {[
                { color: ZONE_COLORS.easy, label: '高频触达区', desc: '90%+ 动作落点' },
                { color: ZONE_COLORS.medium, label: '中频触达区', desc: '需轻微手部移动' },
                { color: ZONE_COLORS.hard, label: '困难触达区', desc: '需大幅移动或双手' },
              ].map(z => (
                <div key={z.label} className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0 mt-0.5 opacity-80" style={{ backgroundColor: z.color }} />
                  <div>
                    <div className="text-xs text-slate-700" style={{ fontWeight: 500 }}>{z.label}</div>
                    <div className="text-xs text-slate-400">{z.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SVG heatmap */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <h3 className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>
              拇指触达热区 — {PERCENTILE_LABELS[percentile]} · {hand === 'right' ? '右手' : hand === 'left' ? '左手' : '双手'}
            </h3>
            <button onClick={() => setPercentile('50th')} className="text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>

          <svg ref={svgRef} viewBox="0 0 280 360" width="100%" style={{ maxHeight: '480px' }}>
            <defs>
              <radialGradient id="easyGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={ZONE_COLORS.easy} stopOpacity="0.75" />
                <stop offset="100%" stopColor={ZONE_COLORS.easy} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="medGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={ZONE_COLORS.medium} stopOpacity="0.6" />
                <stop offset="100%" stopColor={ZONE_COLORS.medium} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hardGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={ZONE_COLORS.hard} stopOpacity="0.5" />
                <stop offset="100%" stopColor={ZONE_COLORS.hard} stopOpacity="0" />
              </radialGradient>
              <clipPath id="phoneClip">
                <rect x={PHONE_X} y={PHONE_Y} width={PHONE_W} height={PHONE_H} rx="22" />
              </clipPath>
            </defs>

            {/* Phone outline */}
            <rect x={PHONE_X} y={PHONE_Y} width={PHONE_W} height={PHONE_H} rx="22" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

            {/* Screen area */}
            <rect x={PHONE_X + 8} y={PHONE_Y + 40} width={PHONE_W - 16} height={PHONE_H - 70} rx="10" fill="white" stroke="#f1f5f9" strokeWidth="1" />

            {/* Status bar */}
            <rect x={PHONE_X + 8} y={PHONE_Y + 8} width={PHONE_W - 16} height={24} rx="6" fill="#f1f5f9" />
            <text x={PHONE_X + PHONE_W / 2} y={PHONE_Y + 24} textAnchor="middle" fill="#94a3b8" fontSize="9">9:41</text>

            {/* Home bar */}
            <rect x={PHONE_X + PHONE_W/2 - 25} y={PHONE_Y + PHONE_H - 20} width={50} height={5} rx="2.5" fill="#d1d5db" />

            {/* Heatmap zones clipped to phone */}
            <g clipPath="url(#phoneClip)">
              {/* Hard zone (outermost, render first) */}
              <ellipse cx={zones.hard.cx} cy={zones.hard.cy} rx={zones.hard.rx} ry={zones.hard.ry} fill="url(#hardGrad)" />
              {/* Medium zone */}
              <ellipse cx={zones.medium.cx} cy={zones.medium.cy} rx={zones.medium.rx} ry={zones.medium.ry} fill="url(#medGrad)" />
              {/* Easy zone (innermost, render last = on top) */}
              <ellipse cx={zones.easy.cx} cy={zones.easy.cy} rx={zones.easy.rx} ry={zones.easy.ry} fill="url(#easyGrad)" />
            </g>

            {/* Zone labels */}
            <text x={zones.easy.cx} y={zones.easy.cy + 4} textAnchor="middle" fill="#92400e" fontSize="9" style={{ fontWeight: '600' }}>高频触达</text>
            <text x={zones.medium.cx} y={zones.medium.cy - zones.medium.ry - 4} textAnchor="middle" fill="#3730a3" fontSize="8">中频触达</text>
            <text x={zones.hard.cx} y={zones.hard.cy - zones.hard.ry - 4} textAnchor="middle" fill="#1e40af" fontSize="8">困难触达</text>

            {/* Reach limit line */}
            <line x1={PHONE_X + 4} y1={zones.reachY} x2={PHONE_X + PHONE_W - 4} y2={zones.reachY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x={PHONE_X + PHONE_W - 6} y={zones.reachY - 4} textAnchor="end" fill="#ef4444" fontSize="8">最大触达线</text>

            {/* Thumb position indicator */}
            <circle cx={PHONE_X + PHONE_W * (0.5 + (hand === 'right' ? 0.1 : hand === 'left' ? -0.1 : 0))} cy={PHONE_Y + PHONE_H * 0.88} r="6" fill="#6366f1" fillOpacity="0.8" />
            <text x={PHONE_X + PHONE_W * (0.5 + (hand === 'right' ? 0.1 : hand === 'left' ? -0.1 : 0))} y={PHONE_Y + PHONE_H * 0.88 + 16} textAnchor="middle" fill="#4f46e5" fontSize="8">拇指</text>

            {/* Grid guidelines */}
            {[0.25, 0.5, 0.75].map((pctY, i) => (
              <line key={i} x1={PHONE_X + 8} y1={PHONE_Y + 40 + (PHONE_H - 70) * pctY} x2={PHONE_X + PHONE_W - 8} y2={PHONE_Y + 40 + (PHONE_H - 70) * pctY}
                stroke="#f1f5f9" strokeWidth="1" />
            ))}
          </svg>
        </div>

        {/* Guidance panel */}
        <div className="space-y-4">
          {showGuide && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <h3 className="text-amber-800 text-sm mb-3" style={{ fontWeight: 600 }}>设计建议</h3>
              <div className="space-y-3 text-sm text-amber-700">
                <div className="p-3 bg-white/60 rounded-lg">
                  <div style={{ fontWeight: 600 }} className="mb-1 text-xs">✅ 高频交互元素</div>
                  <p className="text-xs leading-relaxed">主操作按钮、底部导航栏应置于橙色高频触达区，避免用户移动手部</p>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <div style={{ fontWeight: 600 }} className="mb-1 text-xs">⚠️ 中频交互元素</div>
                  <p className="text-xs leading-relaxed">次级功能、通知中心等可置于紫色中频区，偶尔使用可接受</p>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <div style={{ fontWeight: 600 }} className="mb-1 text-xs">❌ 避免区域</div>
                  <p className="text-xs leading-relaxed">红线以上的蓝色区域不应放置高频操作，可放置信息展示内容</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-slate-800 text-sm mb-3" style={{ fontWeight: 600 }}>触达数据摘要</h3>
            <div className="space-y-2.5">
              {[
                { label: '高频触达区面积', value: `${Math.round(100 * parseFloat(percentile)/100 * 28)}%`, note: '屏幕总面积占比' },
                { label: '最大触达高度', value: `${Math.round(parseFloat(percentile) * 2.1 + 220)}px`, note: '距屏幕底部' },
                { label: '单手可达率', value: `${Math.round(parseFloat(percentile) * 0.6 + 55)}%`, note: '单手无移动操作' },
              ].map((d, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-500">{d.label}</div>
                    <div className="text-xs text-slate-400">{d.note}</div>
                  </div>
                  <div className="text-amber-600 text-sm" style={{ fontWeight: 700 }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
