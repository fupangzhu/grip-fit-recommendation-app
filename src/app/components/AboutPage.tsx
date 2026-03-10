import React from 'react';
import { useNavigate } from 'react-router';
import {
  Hand, Smartphone, LayoutGrid, SlidersHorizontal, FileText,
  ArrowRight, ArrowLeft, Scan, Activity, ChevronRight,
  Ruler, Target, BarChart3, Download
} from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Ruler,
    title: '手部测量',
    subtitle: 'Hand Measurement',
    desc: '通过精度1mm滑块调整手长、手宽、指长等6项数据，含正态分布百分位可视化与GB/T标准文献参考，实时CSS 3D手部模型预览。',
    tags: ['P5–P95范围', '正态分布图', '3D预览', 'GB/T标准'],
    color: '#3370ff',
    glow: 'rgba(51,112,255,0.2)',
  },
  {
    step: '02',
    icon: Smartphone,
    title: '机型选择',
    subtitle: 'Phone Selection',
    desc: '浏览收录2000+机型数据库，支持品牌/价位/形态筛选，点击查看长宽厚重、背板材质、后摄凸起高度等详细参数弹窗对比。',
    tags: ['2000+机型', '参数弹窗', '多维筛选', '直板/折叠'],
    color: '#7b61ff',
    glow: 'rgba(123,97,255,0.2)',
  },
  {
    step: '03',
    icon: LayoutGrid,
    title: '场景预设',
    subtitle: 'Usage Presets',
    desc: '6种快速预设模板（单手操作、游戏、摄影、商务等），一键配置偏好权重，或跳过直接进入手感预览阶段。',
    tags: ['6种预设', '权重调整', '快速跳过', '自定义'],
    color: '#ff9f0a',
    glow: 'rgba(255,159,10,0.2)',
  },
  {
    step: '04',
    icon: SlidersHorizontal,
    title: '手感预览',
    subtitle: 'Grip Preview',
    desc: '沉浸式全屏CSS 3D手机模型与半透明手部叠加，5个压力热点区域悬浮提示，可收起参数面板，左下角六维雷达图实时更新。',
    tags: ['3D叠加预览', '热点压力图', '雷达图', '直板/折叠形态'],
    color: '#f54a45',
    glow: 'rgba(245,74,69,0.2)',
  },
  {
    step: '05',
    icon: FileText,
    title: '手感报告',
    subtitle: 'Grip Report',
    desc: '综合雷达图对比、评分柱状图、规格对比表、优劣势分析，附购买链接推荐，支持一键导出PDF报告分享。',
    tags: ['雷达对比', '规格表', '优劣分析', 'PDF导出'],
    color: '#34c759',
    glow: 'rgba(52,199,89,0.2)',
  },
];

const features = [
  { icon: Activity, label: 'AI匹配引擎', desc: '基于150万+用户数据训练的握持匹配模型' },
  { icon: Target, label: '人体工学', desc: 'GB/T标准手部数据，P5-P95百分位覆盖' },
  { icon: BarChart3, label: '多维评分', desc: '握持感、可达性、舒适度、轻便性等六维分析' },
  { icon: Download, label: '报告导出', desc: '专业PDF报告，记录测量数据和推荐结果' },
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: '#070a0e', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(74,144,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,144,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
        style={{
          background: 'rgba(7,10,14,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 transition-colors"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回首页
          </button>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3370ff,#2b5bdb)' }}
            >
              <Hand className="w-3 h-3 text-white" />
            </div>
            <span className="text-white/80 tracking-widest uppercase" style={{ fontSize: '12px', fontWeight: 700 }}>
              GripFit
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/hand-measure')}
          className="flex items-center gap-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{
            padding: '8px 18px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #3370ff, #5580ff)',
          }}
        >
          <Scan className="w-3.5 h-3.5" />
          立即开始测量
        </button>
      </header>

      <div className="max-w-[900px] mx-auto px-6 py-14">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(74,144,255,0.5))' }} />
            <span
              className="font-mono tracking-[0.25em] uppercase"
              style={{ fontSize: '9px', color: 'rgba(74,144,255,0.5)' }}
            >
              Product Introduction
            </span>
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(74,144,255,0.5))' }} />
          </div>
          <h1
            className="text-white mb-4"
            style={{ fontSize: '38px', fontWeight: 300, lineHeight: 1.2, letterSpacing: '0.01em' }}
          >
            科学握持分析
            <span
              style={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4a90ff, #7b61ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
              }}
            >
              找到属于你的手机
            </span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>
            GripFit 通过采集你的手部尺寸数据，结合AI匹配算法，<br />
            从握持舒适度、单手可操作性、长时间使用疲劳感等多维度为你精准推荐手机。
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.label}
                className="rounded-xl p-4 flex flex-col gap-2 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(51,112,255,0.12)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#4a90ff' }} />
                </div>
                <div>
                  <div className="text-white mb-0.5" style={{ fontSize: '12px', fontWeight: 600 }}>{feat.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{feat.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-8">
            <div style={{ width: '3px', height: '16px', background: '#3370ff', borderRadius: '2px' }} />
            <h2 className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>五步推荐流程</h2>
          </div>
          <div className="flex flex-col gap-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="group relative flex gap-5 rounded-2xl p-6 transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={e => {
                    const t = e.currentTarget;
                    t.style.background = `rgba(${s.color === '#3370ff' ? '51,112,255' : s.color === '#7b61ff' ? '123,97,255' : s.color === '#ff9f0a' ? '255,159,10' : s.color === '#f54a45' ? '245,74,69' : '52,199,89'},0.06)`;
                    t.style.borderColor = `${s.color}30`;
                  }}
                  onMouseLeave={e => {
                    const t = e.currentTarget;
                    t.style.background = 'rgba(255,255,255,0.025)';
                    t.style.borderColor = 'rgba(255,255,255,0.07)';
                  }}
                >
                  {/* Step number */}
                  <div className="shrink-0">
                    <div
                      className="font-mono"
                      style={{ fontSize: '28px', fontWeight: 700, color: `${s.color}20`, lineHeight: 1 }}
                    >
                      {s.step}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        style={{
                          width: '1px',
                          height: '100%',
                          maxHeight: '60px',
                          background: 'rgba(255,255,255,0.06)',
                          margin: '8px auto 0',
                        }}
                      />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ background: `${s.color}18`, border: `1px solid ${s.color}25` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>{s.title}</h3>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
                        {s.subtitle}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: '12px' }}>
                      {s.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.tags.map(tag => (
                        <span
                          key={tag}
                          className="rounded-full"
                          style={{
                            fontSize: '10px',
                            padding: '2px 10px',
                            color: s.color,
                            background: `${s.color}12`,
                            border: `1px solid ${s.color}20`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-14 rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(51,112,255,0.08), rgba(123,97,255,0.08))',
            border: '1px solid rgba(51,112,255,0.15)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'rgba(74,144,255,0.5)', letterSpacing: '0.2em', marginBottom: '10px' }}>
            READY TO START
          </div>
          <h3 className="text-white mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
            立即测量，找到最合手的手机
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>
            整个流程仅需约3分钟，基于人体工学数据的精准推荐
          </p>
          <button
            onClick={() => navigate('/hand-measure')}
            className="inline-flex items-center gap-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{
              padding: '12px 32px',
              fontSize: '13px',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #3370ff, #5580ff)',
              boxShadow: '0 0 24px rgba(51,112,255,0.25)',
            }}
          >
            <Scan className="w-4 h-4" />
            开始手部测量
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
