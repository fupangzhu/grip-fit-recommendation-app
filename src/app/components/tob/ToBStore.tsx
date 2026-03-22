import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ─── Core types ─────────────────────────────────────────────────────────────
export type Role = 'he' | 'id' | 'ux';
export type ResearchType = 'comfort' | 'thermal' | 'acoustic' | 'vibration' | 'touch' | 'weight' | 'form';
export type FormFactor = 'bar' | 'flip' | 'fold';
export type ExperimentStatus = 'draft' | 'recruiting' | 'running' | 'analyzing' | 'completed' | 'archived';
export type RunStep = 'participants' | 'lab' | 'setup' | 'questionnaire' | 'collect' | 'analysis';
export type InvitationStatus = 'sent' | 'confirmed' | 'declined' | 'noReply';

// ─── Label maps ──────────────────────────────────────────────────────────────
export const RESEARCH_TYPE_LABELS: Record<ResearchType, string> = {
  comfort: '握持舒适度', thermal: '热控制体验', acoustic: '声学体验',
  vibration: '振动体验', touch: '触控手感', weight: '重量感知', form: '形态适配性',
};
export const RESEARCH_TYPE_ICONS: Record<ResearchType, string> = {
  comfort: '🤝', thermal: '🌡️', acoustic: '🔊',
  vibration: '📳', touch: '👆', weight: '⚖️', form: '📐',
};
export const RESEARCH_TYPE_DESC: Record<ResearchType, string> = {
  comfort: '静态与动态握持的主观舒适感受',
  thermal: '长时间使用下机身温度的主观感受',
  acoustic: '扬声器音量、音质与通话清晰度感受',
  vibration: '马达震动的力度、纹理、反馈识别感',
  touch: '屏幕玻璃触感、边框握感、按键阻尼',
  weight: '主观重量感受与持握疲劳评估',
  form: '整机尺寸与用户手型的匹配程度',
};
export const STATUS_LABELS: Record<ExperimentStatus, string> = {
  draft: '规划中', recruiting: '招募被试', running: '实验进行中',
  analyzing: '数据分析中', completed: '已完成', archived: '已归档',
};
export const STATUS_COLORS: Record<ExperimentStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  recruiting: 'bg-blue-100 text-blue-700',
  running: 'bg-indigo-100 text-indigo-700',
  analyzing: 'bg-violet-100 text-violet-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};
export const FORM_FACTOR_LABELS: Record<FormFactor, string> = {
  bar: '直板', flip: '竖折', fold: '横折',
};
export const RUN_STEPS: { key: RunStep; label: string }[] = [
  { key: 'participants', label: '被试筛选' },
  { key: 'lab', label: '实验室安排' },
  { key: 'setup', label: '环境搭建' },
  { key: 'questionnaire', label: '量表配置' },
  { key: 'collect', label: '数据采集' },
  { key: 'analysis', label: '分析结论' },
];

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface ProjectParticipant {
  code: string;
  handLength: number;
  handWidth: number;
  thumbSpan: number;
  gripHabit: 'onehand' | 'twohand';
  ageGroup: '18-25' | '26-35' | '36-45';
  invitationStatus: InvitationStatus;
  questProgress: number;
  questTotal: number;
  recordingStatus: 'pending' | 'recording' | 'done';
  notes: string;
}
export interface Lab {
  id: string; name: string; location: string;
  capacity: number; equipment: string[]; available: boolean;
}
export interface HEProject {
  id: string; name: string; status: ExperimentStatus;
  researchTypes: ResearchType[]; formFactor: FormFactor;
  paradigm: string; startDate: string; period: string;
  description: string; createdAt: string; updatedAt: string;
  currentStep: RunStep; participants: ProjectParticipant[];
  participantTarget: number; deadline: string;
  memberCount: number; progress: number;
}
export interface WizardState {
  name: string; researchTypes: ResearchType[]; formFactor: FormFactor;
  startDate: string; period: string; description: string; paradigm: string;
}

