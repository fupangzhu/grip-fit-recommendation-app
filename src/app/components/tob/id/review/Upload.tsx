import { useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { Upload as UploadIcon } from 'lucide-react';
import { useRef } from 'react';

export function ReviewUpload() {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const wiz = state.idReviewWizard;

  function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'step' && ext !== 'fbx') return;
    dispatch({
      type: 'SET_ID_REVIEW_WIZARD',
      payload: {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        fileType: ext as 'step' | 'fbx',
      },
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDemo() {
    dispatch({
      type: 'SET_ID_REVIEW_WIZARD',
      payload: { fileName: 'nova_flip_draft_v1.step', fileSize: '2.4 MB', fileType: 'step' },
    });
  }

  const canContinue = !!wiz.fileType;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-slate-400 mb-1">第 1 步 / 共 2 步</div>
        <h1 className="text-xl font-semibold text-slate-800">上传设计文件</h1>
        <p className="text-sm text-slate-500 mt-1">上传 STEP 或 FBX 格式的三维方案文件，系统将自动提取尺寸参数。</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${wiz.fileName ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300 bg-white'}`}>
        <input ref={inputRef} type="file" accept=".step,.fbx" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        <UploadIcon size={32} className={`mx-auto mb-3 ${wiz.fileName ? 'text-teal-500' : 'text-slate-300'}`} />
        {wiz.fileName ? (
          <div>
            <div className="text-sm font-medium text-teal-700">{wiz.fileName}</div>
            <div className="text-xs text-teal-500 mt-0.5">{wiz.fileSize} · {wiz.fileType?.toUpperCase()}</div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-slate-600">拖拽文件到此处，或点击选择文件</div>
            <div className="text-xs text-slate-400 mt-1">支持 .step / .fbx 格式</div>
          </div>
        )}
      </div>

      {!wiz.fileName && (
        <button onClick={handleDemo}
          className="mt-3 w-full text-center text-sm text-teal-600 hover:text-teal-700 py-2 transition-colors">
          使用演示文件（nova_flip_draft_v1.step）
        </button>
      )}

      <div className="flex justify-between mt-8">
        <button onClick={() => navigate('/tob/id/dashboard')}
          className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          取消
        </button>
        <button onClick={() => navigate('/tob/id/review/population')}
          disabled={!canContinue}
          className="px-5 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          下一步：配置人群
        </button>
      </div>
    </div>
  );
}

