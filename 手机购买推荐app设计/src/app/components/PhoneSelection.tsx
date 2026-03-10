import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Grid3x3, List, ArrowRight, ArrowLeft, Check, X,
  Camera, HardDrive, Ruler, Layers, RefreshCw,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAppContext, PhoneModel } from './AppContext';
import { fetchAllPhones } from '../../lib/api/phones';

const brands = ['全部', 'Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus'];

// ─── Phone Detail Modal ───
function PhoneDetailModal({ phone, onClose }: { phone: PhoneModel; onClose: () => void }) {
  const specGroups = [
    {
      title: '基础尺寸',
      icon: <Ruler className="w-3.5 h-3.5 text-[#3370ff]" />,
      items: [
        { label: '长度', value: `${phone.height} mm` },
        { label: '宽度', value: `${phone.width} mm` },
        { label: '厚度', value: `${phone.thickness} mm` },
        { label: '重量', value: `${phone.weight} g` },
        { label: '屏幕尺寸', value: `${phone.screenSize}"` },
        { label: '圆角半径', value: phone.cornerRadius ? `${phone.cornerRadius} mm` : '—' },
      ],
    },
    {
      title: '材质与外观',
      icon: <Layers className="w-3.5 h-3.5 text-[#7b61ff]" />,
      items: [
        { label: '边框材质', value: phone.material },
        { label: '背板材质', value: phone.backMaterial || '—' },
        { label: '机身形态', value: phone.formFactor === 'flip' ? '上下折叠' : phone.formFactor === 'fold' ? '左右折叠' : '直板' },
      ],
    },
    {
      title: '后摄模组',
      icon: <Camera className="w-3.5 h-3.5 text-[#ff9f0a]" />,
      items: [
        { label: '后摄位置', value: phone.cameraPosition || '—' },
        { label: '后摄形状', value: phone.cameraShape || '—' },
        { label: '后摄凸起', value: phone.cameraBumpHeight ? `${phone.cameraBumpHeight} mm` : '—' },
      ],
    },
    {
      title: '硬件配置',
      icon: <HardDrive className="w-3.5 h-3.5 text-[#34c759]" />,
      items: [
        { label: '电池容量', value: phone.battery ? `${phone.battery} mAh` : '—' },
        { label: '存储选项', value: phone.storage ? phone.storage.map((s) => s >= 1024 ? '1TB' : `${s}GB`).join(' / ') : '—' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-[600px] w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#f0f1f5] p-5 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <ImageWithFallback src={phone.image} alt={phone.name} className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <div className="text-[11px] text-[#8f959e]">{phone.brand}</div>
              <h3 className="text-[16px] text-[#1f2329]" style={{ fontWeight: 600 }}>{phone.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#f0f1f5]">
            <X className="w-4 h-4 text-[#8f959e]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Score bar */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#3370ff]/5 to-[#6694ff]/5 border border-[#3370ff]/10">
            <div className="text-center">
              <div className="text-[28px] text-[#3370ff] tabular-nums" style={{ fontWeight: 700 }}>{phone.overallScore}</div>
              <div className="text-[11px] text-[#8f959e]">综合手感</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[
                { label: '握持感', score: phone.gripScore, color: '#3370ff' },
                { label: '可达性', score: phone.reachScore, color: '#7b61ff' },
                { label: '舒适度', score: phone.comfortScore, color: '#34c759' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8f959e] w-12">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="text-[11px] tabular-nums" style={{ color: s.color, fontWeight: 600 }}>{s.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5">
            {phone.features.map((f) => (
              <span key={f} className="px-2.5 py-1 rounded-lg bg-[#f5f6f8] text-[11px] text-[#646a73]">{f}</span>
            ))}
          </div>

          {/* Spec groups */}
          {specGroups.map((group) => (
            <div key={group.title}>
              <div className="flex items-center gap-2 mb-2">
                {group.icon}
                <span className="text-[13px] text-[#1f2329]" style={{ fontWeight: 500 }}>{group.title}</span>
              </div>
              <div className="bg-[#f9fafb] rounded-lg divide-y divide-[#f0f1f5]">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-3 py-2">
                    <span className="text-[12px] text-[#8f959e]">{item.label}</span>
                    <span className="text-[12px] text-[#1f2329] tabular-nums" style={{ fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-[#f0f1f5]">
            <span className="text-[13px] text-[#8f959e]">参考售价</span>
            <span className="text-[20px] text-[#1f2329]" style={{ fontWeight: 700 }}>¥{phone.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export function PhoneSelection() {
  const navigate = useNavigate();
  const { selectedPhones, setSelectedPhones, setCurrentStep, handData } = useAppContext();
  const [allPhones, setAllPhones] = useState<PhoneModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'overallScore' | 'price' | 'weight'>('overallScore');
  const [detailPhone, setDetailPhone] = useState<PhoneModel | null>(null);

  useEffect(() => {
    async function loadPhones() {
      try {
        const data = await fetchAllPhones();
        setAllPhones(data);
      } catch (err) {
        setError('加载手机数据失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPhones();
  }, []);

  const filteredPhones = useMemo(() => {
    let result = [...allPhones];
    if (selectedBrand !== '全部') result = result.filter((p) => p.brand === selectedBrand);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    result.sort((a, b) => sortBy === 'price' ? a.price - b.price : sortBy === 'weight' ? a.weight - b.weight : b.overallScore - a.overallScore);
    return result;
  }, [allPhones, selectedBrand, searchQuery, sortBy]);

  const isSelected = (id: string) => selectedPhones.some((p) => p.id === id);

  const togglePhone = (phone: PhoneModel) => {
    if (isSelected(phone.id)) {
      setSelectedPhones(selectedPhones.filter((p) => p.id !== phone.id));
    } else if (selectedPhones.length < 5) {
      setSelectedPhones([...selectedPhones, phone]);
    }
  };

  const handleNext = () => {
    setCurrentStep(3);
    navigate('/model-presets');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12px] text-[#8f959e] mb-3">
          <span className="cursor-pointer hover:text-[#3370ff]" onClick={() => navigate('/')}>首页</span>
          <span>/</span>
          <span className="text-[#1f2329]">机型选择</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[24px] text-[#1f2329] mb-2" style={{ fontWeight: 600 }}>选择候选机型</h1>
            <p className="text-[14px] text-[#8f959e]">
              选择最多5款感兴趣的手机，点击卡片查看详细参数
              {handData.handSize && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#34c759]/10 text-[#34c759] text-[12px]">
                  已识别：{handData.handSize === 'small' ? '小手型' : handData.handSize === 'medium' ? '中手型' : '大手型'}
                </span>
              )}
            </p>
          </div>
          <span className="text-[13px] text-[#646a73]">
            已选 <span className="text-[#3370ff]" style={{ fontWeight: 600 }}>{selectedPhones.length}</span>/5
          </span>
        </div>
      </div>

      {/* Selected Bar */}
      {selectedPhones.length > 0 && (
        <div className="bg-white rounded-xl border border-[#e8e8ed] p-4 mb-6">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-[12px] text-[#8f959e] shrink-0">已选机型：</span>
            {selectedPhones.map((phone) => (
              <div key={phone.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3370ff]/5 border border-[#3370ff]/20 shrink-0">
                <span className="text-[12px] text-[#3370ff]">{phone.name}</span>
                <button onClick={() => togglePhone(phone)} className="text-[#3370ff]/50 hover:text-[#3370ff]">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center bg-white border border-[#e8e8ed] rounded-lg px-3 py-[7px] flex-1 min-w-[200px] max-w-[400px]">
          <Search className="w-4 h-4 text-[#8f959e] mr-2 shrink-0" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索手机型号..."
            className="bg-transparent border-none outline-none text-[13px] text-[#1f2329] w-full placeholder-[#8f959e]"
          />
        </div>
        <div className="flex gap-1 bg-white border border-[#e8e8ed] rounded-lg p-1">
          {brands.map((brand) => (
            <button key={brand} onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-md text-[12px] transition-all ${selectedBrand === brand ? 'bg-[#3370ff] text-white' : 'text-[#646a73] hover:bg-[#f0f1f5]'
                }`}
            >
              {brand}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-[#e8e8ed] rounded-lg px-3 py-[7px] text-[12px] text-[#646a73] outline-none cursor-pointer">
            <option value="overallScore">手感评分</option>
            <option value="price">价格排序</option>
            <option value="weight">重量排序</option>
          </select>
          <div className="flex bg-white border border-[#e8e8ed] rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#f0f1f5]' : ''}`}>
              <Grid3x3 className="w-4 h-4 text-[#646a73]" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-[#f0f1f5]' : ''}`}>
              <List className="w-4 h-4 text-[#646a73]" />
            </button>
          </div>
        </div>
      </div>

      {/* Phone Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#e8e8ed] mb-8">
          <RefreshCw className="w-8 h-8 text-[#3370ff] animate-spin mb-3" />
          <p className="text-[14px] text-[#8f959e]">正在从实验室云端加载机型数据...</p>
        </div>
      ) : filteredPhones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#e8e8ed] mb-8 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-[#f5f6f8] flex items-center justify-center mb-3">
            <Search className="w-6 h-6 text-[#c9cdd4]" />
          </div>
          <p className="text-[15px] text-[#1f2329] mb-1" style={{ fontWeight: 500 }}>未找到匹配机型</p>
          <p className="text-[13px] text-[#8f959e]">尝试切换品牌或清除搜索关键词</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedBrand('全部'); }}
            className="mt-4 text-[13px] text-[#3370ff] hover:underline"
          >
            清除所有过滤
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredPhones.map((phone) => (
            <div key={phone.id}
              className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md group ${isSelected(phone.id) ? 'border-[#3370ff] ring-1 ring-[#3370ff]/20' : 'border-[#e8e8ed]'
                }`}
            >
              <div className="relative h-[180px] bg-[#f5f6f8] overflow-hidden" onClick={() => setDetailPhone(phone)}>
                <ImageWithFallback src={phone.image} alt={phone.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {isSelected(phone.id) && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#3370ff] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] backdrop-blur-sm">{phone.screenSize}"</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] backdrop-blur-sm">{phone.weight}g</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] backdrop-blur-sm">{phone.width}×{phone.height}mm</span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-[11px] text-[#8f959e] mb-0.5">{phone.brand}</div>
                <h3 className="text-[14px] text-[#1f2329] mb-1.5 cursor-pointer hover:text-[#3370ff]"
                  style={{ fontWeight: 500 }} onClick={() => setDetailPhone(phone)}>
                  {phone.name}
                </h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {phone.features.slice(0, 2).map((f) => (
                    <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-[#f5f6f8] text-[#8f959e]">{f}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#1f2329]" style={{ fontWeight: 600 }}>¥{phone.price.toLocaleString()}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePhone(phone); }}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${isSelected(phone.id)
                      ? 'bg-[#3370ff] text-white'
                      : 'bg-[#f5f6f8] text-[#646a73] hover:bg-[#3370ff]/10 hover:text-[#3370ff]'
                      }`}
                  >
                    {isSelected(phone.id) ? '已选择' : '选择'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {filteredPhones.map((phone) => (
            <div key={phone.id}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm flex gap-4 items-center ${isSelected(phone.id) ? 'border-[#3370ff] ring-1 ring-[#3370ff]/20' : 'border-[#e8e8ed]'
                }`}
              onClick={() => setDetailPhone(phone)}
            >
              <ImageWithFallback src={phone.image} alt={phone.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-[#8f959e]">{phone.brand}</span>
                  <h3 className="text-[14px] text-[#1f2329]" style={{ fontWeight: 500 }}>{phone.name}</h3>
                </div>
                <div className="flex flex-wrap gap-3 text-[12px] text-[#8f959e]">
                  <span>{phone.width}×{phone.height}×{phone.thickness}mm</span>
                  <span>{phone.weight}g</span>
                  <span>{phone.material}</span>
                  {phone.backMaterial && <span>{phone.backMaterial}</span>}
                </div>
              </div>
              <div className="text-right shrink-0 mr-2">
                <div className="text-[15px] text-[#1f2329] mb-1" style={{ fontWeight: 600 }}>¥{phone.price.toLocaleString()}</div>
                <span className="text-[12px] text-[#3370ff]" style={{ fontWeight: 600 }}>手感 {phone.overallScore}分</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); togglePhone(phone); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected(phone.id) ? 'bg-[#3370ff]' : 'bg-[#f5f6f8] hover:bg-[#3370ff]/10'
                  }`}
              >
                <Check className={`w-4 h-4 ${isSelected(phone.id) ? 'text-white' : 'text-[#c9cdd4]'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e8e8ed]">
        <button onClick={() => navigate('/hand-measure')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#e8e8ed] text-[14px] text-[#646a73] hover:bg-[#f5f6f8] transition-colors">
          <ArrowLeft className="w-4 h-4" /> 上一步
        </button>
        <button onClick={handleNext} disabled={selectedPhones.length === 0}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] transition-colors ${selectedPhones.length > 0
            ? 'bg-[#3370ff] text-white hover:bg-[#2b5bdb]'
            : 'bg-[#f0f1f5] text-[#c9cdd4] cursor-not-allowed'
            }`}
          style={{ fontWeight: 500 }}>
          下一步：模型预设 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {detailPhone && <PhoneDetailModal phone={detailPhone} onClose={() => setDetailPhone(null)} />}
    </div>
  );
}