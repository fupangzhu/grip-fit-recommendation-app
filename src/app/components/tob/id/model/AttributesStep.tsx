import { useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { IDModel, IDMaterial, IDPowerKeyPos, IDScreenRatio, IDVolumeKeyPos, FormFactor } from '../../ToBStore';
import { FORM_FACTOR_LABELS } from '../../ToBStore';

const FORM_FACTORS: FormFactor[] = ['bar', 'flip', 'fold'];
const MATERIAL_OPTIONS: { value: IDMaterial; label: string }[] = [
  { value: 'metal', label: '金属' },
  { value: 'glass', label: '玻璃' },
  { value: 'leather', label: '素皮' },
  { value: 'plastic', label: '工程塑料' },
];
const SCREEN_RATIO_OPTIONS: IDScreenRatio[] = ['20:9', '21:9', 'custom'];
const VOLUME_POS_OPTIONS: { value: IDVolumeKeyPos; label: string }[] = [
  { value: 'left_upper', label: '左侧上方' },
  { value: 'right_upper', label: '右侧上方' },
];
const POWER_POS_OPTIONS: { value: IDPowerKeyPos; label: string }[] = [
  { value: 'right', label: '右侧' },
  { value: 'top', label: '顶部' },
];

export function AttributesStep() {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const dims = state.idModelWizard.dimensions;
  const pop = state.idModelWizard.population;

  function updateDims(patch: Partial<typeof dims>) {
    dispatch({ type: 'SET_ID_MODEL_WIZARD', payload: { dimensions: { ...dims, ...patch } } });
  }

  function handleCreate() {
    const newModel: IDModel = {
      id: `model-${Date.now()}`,
      name: `参考底模 ${new Date().toLocaleDateString('zh-CN')}`,
      createdAt: new Date().toISOString().slice(0, 10),
      population: {
        ageGroups: pop.ageGroups ?? [],
        genderRatio: pop.genderRatio ?? 50,
        percentiles: pop.percentiles ?? ['P50'],
        gripHabits: pop.gripHabits ?? [],
        useScenes: pop.useScenes ?? [],
      },
      dimensions: {
        formFactor: dims.formFactor ?? 'bar',
        width: dims.width ?? 71,
        height: dims.height ?? 153,
        thickness: dims.thickness ?? 7.5,
        cornerRadius: dims.cornerRadius ?? 14,
        volumeKeyPos: dims.volumeKeyPos ?? 'left_upper',
        powerKeyPos: dims.powerKeyPos ?? 'right',
        screenRatio: dims.screenRatio ?? '20:9',
        material: dims.material ?? 'metal',
      },
      coverageP5: 72.0,
      coverageP50: 88.5,
      coverageP95: 93.0,
    };
    dispatch({ type: 'ADD_ID_MODEL', payload: newModel });
    dispatch({ type: 'RESET_ID_MODEL_WIZARD' });
    navigate(`/tob/id/model/${newModel.id}/front`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-slate-400 mb-1">第 2 步 / 共 2 步</div>
        <h1 className="text-xl font-semibold text-slate-800">配置外观属性</h1>
        <p className="text-sm text-slate-500 mt-1">设定机身形态与物理尺寸，系统将生成参考底模并计算握持覆盖率。</p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">机身形态</div>
          <div className="flex gap-2">
            {FORM_FACTORS.map(f => (
              <button key={f} onClick={() => updateDims({ formFactor: f })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${dims.formFactor === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                {FORM_FACTOR_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {([['width', '机身宽度 (mm)', 60, 160], ['height', '机身高度 (mm)', 100, 200], ['thickness', '机身厚度 (mm)', 4, 20], ['cornerRadius', '圆角半径 (mm)', 0, 30]] as const).map(([key, label, min, max]) => (
            <div key={key}>
              <label className="text-sm font-medium text-slate-700">{label}</label>
              <input type="number" min={min} max={max} step={0.1}
                value={(dims as Record<string, number>)[key] ?? 0}
                onChange={e => updateDims({ [key]: parseFloat(e.target.value) })}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">音量键位置</div>
            <div className="flex gap-2 flex-wrap">
              {VOLUME_POS_OPTIONS.map(o => (
                <button key={o.value} onClick={() => updateDims({ volumeKeyPos: o.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${dims.volumeKeyPos === o.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">电源键位置</div>
            <div className="flex gap-2 flex-wrap">
              {POWER_POS_OPTIONS.map(o => (
                <button key={o.value} onClick={() => updateDims({ powerKeyPos: o.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${dims.powerKeyPos === o.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">屏幕比例</div>
            <div className="flex gap-2 flex-wrap">
              {SCREEN_RATIO_OPTIONS.map(r => (
                <button key={r} onClick={() => updateDims({ screenRatio: r })}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${dims.screenRatio === r ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">机身材质</div>
            <div className="flex gap-2 flex-wrap">
              {MATERIAL_OPTIONS.map(m => (
                <button key={m.value} onClick={() => updateDims({ material: m.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${dims.material === m.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate('/tob/id/model/new/population')}
          className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          上一步
        </button>
        <button onClick={handleCreate}
          className="px-5 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors">
          生成参考底模
        </button>
      </div>
    </div>
  );
}

