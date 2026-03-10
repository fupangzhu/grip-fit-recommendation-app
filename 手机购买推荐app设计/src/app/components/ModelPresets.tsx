import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight, ArrowLeft, Feather, Camera, Gamepad2, Briefcase, Coins,
  Smartphone, Check, Sparkles, Settings2,
} from 'lucide-react';
import { useAppContext } from './AppContext';

interface Preset {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  tags: string[];
  config: {
    type: 'bar' | 'flip' | 'fold';
    width: number; height: number; thickness: number;
    cornerRadius: number; weight: number;
    cameraLayout: string; cameraBumpHeight: number;
  };
}

const presets: Preset[] = [
  {
    id: 'slim', name: '轻薄手感', desc: '追求极致轻薄，单手掌控无压力',
    icon: <Feather className="w-5 h-5" />, color: '#3370ff', bg: '#eef3ff',
    tags: ['轻量', '窄机身', '薄'],
    config: { type: 'bar', width: 70, height: 148, thickness: 7.2, cornerRadius: 10, weight: 165, cameraLayout: 'dual-v', cameraBumpHeight: 2 },
  },
  {
    id: 'camera', name: '影像优先', desc: '大底传感器+多摄，拍照体验至上',
    icon: <Camera className="w-5 h-5" />, color: '#ff9f0a', bg: '#fff6e5',
    tags: ['高端影像', '大尺寸', '大电池'],
    config: { type: 'bar', width: 76, height: 162, thickness: 8.8, cornerRadius: 8, weight: 220, cameraLayout: 'square-island', cameraBumpHeight: 4 },
  },
  {
    id: 'gaming', name: '游戏利器', desc: '大屏横握+长续航，沉浸游戏体验',
    icon: <Gamepad2 className="w-5 h-5" />, color: '#f54a45', bg: '#fef0f0',
    tags: ['大屏', '大电池', '散热优'],
    config: { type: 'bar', width: 77, height: 164, thickness: 9, cornerRadius: 7, weight: 225, cameraLayout: 'triple-v', cameraBumpHeight: 3 },
  },
  {
    id: 'business', name: '商务旗舰', desc: '折叠大屏，兼顾便携与效率',
    icon: <Briefcase className="w-5 h-5" />, color: '#7b61ff', bg: '#f0edff',
    tags: ['折叠屏', '商务', '多任务'],
    config: { type: 'fold', width: 68, height: 155, thickness: 5.5, cornerRadius: 9, weight: 239, cameraLayout: 'triple-v', cameraBumpHeight: 3.2 },
  },
  {
    id: 'value', name: '性价比之王', desc: '均衡配置+合理价格，不过度追求极致',
    icon: <Coins className="w-5 h-5" />, color: '#34c759', bg: '#edfcf2',
    tags: ['均衡', '高性价比', '主流'],
    config: { type: 'bar', width: 72, height: 153, thickness: 8.2, cornerRadius: 9, weight: 192, cameraLayout: 'triple-v', cameraBumpHeight: 2.8 },
  },
  {
    id: 'compact-flip', name: '时尚翻盖', desc: '上下折叠，口袋友好的时尚之选',
    icon: <Smartphone className="w-5 h-5" />, color: '#30bced', bg: '#e8f7fd',
    tags: ['折叠', '口袋友好', '时尚'],
    config: { type: 'flip', width: 72, height: 165, thickness: 6.9, cornerRadius: 10, weight: 187, cameraLayout: 'dual-v', cameraBumpHeight: 2.5 },
  },
];

export function ModelPresets() {
  const navigate = useNavigate();
  const { setCurrentStep, customParams, setCustomParams } = useAppContext();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPreset(preset.id);
    // Store preset config in custom params for the next page
    setCustomParams({
      ...customParams,
      gripStyle: preset.id,
    });
  };

  const handleNext = () => {
    setCurrentStep(4);
    navigate('/grip-preview');
  };

  const handleSkip = () => {
    setCurrentStep(4);
    navigate('/grip-preview');
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[12px] text-[#8f959e] mb-3">
          <span className="cursor-pointer hover:text-[#3370ff]" onClick={() => navigate('/')}>首页</span>
          <span>/</span>
          <span className="text-[#1f2329]">模型预设</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[24px] text-[#1f2329] mb-2" style={{ fontWeight: 600 }}>
              快速预设模板
            </h1>
            <p className="text-[14px] text-[#8f959e]">
              选择一个使用场景作为起点，后续可在手感预览中精细调整所有参数
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e8e8ed] text-[13px] text-[#646a73] hover:bg-[#f5f6f8] transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            跳过，自定义配置
          </button>
        </div>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`relative text-left p-5 rounded-xl border transition-all hover:shadow-md group ${
              selectedPreset === preset.id
                ? 'border-[#3370ff] ring-2 ring-[#3370ff]/15 bg-[#3370ff]/[0.02]'
                : 'border-[#e8e8ed] hover:border-[#c9cdd4] bg-white'
            }`}
          >
            {selectedPreset === preset.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#3370ff] flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: preset.bg }}>
              <div style={{ color: preset.color }}>{preset.icon}</div>
            </div>
            <h3 className="text-[15px] text-[#1f2329] mb-1" style={{ fontWeight: 600 }}>{preset.name}</h3>
            <p className="text-[12px] text-[#8f959e] mb-3" style={{ lineHeight: 1.5 }}>{preset.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {preset.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] bg-[#f5f6f8] text-[#8f959e]">{tag}</span>
              ))}
            </div>
            {/* Config summary */}
            <div className="mt-3 pt-3 border-t border-[#f0f1f5] flex flex-wrap gap-2 text-[10px] text-[#8f959e]">
              <span>{preset.config.type === 'bar' ? '📱直板' : preset.config.type === 'flip' ? '🔄翻盖' : '📖折叠'}</span>
              <span>{preset.config.width}×{preset.config.height}mm</span>
              <span>{preset.config.weight}g</span>
              <span>{preset.config.thickness}mm厚</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected info */}
      {selectedPreset && (
        <div className="bg-gradient-to-r from-[#3370ff]/5 to-[#6694ff]/5 rounded-xl border border-[#3370ff]/15 p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#3370ff]" />
            <span className="text-[13px] text-[#3370ff]" style={{ fontWeight: 600 }}>
              已选择：{presets.find((p) => p.id === selectedPreset)?.name}
            </span>
          </div>
          <p className="text-[12px] text-[#646a73]">
            此预设将作为3D手感预览的初始参数配置，你可以在下一步中继续微调所有尺寸、重量、后摄等参数。
          </p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e8e8ed]">
        <button
          onClick={() => navigate('/phone-select')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#e8e8ed] text-[14px] text-[#646a73] hover:bg-[#f5f6f8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 上一步
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#3370ff] text-white text-[14px] hover:bg-[#2b5bdb] transition-colors"
          style={{ fontWeight: 500 }}
        >
          下一步：手感预览
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
