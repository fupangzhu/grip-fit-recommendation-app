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