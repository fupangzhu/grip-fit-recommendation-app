import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '../../ToBStore';
import { Download, FileText, ArrowLeft, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export function ReviewExport() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppStore();
  const navigate = useNavigate();
  const review = state.idReviews.find(r => r.id === id);

  if (!review) return <div className="p-8 text-center text-slate-500">未找到评审记录</div>;

  const highCount = review.issues.filter(i => i.severity === 'high').length;
  const medCount = review.issues.filter(i => i.severity === 'medium').length;
  const okCount = review.issues.filter(i => i.severity === 'ok').length;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate(`/tob/id/review/${id}/overview`)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} />返回评审概览
      </button>

      <h1 className="text-xl font-semibold text-slate-800 mb-1">导出评审报告</h1>
      <p className="text-sm text-slate-500 mb-2">{review.name}</p>

      <div className="flex gap-4 mb-8 text-sm">
        <div className="flex items-center gap-1.5 text-rose-600">
          <AlertTriangle size={13} />{highCount} 高风险
        </div>
        <div className="flex items-center gap-1.5 text-amber-600">
          <Info size={13} />{medCount} 中风险
        </div>
        <div className="flex items-center gap-1.5 text-teal-600">
          <CheckCircle size={13} />{okCount} 通过
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'PDF 完整评审报告', desc: '含所有问题分析、热力图截图及优化建议', ext: 'PDF' },
          { label: 'Word 可编辑版本', desc: '可供设计团队直接批注修改', ext: 'DOCX' },
          { label: 'CSV 问题数据表', desc: '所有问题条目的结构化数据', ext: 'CSV' },
          { label: 'JSON 数据包', desc: '供研发系统对接使用的原始数据', ext: 'JSON' },
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