// ─── ID-designer NEW types ────────────────────────────────────────────────────
export type IDHandPercentile = 'P5' | 'P50' | 'P95';
export type IDGripHabit = 'onehand_right' | 'onehand_left' | 'twohand';
export type IDUseScene = 'commute' | 'office' | 'outdoor';
export type IDMaterial = 'metal' | 'glass' | 'leather' | 'plastic';
export type IDVolumeKeyPos = 'left_upper' | 'right_upper';
export type IDPowerKeyPos = 'right' | 'top';
export type IDScreenRatio = '20:9' | '21:9' | 'custom';
export type IDIssueSeverity = 'high' | 'medium' | 'ok';

export interface IDModelPopulation {
  ageGroups: string[];
  genderRatio: number;
  percentiles: IDHandPercentile[];
  gripHabits: IDGripHabit[];
  useScenes: IDUseScene[];
}

export interface IDModelDimensions {
  formFactor: FormFactor;
  width: number;
  height: number;
  thickness: number;
  cornerRadius: number;
  volumeKeyPos: IDVolumeKeyPos;
  powerKeyPos: IDPowerKeyPos;
  screenRatio: IDScreenRatio;
  material: IDMaterial;
}

export interface IDModel {
  id: string;
  name: string;
  createdAt: string;
  population: IDModelPopulation;
  dimensions: IDModelDimensions;
  coverageP5: number;
  coverageP50: number;
  coverageP95: number;
}

export interface IDReviewZone {
  x: number; y: number; w: number; h: number;
  view: 'front' | 'side';
}

export interface IDReviewIssue {
  id: string;
  area: string;
  severity: IDIssueSeverity;
  description: string;
  affectedPopulations: IDHandPercentile[];
  recommendations: string[];
  currentValue: string;
  recommendedRange: string;
  zone: IDReviewZone;
}

export interface IDReview {
  id: string;
  name: string;
  fileName: string;
  fileSize: string;
  fileType: 'step' | 'fbx';
  uploadedAt: string;
  population: IDModelPopulation;
  extractedWidth: number;
  extractedHeight: number;
  extractedThickness: number;
  issues: IDReviewIssue[];
}

export interface IDModelWizard {
  population: Partial<IDModelPopulation>;
  dimensions: Partial<IDModelDimensions>;
}

export interface IDReviewWizard {
  fileName: string;
  fileSize: string;
  fileType: 'step' | 'fbx' | null;
  population: Partial<IDModelPopulation>;
}

