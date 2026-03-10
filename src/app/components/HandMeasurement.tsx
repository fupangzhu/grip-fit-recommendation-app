import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Hand, Ruler, ArrowRight, ArrowLeft, RotateCcw, HelpCircle,
  X, Scan, CheckCircle2, Camera
} from 'lucide-react';
import { useAppContext, HAND_RANGES, HandMeasureKey, computePercentile, normalPDF } from './AppContext';
import { Hand3DScene } from './Hand3DScene';
import { useAuth } from './AuthContext';
import { saveMeasurement, getLatestMeasurement } from '../../lib/api/measurements';

// ─── Normal Distribution Bell Curve SVG ───
function PercentileChart({ value, p5, p95, label }: {
  value: number; p5: number; p95: number; label: string;
}) {
  const mean = (p5 + p95) / 2;
  const std = (p95 - p5) / (2 * 1.645);
  const percentile = computePercentile(value, p5, p95);

  const xMin = mean - 3.5 * std;
  const xMax = mean + 3.5 * std;
  const points: [number, number][] = [];
  const steps = 60;
  let maxY = 0;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = normalPDF(x, mean, std);
    points.push([x, y]);
    if (y > maxY) maxY = y;
  }

  const w = 240;
  const h = 70;
  const pad = { l: 10, r: 10, t: 5, b: 18 };
  const plotW = w - pad.l - pad.r;
  const plotH = h - pad.t - pad.b;

  const toSvgX = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => pad.t + plotH - (y / maxY) * plotH;

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p[0]).toFixed(1)},${toSvgY(p[1]).toFixed(1)}`).join(' ');
  const fillD = pathD + ` L${toSvgX(xMax).toFixed(1)},${toSvgY(0).toFixed(1)} L${toSvgX(xMin).toFixed(1)},${toSvgY(0).toFixed(1)} Z`;

  const valueX = toSvgX(value);
  const valueY = toSvgY(normalPDF(value, mean, std));
  const p5X = toSvgX(p5);
  const p95X = toSvgX(p95);

  return (
    <div className="mt-2">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[240px]">
        {/* Fill area */}
        <path d={fillD} fill="rgba(51,112,255,0.08)" />
        {/* Curve */}
        <path d={pathD} fill="none" stroke="#3370ff" strokeWidth="1.5" />
        {/* P5 / P95 lines */}
        <line x1={p5X} y1={pad.t} x2={p5X} y2={h - pad.b} stroke="#c9cdd4" strokeWidth="1" strokeDasharray="3 2" />
        <line x1={p95X} y1={pad.t} x2={p95X} y2={h - pad.b} stroke="#c9cdd4" strokeWidth="1" strokeDasharray="3 2" />
        {/* Current value line */}
        <line x1={valueX} y1={pad.t} x2={valueX} y2={h - pad.b} stroke="#3370ff" strokeWidth="1.5" />
        <circle cx={valueX} cy={valueY} r="3" fill="#3370ff" />
        {/* Labels */}
        <text x={p5X} y={h - 4} textAnchor="middle" fontSize="8" fill="#c9cdd4">P5</text>
        <text x={p95X} y={h - 4} textAnchor="middle" fontSize="8" fill="#c9cdd4">P95</text>
        <text x={valueX} y={h - 4} textAnchor="middle" fontSize="8" fill="#3370ff" fontWeight="600">
          P{Math.round(percentile)}
        </text>
      </svg>
      <div className="text-[10px] text-[#8f959e] mt-0.5">
        你的{label}处于人群中的 <span className="text-[#3370ff]" style={{ fontWeight: 600 }}>P{Math.round(percentile)}</span> 百分位
      </div>
    </div>
  );
}

// ─── Slider with keyboard input ───
function MeasureSlider({ fieldKey, handData, onChange }: {
  fieldKey: HandMeasureKey;
  handData: Record<string, any>;
  onChange: (key: string, value: number) => void;
}) {
  const range = HAND_RANGES[fieldKey];
  const value = handData[fieldKey] || range.default;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Allow full range for keyboard input (extend beyond P5-P95)
  const absMin = Math.max(range.p5 - 30, 40);
  const absMax = range.p95 + 30;

  const handleKeyboardSubmit = () => {
    const num = parseInt(editValue);
    if (!isNaN(num) && num >= absMin && num <= absMax) {
      onChange(fieldKey, num);
    }
    setIsEditing(false);
  };

  const isOutOfRange = value < range.p5 || value > range.p95;

  return (
    <div className="bg-white rounded-xl border border-[#e8e8ed] p-4 mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#1f2329]" style={{ fontWeight: 500 }}>{range.label}</span>
          <span className="text-[10px] text-[#8f959e]">{range.desc}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isOutOfRange && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ff9f0a]/10 text-[#ff9f0a]">超出常规范围</span>
          )}
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleKeyboardSubmit()}
                onBlur={handleKeyboardSubmit}
                autoFocus
                className="w-16 px-2 py-1 rounded border border-[#3370ff] text-[13px] text-center outline-none"
                min={absMin}
                max={absMax}
              />
              <span className="text-[11px] text-[#8f959e]">mm</span>
            </div>
          ) : (
            <button
              onClick={() => { setEditValue(String(value)); setIsEditing(true); }}
              className="text-[15px] text-[#1f2329] tabular-nums hover:text-[#3370ff] transition-colors cursor-text"
              style={{ fontWeight: 600 }}
              title="点击精确输入"
            >
              {value}<span className="text-[11px] text-[#8f959e] ml-0.5">mm</span>
            </button>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative mt-2">
        <input
          type="range"
          min={range.p5}
          max={range.p95}
          step={1}
          value={Math.max(range.p5, Math.min(range.p95, value))}
          onChange={(e) => onChange(fieldKey, parseInt(e.target.value))}
          className="w-full h-1.5 bg-[#f0f1f5] rounded-full appearance-none cursor-pointer accent-[#3370ff]"
        />
        <div className="flex justify-between text-[9px] text-[#c9cdd4] mt-0.5">
          <span>P5: {range.p5}mm</span>
          <span>P95: {range.p95}mm</span>
        </div>
      </div>

      {/* Percentile chart */}
      <PercentileChart value={value} p5={range.p5} p95={range.p95} label={range.label} />
    </div>
  );
}

// ─── Reference Info Modal ───
function ReferenceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-[500px] w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] text-[#1f2329]" style={{ fontWeight: 600 }}>数据来源说明</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#f0f1f5]">
            <X className="w-4 h-4 text-[#8f959e]" />
          </button>
        </div>
        <div className="space-y-3 text-[13px] text-[#646a73]" style={{ lineHeight: 1.7 }}>
          <p>本页手部尺寸参考范围（P5-P95）基于以下标准和文献：</p>
          <div className="bg-[#f9fafb] rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-[#3370ff] shrink-0">📄</span>
              <div>
                <div style={{ fontWeight: 500 }} className="text-[#1f2329]">GB/T 10000-2023</div>
                <div className="text-[12px] text-[#8f959e]">《中国成年人人体尺寸》国家标准</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#3370ff] shrink-0">📄</span>
              <div>
                <div style={{ fontWeight: 500 }} className="text-[#1f2329]">GB/T 26158-2010</div>
                <div className="text-[12px] text-[#8f959e]">《中国未成年人人体尺寸》</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#3370ff] shrink-0">📄</span>
              <div>
                <div style={{ fontWeight: 500 }} className="text-[#1f2329]">中国成人手部人体测量学研究</div>
                <div className="text-[12px] text-[#8f959e]">Journal of Ergonomics, 相关调研数据综合整理</div>
              </div>
            </div>
          </div>
          <p className="text-[12px] text-[#8f959e]">
            P5-P95 表示覆盖了90%中国成年人的手部尺寸分布范围。
            滑块范围为P5-P95，超出范围可点击数值后通过键盘输入。
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-lg bg-[#3370ff] text-white text-[13px] hover:bg-[#2b5bdb] transition-colors"
          style={{ fontWeight: 500 }}
        >
          知道了
        </button>
      </div>
    </div>
  );
}

// ─── Quick Select ───
const handSizes = [
  { value: 'small', label: '小手型', desc: '手长 < 170mm', data: { handLength: 165, handWidth: 76, thumbLength: 57, indexLength: 64, middleLength: 70, thumbSpan: 82 } },
  { value: 'medium', label: '中手型', desc: '170mm ≤ 手长 < 190mm', data: { handLength: 180, handWidth: 83, thumbLength: 63, indexLength: 71, middleLength: 78, thumbSpan: 95 } },
  { value: 'large', label: '大手型', desc: '手长 ≥ 190mm', data: { handLength: 195, handWidth: 90, thumbLength: 70, indexLength: 78, middleLength: 86, thumbSpan: 108 } },
];

// ─── Main Component ───
export function HandMeasurement() {
  const navigate = useNavigate();
  const { handData, setHandData, setCurrentStep, setMeasurementId } = useAppContext();
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [showRef, setShowRef] = useState(false);
  const [saving, setSaving] = useState(false);

  // Listen to iframe postMessage
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PALMSCAN_RESULT') {
        const payload = e.data.payload;
        if (payload) {
          setHandData({
            ...handData,
            handLength: Math.round(payload.handLength || handData.handLength),
            handWidth: Math.round(payload.palmWidth || handData.handWidth),
            thumbLength: Math.round(payload.thumbLength || handData.thumbLength),
            indexLength: Math.round(payload.indexLength || handData.indexLength),
            middleLength: Math.round(payload.middleLength || handData.middleLength),
            thumbSpan: Math.round(payload.thumbSpan || handData.thumbSpan),
          });
          // Switch back to manual tab to show the results
          setActiveTab('manual');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handData, setHandData]);

  // 若已登录，加载最近一次测量数据作为预填
  useEffect(() => {
    if (isLoggedIn && user) {
      getLatestMeasurement(user.id).then((m) => {
        if (m) {
          setHandData({
            ...handData,
            handLength: m.handLength,
            handWidth: m.handWidth,
            thumbLength: m.thumbLength,
            indexLength: m.indexLength,
            middleLength: m.middleLength,
            thumbSpan: m.thumbSpan,
            handSize: m.handSize,
          });
        }
      });
    }
  }, [isLoggedIn, user]);

  const handleChange = (key: string, value: number) => {
    setHandData({ ...handData, [key]: value });
  };

  const determineHandSize = () => {
    if (handData.handLength < 170) return 'small';
    if (handData.handLength < 190) return 'medium';
    return 'large';
  };

  const handleQuickSelect = (size: typeof handSizes[0]) => {
    setHandData({ ...handData, ...size.data, handSize: size.value });
  };

  const handleNext = async () => {
    const sz = determineHandSize();
    const updatedData = { ...handData, handSize: sz };
    setHandData(updatedData);

    // 如已登录，保存测量数据到 Supabase
    if (isLoggedIn && user) {
      setSaving(true);
      try {
        const { data, error } = await saveMeasurement(user.id, updatedData);
        if (data && !error) {
          setMeasurementId(data.id);
        }
      } catch (err) {
        console.error('保存测量数据失败:', err);
      } finally {
        setSaving(false);
      }
    }

    setCurrentStep(2);
    navigate('/phone-select');
  };

  const handleReset = () => {
    const defaults: Record<string, number> = {};
    (Object.keys(HAND_RANGES) as HandMeasureKey[]).forEach((k) => {
      defaults[k] = HAND_RANGES[k].default;
    });
    setHandData({ ...handData, ...defaults, handSize: 'medium' });
  };

  const measureKeys = Object.keys(HAND_RANGES) as HandMeasureKey[];

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12px] text-[#8f959e] mb-3">
          <span className="cursor-pointer hover:text-[#3370ff]" onClick={() => navigate('/')}>首页</span>
          <span>/</span>
          <span className="text-[#1f2329]">手部测量</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[24px] text-[#1f2329] mb-2" style={{ fontWeight: 600 }}>
              手部数据采集
            </h1>
            <p className="text-[14px] text-[#8f959e]">
              已预填中国成年人平均值，拖动滑块调整到你的实际尺寸
              <button onClick={() => setShowRef(true)} className="inline-flex items-center gap-0.5 ml-2 text-[#3370ff] hover:underline">
                <HelpCircle className="w-3 h-3" /> 数据来源
              </button>
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#646a73] hover:bg-[#f0f1f5] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-1 bg-[#f0f1f5] p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab('camera')}
          className={`px-4 py-2 rounded-md text-[13px] transition-all ${activeTab === 'camera' ? 'bg-white text-[#1f2329] shadow-sm' : 'text-[#646a73]'
            }`}
          style={{ fontWeight: 500 }}
        >
          <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" />智能识别</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 rounded-md text-[13px] transition-all ${activeTab === 'manual' ? 'bg-white text-[#1f2329] shadow-sm' : 'text-[#646a73]'
            }`}
          style={{ fontWeight: 500 }}
        >
          <span className="flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" />滑块微调</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Quick Select Always Visible */}
          <div className="bg-white rounded-xl border border-[#e8e8ed] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] text-[#1f2329]" style={{ fontWeight: 600 }}>预设手型快速选择</p>
              <span className="text-[12px] text-[#8f959e]">一键加载标准数据</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {handSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleQuickSelect(size)}
                  className={`flex flex-col items-center gap-2.5 p-3 rounded-xl border transition-all text-center ${handData.handSize === size.value
                    ? 'border-[#3370ff] bg-[#3370ff]/5 ring-1 ring-[#3370ff]/20'
                    : 'border-[#e8e8ed] hover:border-[#c9cdd4] hover:bg-[#f9fafb]'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${handData.handSize === size.value ? 'bg-[#3370ff]/10 text-[#3370ff]' : 'bg-[#f0f1f5] text-[#8f959e]'
                    }`}>
                    <Hand className="w-5 h-5" style={{ transform: size.value === 'small' ? 'scale(0.85)' : size.value === 'large' ? 'scale(1.15)' : 'scale(1)' }} />
                  </div>
                  <div>
                    <div className="text-[13px] text-[#1f2329]" style={{ fontWeight: 500 }}>{size.label}</div>
                    <div className="text-[11px] text-[#8f959e] mt-0.5">{size.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'camera' && (
            <div className="bg-white rounded-xl border border-[#e8e8ed] overflow-hidden" style={{ height: '700px' }}>
              <iframe
                src="/palmscan/index.html?v=0311"
                className="w-full h-full border-0"
                allow="camera"
                title="AI Hand Measurement"
              ></iframe>
            </div>
          )}

          {activeTab === 'manual' && (
            <div>
              {measureKeys.map((key) => (
                <MeasureSlider
                  key={key}
                  fieldKey={key}
                  handData={handData}
                  onChange={handleChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: 3D Hand Preview */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-white rounded-xl border border-[#e8e8ed] overflow-hidden sticky top-6">
            <div className="p-3 border-b border-[#f0f1f5] flex items-center justify-between">
              <span className="text-[13px] text-[#1f2329]" style={{ fontWeight: 500 }}>3D 手部预览</span>
              <span className="text-[10px] text-[#8f959e]">拖拽旋转</span>
            </div>
            <div className="h-[320px] bg-gradient-to-b from-[#fafbfd] to-[#f0f2f5]">
              <Hand3DScene
                handData={handData}
                opacity={0.6}
                showPressureZones={false}
                autoRotate={true}
                interactive={true}
              />
            </div>
            <div className="p-3 bg-[#f9fafb] border-t border-[#f0f1f5]">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[14px] text-[#1f2329] tabular-nums" style={{ fontWeight: 600 }}>{handData.handLength}</div>
                  <div className="text-[10px] text-[#8f959e]">手长(mm)</div>
                </div>
                <div>
                  <div className="text-[14px] text-[#1f2329] tabular-nums" style={{ fontWeight: 600 }}>{handData.handWidth}</div>
                  <div className="text-[10px] text-[#8f959e]">手宽(mm)</div>
                </div>
                <div>
                  <div className="text-[14px] text-[#3370ff] tabular-nums" style={{ fontWeight: 600 }}>
                    {determineHandSize() === 'small' ? '小' : determineHandSize() === 'medium' ? '中' : '大'}
                  </div>
                  <div className="text-[10px] text-[#8f959e]">手型</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#e8e8ed] text-[14px] text-[#646a73] hover:bg-[#f5f6f8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#3370ff] text-white text-[14px] hover:bg-[#2b5bdb] transition-colors"
          style={{ fontWeight: 500 }}
        >
          下一步：选择机型 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {showRef && <ReferenceModal onClose={() => setShowRef(false)} />}
    </div>
  );
}