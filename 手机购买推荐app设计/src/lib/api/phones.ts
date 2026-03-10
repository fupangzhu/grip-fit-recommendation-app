import { supabase, isSupabaseConfigured } from '../supabase';
import type { PhoneModel } from '../../app/components/AppContext';

/**
 * 手机数据 API
 * 带本地缓存，Supabase 不可用时 fallback 到本地数据
 */

let phonesCache: PhoneModel[] | null = null;

/** 将数据库记录转换为前端 PhoneModel */
function dbToPhoneModel(row: any): PhoneModel {
    return {
        id: row.id,
        name: row.name,
        brand: row.brand,
        image: row.image || '',
        width: row.width,
        height: row.height,
        thickness: row.thickness,
        weight: row.weight,
        screenSize: row.screen_size,
        price: row.price,
        gripScore: row.grip_score,
        reachScore: row.reach_score,
        comfortScore: row.comfort_score,
        overallScore: row.overall_score,
        material: row.material || '',
        features: row.features || [],
        backMaterial: row.back_material,
        cameraPosition: row.camera_position,
        cameraShape: row.camera_shape,
        cameraBumpHeight: row.camera_bump_height,
        battery: row.battery,
        storage: row.storage,
        formFactor: row.form_factor,
        cornerRadius: row.corner_radius,
    };
}

/** 获取所有手机数据（带缓存） */
export async function fetchAllPhones(): Promise<PhoneModel[]> {
    if (phonesCache) return phonesCache;

    if (!isSupabaseConfigured()) {
        // Fallback to local data
        const { allPhones } = await import('../../app/components/phoneData');
        phonesCache = allPhones;
        return phonesCache;
    }

    try {
        const { data, error } = await supabase
            .from('phones')
            .select('*')
            .order('overall_score', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            phonesCache = data.map(dbToPhoneModel);
            return phonesCache;
        }
    } catch (err) {
        console.warn('[GripFit] 从 Supabase 加载手机数据失败，使用本地数据:', err);
    }

    // Fallback
    const { allPhones } = await import('../../app/components/phoneData');
    phonesCache = allPhones;
    return phonesCache;
}

/** 根据 ID 获取单个手机 */
export async function fetchPhoneById(id: string): Promise<PhoneModel | null> {
    const phones = await fetchAllPhones();
    return phones.find(p => p.id === id) || null;
}

/** 搜索手机 */
export async function searchPhones(
    query: string,
    filters?: { brand?: string; maxPrice?: number; maxWeight?: number }
): Promise<PhoneModel[]> {
    const phones = await fetchAllPhones();
    let result = phones;

    if (query) {
        const q = query.toLowerCase();
        result = result.filter(p =>
            p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
        );
    }

    if (filters?.brand && filters.brand !== '全部') {
        result = result.filter(p => p.brand === filters.brand);
    }
    if (filters?.maxPrice) {
        result = result.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters?.maxWeight) {
        result = result.filter(p => p.weight <= filters.maxWeight!);
    }

    return result;
}

/** 清除缓存（用于强制刷新） */
export function clearPhonesCache() {
    phonesCache = null;
}

// ─── Admin CRUD ───

/** 新增手机 */
export async function addPhone(phone: Omit<PhoneModel, 'id'>): Promise<{ data: PhoneModel | null; error: any }> {
    if (!isSupabaseConfigured()) return { data: null, error: { message: 'Supabase 未配置' } };

    const { data, error } = await supabase
        .from('phones')
        .insert({
            name: phone.name,
            brand: phone.brand,
            image: phone.image || '',
            width: phone.width,
            height: phone.height,
            thickness: phone.thickness,
            weight: phone.weight,
            screen_size: phone.screenSize,
            price: phone.price,
            grip_score: phone.gripScore || 0,
            reach_score: phone.reachScore || 0,
            comfort_score: phone.comfortScore || 0,
            overall_score: phone.overallScore || 0,
            material: phone.material || '',
            features: phone.features || [],
            back_material: phone.backMaterial,
            camera_position: phone.cameraPosition,
            camera_shape: phone.cameraShape,
            camera_bump_height: phone.cameraBumpHeight,
            battery: phone.battery,
            storage: phone.storage,
            form_factor: phone.formFactor || 'bar',
            corner_radius: phone.cornerRadius,
        })
        .select()
        .single();

    if (!error) clearPhonesCache();
    return { data: data ? dbToPhoneModel(data) : null, error };
}

/** 更新手机 */
export async function updatePhone(id: string, updates: Partial<PhoneModel>): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase 未配置' } };

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.width !== undefined) dbUpdates.width = updates.width;
    if (updates.height !== undefined) dbUpdates.height = updates.height;
    if (updates.thickness !== undefined) dbUpdates.thickness = updates.thickness;
    if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
    if (updates.screenSize !== undefined) dbUpdates.screen_size = updates.screenSize;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.gripScore !== undefined) dbUpdates.grip_score = updates.gripScore;
    if (updates.reachScore !== undefined) dbUpdates.reach_score = updates.reachScore;
    if (updates.comfortScore !== undefined) dbUpdates.comfort_score = updates.comfortScore;
    if (updates.overallScore !== undefined) dbUpdates.overall_score = updates.overallScore;
    if (updates.material !== undefined) dbUpdates.material = updates.material;
    if (updates.features !== undefined) dbUpdates.features = updates.features;
    if (updates.backMaterial !== undefined) dbUpdates.back_material = updates.backMaterial;
    if (updates.cameraPosition !== undefined) dbUpdates.camera_position = updates.cameraPosition;
    if (updates.cameraShape !== undefined) dbUpdates.camera_shape = updates.cameraShape;
    if (updates.cameraBumpHeight !== undefined) dbUpdates.camera_bump_height = updates.cameraBumpHeight;
    if (updates.battery !== undefined) dbUpdates.battery = updates.battery;
    if (updates.storage !== undefined) dbUpdates.storage = updates.storage;
    if (updates.formFactor !== undefined) dbUpdates.form_factor = updates.formFactor;
    if (updates.cornerRadius !== undefined) dbUpdates.corner_radius = updates.cornerRadius;

    const { error } = await supabase.from('phones').update(dbUpdates).eq('id', id);
    if (!error) clearPhonesCache();
    return { error };
}

/** 删除手机 */
export async function deletePhone(id: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase 未配置' } };
    const { error } = await supabase.from('phones').delete().eq('id', id);
    if (!error) clearPhonesCache();
    return { error };
}

/** 批量删除手机 */
export async function deletePhones(ids: string[]): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase 未配置' } };
    const { error } = await supabase.from('phones').delete().in('id', ids);
    if (!error) clearPhonesCache();
    return { error };
}
