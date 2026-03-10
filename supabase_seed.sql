-- ============================================================
-- GripFit 手机种子数据
-- 先执行 supabase_schema.sql，再执行本脚本
-- id 与 src/app/components/phoneData.ts 中的字符串 ID 保持一致
-- ============================================================

INSERT INTO phones (id, name, brand, image,
  width, height, thickness, weight, screen_size, price,
  grip_score, reach_score, comfort_score, overall_score,
  material, features,
  back_material, camera_position, camera_shape, camera_bump_height,
  battery, storage, form_factor, corner_radius)
VALUES

-- iPhone 16 Pro
('1', 'iPhone 16 Pro', 'Apple',
  'https://images.unsplash.com/photo-1727093493878-874890b4f9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpUGhvbmUlMjBtb2Rlcm4lMjBzbWFydHBob25lfGVufDF8fHx8MTc3MjA5OTU4NXww&ixlib=rb-4.1.0&q=80&w=1080',
  71.5, 149.6, 8.25, 199, 6.3, 8999,
  95, 90, 93, 93, '钛金属',
  '["A18 Pro芯片","4800万像素","钛金属框架"]'::jsonb,
  '磨砂玻璃', '左上', '方形岛', 3.6,
  3582, '[256,512,1024]'::jsonb, 'bar', 9),

-- iPhone 16 Pro Max
('2', 'iPhone 16 Pro Max', 'Apple',
  'https://images.unsplash.com/photo-1727093493878-874890b4f9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpUGhvbmUlMjBtb2Rlcm4lMjBzbWFydHBob25lfGVufDF8fHx8MTc3MjA5OTU4NXww&ixlib=rb-4.1.0&q=80&w=1080',
  77.6, 163.0, 8.25, 227, 6.9, 9999,
  82, 75, 80, 79, '钛金属',
  '["A18 Pro芯片","5倍光变","超大屏幕"]'::jsonb,
  '磨砂玻璃', '左上', '方形岛', 3.6,
  4685, '[256,512,1024]'::jsonb, 'bar', 9),

-- Samsung S25 Ultra
('3', 'Samsung S25 Ultra', 'Samsung',
  'https://images.unsplash.com/photo-1627609834360-74948f361335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYW1zdW5nJTIwR2FsYXh5JTIwc21hcnRwaG9uZXxlbnwxfHx8fDE3NzIwOTk1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  77.6, 162.8, 8.2, 218, 6.9, 9699,
  84, 76, 82, 81, '钛金属',
  '["骁龙8 Elite","S Pen","Galaxy AI"]'::jsonb,
  '康宁大猩猩玻璃', '居中偏左', '独立竖排', 2.8,
  5000, '[256,512,1024]'::jsonb, 'bar', 5),

-- Samsung S25
('4', 'Samsung S25', 'Samsung',
  'https://images.unsplash.com/photo-1627609834360-74948f361335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYW1zdW5nJTIwR2FsYXh5JTIwc21hcnRwaG9uZXxlbnwxfHx8fDE3NzIwOTk1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  70.5, 146.9, 7.2, 162, 6.2, 5999,
  96, 94, 95, 95, '铝合金',
  '["骁龙8 Elite","轻薄机身","Galaxy AI"]'::jsonb,
  '大猩猩玻璃', '居中偏左', '独立竖排', 2.2,
  4000, '[128,256]'::jsonb, 'bar', 8),

-- Pixel 9 Pro
('5', 'Pixel 9 Pro', 'Google',
  'https://images.unsplash.com/photo-1636633484288-ba18d16271a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHb29nbGUlMjBQaXhlbCUyMHNtYXJ0cGhvbmV8ZW58MXx8fHwxNzcyMDYzNDQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  72.5, 152.8, 8.5, 199, 6.3, 7299,
  91, 88, 90, 90, '铝合金',
  '["Tensor G4","Gemini AI","强劲摄影"]'::jsonb,
  '磨砂玻璃', '居中横条', '横条岛', 3.5,
  4700, '[128,256,512]'::jsonb, 'bar', 10),

-- Xiaomi 15
('6', 'Xiaomi 15', 'Xiaomi',
  'https://images.unsplash.com/photo-1728897061866-9933536214a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxYaWFvbWklMjBzbWFydHBob25lJTIwZGV2aWNlfGVufDF8fHx8MTc3MjAxNTQ2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  71.2, 152.3, 8.1, 191, 6.36, 4499,
  93, 91, 92, 92, '铝合金',
  '["骁龙8 Elite","徕卡镜头","5400mAh"]'::jsonb,
  '玻璃', '左上', '圆形岛', 3.2,
  5400, '[256,512]'::jsonb, 'bar', 9),

