import React, { useState, useRef, useCallback, useMemo } from 'react';
import { HandData } from './AppContext';

export const PRESSURE_ZONES = [
  { id: 'palm-center', label: '掌心', rank: 'No.1 主受力区', pressure: '35%', color: '#f54a45', x: 0.45, y: 0.45 },
  { id: 'index', label: '食指', rank: 'No.2 次受力区', pressure: '22%', color: '#ff9f0a', x: 0.38, y: 0.12 },
  { id: 'thenar', label: '鱼际', rank: 'No.3 辅受力区', pressure: '18%', color: '#3370ff', x: 0.7, y: 0.48 },
  { id: 'pinky', label: '小拇指', rank: 'No.4 支撑区', pressure: '12%', color: '#7b61ff', x: 0.15, y: 0.35 },
  { id: 'thumb', label: '拇指', rank: 'No.5 操控区', pressure: '13%', color: '#34c759', x: 0.78, y: 0.25 },
];

interface Hand3DSceneProps {
  handData: HandData;
  opacity?: number;
  showPressureZones?: boolean;
  onZoneHover?: (id: string | null) => void;
  hoveredZone?: string | null;
  autoRotate?: boolean;
  interactive?: boolean;
  height?: string;
}

export function Hand3DScene({
  handData, opacity = 0.55, showPressureZones = false,
  onZoneHover, hoveredZone, height = '100%',
}: Hand3DSceneProps) {
  const [rotation, setRotation] = useState({ x: -8, y: -15 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, rotX: rotation.x, rotY: rotation.y };
  }, [rotation]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotation({
      x: Math.max(-30, Math.min(30, dragStart.current.rotX + dy * 0.3)),
      y: dragStart.current.rotY + dx * 0.3,
    });
  }, [isDragging]);

  const scale = handData.handLength / 180;
  const palmW = 75 * (handData.handWidth / 83);
  const palmH = 95 * scale;
  const color = `rgba(240,200,160,${opacity})`;
  const borderColor = `rgba(200,160,120,${opacity * 0.6})`;

  const fingers = useMemo(() => [
    { name: 'index', w: 13, h: handData.indexLength * 0.85, x: palmW * 0.15, bot: 0, rot: -2 },
    { name: 'middle', w: 13, h: handData.middleLength * 0.85, x: palmW * 0.38, bot: 0, rot: 0 },
    { name: 'ring', w: 12, h: (handData.indexLength - 3) * 0.83, x: palmW * 0.6, bot: 2, rot: 2 },
    { name: 'pinky', w: 11, h: (handData.indexLength - 12) * 0.8, x: palmW * 0.8, bot: 8, rot: 4 },
  ], [handData, palmW]);

  const thumbH = handData.thumbLength * 0.82;

  return (
    <div style={{ width: '100%', height, position: 'relative' }}
      className="select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* 3D Hand */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '800px' }}>
        <div style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s',
          position: 'relative',
          width: palmW + 40, height: palmH + thumbH + 30,
        }}>
          {/* Palm */}
          <div style={{
            position: 'absolute',
            left: 20, bottom: 0,
            width: palmW, height: palmH,
            borderRadius: '8px 8px 12px 18px',
            background: `linear-gradient(135deg, rgba(245,210,175,${opacity}), rgba(230,190,150,${opacity}))`,
            border: `1.5px solid ${borderColor}`,
            transform: 'translateZ(5px)',
            boxShadow: `0 4px 12px rgba(200,160,120,${opacity * 0.3})`,
          }} />

          {/* Palm back face */}
          <div style={{
            position: 'absolute',
            left: 20, bottom: 0,
            width: palmW, height: palmH,
            borderRadius: '8px 8px 12px 18px',
            background: `linear-gradient(135deg, rgba(220,180,140,${opacity * 0.8}), rgba(200,160,120,${opacity * 0.8}))`,
            border: `1.5px solid ${borderColor}`,
            transform: 'translateZ(-5px) rotateY(180deg)',
          }} />

          {/* Fingers */}
          {fingers.map((f) => (
            <div key={f.name} style={{
              position: 'absolute',
              left: 20 + f.x - f.w / 2,
              bottom: palmH - 5 + f.bot,
              width: f.w,
              height: f.h,
              borderRadius: `${f.w / 2}px ${f.w / 2}px 3px 3px`,
              background: `linear-gradient(180deg, rgba(240,205,170,${opacity}), rgba(250,215,180,${opacity}))`,
              border: `1.5px solid ${borderColor}`,
              transform: `translateZ(4px) rotate(${f.rot}deg)`,
              transformOrigin: 'bottom center',
            }}>
              {/* Finger joints */}
              <div style={{
                position: 'absolute', left: '15%', right: '15%',
                top: '33%', height: 1,
                background: `rgba(180,140,100,${opacity * 0.4})`,
                borderRadius: 1,
              }} />
              <div style={{
                position: 'absolute', left: '20%', right: '20%',
                top: '63%', height: 1,
                background: `rgba(180,140,100,${opacity * 0.4})`,
                borderRadius: 1,
              }} />
            </div>
          ))}

          {/* Thumb */}
          <div style={{
            position: 'absolute',
            left: 20 + palmW - 5,
            bottom: palmH * 0.15,
            width: 16,
            height: thumbH,
            borderRadius: '8px 8px 4px 4px',
            background: `linear-gradient(160deg, rgba(245,210,175,${opacity}), rgba(235,195,160,${opacity}))`,
            border: `1.5px solid ${borderColor}`,
            transform: 'translateZ(6px) rotate(-25deg)',
            transformOrigin: 'bottom left',
          }}>
            <div style={{
              position: 'absolute', left: '15%', right: '15%',
              top: '45%', height: 1,
              background: `rgba(180,140,100,${opacity * 0.4})`,
            }} />
          </div>

          {/* Pressure zones */}
          {showPressureZones && PRESSURE_ZONES.map((zone) => {
            const zx = 20 + zone.x * palmW;
            const zy = zone.y * (palmH + thumbH * 0.3);
            return (
              <div
                key={zone.id}
                onMouseEnter={() => onZoneHover?.(zone.id)}
                onMouseLeave={() => onZoneHover?.(null)}
                style={{
                  position: 'absolute',
                  left: zx - 14, bottom: zy - 14,
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: hoveredZone === zone.id
                    ? `radial-gradient(circle, ${zone.color}40, ${zone.color}15)`
                    : `radial-gradient(circle, ${zone.color}15, transparent)`,
                  border: hoveredZone === zone.id ? `2px solid ${zone.color}60` : `1px dashed ${zone.color}30`,
                  transform: 'translateZ(12px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {hoveredZone === zone.id && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-[#e8e8ed] px-3 py-2 whitespace-nowrap z-50"
                    style={{ transform: 'translateX(-50%) translateZ(20px)' }}>
                    <div className="text-[10px] text-[#8f959e]">{zone.rank}</div>
                    <div className="text-[12px] text-[#1f2329]" style={{ fontWeight: 600 }}>{zone.label}</div>
                    <div className="text-[10px]" style={{ color: zone.color }}>压力分布 {zone.pressure}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-2 right-3 text-[9px] text-[#c9cdd4]">拖拽旋转</div>
    </div>
  );
}
