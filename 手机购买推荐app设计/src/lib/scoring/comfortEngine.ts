import type { PhoneModel, HandData } from '../../app/components/AppContext';
import type { ScoringFormula, CategoricalPreference } from '../api/scoring';

/**
 * 舒适度评分引擎
 *
 * 核心公式: comfortScore = Σ(a_i·x_i² + b_i·x_i + c_i) + Σ(preference_j)
 *
 * 其中:
 *  - x_i 是手机参数（宽度、高度、重量等）与用户手部数据的交互值
 *  - a_i, b_i, c_i 是二次回归系数
 *  - preference_j 是分类变量偏好得分（如摄像模组形状）
 */

// ─── 支持的手机参数维度 ───

export const PHONE_PARAM_OPTIONS = [
    // --- 直板机 Bar ---
    { value: 'weight_bar', label: '直板机 - 重量 (g)' },
    { value: 'width_bar', label: '直板机 - 宽度 (mm)' },
    { value: 'aspect_ratio_bar', label: '直板机 - 长宽比' },
    { value: 'thickness_bar', label: '直板机 - 厚度 (mm)' },
    { value: 'side_curvature_bar', label: '直板机 - 侧边弧度' },
    { value: 'back_curvature_bar', label: '直板机 - 背面弧度' },
    { value: 'front_back_transition_bar', label: '直板机 - 正反面过渡' },
    { value: 'corner_radius_bar', label: '直板机 - 四边圆角' },
    { value: 'camera_pos_circle_bar', label: '直板机 - 摄像头位置(正圆)' },
    { value: 'camera_pos_square_bar', label: '直板机 - 摄像头位置(正方带倒角)' },
    { value: 'camera_size_circle_bar', label: '直板机 - 摄像头大小(圆形)' },
    { value: 'camera_size_square_bar', label: '直板机 - 摄像头大小(方形)' },
    { value: 'screen_ratio_equal_bar', label: '直板机 - 屏占比(四边等宽)' },
    { value: 'screen_ratio_unequal_bar', label: '直板机 - 屏占比(三边窄一边宽)' },

    // --- 上下折叠 Flip ---
    { value: 'folded_thickness_flip', label: '上下折叠 - 闭合态厚度 (mm)' },
    { value: 'weight_flip', label: '上下折叠 - 闭合态重量 (g)' },
    { value: 'crease_flip', label: '上下折叠 - 折痕深度' },
    { value: 'folded_aspect_ratio_flip', label: '上下折叠 - 闭合态长宽比' },
    { value: 'unfolded_aspect_ratio_flip', label: '上下折叠 - 展开态长宽比' },
    { value: 'camera_size_single_circle_flip', label: '上下折叠 - 摄像头大小(单圆形)' },
    { value: 'camera_size_square_flip', label: '上下折叠 - 摄像头大小(方形)' },
    { value: 'camera_size_track_flip', label: '上下折叠 - 摄像头大小(跑道型)' },
    { value: 'sub_screen_size_flip', label: '上下折叠 - 副屏大小' },

    // --- 左右折叠 Fold ---
    { value: 'width_fold', label: '左右折叠 - 整机宽 (mm)' },
    { value: 'weight_fold', label: '左右折叠 - 整机重量 (g)' },
    { value: 'folded_thickness_fold', label: '左右折叠 - 闭合厚度 (mm)' },
    { value: 'unfolded_thickness_fold', label: '左右折叠 - 展开厚度 (mm)' },
    { value: 'aspect_ratio_fold', label: '左右折叠 - 整机长宽比' },
    { value: 'hinge_protrusion_fold', label: '左右折叠 - 转轴盖凸出量' },
    { value: 'crease_fold', label: '左右折叠 - 折痕深度' },
    { value: 'sub_screen_asymmetric_r_fold', label: '左右折叠 - 副屏左右不对称R角' },
    { value: 'screen_size_fold', label: '左右折叠 - 屏幕尺寸' },

    // --- Generic ---
    { value: 'width_hand_ratio', label: '宽度/手宽比' },
    { value: 'height_hand_ratio', label: '高度/手长比' },
    { value: 'weight_hand_ratio', label: '重量/手宽比' },
] as const;