// ─── ID-designer types (preserved from v1) ───────────────────────────────────
export type Positioning = 'entry' | 'mid' | 'flagship' | 'ultra';
export type GripStyle = 'onehand' | 'twohand' | 'mixed';
export interface Parameter {
  recommended: number; min: number; max: number;
  tolerance: number; unit: string; coverage: number; constraint?: number;
}
export interface Parameters {
  width: Parameter; height: Parameter; thickness: Parameter;
  weight: Parameter; cornerRadius: Parameter;
}
export const POSITIONING_LABELS: Record<Positioning, string> = {
  entry: '入门', mid: '中端', flagship: '旗舰', ultra: '超旗舰',
};
export const GRIP_STYLE_LABELS: Record<GripStyle, string> = {
  onehand: '单手握持', twohand: '双手握持', mixed: '混合握持',
};
export const POSITIONING_COLORS: Record<Positioning, string> = {
  entry: 'bg-gray-100 text-gray-600', mid: 'bg-teal-100 text-teal-700',
  flagship: 'bg-violet-100 text-violet-700', ultra: 'bg-amber-100 text-amber-700',
};
export function calcParameters(p: Positioning, f: FormFactor, g: GripStyle): Parameters {
  const base: Record<Positioning, Record<string, number>> = {
    entry:    { width: 75.5, height: 163.5, thickness: 8.5, weight: 205, cornerRadius: 10 },
    mid:      { width: 73.0, height: 158.0, thickness: 7.8, weight: 190, cornerRadius: 12 },
    flagship: { width: 71.0, height: 153.0, thickness: 7.2, weight: 185, cornerRadius: 14 },
    ultra:    { width: 69.5, height: 149.2, thickness: 6.5, weight: 175, cornerRadius: 16 },
  };
  let b = { ...base[p] };
  if (f === 'fold') { b.width = Math.round(b.width*1.85*10)/10; b.thickness = Math.round(b.thickness*1.4*10)/10; b.weight = Math.round(b.weight*1.38); }
  else if (f === 'flip') { b.height = Math.round(b.height*0.555*10)/10; b.thickness = Math.round(b.thickness*2.05*10)/10; b.weight = Math.round(b.weight*1.02); }
  if (g === 'onehand') b.width = Math.round((b.width-1.5)*10)/10;
  else if (g === 'twohand') b.width = Math.round((b.width+1.5)*10)/10;
  const tol: Record<Positioning, number> = { entry:2.5, mid:2.0, flagship:1.5, ultra:1.2 };
  const t = tol[p];
  const cov: Record<Positioning, number[]> = {
    entry:[79.3,82.1,87.6,81.4,84.5], mid:[83.2,86.4,89.1,84.7,88.0],
    flagship:[87.5,89.2,91.3,87.8,90.5], ultra:[88.5,91.2,94.1,89.7,92.3],
  };
  const [wC,hC,tC,wtC,rC] = cov[p];
  return {
    width:        { recommended: b.width, min: Math.round((b.width-t)*10)/10, max: Math.round((b.width+t)*10)/10, tolerance: t, unit:'mm', coverage: wC },
    height:       { recommended: b.height, min: Math.round((b.height-t*1.8)*10)/10, max: Math.round((b.height+t*1.8)*10)/10, tolerance: t*1.8, unit:'mm', coverage: hC },
    thickness:    { recommended: b.thickness, min: Math.round((b.thickness-t*0.2)*10)/10, max: Math.round((b.thickness+t*0.2)*10)/10, tolerance: t*0.2, unit:'mm', coverage: tC },
    weight:       { recommended: b.weight, min: Math.round(b.weight-t*5), max: Math.round(b.weight+t*5), tolerance: t*5, unit:'g', coverage: wtC },
    cornerRadius: { recommended: b.cornerRadius, min: Math.round((b.cornerRadius-t)*10)/10, max: Math.round((b.cornerRadius+t)*10)/10, tolerance: t, unit:'mm', coverage: rC },
  };
}

// ─── Mock data ───────────────────────────────────────────────────────────────
function mkP(code: string, hl: number, hw: number, ts: number, grip: 'onehand'|'twohand', age: '18-25'|'26-35'|'36-45', inv: InvitationStatus, qp: number, qt: number, rec: 'pending'|'recording'|'done'): ProjectParticipant {
  return { code, handLength: hl, handWidth: hw, thumbSpan: ts, gripHabit: grip, ageGroup: age, invitationStatus: inv, questProgress: qp, questTotal: qt, recordingStatus: rec, notes: '' };
}

