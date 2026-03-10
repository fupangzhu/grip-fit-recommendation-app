import React, { useState, useRef, useCallback, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { HandData } from './AppContext';

export type PhoneType = 'bar' | 'flip' | 'fold';
export type CameraLayout = 'single' | 'dual-v' | 'triple-v' | 'square-island' | 'circle-island';
export type GripMode = 'single-normal' | 'single-pinky' | 'dual-portrait' | 'dual-landscape';

export interface PhoneConfig {
  type: PhoneType;
  width: number; height: number; thickness: number;
  cornerRadius: number; weight: number;
  cameraLayout: CameraLayout;
  cameraBumpHeight: number;
  isUnfolded: boolean;
}

const PRESSURE_ZONES = [
  { id: 'palm-center', label: '掌心', rank: 'No.1 主受力区', pressure: '35%', color: '#f54a45', ox: 0.6, oy: 0.55 },
  { id: 'index', label: '食指', rank: 'No.2 次受力区', pressure: '22%', color: '#ff9f0a', ox: 0.85, oy: 0.25 },
  { id: 'thenar', label: '鱼际', rank: 'No.3 辅受力区', pressure: '18%', color: '#3370ff', ox: 0.55, oy: 0.7 },
  { id: 'pinky', label: '小拇指', rank: 'No.4 支撑区', pressure: '12%', color: '#7b61ff', ox: 0.75, oy: 0.85 },
  { id: 'thumb', label: '拇指', rank: 'No.5 操控区', pressure: '13%', color: '#34c759', ox: 0.15, oy: 0.45 },
];

const SCALE = 2.2;

interface Phone3DViewerProps {
  config: PhoneConfig;
  gripMode: GripMode;
  handData: HandData;
  showHand?: boolean;
  showPressure?: boolean;
  hoveredZone?: string | null;
  onZoneHover?: (id: string | null) => void;
  autoRotate?: boolean;
  height?: string;
}

export function Phone3DViewer({
  config, gripMode, handData,
  showHand = true, showPressure = false,
  hoveredZone = null, onZoneHover = () => {},
  autoRotate = false, height = '100%',
}: Phone3DViewerProps) {
  const [rotation, setRotation] = useState({ x: -12, y: -22 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, rotX: rotation.x, rotY: rotation.y };
  }, [rotation]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setRotation({
      x: Math.max(-40, Math.min(40, dragStart.current.rotX + (e.clientY - dragStart.current.y) * 0.3)),
      y: dragStart.current.rotY + (e.clientX - dragStart.current.x) * 0.3,
    });
  }, [isDragging]);

  const isFlip = config.type === 'flip';
  const isFold = config.type === 'fold';
  const unfolded = config.isUnfolded;

  const pw = config.width * SCALE;
  const ph = isFlip ? (unfolded ? config.height * SCALE : config.height * SCALE * 0.52) : config.height * SCALE;
  const actualPw = isFold ? (unfolded ? pw * 2 + 4 : pw) : pw;
  const pd = (!unfolded && (isFlip || isFold)) ? config.thickness * SCALE * 2 : config.thickness * SCALE;
  const cr = config.cornerRadius * SCALE;
  const cameraBump = config.cameraBumpHeight * SCALE;

  const isLandscape = gripMode === 'dual-landscape';
  const displayW = isLandscape ? ph : actualPw;
  const displayH = isLandscape ? actualPw : ph;

  const renderCameraModule = () => {
    const layout = config.cameraLayout;
    const lensSize = Math.min(16, actualPw * 0.1);
    const lensCount = layout === 'single' ? 1 : layout === 'dual-v' ? 2 : 3;
    const isSquare = layout === 'square-island';
    const isCircle = layout === 'circle-island';
    const moduleW = isSquare || isCircle ? lensSize * 3.5 : lensSize * 2.2;
    const moduleH = isSquare || isCircle ? lensSize * 3.5 : lensSize * (1 + lensCount * 1.3);

    return (
      <div style={{
        position: 'absolute', top: '10%', left: '8%',
        width: moduleW, height: moduleH,
        borderRadius: isCircle ? '50%' : cr * 0.5,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.12), rgba(0,0,0,0.06))',
        border: '1px solid rgba(0,0,0,0.08)',
        transform: `translateZ(${cameraBump}px)`,
        display: 'flex', flexDirection: isSquare ? 'row' : 'column',
        flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
        gap: 4, padding: 6,
      }}>
        {Array.from({ length: lensCount }).map((_, i) => (
          <div key={i} style={{
            width: lensSize, height: lensSize, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #4a4a5a, #1a1a2a)',
            border: '2px solid rgba(80,80,100,0.5)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
          }} />
        ))}
      </div>
    );
  };

  const renderHandOverlay = () => {
    if (!showHand) return null;
    const handScale = handData.handLength / 180;
    const fingerW = 11 * handScale;
    const opacity = 0.35;
    const handColor = `rgba(245,210,175,${opacity})`;
    const handBorder = `1px solid rgba(200,160,120,${opacity * 0.7})`;

    if (gripMode === 'single-normal' || gripMode === 'single-pinky') {
      return (
        <>
          {/* Fingers on right edge */}
          {[0.2, 0.32, 0.44, 0.56].map((t, i) => (
            <div key={i} style={{
              position: 'absolute', right: -fingerW * 2.2,
              top: `${t * 100}%`, width: fingerW, height: fingerW * 2.6,
              borderRadius: fingerW / 2,
              background: `linear-gradient(90deg, ${handColor}, rgba(240,195,160,${opacity * 0.8}))`,
              border: handBorder, transform: `rotate(${-3 + i * 2}deg)`,
            }} />
          ))}
          {/* Palm */}
          <div style={{
            position: 'absolute', right: -fingerW * 1.2,
            top: '18%', width: fingerW * 2.5 * handScale, height: displayH * 0.4,
            borderRadius: `${fingerW}px ${fingerW * 2}px ${fingerW * 2}px ${fingerW}px`,
            background: `linear-gradient(135deg, rgba(245,210,175,${opacity * 0.7}), rgba(235,195,160,${opacity * 0.4}))`,
            border: handBorder,
          }} />
          {/* Thumb on left */}
          <div style={{
            position: 'absolute', left: -fingerW,
            top: '38%', width: fingerW * 1.2, height: fingerW * 3.5,
            borderRadius: fingerW,
            background: `linear-gradient(180deg, ${handColor}, rgba(235,195,160,${opacity * 0.7}))`,
            border: handBorder, transform: 'rotate(15deg)', transformOrigin: 'bottom center',
          }} />
          {/* Pinky shelf */}
          {gripMode === 'single-pinky' && (
            <div style={{
              position: 'absolute', bottom: -fingerW * 1.3,
              left: '15%', width: displayW * 0.5, height: fingerW * 1.4,
              borderRadius: fingerW / 2,
              background: `linear-gradient(0deg, ${handColor}, rgba(235,195,160,${opacity * 0.6}))`,
              border: handBorder, transform: 'rotate(-3deg)',
            }} />
          )}
        </>
      );
    }

    if (gripMode === 'dual-portrait' || gripMode === 'dual-landscape') {
      return (
        <>
          {[-1, 1].map((side) => (
            <div key={side} style={{
              position: 'absolute',
              ...(side === -1 ? { left: -fingerW * 2.5 } : { right: -fingerW * 2.5 }),
              top: '25%', bottom: '25%', width: fingerW * 2.5,
            }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  position: 'absolute',
                  [side === -1 ? 'right' : 'left']: 2 + i * 1.5,
                  top: `${15 + i * 18}%`, width: fingerW, height: fingerW * 2.5,
                  borderRadius: fingerW / 2,
                  background: `linear-gradient(${side === -1 ? 270 : 90}deg, ${handColor}, rgba(240,195,160,${opacity * 0.7}))`,
                  border: handBorder,
                }} />
              ))}
            </div>
          ))}
        </>
      );
    }
    return null;
  };

  const renderPressureZones = () => {
    if (!showPressure || !showHand) return null;
    return PRESSURE_ZONES.map((zone) => (
      <div
        key={zone.id}
        onMouseEnter={() => onZoneHover(zone.id)}
        onMouseLeave={() => onZoneHover(null)}
        style={{
          position: 'absolute',
          left: `${zone.ox * 100}%`, top: `${zone.oy * 100}%`,
          width: 24, height: 24, marginLeft: -12, marginTop: -12,
          borderRadius: '50%',
          background: hoveredZone === zone.id
            ? `radial-gradient(circle, ${zone.color}50, ${zone.color}20)`
            : `radial-gradient(circle, ${zone.color}18, transparent)`,
          border: hoveredZone === zone.id ? `2px solid ${zone.color}80` : `1.5px dashed ${zone.color}35`,
          cursor: 'pointer', transition: 'all 0.2s', zIndex: 30,
        }}
      >
        {hoveredZone === zone.id && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-[#e8e8ed] px-3 py-2 whitespace-nowrap z-50">
            <div className="text-[10px] text-[#8f959e]">{zone.rank}</div>
            <div className="text-[12px] text-[#1f2329]" style={{ fontWeight: 600 }}>{zone.label}</div>
            <div className="text-[10px]" style={{ color: zone.color }}>压力分布 {zone.pressure}</div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div
      style={{ width: '100%', height, position: 'relative', minHeight: 300 }}
      className="select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* 3D Scene */}
      <div className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1200px' }}>
        <div style={{
          transformStyle: 'preserve-3d',
          transform: `${isLandscape ? 'rotate(90deg) ' : ''}rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          position: 'relative', width: displayW, height: displayH,
        }}>
          {/* Front face */}
          <div style={{
            position: 'absolute', width: displayW, height: displayH, borderRadius: cr,
            background: 'linear-gradient(180deg, #0f0f1a, #1a1a2e)',
            transform: `translateZ(${pd / 2}px)`,
            boxShadow: 'inset 0 0 0 3px #2a2a3a, inset 0 0 30px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: Math.max(4, cr * 0.3),
              borderRadius: Math.max(2, cr * 0.7),
              background: 'linear-gradient(180deg, #16213e 0%, #0f3460 30%, #16213e 100%)',
              opacity: 0.5,
            }} />
            <div style={{
              position: 'absolute', top: Math.max(6, cr * 0.4), left: '50%', transform: 'translateX(-50%)',
              width: displayW * 0.22, height: 3.5, borderRadius: 2,
              background: 'rgba(255,255,255,0.12)',
            }} />
            {/* Hinge line */}
            {(isFlip || isFold) && unfolded && (
              <div style={{
                position: 'absolute',
                ...(isFold
                  ? { left: '50%', top: '5%', bottom: '5%', width: 2, marginLeft: -1, background: 'rgba(100,100,110,0.5)' }
                  : { top: '50%', left: '5%', right: '5%', height: 2, marginTop: -1, background: 'rgba(100,100,110,0.5)' }
                ),
              }} />
            )}
          </div>
          {/* Back face */}
          <div style={{
            position: 'absolute', width: displayW, height: displayH, borderRadius: cr,
            background: 'linear-gradient(160deg, #d4d4d8, #a1a1aa 40%, #b8b8be)',
            transform: `rotateY(180deg) translateZ(${pd / 2}px)`,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
          }}>
            {renderCameraModule()}
            <div style={{
              position: 'absolute', bottom: '14%', left: '50%', transform: 'translateX(-50%)',
              fontSize: 7, color: 'rgba(0,0,0,0.1)', letterSpacing: 3, fontWeight: 500,
            }}>GRIPFIT</div>
          </div>
          {/* Edges */}
          {['top', 'bottom', 'left', 'right'].map((face) => {
            const isH = face === 'top' || face === 'bottom';
            const ew = isH ? displayW : pd;
            const eh = isH ? pd : displayH;
            const transforms: Record<string, string> = {
              top: `rotateX(90deg) translateZ(${displayH / 2}px)`,
              bottom: `rotateX(-90deg) translateZ(${displayH / 2}px)`,
              left: `rotateY(-90deg) translateZ(${displayW / 2}px)`,
              right: `rotateY(90deg) translateZ(${displayW / 2}px)`,
            };
            return (
              <div key={face} style={{
                position: 'absolute', width: ew, height: eh,
                background: 'linear-gradient(180deg, #c8c8cd, #9a9aa0 50%, #b0b0b5)',
                transform: transforms[face],
                left: '50%', top: '50%',
                marginLeft: -ew / 2, marginTop: -eh / 2,
                boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.2)',
              }} />
            );
          })}
          {/* Shadow */}
          <div style={{
            position: 'absolute', left: '10%', right: '10%', bottom: -25, height: 16,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.12), transparent 70%)',
            transform: `rotateX(90deg) translateZ(${displayH / 2 + 12}px)`,
            filter: 'blur(4px)',
          }} />
        </div>

        {/* Hand overlay (2D positioned) */}
        <div style={{
          position: 'absolute', width: displayW, height: displayH,
          pointerEvents: 'none',
        }}>
          {renderHandOverlay()}
        </div>

        {/* Pressure zones */}
        <div style={{
          position: 'absolute', width: displayW, height: displayH,
        }}>
          {renderPressureZones()}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => setRotation({ x: -12, y: -22 })}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 hover:bg-white border border-[#e8e8ed] text-[#646a73] transition-colors z-10"
        title="重置视角"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] text-[#8f959e] z-10">
        <span>{config.width}×{config.height}×{config.thickness}mm</span>
        <span>{config.weight}g</span>
        <span>R{config.cornerRadius}</span>
      </div>
      <div className="absolute bottom-3 right-3 text-[10px] text-[#c9cdd4] z-10">拖拽旋转视角</div>
    </div>
  );
}