// ─── 支持的人群分类 ───

export const USER_GROUP_OPTIONS = [
    { value: 'default', label: '默认（全人群）' },
    // --- 按性别 ---
    { value: 'gender_male', label: '男性' },
    { value: 'gender_female', label: '女性' },
    // --- 按年龄 ---
    { value: 'age_youth', label: '青年 (18-35岁)' },
    { value: 'age_middle', label: '中年 (36-50岁)' },
    { value: 'age_elder', label: '老年 (50岁以上)' },
    // --- 按手长 ---
    { value: 'small_hand', label: '小手型 (手长<170mm)' },
    { value: 'medium_hand', label: '中手型 (170≤手长<190mm)' },
    { value: 'large_hand', label: '大手型 (手长≥190mm)' },
] as const;

// ─── 支持的分类维度 & 选项 ───

export const CATEGORY_OPTIONS: Record<string, { label: string; values: string[] }> = {
    camera_shape: {
        label: '摄像模组形状',
        values: ['方形岛', '圆形岛', '横条岛', '独立竖排', '独立横排', '居中圆形'],
    },
    back_material: {
        label: '背板材质',
        values: ['玻璃', '磨砂玻璃', '陶瓷', '塑料', '皮革', '金属'],
    },
    form_factor: {
        label: '机身形态',
        values: ['直板 (bar)', '折叠 (flip)', '横折 (fold)'],
    },
};

// ─── 核心计算 ───

/**
 * 根据手部数据等人群特征推断用户所属的所有人群分类
 */
export function getUserGroups(handData: HandData): string[] {
    const groups: string[] = ['default'];

    if (handData.handLength < 170) groups.push('small_hand');
    else if (handData.handLength < 190) groups.push('medium_hand');
    else groups.push('large_hand');

    // TODO: 目前 handData 中还不包含性别和年龄字段。
    // 如果后续在 AppContext/HandData 中加入了 gender 和 age 字段，可以在这里直接 push 相应的群体配置
    // if (handData.gender === 'male') groups.push('gender_male');
    // if (handData.gender === 'female') groups.push('gender_female');

    return groups;
}

/**
 * 获取手机参数值（包括与手部数据的交互比值）
 */
export function getPhoneParamValue(
    phone: PhoneModel,
    paramKey: string,
    handData: HandData
): number {
    // Basic properties mapping
    const formFactor = phone.formFactor || 'bar';
    const aspectRatio = phone.width > 0 ? phone.height / phone.width : 0;

    // Check if the current phone is compatible with the requested physical param
    // If param is for 'bar' but phone is 'fold', it should technically not apply and return 0
    if (paramKey.endsWith('_bar') && formFactor !== 'bar') return 0;
    if (paramKey.endsWith('_flip') && formFactor !== 'flip') return 0;
    if (paramKey.endsWith('_fold') && formFactor !== 'fold') return 0;

    switch (paramKey) {
        // --- Bar Parameters ---
        case 'weight_bar': return phone.weight;
        case 'width_bar': return phone.width;
        case 'aspect_ratio_bar': return aspectRatio;
        case 'thickness_bar': return phone.thickness;
        case 'side_curvature_bar': return phone.cornerRadius || 0; // fallback to corner radius

        // --- Flip Parameters ---
        case 'thickness_flip': return phone.thickness;
        case 'weight_flip': return phone.weight;
        case 'crease_flip': return 0; // Not currently modeled
        case 'side_curvature_flip': return phone.cornerRadius || 0;
        case 'aspect_ratio_flip': return aspectRatio;

        // --- Fold Parameters ---
        case 'weight_fold': return phone.weight;
        case 'unfolded_aspect_ratio_fold': return aspectRatio; // Assuming default width/height is unfolded usually
        case 'folded_thickness_fold': return phone.thickness * 2; // Rough approximation
        case 'folded_width_fold': return phone.width / 2; // Rough approximation for fold
        case 'unfolded_thickness_fold': return phone.thickness;

        // --- Interactions ---
        case 'width_hand_ratio': return phone.width / (handData.handWidth || 83);
        case 'height_hand_ratio': return phone.height / (handData.handLength || 180);
        case 'weight_hand_ratio': return phone.weight / (handData.handWidth || 83);
        default: return 0;
    }
}

