import { useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { IDGripHabit, IDHandPercentile, IDUseScene } from '../../ToBStore';

const AGE_OPTIONS = ['18-25', '26-35', '36-45', '46-55', '55+'];
const PERCENTILE_OPTIONS: IDHandPercentile[] = ['P5', 'P50', 'P95'];
const GRIP_OPTIONS: { value: IDGripHabit; label: string }[] = [
  { value: 'onehand_right', label: '单手右手' },
  { value: 'onehand_left', label: '单手左手' },
  { value: 'twohand', label: '双手持握' },
];
const SCENE_OPTIONS: { value: IDUseScene; label: string }[] = [
  { value: 'commute', label: '通勤场景' },
  { value: 'office', label: '办公室' },
  { value: 'outdoor', label: '户外' },
];

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

export function PopulationStep() {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const pop = state.idModelWizard.population;

  const ageGroups = (pop.ageGroups ?? []) as string[];
  const percentiles = (pop.percentiles ?? []) as IDHandPercentile[];
  const gripHabits = (pop.gripHabits ?? []) as IDGripHabit[];
  const useScenes = (pop.useScenes ?? []) as IDUseScene[];
  const genderRatio = pop.genderRatio ?? 50;

  function updatePop(patch: Partial<typeof pop>) {
    dispatch({ type: 'SET_ID_MODEL_WIZARD', payload: { population: { ...pop, ...patch } } });
  }

  const canContinue = ageGroups.length > 0 && percentiles.length > 0 && gripHabits.length > 0 && useScenes.length > 0;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-slate-400 mb-1">第 1 步 / 共 2 步</div>
        <h1 className="text-xl font-semibold text-slate-800">定义目标人群</h1>
        <p className="text-sm text-slate-500 mt-1">指定此参考底模覆盖的用户群体特征，系统将据此计算握持适配覆盖率。</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">年龄段</div>
          <div className="flex flex-wrap gap-2">
            {AGE_OPTIONS.map(a => (
              <button key={a} onClick={() => updatePop({ ageGroups: toggle(ageGroups, a) })}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${ageGroups.includes(a) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">手型百分位</div>
          <div className="flex flex-wrap gap-2">
            {PERCENTILE_OPTIONS.map(p => (
              <button key={p} onClick={() => updatePop({ percentiles: toggle(percentiles, p) })}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${percentiles.includes(p) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">握持习惯</div>
          <div className="flex flex-wrap gap-2">
            {GRIP_OPTIONS.map(g => (
              <button key={g.value} onClick={() => updatePop({ gripHabits: toggle(gripHabits, g.value) })}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${gripHabits.includes(g.value) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">使用场景</div>
          <div className="flex flex-wrap gap-2">
            {SCENE_OPTIONS.map(s => (
              <button key={s.value} onClick={() => updatePop({ useScenes: toggle(useScenes, s.value) })}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${useScenes.includes(s.value) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">性别比例（女性占比 {genderRatio}%）</div>
          <input type="range" min={0} max={100} value={genderRatio}
            onChange={e => updatePop({ genderRatio: Number(e.target.value) })}
            className="w-full accent-teal-600" />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate('/tob/id/dashboard')}
          className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          取消
        </button>
        <button onClick={() => navigate('/tob/id/model/new/attributes')}
          disabled={!canContinue}
          className="px-5 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          下一步：外观属性
        </button>
      </div>
    </div>
  );
}