const mockHEProjects: HEProject[] = [
  {
    id: 'he-001', name: '旗舰机握持舒适度研究 A2026', status: 'recruiting',
    researchTypes: ['comfort', 'form'], formFactor: 'bar',
    paradigm: '主观量表评定 + 比较判断法', startDate: '2026-03-25', period: '2周',
    description: '针对新旗舰机型握持手感的系统性用户研究，目标覆盖M/L手型主力用户群',
    createdAt: '2026-03-10', updatedAt: '2026-03-18', currentStep: 'participants',
    participantTarget: 20, deadline: '2026-04-15', memberCount: 4, progress: 18,
    participants: [
      mkP('P001',178,80,95,'onehand','26-35','confirmed',0,18,'pending'),
      mkP('P002',165,74,88,'onehand','18-25','confirmed',0,18,'pending'),
      mkP('P003',182,84,100,'twohand','26-35','confirmed',0,18,'pending'),
      mkP('P004',171,78,92,'onehand','36-45','confirmed',0,18,'pending'),
      mkP('P005',176,81,96,'onehand','26-35','confirmed',0,18,'pending'),
      mkP('P006',168,76,90,'twohand','18-25','sent',0,18,'pending'),
      mkP('P007',183,85,102,'twohand','36-45','sent',0,18,'pending'),
      mkP('P008',170,77,91,'onehand','26-35','sent',0,18,'pending'),
      mkP('P009',174,79,94,'onehand','18-25','noReply',0,18,'pending'),
      mkP('P010',180,82,98,'twohand','26-35','noReply',0,18,'pending'),
      mkP('P011',167,75,89,'onehand','36-45','declined',0,18,'pending'),
    ],
  },
  {
    id: 'he-002', name: 'Fold Z4 热控制体验研究', status: 'running',
    researchTypes: ['thermal'], formFactor: 'fold',
    paradigm: '温度主观感受量表 + 热舒适区间评定', startDate: '2026-03-01', period: '1月',
    description: '评估折叠屏手机长时间使用下的热感知体验，建立热舒适标准',
    createdAt: '2026-02-18', updatedAt: '2026-03-17', currentStep: 'collect',
    participantTarget: 20, deadline: '2026-04-01', memberCount: 5, progress: 65,
    participants: [
      mkP('P001',178,80,95,'onehand','26-35','confirmed',10,10,'done'),
      mkP('P002',165,74,88,'onehand','18-25','confirmed',10,10,'done'),
      mkP('P003',182,84,100,'twohand','26-35','confirmed',10,10,'done'),
      mkP('P004',171,78,92,'onehand','36-45','confirmed',10,10,'done'),
      mkP('P005',176,81,96,'onehand','26-35','confirmed',10,10,'done'),
      mkP('P006',168,76,90,'twohand','18-25','confirmed',10,10,'done'),
      mkP('P007',183,85,102,'twohand','36-45','confirmed',10,10,'done'),
      mkP('P008',170,77,91,'onehand','26-35','confirmed',10,10,'done'),
      mkP('P009',174,79,94,'onehand','18-25','confirmed',10,10,'done'),
      mkP('P010',180,82,98,'twohand','26-35','confirmed',10,10,'done'),
      mkP('P011',167,75,89,'onehand','36-45','confirmed',10,10,'done'),
      mkP('P012',175,80,94,'onehand','26-35','confirmed',10,10,'done'),
      mkP('P013',179,82,97,'twohand','18-25','confirmed',7,10,'recording'),
      mkP('P014',166,74,88,'onehand','26-35','confirmed',5,10,'recording'),
      mkP('P015',181,83,99,'twohand','36-45','confirmed',3,10,'recording'),
      mkP('P016',172,78,93,'onehand','18-25','confirmed',0,10,'pending'),
      mkP('P017',177,80,95,'twohand','26-35','confirmed',0,10,'pending'),
      mkP('P018',184,86,103,'onehand','36-45','confirmed',0,10,'pending'),
      mkP('P019',169,76,90,'onehand','26-35','confirmed',0,10,'pending'),
      mkP('P020',173,79,93,'twohand','18-25','confirmed',0,10,'pending'),
    ],
  },
  {
    id: 'he-003', name: 'X Ultra 振动感知量化实验', status: 'analyzing',
    researchTypes: ['vibration'], formFactor: 'bar',
    paradigm: '振动强度感知量表 + 触觉纹理辨别', startDate: '2026-02-10', period: '3周',
    description: '量化不同马达参数组合对用户振动感知的影响，建立优化模型',
    createdAt: '2026-02-01', updatedAt: '2026-03-15', currentStep: 'analysis',
    participantTarget: 20, deadline: '2026-03-31', memberCount: 3, progress: 88,
    participants: Array.from({ length: 20 }, (_, i) =>
      mkP(`P${String(i+1).padStart(3,'0')}`, 168+i, 76+Math.floor(i/4), 90+i, i%2===0?'onehand':'twohand', i<7?'18-25':i<14?'26-35':'36-45', 'confirmed', 8, 8, 'done')
    ),
  },
  {
    id: 'he-004', name: 'Fold Z5 声学体验评测规划', status: 'draft',
    researchTypes: ['acoustic'], formFactor: 'fold',
    paradigm: '', startDate: '', period: '2周',
    description: '下一代折叠屏扬声器与通话体验的前期研究规划',
    createdAt: '2026-03-15', updatedAt: '2026-03-15', currentStep: 'participants',
    participantTarget: 25, deadline: '2026-05-01', memberCount: 2, progress: 5,
    participants: [],
  },
  {
    id: 'he-005', name: 'Nova Flip 触控手感与重量研究', status: 'running',
    researchTypes: ['touch', 'weight'], formFactor: 'flip',
    paradigm: '主观量表评定 + 持续握持疲劳测试', startDate: '2026-03-05', period: '2周',
    description: '竖折手机展开/折叠态下触控手感与重量感知专项研究',
    createdAt: '2026-02-28', updatedAt: '2026-03-16', currentStep: 'setup',
    participantTarget: 15, deadline: '2026-04-10', memberCount: 4, progress: 40,
    participants: Array.from({ length: 15 }, (_, i) =>
      mkP(`P${String(i+1).padStart(3,'0')}`, 165+i, 74+Math.floor(i/3), 88+i, i%3===0?'twohand':'onehand', i<5?'18-25':i<10?'26-35':'36-45', 'confirmed', 0, 12, 'pending')
    ),
  },
  {
    id: 'he-006', name: 'Lite S6 形态适配研究', status: 'completed',
    researchTypes: ['form', 'weight'], formFactor: 'bar',
    paradigm: '主观量表评定 + 身体地图标注', startDate: '2026-01-05', period: '3周',
    description: '入门级直板机型对大众手型的适配性评估，已完成归档',
    createdAt: '2025-12-20', updatedAt: '2026-02-10', currentStep: 'analysis',
    participantTarget: 22, deadline: '2026-02-15', memberCount: 5, progress: 100,
    participants: Array.from({ length: 22 }, (_, i) =>
      mkP(`P${String(i+1).padStart(3,'0')}`, 164+i, 73+Math.floor(i/4), 87+i, i%2===0?'onehand':'twohand', i<8?'18-25':i<16?'26-35':'36-45', 'confirmed', 18, 18, 'done')
    ),
  },
];

