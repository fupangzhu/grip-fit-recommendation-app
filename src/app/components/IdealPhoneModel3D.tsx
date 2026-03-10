/**
 * IdealPhoneModel3D
 * 高精度 PBR 手机 3D 渲染组件
 * 使用 @react-three/fiber + @react-three/drei + Three.js MeshPhysicalMaterial
 * 参数完全由用户手部生理数据驱动
 */

import React, { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Environment,
    ContactShadows,
    OrbitControls,
    Html,
    RoundedBox,
} from '@react-three/drei';
import * as THREE from 'three';

// ─── 理想手机物理参数 ───────────────────────────────────────────────────────
export interface IdealPhoneParams {
    width: number;       // mm → 除以1000转m
    height: number;      // mm
    thickness: number;   // mm
    cornerRadius: number; // mm
    backMaterial: 'titanium' | 'aluminum' | 'ag-glass' | 'glossy-glass' | 'leather' | 'ceramic';
    color: string;        // hex
    cameraCount: 1 | 2 | 3;
    cameraLayout: 'vertical' | 'island';
    hasCenterNotch: boolean;
}

// ─── 从手部数据推算理想手机参数 ───────────────────────────────────────────
export function computeIdealParams(
    handLength: number,
    handWidth: number,
    thumbLength: number,
    thumbSpan: number,
    gripStyle: string,
    backMaterialPref: string,
): IdealPhoneParams {
    // 二次回归近似公式（P1 阶段将用实验数据替换系数）
    // width: 单手舒适宽度 ≈ 虎口跨度的70% - 偏移量
    const rawWidth = thumbSpan * 0.70 - 0.3;
    const idealWidth = Math.round(Math.max(64, Math.min(80, rawWidth)) * 2) / 2; // 0.5mm 步进

    // height: 适合单手触达全屏 ≈ handLength * 0.85
    const rawHeight = handLength * 0.85;
    const idealHeight = Math.round(Math.max(140, Math.min(168, rawHeight)) * 2) / 2;

    // thickness: 拇指长越短 → 越薄越好握
    const rawThick = 6.5 + (thumbLength - 55) * 0.08;
    const idealThickness = Math.round(Math.max(6.5, Math.min(10.5, rawThick)) * 10) / 10;

    // cornerRadius: 拇指指尖接触感 → 手小偏大圆角更友好
    const rawCR = 14 - (thumbLength - 55) * 0.12;
    const idealCornerR = Math.round(Math.max(8, Math.min(18, rawCR)));

    // 材质偏好映射
    const matMap: Record<string, IdealPhoneParams['backMaterial']> = {
        'glass': 'glossy-glass',
        'matte-glass': 'ag-glass',
        'metal': 'titanium',
        'leather': 'leather',
        'ceramic': 'ceramic',
    };
    const backMaterial = matMap[backMaterialPref] ?? 'ag-glass';

    // 尺码大小决定摄像头布局
    const cameraLayout: IdealPhoneParams['cameraLayout'] = idealWidth >= 72 ? 'island' : 'vertical';

    return {
        width: idealWidth,
        height: idealHeight,
        thickness: idealThickness,
        cornerRadius: idealCornerR,
        backMaterial,
        color: '#8b8fa8',
        cameraCount: 3,
        cameraLayout,
        hasCenterNotch: true,
    };
}

// ─── PBR 材质配置表 ───────────────────────────────────────────────────────
function getMaterialProps(mat: IdealPhoneParams['backMaterial'], color: string): THREE.MeshPhysicalMaterialParameters {
    const hex = new THREE.Color(color);
    switch (mat) {
        case 'titanium':
            return {
                color: hex, metalness: 1.0, roughness: 0.28,
                envMapIntensity: 1.6,
            };
        case 'aluminum':
            return {
                color: hex, metalness: 1.0, roughness: 0.06,
                envMapIntensity: 2.2,
            };
        case 'ag-glass':
            return {
                color: hex, metalness: 0.0, roughness: 0.55,
                envMapIntensity: 0.9,
            };
        case 'glossy-glass':
            return {
                color: hex, metalness: 0.08, roughness: 0.03,
                envMapIntensity: 2.5, transmission: 0.04, ior: 1.52, thickness: 0.003,
            };
        case 'leather':
            return {
                color: hex, metalness: 0.0, roughness: 0.88,
                envMapIntensity: 0.3,
            };
        case 'ceramic':
            return {
                color: hex, metalness: 0.04, roughness: 0.08,
                envMapIntensity: 1.9,
            };
        default:
            return { color: hex, metalness: 0.2, roughness: 0.5 };
    }
}

