import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight, ArrowLeft, Ruler, Camera,
  ChevronRight, ChevronLeft, Eye, EyeOff, Settings2,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { useAppContext } from './AppContext';
import { Phone3DViewer, PhoneConfig, PhoneType, CameraLayout, GripMode } from './Phone3DViewer';

function computeIdealScores(config: PhoneConfig, gripMode: GripMode, handSize: string) {
  let grip = 80, reach = 80, comfort = 80, light = 80, oneHand = 80, pocket = 80;
  if (config.width <= 72) { grip += 8; reach += 10; oneHand += 12; pocket += 5; }
  else if (config.width <= 75) { grip += 3; reach += 3; oneHand += 3; }
  else { grip -= 5; reach -= 8; oneHand -= 10; }
  if (config.weight <= 175) { light += 15; comfort += 8; }
  else if (config.weight <= 200) { light += 5; comfort += 3; }
  else if (config.weight > 220) { light -= 10; comfort -= 8; }
  if (config.thickness <= 7.5) { grip += 5; pocket += 8; }
  else if (config.thickness > 9) { grip -= 5; pocket -= 8; }
  if (config.cornerRadius >= 8) { grip += 5; comfort += 5; }
  if (handSize === 'large') { reach += 5; grip += 3; }
  if (handSize === 'small') { reach -= 5; grip -= 3; }
  if (gripMode.startsWith('dual')) { oneHand -= 15; comfort += 5; }
  const c = (v: number) => Math.max(40, Math.min(100, v));
  return { grip: c(grip), reach: c(reach), comfort: c(comfort), light: c(light), oneHand: c(oneHand), pocket: c(pocket) };
}

