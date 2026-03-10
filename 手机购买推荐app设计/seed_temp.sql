-- ============================================================
-- GripFit 鎵嬫満绉嶅瓙鏁版嵁
-- 鍏堟墽琛?supabase_schema.sql锛屽啀鎵ц鏈剼鏈?
-- id 涓?src/app/components/phoneData.ts 涓殑瀛楃涓?ID 淇濇寔涓€鑷?
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
  95, 90, 93, 93, '閽涢噾灞?,
  '["A18 Pro鑺墖","4800涓囧儚绱?,"閽涢噾灞炴鏋?]'::jsonb,
  '纾ㄧ爞鐜荤拑', '宸︿笂', '鏂瑰舰宀?, 3.6,
  3582, '[256,512,1024]'::jsonb, 'bar', 9),

-- iPhone 16 Pro Max
('2', 'iPhone 16 Pro Max', 'Apple',
  'https://images.unsplash.com/photo-1727093493878-874890b4f9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpUGhvbmUlMjBtb2Rlcm4lMjBzbWFydHBob25lfGVufDF8fHx8MTc3MjA5OTU4NXww&ixlib=rb-4.1.0&q=80&w=1080',
  77.6, 163.0, 8.25, 227, 6.9, 9999,
  82, 75, 80, 79, '閽涢噾灞?,
  '["A18 Pro鑺墖","5鍊嶅厜鍙?,"瓒呭ぇ灞忓箷"]'::jsonb,
  '纾ㄧ爞鐜荤拑', '宸︿笂', '鏂瑰舰宀?, 3.6,
  4685, '[256,512,1024]'::jsonb, 'bar', 9),

-- Samsung S25 Ultra
('3', 'Samsung S25 Ultra', 'Samsung',
  'https://images.unsplash.com/photo-1627609834360-74948f361335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYW1zdW5nJTIwR2FsYXh5JTIwc21hcnRwaG9uZXxlbnwxfHx8fDE3NzIwOTk1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  77.6, 162.8, 8.2, 218, 6.9, 9699,
  84, 76, 82, 81, '閽涢噾灞?,
  '["楠侀緳8 Elite","S Pen","Galaxy AI"]'::jsonb,
  '搴峰畞澶х尒鐚╃幓鐠?, '灞呬腑鍋忓乏', '鐙珛绔栨帓', 2.8,
  5000, '[256,512,1024]'::jsonb, 'bar', 5),

-- Samsung S25
('4', 'Samsung S25', 'Samsung',
  'https://images.unsplash.com/photo-1627609834360-74948f361335?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYW1zdW5nJTIwR2FsYXh5JTIwc21hcnRwaG9uZXxlbnwxfHx8fDE3NzIwOTk1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  70.5, 146.9, 7.2, 162, 6.2, 5999,
  96, 94, 95, 95, '閾濆悎閲?,
  '["楠侀緳8 Elite","杞昏杽鏈鸿韩","Galaxy AI"]'::jsonb,
  '澶х尒鐚╃幓鐠?, '灞呬腑鍋忓乏', '鐙珛绔栨帓', 2.2,
  4000, '[128,256]'::jsonb, 'bar', 8),

-- Pixel 9 Pro
('5', 'Pixel 9 Pro', 'Google',
  'https://images.unsplash.com/photo-1636633484288-ba18d16271a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHb29nbGUlMjBQaXhlbCUyMHNtYXJ0cGhvbmV8ZW58MXx8fHwxNzcyMDYzNDQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  72.5, 152.8, 8.5, 199, 6.3, 7299,
  91, 88, 90, 90, '閾濆悎閲?,
  '["Tensor G4","Gemini AI","寮哄姴鎽勫奖"]'::jsonb,
  '纾ㄧ爞鐜荤拑', '灞呬腑妯潯', '妯潯宀?, 3.5,
  4700, '[128,256,512]'::jsonb, 'bar', 10),

-- Xiaomi 15
('6', 'Xiaomi 15', 'Xiaomi',
  'https://images.unsplash.com/photo-1728897061866-9933536214a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxYaWFvbWklMjBzbWFydHBob25lJTIwZGV2aWNlfGVufDF8fHx8MTc3MjAxNTQ2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  71.2, 152.3, 8.1, 191, 6.36, 4499,
  93, 91, 92, 92, '閾濆悎閲?,
  '["楠侀緳8 Elite","寰曞崱闀滃ご","5400mAh"]'::jsonb,
  '鐜荤拑', '宸︿笂', '鍦嗗舰宀?, 3.2,
  5400, '[256,512]'::jsonb, 'bar', 9),

