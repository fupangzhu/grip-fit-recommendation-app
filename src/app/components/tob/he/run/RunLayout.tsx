import { Outlet, useParams, useNavigate, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useAppStore, RUN_STEPS, RunStep } from '../../ToBStore';

export function RunLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppStore();

  const project = state.heProjects.find(p => p.id === id);
  const currentPath = location.pathname.split('/').pop() as RunStep;
  const currentIndex = RUN_STEPS.findIndex(s => s.key === currentPath);
  const projectStepIndex = RUN_STEPS.findIndex(s => s.key === project?.currentStep);
  // Allow navigation to any step up to max(project currentStep, currently viewed step)
  const maxReachableIndex = Math.max(projectStepIndex, currentIndex);

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(`/tob/he/projects/${id}`)}
            className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 text-sm">
            <ArrowLeft size={15} />
            {project?.name ?? '返回项目'}
          </button>
        </div>

        {/* Step progress bar */}
        <div className="flex items-center gap-1">
          {RUN_STEPS.map((step, i) => {
            const isDone = i < projectStepIndex || (i <= projectStepIndex && i < currentIndex);
            const isActive = currentPath === step.key;
            const isReachable = i <= maxReachableIndex;
            return (
              <div key={step.key} className="flex items-center gap-1">
                <button
                  onClick={() => isReachable && navigate(`/tob/he/projects/${id}/run/${step.key}`)}
                  disabled={!isReachable}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    isActive ? 'bg-indigo-600 text-white shadow-sm' :
                    isDone ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                    isReachable ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' :
                    'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                  style={{ fontWeight: isActive ? 600 : 400 }}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${isActive ? 'bg-white/30' : isDone ? 'bg-green-500 text-white' : 'bg-current/20'}`}
                    style={{ fontWeight: 700 }}>
                    {isDone ? '✓' : i + 1}
                  </span>
                  {step.label}
                </button>
                {i < RUN_STEPS.length - 1 && (
                  <div className={`w-5 h-px ${i < projectStepIndex ? 'bg-green-300' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