// Compact slider for the side panel
function MiniSlider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-[#646a73]">{label}</span>
        <span className="text-[11px] text-[#1f2329] tabular-nums" style={{ fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-[#f0f1f5] rounded-full appearance-none cursor-pointer accent-[#3370ff]" />
    </div>
  );
}

export function ParamPreview() {
  const navigate = useNavigate();
  const { handData } = useAppContext();

  // Phone config state
  const [phoneType, setPhoneType] = useState<PhoneType>('bar');
  const [width, setWidth] = useState(72);
  const [height, setHeight] = useState(152);
  const [thickness, setThickness] = useState(8.2);
  const [cornerRadius, setCornerRadius] = useState(8);
  const [weight, setWeight] = useState(195);
  const [cameraLayout, setCameraLayout] = useState<CameraLayout>('triple-v');
  const [cameraBumpHeight, setCameraBumpHeight] = useState(2);
  const [isUnfolded, setIsUnfolded] = useState(false);

  // Grip mode
  const [gripCategory, setGripCategory] = useState<'single' | 'dual'>('single');
  const [gripSub, setGripSub] = useState<'normal' | 'pinky' | 'portrait' | 'landscape'>('normal');
  const gripMode: GripMode = gripCategory === 'single'
    ? (gripSub === 'pinky' ? 'single-pinky' : 'single-normal')
    : (gripSub === 'landscape' ? 'dual-landscape' : 'dual-portrait');

  // UI state
  const [showHand, setShowHand] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const phoneConfig: PhoneConfig = {
    type: phoneType, width, height, thickness, cornerRadius, weight,
    cameraLayout, cameraBumpHeight, isUnfolded,
  };

  const idealScores = useMemo(
    () => computeIdealScores(phoneConfig, gripMode, handData.handSize || 'medium'),
    [phoneConfig, gripMode, handData.handSize]
  );

  const radarData = useMemo(() => [
    { subject: '握持感', value: idealScores.grip },
    { subject: '可达性', value: idealScores.reach },
    { subject: '舒适度', value: idealScores.comfort },
    { subject: '轻便性', value: idealScores.light },
    { subject: '单手操控', value: idealScores.oneHand },
    { subject: '口袋友好', value: idealScores.pocket },
  ], [idealScores]);

  return (
    <div className="relative h-[calc(100vh-56px)] overflow-hidden bg-gradient-to-br from-[#f8faff] via-[#f5f6f8] to-[#eef1f6]">
      {/* ─── Main 3D Viewport ─── */}
      <div className="absolute inset-0">
        <Phone3DViewer
          config={phoneConfig}
          gripMode={gripMode}
          handData={handData}
          showHand={showHand}
          showPressure={showHand}
          hoveredZone={hoveredZone}
          onZoneHover={setHoveredZone}
          autoRotate={!hoveredZone}
          height="100%"
        />
      </div>

      {/* ─── Top Bar ─── */}
      <div className="absolute top-0 left-0 right-0 z-20 px-5 py-3 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2 text-[12px] text-[#8f959e] mb-0.5">
            <span className="cursor-pointer hover:text-[#3370ff]" onClick={() => navigate('/')}>首页</span>
            <span>/</span>
            <span className="text-[#1f2329]">手感预览</span>
          </div>
          <h1 className="text-[18px] text-[#1f2329]" style={{ fontWeight: 600 }}>3D 手感预览</h1>
        </div>
        <button
          onClick={() => navigate('/grip-report')}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3370ff] text-white text-[13px] hover:bg-[#2b5bdb] transition-colors shadow-lg"
          style={{ fontWeight: 500 }}
        >
          查看手感报告 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Left Bottom: Radar Chart (only when no zone hovered) ─── */}
      {!hoveredZone && (
        <div className="absolute bottom-20 left-4 z-20 w-[220px] bg-white/90 backdrop-blur-md rounded-xl border border-[#e8e8ed]/80 p-3 shadow-lg">
          <div className="text-[11px] text-[#8f959e] mb-1" style={{ fontWeight: 500 }}>手感评分雷达图</div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#e8e8ed" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8f959e', fontSize: 9 }} />
                <Radar dataKey="value" stroke="#3370ff" fill="#3370ff" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {[
              { label: '握持', val: idealScores.grip, color: '#3370ff' },
              { label: '可达', val: idealScores.reach, color: '#7b61ff' },
              { label: '舒适', val: idealScores.comfort, color: '#34c759' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[13px] tabular-nums" style={{ fontWeight: 700, color: s.color }}>{s.val}</div>
                <div className="text-[8px] text-[#8f959e]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Bottom Center: Show/Hide & Grip Mode ─── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-auto">
        {/* Show/Hide hand */}
        <button
          onClick={() => setShowHand(!showHand)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-md shadow-sm transition-all ${
            showHand ? 'bg-white/90 border-[#3370ff]/20 text-[#3370ff]' : 'bg-white/70 border-[#e8e8ed] text-[#8f959e]'
          }`}
        >
          {showHand ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="text-[12px]" style={{ fontWeight: 500 }}>{showHand ? '隐藏手部' : '显示手部'}</span>
        </button>

        {/* Grip mode quick switch */}
        <div className="flex gap-1 bg-white/90 backdrop-blur-md rounded-xl border border-[#e8e8ed] p-1">
          {[
            { cat: 'single' as const, sub: 'normal' as const, label: '单手' },
            { cat: 'single' as const, sub: 'pinky' as const, label: '托底' },
            { cat: 'dual' as const, sub: 'portrait' as const, label: '双手竖' },
            { cat: 'dual' as const, sub: 'landscape' as const, label: '双手横' },
          ].map((g) => {
            const active = gripCategory === g.cat && gripSub === g.sub;
            return (
              <button
                key={g.label}
                onClick={() => { setGripCategory(g.cat); setGripSub(g.sub); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] transition-all ${
                  active ? 'bg-[#3370ff] text-white shadow-sm' : 'text-[#646a73] hover:bg-[#f0f1f5]'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Fold state toggle */}
        {phoneType !== 'bar' && (
          <div className="flex gap-1 bg-white/90 backdrop-blur-md rounded-xl border border-[#e8e8ed] p-1">
            <button onClick={() => setIsUnfolded(false)}
              className={`px-3 py-1.5 rounded-lg text-[11px] transition-all ${!isUnfolded ? 'bg-[#3370ff] text-white' : 'text-[#646a73]'}`}>
              折叠
            </button>
            <button onClick={() => setIsUnfolded(true)}
              className={`px-3 py-1.5 rounded-lg text-[11px] transition-all ${isUnfolded ? 'bg-[#3370ff] text-white' : 'text-[#646a73]'}`}>
              展开
            </button>
          </div>
        )}
      </div>

      {/* ─── Right Panel Toggle ─── */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="absolute top-1/2 -translate-y-1/2 z-30 right-0 w-6 h-16 bg-white/90 backdrop-blur-md border border-r-0 border-[#e8e8ed] rounded-l-lg flex items-center justify-center hover:bg-[#f5f6f8] transition-colors shadow-sm pointer-events-auto"
      >
        {showPanel ? <ChevronRight className="w-3.5 h-3.5 text-[#646a73]" /> : <ChevronLeft className="w-3.5 h-3.5 text-[#646a73]" />}
      </button>

      {/* ─── Right Collapsible Panel ─── */}
      <div className={`absolute top-0 bottom-0 right-0 z-20 w-[300px] bg-white/95 backdrop-blur-md border-l border-[#e8e8ed] overflow-y-auto transition-transform duration-300 ${
        showPanel ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[#3370ff]" />
              <span className="text-[14px] text-[#1f2329]" style={{ fontWeight: 600 }}>参数调节</span>
            </div>
            <button onClick={() => setShowPanel(false)} className="p-1 rounded-lg hover:bg-[#f0f1f5]">
              <ChevronRight className="w-4 h-4 text-[#8f959e]" />
            </button>
          </div>

          {/* Phone Type */}
          <div className="mb-4">
            <span className="text-[11px] text-[#8f959e] mb-2 block">机型形态</span>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { val: 'bar' as PhoneType, label: '📱 直板' },
                { val: 'flip' as PhoneType, label: '🔄 翻盖' },
                { val: 'fold' as PhoneType, label: '📖 折叠' },
              ]).map((t) => (
                <button key={t.val} onClick={() => setPhoneType(t.val)}
                  className={`py-2 rounded-lg border text-[11px] transition-all ${
                    phoneType === t.val ? 'border-[#3370ff] bg-[#3370ff]/5 text-[#3370ff]' : 'border-[#e8e8ed] text-[#646a73]'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="mb-4">
            <span className="text-[11px] text-[#8f959e] mb-2 flex items-center gap-1"><Ruler className="w-3 h-3" />尺寸参数</span>
            <MiniSlider label="宽度" value={width} min={60} max={85} step={0.5} unit="mm" onChange={setWidth} />
            <MiniSlider label="高度" value={height} min={130} max={175} step={0.5} unit="mm" onChange={setHeight} />
            <MiniSlider label="厚度" value={thickness} min={6} max={12} step={0.1} unit="mm" onChange={setThickness} />
            <MiniSlider label="圆角" value={cornerRadius} min={2} max={16} step={0.5} unit="mm" onChange={setCornerRadius} />
            <MiniSlider label="重量" value={weight} min={130} max={270} step={1} unit="g" onChange={setWeight} />
          </div>

          {/* Camera */}
          <div className="mb-4">
            <span className="text-[11px] text-[#8f959e] mb-2 flex items-center gap-1"><Camera className="w-3 h-3" />后摄模组</span>
            <div className="flex flex-wrap gap-1 mb-2">
              {([
                { val: 'single' as CameraLayout, l: '单摄' },
                { val: 'dual-v' as CameraLayout, l: '双摄' },
                { val: 'triple-v' as CameraLayout, l: '三摄' },
                { val: 'square-island' as CameraLayout, l: '方形' },
                { val: 'circle-island' as CameraLayout, l: '圆形' },
              ]).map((c) => (
                <button key={c.val} onClick={() => setCameraLayout(c.val)}
                  className={`px-2 py-1 rounded-md border text-[10px] ${
                    cameraLayout === c.val ? 'border-[#3370ff] bg-[#3370ff]/5 text-[#3370ff]' : 'border-[#e8e8ed] text-[#8f959e]'
                  }`}>{c.l}</button>
              ))}
            </div>
            <MiniSlider label="凸起高度" value={cameraBumpHeight} min={0} max={5} step={0.5} unit="mm" onChange={setCameraBumpHeight} />
          </div>

          {/* Dim info */}
          <div className="p-3 rounded-lg bg-[#f9fafb] text-[10px] text-[#8f959e] space-y-1">
            <div className="flex justify-between"><span>尺寸</span><span className="text-[#1f2329]">{width}×{height}×{thickness}mm</span></div>
            <div className="flex justify-between"><span>重量</span><span className="text-[#1f2329]">{weight}g</span></div>
            <div className="flex justify-between"><span>圆角</span><span className="text-[#1f2329]">R{cornerRadius}</span></div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Left: Navigation ─── */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        <button
          onClick={() => navigate('/model-presets')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-md border border-[#e8e8ed] text-[12px] text-[#646a73] hover:bg-white transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 模型预设
        </button>
      </div>

      {/* ─── Bottom Right: Dimension label ─── */}
      <div className="absolute bottom-4 right-4 z-10 text-[10px] text-[#c9cdd4]">
        拖拽旋转 · 滚轮缩放
      </div>
    </div>
  );
}