-- OnePlus 13
('7', 'OnePlus 13', 'OnePlus',
  'https://images.unsplash.com/photo-1652352545956-34c26af007da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxPbmVQbHVzJTIwc21hcnRwaG9uZXxlbnwxfHx8fDE3NzIwODU1MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  74.6, 162.9, 8.5, 213, 6.82, 4499,
  85, 78, 83, 82, '鐜荤拑+閲戝睘',
  '["楠侀緳8 Elite","鍝堣嫃褰卞儚","100W蹇厖"]'::jsonb,
  '涓濈桓鐜荤拑', '宸︿笂', '鍦嗗舰宀?, 3.8,
  6000, '[256,512]'::jsonb, 'bar', 10),

-- Xiaomi 15 Pro
('8', 'Xiaomi 15 Pro', 'Xiaomi',
  'https://images.unsplash.com/photo-1728897061866-9933536214a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxYaWFvbWklMjBzbWFydHBob25lJTIwZGV2aWNlfGVufDF8fHx8MTc3MjAxNTQ2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  75.3, 161.3, 8.35, 213, 6.73, 5299,
  86, 80, 84, 83, '闄剁摲+閲戝睘',
  '["楠侀緳8 Elite","寰曞崱褰卞儚","6100mAh"]'::jsonb,
  '闄剁摲', '宸︿笂', '鏂瑰舰宀?, 3.5,
  6100, '[256,512,1024]'::jsonb, 'bar', 9)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 璇勫垎鍏紡绉嶅瓙鏁版嵁 (Scoring Formulas Seed Data)
-- 鍒濆鍖栦粠 DOCX 涓彁鍙栫殑鍥炲綊鍏紡锛氱洿鏉挎満鏁存満瀹統=-0.02x2+3.3x-108.11
-- 浠ュ強涓哄叾浠?29 涓?Top 10 缁村害鍑嗗绌轰綅銆?
-- ============================================================

INSERT INTO scoring_formulas (id, score_type, user_group, phone_param, coeff_a, coeff_b, coeff_c, description)
VALUES
-- === 鐩存澘鏈?(Bar) ===
(gen_random_uuid(), 'comfort', 'default', 'width_bar', -0.02, 3.3, -108.11, '鐩存澘鏈烘暣鏈哄鑸掗€傚害浜屾鍥炲綊妯″瀷 (y = -0.02x^2 + 3.3x - 108.11)'),
(gen_random_uuid(), 'comfort', 'default', 'weight_bar', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 鐩存澘鏈?閲嶉噺'),
(gen_random_uuid(), 'comfort', 'default', 'aspect_ratio_bar', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 鐩存澘鏈?闀垮姣?),
(gen_random_uuid(), 'comfort', 'default', 'thickness_bar', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 鐩存澘鏈?鍘氬害'),
(gen_random_uuid(), 'comfort', 'default', 'side_curvature_bar', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 鐩存澘鏈?渚ц竟寮у害'),

-- === 涓婁笅鎶樺彔鏈?(Flip) ===
(gen_random_uuid(), 'comfort', 'default', 'thickness_flip', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 涓婁笅鎶樺彔-鍘氬害'),
(gen_random_uuid(), 'comfort', 'default', 'weight_flip', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 涓婁笅鎶樺彔-閲嶉噺'),
(gen_random_uuid(), 'comfort', 'default', 'crease_flip', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 涓婁笅鎶樺彔-鎶樼棔娣卞害'),
(gen_random_uuid(), 'comfort', 'default', 'side_curvature_flip', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 涓婁笅鎶樺彔-渚ц竟寮у害'),
(gen_random_uuid(), 'comfort', 'default', 'aspect_ratio_flip', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 涓婁笅鎶樺彔-闀垮姣?),

-- === 宸﹀彸鎶樺彔鏈?(Fold) ===
(gen_random_uuid(), 'comfort', 'default', 'weight_fold', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 宸﹀彸鎶樺彔-閲嶉噺'),
(gen_random_uuid(), 'comfort', 'default', 'unfolded_aspect_ratio_fold', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 宸﹀彸鎶樺彔-灞曞紑闀垮姣?),
(gen_random_uuid(), 'comfort', 'default', 'folded_thickness_fold', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 宸﹀彸鎶樺彔-闂悎鍘氬害'),
(gen_random_uuid(), 'comfort', 'default', 'folded_width_fold', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 宸﹀彸鎶樺彔-闂悎瀹藉害'),
(gen_random_uuid(), 'comfort', 'default', 'unfolded_thickness_fold', 0, 0, 0, '闇€琛ュ厖鍥炲綊鍙傛暟: 宸﹀彸鎶樺彔-灞曞紑鍘氬害')
ON CONFLICT (score_type, user_group, phone_param) DO NOTHING;