// ─── 子组件：摄像头模组 ───────────────────────────────────────────────────
function CameraModule({ params, pw }: { params: IdealPhoneParams; pw: number }) {
    const { cameraCount, cameraLayout } = params;
    const lensR = pw * 0.055;
    const islandW = cameraLayout === 'island' ? pw * 0.38 : pw * 0.18;
    const islandH = cameraLayout === 'island'
        ? pw * 0.38
        : lensR * 2.6 * cameraCount + 0.004;
    const bumpZ = 0.0025;
    const posX = cameraLayout === 'island' ? 0 : -pw * 0.28;
    const posY = params.height / 1000 * 0.33;

    return (
        <group position={[posX, posY, params.thickness / 2000 + bumpZ]}>
            {/* 摄像头背板 */}
            <RoundedBox
                args={[islandW, islandH, bumpZ * 2]}
                radius={cameraLayout === 'island' ? islandW * 0.22 : islandW * 0.4}
                smoothness={6}
            >
                <meshPhysicalMaterial
                    color="#1a1a22"
                    metalness={0.6}
                    roughness={0.2}
                    envMapIntensity={1.2}
                />
            </RoundedBox>

            {/* 镜头 */}
            {Array.from({ length: cameraCount }).map((_, i) => {
                const offsetY = cameraLayout === 'island'
                    ? (i - (cameraCount - 1) / 2) * lensR * 2.4
                    : (i - (cameraCount - 1) / 2) * lensR * 2.6;
                const offsetX = cameraLayout === 'island' && cameraCount === 3
                    ? (i === 2 ? lensR * 1.2 : (i - 0.5) * lensR * 2.4)
                    : 0;
                const finalY = cameraLayout === 'island' && cameraCount === 3
                    ? (i < 2 ? lensR * 0.8 : -lensR * 1.0)
                    : offsetY;

                return (
                    <group key={i} position={[offsetX, finalY, bumpZ + 0.0005]}>
                        {/* 镜头外环 */}
                        <mesh>
                            <cylinderGeometry args={[lensR, lensR, 0.001, 32]} />
                            <meshPhysicalMaterial color="#2a2a38" metalness={0.9} roughness={0.1} />
                        </mesh>
                        {/* 镜头玻璃 */}
                        <mesh position={[0, 0, 0.0008]}>
                            <circleGeometry args={[lensR * 0.78, 32]} />
                            <meshPhysicalMaterial
                                color="#080820"
                                metalness={0.1}
                                roughness={0.02}
                                transmission={0.3}
                                ior={1.7}
                                envMapIntensity={3}
                                iridescence={0.6}
                                iridescenceIOR={1.5}
                            />
                        </mesh>
                        {/* 高光点 */}
                        <mesh position={[-lensR * 0.28, lensR * 0.28, 0.0016]}>
                            <circleGeometry args={[lensR * 0.14, 16]} />
                            <meshBasicMaterial color="white" transparent opacity={0.6} />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
}

// ─── 子组件：手机本体 ───────────────────────────────────────────────────────
function PhoneBody({ params, showWireframe }: { params: IdealPhoneParams; showWireframe: boolean }) {
    const groupRef = useRef<THREE.Group>(null!);
    const backRef = useRef<THREE.Mesh>(null!);

    const pw = params.width / 1000;
    const ph = params.height / 1000;
    const pt = params.thickness / 1000;
    const cr = Math.min(params.cornerRadius / 1000, pw * 0.12);

    // PBR 背板材质
    const backMatProps = getMaterialProps(params.backMaterial, params.color);

    // 机身几何体
    const bodyArgs: [number, number, number] = [pw, ph, pt];

    return (
        <group ref={groupRef}>
            {/* ── 机身主体（背面 PBR）── */}
            <RoundedBox args={bodyArgs} radius={cr} smoothness={8}>
                <meshPhysicalMaterial
                    {...backMatProps}
                    side={THREE.FrontSide}
                />
            </RoundedBox>

            {/* ── 前屏（深色玻璃 + 微透光）── */}
            <RoundedBox
                args={[pw * 0.97, ph * 0.97, pt * 0.01]}
                radius={cr * 0.95}
                smoothness={8}
                position={[0, 0, pt / 2 + 0.0001]}
            >
                <meshPhysicalMaterial
                    color="#080814"
                    metalness={0.05}
                    roughness={0.02}
                    envMapIntensity={2.8}
                    transmission={0.04}
                    ior={1.52}
                />
            </RoundedBox>

            {/* ── 前摄打孔/notch ── */}
            {params.hasCenterNotch && (
                <mesh position={[0, ph * 0.44, pt / 2 + 0.0005]}>
                    <circleGeometry args={[pw * 0.022, 24]} />
                    <meshPhysicalMaterial
                        color="#060610"
                        metalness={0.1} roughness={0.03}
                        envMapIntensity={1.2}
                    />
                </mesh>
            )}

            {/* ── 屏幕微发光（模拟 OLED 亮屏）── */}
            <mesh position={[0, -ph * 0.02, pt / 2 + 0.00015]}>
                <planeGeometry args={[pw * 0.90, ph * 0.82]} />
                <meshBasicMaterial
                    color="#1a1a3a"
                    transparent
                    opacity={0.15}
                />
            </mesh>

            {/* ── 中框金属条 ── */}
            <mesh position={[0, 0, 0]}>
                <torusGeometry args={[
                    Math.min(pw, ph) / 2 * 0.0001, // 占位，通过 scale 实际控制
                    0.0001, 4, 4
                ]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* ── 电源键 ── */}
            <mesh position={[pw / 2 + 0.0005, ph * 0.08, 0]}>
                <boxGeometry args={[0.001, pw * 0.12, pt * 0.35]} />
                <meshPhysicalMaterial color="#aaaaaa" metalness={0.9} roughness={0.18} />
            </mesh>

            {/* ── 音量键 ── */}
            {[-0.04, 0.01].map((offsetY, i) => (
                <mesh key={i} position={[-pw / 2 - 0.0005, ph * offsetY, 0]}>
                    <boxGeometry args={[0.001, pw * 0.14, pt * 0.3]} />
                    <meshPhysicalMaterial color="#aaaaaa" metalness={0.9} roughness={0.18} />
                </mesh>
            ))}

            {/* ── 摄像头模组 ── */}
            <CameraModule params={params} pw={pw} />

            {/* ── 线框叠加（标注模式）── */}
            {showWireframe && (
                <RoundedBox args={bodyArgs} radius={cr} smoothness={4}>
                    <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.15} />
                </RoundedBox>
            )}
        </group>
    );
}

// ─── 子组件：自动慢速旋转 ─────────────────────────────────────────────────
function AutoRotate({ speed = 0.4 }: { speed?: number }) {
    const { scene } = useThree();
    // 通过外部 ref 控制组旋转
    return null;
}

// ─── 子组件：标注尺寸（HTML Overlay）── ──────────────────────────────────
function DimensionLabels({ params }: { params: IdealPhoneParams }) {
    const pw = params.width / 1000;
    const ph = params.height / 1000;
    const pt = params.thickness / 1000;

    const labels = [
        { pos: [pw / 2 + 0.012, 0, 0] as [number, number, number], text: `${params.width}mm 宽`, sub: '单手持握最优宽度' },
        { pos: [0, ph / 2 + 0.012, 0] as [number, number, number], text: `${params.height}mm 高`, sub: '拇指全屏可达高度' },
        { pos: [-pw / 2 - 0.018, -ph * 0.3, 0] as [number, number, number], text: `R${params.cornerRadius}mm`, sub: '手感友好圆角' },
        { pos: [0, -ph / 2 - 0.018, pt / 2] as [number, number, number], text: `${params.thickness}mm 厚`, sub: '舒适握持厚度' },
    ];

    return (
        <>
            {labels.map((l, i) => (
                <Html key={i} position={l.pos} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        background: 'rgba(15,15,30,0.82)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(99,102,241,0.35)',
                        borderRadius: 8,
                        padding: '4px 8px',
                        fontSize: 11,
                        color: '#e0e0ff',
                        fontFamily: "'Inter','Noto Sans SC',sans-serif",
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                    }}>
                        {l.text}
                        <div style={{ fontSize: 9, color: '#8888bb', fontWeight: 400 }}>{l.sub}</div>
                    </div>
                </Html>
            ))}
        </>
    );
}

// ─── 旋转控制器（跟手旋转 + 自动慢转）── ─────────────────────────────────
function PhoneScene({
    params,
    showLabels,
    showWireframe,
    autoRotate,
}: {
    params: IdealPhoneParams;
    showLabels: boolean;
    showWireframe: boolean;
    autoRotate: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((_, delta) => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += delta * 0.4;
        }
    });

    return (
        <group ref={groupRef} rotation={[0.15, -0.4, 0]}>
            <PhoneBody params={params} showWireframe={showWireframe} />
            {showLabels && <DimensionLabels params={params} />}
        </group>
    );
}

// ─── 主组件 ──────────────────────────────────────────────────────────────
export interface IdealPhoneModel3DProps {
    params: IdealPhoneParams;
    height?: number;  // 容器高度 px
    showLabels?: boolean;
    className?: string;
}

export function IdealPhoneModel3D({
    params,
    height = 480,
    showLabels = true,
    className = '',
}: IdealPhoneModel3DProps) {
    const [autoRotate, setAutoRotate] = useState(true);
    const [showWire, setShowWire] = useState(false);
    const [activeView, setActiveView] = useState<'back' | 'front'>('back');

    // 选色方案
    const colorOptions: { label: string; value: string; mat: IdealPhoneParams['backMaterial'] }[] = [
        { label: '钛灰', value: '#9a9a9e', mat: 'titanium' },
        { label: '暗夜黑', value: '#1a1a22', mat: 'glossy-glass' },
        { label: '星光白', value: '#e8e4dc', mat: 'ag-glass' },
        { label: '紫晶', value: '#7b61c4', mat: 'ag-glass' },
        { label: '深空蓝', value: '#1c2b55', mat: 'glossy-glass' },
    ];
    const [selectedColor, setSelectedColor] = useState(0);

    const activeParams: IdealPhoneParams = {
        ...params,
        color: colorOptions[selectedColor].value,
        backMaterial: colorOptions[selectedColor].mat,
    };

    // 调整初始相机角度
    const initialCamPos: [number, number, number] = [0, 0, activeParams.height / 1000 * 0.85];

    return (
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c0c20] via-[#12122a] to-[#0a0a18] ${className}`}
            style={{ height }}>

            {/* ── 3D Canvas ── */}
            <Canvas
                camera={{ position: initialCamPos, fov: 38 }}
                onPointerDown={() => setAutoRotate(false)}
                shadows
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
            >
                <Suspense fallback={null}>
                    {/* 环境 HDR 光照 */}
                    <Environment preset="studio" />

                    {/* 主方向光（打亮高光） */}
                    <directionalLight
                        position={[0.5, 1.5, 1.2]}
                        intensity={2.5}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                    />
                    {/* 补光（反光板） */}
                    <directionalLight position={[-0.8, 0.5, -0.5]} intensity={0.8} color="#a0a8ff" />
                    <ambientLight intensity={0.2} />

                    {/* 手机主体 */}
                    <PhoneScene
                        params={activeParams}
                        showLabels={showLabels}
                        showWireframe={showWire}
                        autoRotate={autoRotate}
                    />

                    {/* 地面软阴影 */}
                    <ContactShadows
                        position={[0, -activeParams.height / 2000 - 0.01, 0]}
                        opacity={0.45}
                        scale={0.5}
                        blur={2}
                        far={0.3}
                    />

                    {/* 鼠标控制 */}
                    <OrbitControls
                        enablePan={false}
                        minDistance={0.1}
                        maxDistance={0.45}
                        dampingFactor={0.08}
                        enableDamping
                        onStart={() => setAutoRotate(false)}
                    />
                </Suspense>
            </Canvas>

            {/* ── 右上控件 ── */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                <button
                    onClick={() => setAutoRotate(v => !v)}
                    title={autoRotate ? '停止旋转' : '自动旋转'}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] transition-all border ${autoRotate
                        ? 'bg-indigo-500/90 border-indigo-400/50 text-white'
                        : 'bg-white/10 border-white/15 text-white/60'
                        }`}
                >
                    ↻
                </button>
                <button
                    onClick={() => setShowWire(v => !v)}
                    title="线框模式"
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] transition-all border ${showWire
                        ? 'bg-indigo-500/90 border-indigo-400/50 text-white'
                        : 'bg-white/10 border-white/15 text-white/60'
                        }`}
                >
                    ⬛
                </button>
            </div>

            {/* ── 底部 CMF 色彩选择 ── */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 z-10">
                <span className="text-[10px] text-white/40 mr-1">CMF</span>
                {colorOptions.map((c, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedColor(i)}
                        title={c.label}
                        className={`w-5 h-5 rounded-full transition-all border-2 ${selectedColor === i ? 'border-white scale-125' : 'border-transparent scale-100'}`}
                        style={{ background: c.value, boxShadow: `0 0 6px ${c.value}80` }}
                    />
                ))}
                <span className="text-[10px] text-white/35 ml-1">{colorOptions[selectedColor].label}</span>
            </div>

            {/* ── 左下提示 ── */}
            <div className="absolute bottom-3 left-3 text-[9px] text-white/25 z-10">
                拖拽旋转 · 滚轮缩放
            </div>
        </div>
    );
}