/**
 * 计算单个二次回归公式的得分
 * score = a·x² + b·x + c
 */
function evalQuadratic(x: number, a: number, b: number, c: number): number {
    return a * x * x + b * x + c;
}

/**
 * 计算舒适度评分
 *
 * @param phone      手机模型
 * @param handData   用户手部数据
 * @param formulas   二次回归公式配置列表
 * @param preferences 分类偏好配置列表
 * @returns          0-100 的舒适度评分
 */
export function computeComfortScore(
    phone: PhoneModel,
    handData: HandData,
    formulas: ScoringFormula[],
    preferences: CategoricalPreference[]
): number {
    const userGroups = getUserGroups(handData);

    // 筛选出适用于当前用户所在的任何人群众的公式
    const applicableFormulas = formulas.filter(f => userGroups.includes(f.userGroup));

    // 如果同一 phoneParam 既有具体人群公式又有 default，优先用具体人群
    const formulaMap = new Map<string, ScoringFormula>();
    for (const f of applicableFormulas) {
        const existing = formulaMap.get(f.phoneParam);
        if (!existing || (existing.userGroup === 'default' && f.userGroup !== 'default')) {
            formulaMap.set(f.phoneParam, f);
        }
    }

    // 计算连续变量得分
    let continuousScore = 0;
    let formulaCount = 0;
    for (const formula of formulaMap.values()) {
        const x = getPhoneParamValue(phone, formula.phoneParam, handData);
        const score = evalQuadratic(x, formula.coeffA, formula.coeffB, formula.coeffC);
        continuousScore += score;
        formulaCount++;
    }

    // 筛选适用的分类偏好
    const applicablePrefs = preferences.filter(p => userGroups.includes(p.userGroup));
    const prefMap = new Map<string, CategoricalPreference>();
    for (const p of applicablePrefs) {
        const key = `${p.category}:${p.categoryValue}`;
        const existing = prefMap.get(key);
        if (!existing || (existing.userGroup === 'default' && p.userGroup !== 'default')) {
            prefMap.set(key, p);
        }
    }

    // 计算分类变量得分
    let categoryScore = 0;
    let categoryCount = 0;

    // 摄像模组形状
    if (phone.cameraShape) {
        const pref = prefMap.get(`camera_shape:${phone.cameraShape}`);
        if (pref) {
            categoryScore += pref.preferenceScore;
            categoryCount++;
        }
    }

    // 背板材质
    if (phone.backMaterial) {
        const pref = prefMap.get(`back_material:${phone.backMaterial}`);
        if (pref) {
            categoryScore += pref.preferenceScore;
            categoryCount++;
        }
    }

    // 机身形态
    if (phone.formFactor) {
        const formFactorLabel = phone.formFactor === 'bar' ? '直板 (bar)'
            : phone.formFactor === 'flip' ? '折叠 (flip)'
                : '横折 (fold)';
        const pref = prefMap.get(`form_factor:${formFactorLabel}`);
        if (pref) {
            categoryScore += pref.preferenceScore;
            categoryCount++;
        }
    }

    // 汇总: 连续变量均分 + 分类变量均分 => 归一化
    const totalParts = (formulaCount > 0 ? 1 : 0) + (categoryCount > 0 ? 1 : 0);
    if (totalParts === 0) return phone.comfortScore; // fallback 到原始值

    let finalScore = 0;
    if (formulaCount > 0) finalScore += continuousScore / formulaCount;
    if (categoryCount > 0) finalScore += categoryScore / categoryCount;
    finalScore = finalScore / totalParts;

    // 裁剪到 0-100
    return Math.round(Math.max(0, Math.min(100, finalScore)));
}