export const mockLabs: Lab[] = [
  { id: 'lab-1', name: '人因实验室 A', location: 'B栋3楼 301室', capacity: 8, equipment: ['摄像头×4', '录音设备', '压力板×2', '眼动仪'], available: true },
  { id: 'lab-2', name: '声学暗室', location: 'B栋2楼 205室', capacity: 4, equipment: ['专业麦克风×4', '隔音设备', '音频分析仪'], available: true },
  { id: 'lab-3', name: '开放实验区', location: 'C栋1楼 大厅', capacity: 12, equipment: ['摄像头×2', '录音设备'], available: false },
];

export const mockIDModels: IDModel[] = [
  {
    id: 'model-001',
    name: '旗舰直板参考底模 A2026',
    createdAt: '2026-03-15',
    population: { ageGroups: ['18-25', '26-35', '36-45'], genderRatio: 50, percentiles: ['P5', 'P50', 'P95'], gripHabits: ['onehand_right'], useScenes: ['commute', 'office'] },
    dimensions: { formFactor: 'bar', width: 71.0, height: 153.0, thickness: 7.2, cornerRadius: 14, volumeKeyPos: 'left_upper', powerKeyPos: 'right', screenRatio: '20:9', material: 'metal' },
    coverageP5: 72.3, coverageP50: 89.2, coverageP95: 94.1,
  },
  {
    id: 'model-002',
    name: 'Fold Z5 折叠参考底模',
    createdAt: '2026-03-10',
    population: { ageGroups: ['26-35', '36-45'], genderRatio: 40, percentiles: ['P50', 'P95'], gripHabits: ['twohand'], useScenes: ['office'] },
    dimensions: { formFactor: 'fold', width: 132.5, height: 153.0, thickness: 10.1, cornerRadius: 12, volumeKeyPos: 'right_upper', powerKeyPos: 'right', screenRatio: '21:9', material: 'metal' },
    coverageP5: 0, coverageP50: 78.5, coverageP95: 88.3,
  },
];

