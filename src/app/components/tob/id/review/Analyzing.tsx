import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { IDReview } from '../../ToBStore';
import { mockIDReviews } from '../../ToBStore';

const STEPS = [
  '解析几何体结构…',
  '提取机身轮廓尺寸…',
  '映射手型数据库…',
  '计算握持覆盖率…',
  '生成人机问题清单…',
  '分析完成',
];

export function ReviewAnalyzing() {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const wiz = state.idReviewWizard;

  useEffect(() => {
    if (step < STEPS.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        // Use the mock review as the "analysis result" to keep the demo rich
        const existingReview = mockIDReviews.find(r => r.fileName === wiz.fileName);
        const newReview: IDReview = existingReview
          ? { ...existingReview, id: `review-${Date.now()}` }
          : {
              id: `review-${Date.now()}`,
              name: wiz.fileName.replace(/\.[^.]+$/, '') + ' 评审',
              fileName: wiz.fileName,
              fileSize: wiz.fileSize,
              fileType: wiz.fileType ?? 'step',
              uploadedAt: new Date().toISOString().slice(0, 10),
              population: {
                ageGroups: wiz.population.ageGroups ?? [],
                genderRatio: wiz.population.genderRatio ?? 50,
                percentiles: wiz.population.percentiles ?? ['P50'],
                gripHabits: wiz.population.gripHabits ?? [],
                useScenes: wiz.population.useScenes ?? [],
              },
              extractedWidth: 75.5,
              extractedHeight: 168.2,
              extractedThickness: 8.8,
              issues: [],
            };

        dispatch({ type: 'ADD_ID_REVIEW', payload: newReview });
        dispatch({ type: 'RESET_ID_REVIEW_WIZARD' });
        setDone(true);
        setTimeout(() => navigate(`/tob/id/review/${newReview.id}/overview`), 500);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex items-center justify-center min-h-screen -mt-14">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6">
          <div className={`w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent ${done ? '' : 'animate-spin'}`} />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">正在分析方案</h2>
        <p className="text-sm text-teal-600 mb-6">{STEPS[step]}</p>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
          <div className="h-2 bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs text-slate-400">{progress}%</div>
      </div>
    </div>
  );
}

