import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { Download, FileText, ArrowLeft } from 'lucide-react';

export function ModelExport() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppStore();
  const navigate = useNavigate();
  const model = state.idModels.find(m => m.id === id);

  if (!model) return <div className="p-8 text-center text-slate-500">未找到底模</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate(`/tob/id/model/${id}/front`)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} />返回底模视图
      </button>

      <h1 className="text-xl font-semibold text-slate-800 mb-1">导出参考底模</h1>
      <p className="text-sm text-slate-500 mb-8">{model.name}</p>

      <div className="space-y-3">
        {[
          { label: 'PDF 报告', desc: '含握持覆盖率分析、尺寸参数及人群分布图表', ext: 'PDF' },
          { label: 'STEP 参考模型', desc: '可直接导入 CAD 软件的参考底模几何体', ext: 'STEP' },
          { label: 'CSV 数据表', desc: '原始参数数据，供进一步分析使用', ext: 'CSV' },
        ].map(item => (
          <div key={item.ext} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-teal-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 text-sm rounded-lg hover:bg-teal-100 transition-colors">
              <Download size={14} />下载
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