export const mockIDReviews: IDReview[] = [
  {
    id: 'review-001',
    name: 'Nova Flip 初稿方案评审',
    fileName: 'nova_flip_draft_v1.step',
    fileSize: '2.4 MB',
    fileType: 'step',
    uploadedAt: '2026-03-17',
    population: { ageGroups: ['18-25', '26-35', '36-45'], genderRatio: 50, percentiles: ['P5', 'P50', 'P95'], gripHabits: ['onehand_right', 'twohand'], useScenes: ['commute', 'office'] },
    extractedWidth: 75.5,
    extractedHeight: 168.2,
    extractedThickness: 8.8,
    issues: [
      { id: 'issue-001', area: '顶部单手可达区域', severity: 'high', description: '当前方案顶部高度 168.2mm 对 P5 用户（手长 ≤166mm）单手持握时，拇指无法触及顶部 25% 的屏幕区域。', affectedPopulations: ['P5'], recommendations: ['建议将整机高度压缩至 162mm 以内', '或在 UI 层增加单手模式折叠布局'], currentValue: '168.2 mm', recommendedRange: '≤ 162 mm（P5 单手适配）', zone: { x: 0.05, y: 0.0, w: 0.9, h: 0.25, view: 'front' } },
      { id: 'issue-002', area: '机身宽度握持稳定性', severity: 'high', description: '75.5mm 的机身宽度超出 P5 用户舒适握持范围（推荐 ≤72mm），长时间握持疲劳风险高。', affectedPopulations: ['P5'], recommendations: ['建议将机身宽度收窄至 72mm 以内', '或优化侧边曲线增加握持摩擦'], currentValue: '75.5 mm', recommendedRange: '≤ 72 mm（P5 人群）', zone: { x: 0.0, y: 0.2, w: 0.12, h: 0.6, view: 'front' } },
      { id: 'issue-003', area: '音量键操作舒适性', severity: 'medium', description: '音量键位置对 P5 单手右手用户操作需较大拇指上翻角度，操作舒适性一般。', affectedPopulations: ['P5'], recommendations: ['建议将音量键整体下移约 8mm'], currentValue: '距顶部 38mm', recommendedRange: '距顶部 42-55mm（P5 单手）', zone: { x: 0.0, y: 0.2, w: 0.12, h: 0.15, view: 'front' } },
      { id: 'issue-004', area: '电源键误触风险', severity: 'medium', description: '当前电源键位置对 P95 大手用户握持时存在误触风险，行程偏浅。', affectedPopulations: ['P95'], recommendations: ['建议将电源键上移约 5mm', '可考虑增大按键行程以降低误触率'], currentValue: '距底部 62mm', recommendedRange: '距底部 65-75mm（P95 人群）', zone: { x: 0.88, y: 0.35, w: 0.12, h: 0.12, view: 'front' } },
      { id: 'issue-005', area: '折叠缝隙体感', severity: 'medium', description: '折叠缝隙宽度约 0.4mm，P50 用户长时间双手使用时拇指指腹会感受到轻微不适。', affectedPopulations: ['P50'], recommendations: ['参考 HE 研究结论：缝隙宽度 ≤0.25mm 主观感受合理'], currentValue: '缝隙 0.4 mm', recommendedRange: '≤ 0.25 mm', zone: { x: 0.05, y: 0.48, w: 0.9, h: 0.04, view: 'front' } },
      { id: 'issue-006', area: '机身厚度（折叠态）', severity: 'ok', description: '折叠态厚度 8.8mm 在 P50 用户握持舒适区间内，感知为"较轻薄"。', affectedPopulations: ['P50', 'P95'], recommendations: [], currentValue: '8.8 mm', recommendedRange: '7.5-9.5 mm（舒适区间）', zone: { x: 0.0, y: 0.1, w: 0.15, h: 0.8, view: 'side' } },
      { id: 'issue-007', area: '底部手势操作区', severity: 'ok', description: '底部 15mm 手势操作区对所有用户均处于舒适可达范围内，设计合理。', affectedPopulations: ['P5', 'P50', 'P95'], recommendations: [], currentValue: '底部区域 15mm', recommendedRange: '10-20mm（推荐）', zone: { x: 0.05, y: 0.85, w: 0.9, h: 0.15, view: 'front' } },
      { id: 'issue-008', area: '重量重心分布', severity: 'ok', description: '重心位置约在整机 52% 高度处，P50 单手持握稳定性良好。', affectedPopulations: ['P50', 'P95'], recommendations: [], currentValue: '重心高度 52%', recommendedRange: '48-55%（稳定区间）', zone: { x: 0.1, y: 0.4, w: 0.8, h: 0.2, view: 'front' } },
    ],
  },
];