-- OnePlus 13
('7', 'OnePlus 13', 'OnePlus',
  'https://images.unsplash.com/photo-1652352545956-34c26af007da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxPbmVQbHVzJTIwc21hcnRwaG9uZXxlbnwxfHx8fDE3NzIwODU1MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  74.6, 162.9, 8.5, 213, 6.82, 4499,
  85, 78, 83, 82, '玻璃+金属',
  '["骁龙8 Elite","哈苏影像","100W快充"]'::jsonb,
  '丝绸玻璃', '左上', '圆形岛', 3.8,
  6000, '[256,512]'::jsonb, 'bar', 10),

-- Xiaomi 15 Pro
('8', 'Xiaomi 15 Pro', 'Xiaomi',
  'https://images.unsplash.com/photo-1728897061866-9933536214a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxYaWFvbWklMjBzbWFydHBob25lJTIwZGV2aWNlfGVufDF8fHx8MTc3MjAxNTQ2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  75.3, 161.3, 8.35, 213, 6.73, 5299,
  86, 80, 84, 83, '陶瓷+金属',
  '["骁龙8 Elite","徕卡影像","6100mAh"]'::jsonb,
  '陶瓷', '左上', '方形岛', 3.5,
  6100, '[256,512,1024]'::jsonb, 'bar', 9)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 评分公式种子数据 (Scoring Formulas Seed Data)
-- 初始化从 DOCX 中提取的回归公式：直板机整机宽y=-0.02x2+3.3x-108.11
-- 以及为其他 29 个 Top 10 维度准备空位。
-- ============================================================

INSERT INTO scoring_formulas (id, score_type, user_group, phone_param, coeff_a, coeff_b, coeff_c, description)
VALUES
-- === 直板机 (Bar) ===
(gen_random_uuid(), 'comfort', 'default', 'width_bar', -0.02, 3.3, -108.11, '直板机整机宽舒适度二次回归模型 (y = -0.02x^2 + 3.3x - 108.11)'),
(gen_random_uuid(), 'comfort', 'default', 'weight_bar', 0, 0, 0, '需补充回归参数: 直板机-重量'),
(gen_random_uuid(), 'comfort', 'default', 'aspect_ratio_bar', 0, 0, 0, '需补充回归参数: 直板机-长宽比'),
(gen_random_uuid(), 'comfort', 'default', 'thickness_bar', 0, 0, 0, '需补充回归参数: 直板机-厚度'),
(gen_random_uuid(), 'comfort', 'default', 'side_curvature_bar', 0, 0, 0, '需补充回归参数: 直板机-侧边弧度'),

-- === 上下折叠机 (Flip) ===
(gen_random_uuid(), 'comfort', 'default', 'thickness_flip', 0, 0, 0, '需补充回归参数: 上下折叠-厚度'),
(gen_random_uuid(), 'comfort', 'default', 'weight_flip', 0, 0, 0, '需补充回归参数: 上下折叠-重量'),
(gen_random_uuid(), 'comfort', 'default', 'crease_flip', 0, 0, 0, '需补充回归参数: 上下折叠-折痕深度'),
(gen_random_uuid(), 'comfort', 'default', 'side_curvature_flip', 0, 0, 0, '需补充回归参数: 上下折叠-侧边弧度'),
(gen_random_uuid(), 'comfort', 'default', 'aspect_ratio_flip', 0, 0, 0, '需补充回归参数: 上下折叠-长宽比'),

-- === 左右折叠机 (Fold) ===
(gen_random_uuid(), 'comfort', 'default', 'weight_fold', 0, 0, 0, '需补充回归参数: 左右折叠-重量'),
(gen_random_uuid(), 'comfort', 'default', 'unfolded_aspect_ratio_fold', 0, 0, 0, '需补充回归参数: 左右折叠-展开长宽比'),
(gen_random_uuid(), 'comfort', 'default', 'folded_thickness_fold', 0, 0, 0, '需补充回归参数: 左右折叠-闭合厚度'),
(gen_random_uuid(), 'comfort', 'default', 'folded_width_fold', 0, 0, 0, '需补充回归参数: 左右折叠-闭合宽度'),
(gen_random_uuid(), 'comfort', 'default', 'unfolded_thickness_fold', 0, 0, 0, '需补充回归参数: 左右折叠-展开厚度')
ON CONFLICT (score_type, user_group, phone_param) DO NOTHING;