// ─── App state & reducer ─────────────────────────────────────────────────────
const defaultWizard: WizardState = {
  name: '', researchTypes: [], formFactor: 'bar',
  startDate: '', period: '2周', description: '', paradigm: '',
};

const defaultIDModelWizard: IDModelWizard = {
  population: { ageGroups: [], genderRatio: 50, percentiles: ['P50'], gripHabits: [], useScenes: [] },
  dimensions: { formFactor: 'bar', width: 71, height: 153, thickness: 7.5, cornerRadius: 14, volumeKeyPos: 'left_upper', powerKeyPos: 'right', screenRatio: '20:9', material: 'metal' },
};
const defaultIDReviewWizard: IDReviewWizard = { fileName: '', fileSize: '', fileType: null, population: { ageGroups: [], genderRatio: 50, percentiles: ['P50'], gripHabits: [], useScenes: [] } };

interface AppState {
  role: Role | null;
  heProjects: HEProject[];
  wizard: WizardState;
  idModels: IDModel[];
  idReviews: IDReview[];
  idModelWizard: IDModelWizard;
  idReviewWizard: IDReviewWizard;
}

type Action =
  | { type: 'SET_ROLE'; payload: Role | null }
  | { type: 'SET_WIZARD'; payload: Partial<WizardState> }
  | { type: 'ADD_HE_PROJECT'; payload: HEProject }
  | { type: 'UPDATE_HE_PROJECT'; payload: { id: string; updates: Partial<HEProject> } }
  | { type: 'RESET_WIZARD' }
  | { type: 'SET_ID_MODEL_WIZARD'; payload: Partial<IDModelWizard> }
  | { type: 'RESET_ID_MODEL_WIZARD' }
  | { type: 'ADD_ID_MODEL'; payload: IDModel }
  | { type: 'SET_ID_REVIEW_WIZARD'; payload: Partial<IDReviewWizard> }
  | { type: 'RESET_ID_REVIEW_WIZARD' }
  | { type: 'ADD_ID_REVIEW'; payload: IDReview };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE': return { ...state, role: action.payload };
    case 'SET_WIZARD': return { ...state, wizard: { ...state.wizard, ...action.payload } };
    case 'ADD_HE_PROJECT': return { ...state, heProjects: [action.payload, ...state.heProjects] };
    case 'UPDATE_HE_PROJECT':
      return { ...state, heProjects: state.heProjects.map(p => p.id === action.payload.id ? { ...p, ...action.payload.updates } : p) };
    case 'RESET_WIZARD': return { ...state, wizard: defaultWizard };
    case 'SET_ID_MODEL_WIZARD': return { ...state, idModelWizard: { ...state.idModelWizard, ...action.payload } };
    case 'RESET_ID_MODEL_WIZARD': return { ...state, idModelWizard: defaultIDModelWizard };
    case 'ADD_ID_MODEL': return { ...state, idModels: [action.payload, ...state.idModels] };
    case 'SET_ID_REVIEW_WIZARD': return { ...state, idReviewWizard: { ...state.idReviewWizard, ...action.payload } };
    case 'RESET_ID_REVIEW_WIZARD': return { ...state, idReviewWizard: defaultIDReviewWizard };
    case 'ADD_ID_REVIEW': return { ...state, idReviews: [action.payload, ...state.idReviews] };
    default: return state;
  }
}

interface AppContextType { state: AppState; dispatch: React.Dispatch<Action>; }
const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    role: null,
    heProjects: mockHEProjects,
    wizard: defaultWizard,
    idModels: mockIDModels,
    idReviews: mockIDReviews,
    idModelWizard: defaultIDModelWizard,
    idReviewWizard: defaultIDReviewWizard,
  });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppProvider');
  return ctx;
}
