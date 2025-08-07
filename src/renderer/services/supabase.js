import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// 认证服务
export const authService = {
  // 登录
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // 注册
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // 登出
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 获取当前用户
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // 重置密码
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  // 更新密码
  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  },

  // 更新用户信息
  updateUser: async (updates) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },

  // 刷新会话
  refreshSession: async () => {
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  }
};

// 用户档案服务
export const userProfileService = {
  // 获取用户档案
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // 创建用户档案
  createProfile: async (profileData) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();
    return { data, error };
  },

  // 更新用户档案
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },

  // 删除用户档案
  deleteProfile: async (userId) => {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);
    return { error };
  }
};

// 食物数据服务
export const foodService = {
  // 搜索食物
  searchFoods: async (query, limit = 20) => {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(limit);
    return { data, error };
  },

  // 获取食物详情
  getFoodById: async (foodId) => {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', foodId)
      .single();
    return { data, error };
  },

  // 获取食物分类
  getFoodCategories: async () => {
    const { data, error } = await supabase
      .from('foods')
      .select('category')
      .not('category', 'is', null);
    
    if (data) {
      const categories = [...new Set(data.map(item => item.category))];
      return { data: categories, error };
    }
    return { data: [], error };
  },

  // 获取热门食物
  getPopularFoods: async (limit = 10) => {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .order('popularity', { ascending: false })
      .limit(limit);
    return { data, error };
  }
};

// 膳食记录服务
export const mealRecordService = {
  // 获取膳食记录
  getMealRecords: async (userId, date) => {
    const { data, error } = await supabase
      .from('meal_records')
      .select(`
        *,
        foods (*)
      `)
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  // 添加膳食记录
  addMealRecord: async (recordData) => {
    const { data, error } = await supabase
      .from('meal_records')
      .insert([recordData])
      .select()
      .single();
    return { data, error };
  },

  // 更新膳食记录
  updateMealRecord: async (recordId, updates) => {
    const { data, error } = await supabase
      .from('meal_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single();
    return { data, error };
  },

  // 删除膳食记录
  deleteMealRecord: async (recordId) => {
    const { error } = await supabase
      .from('meal_records')
      .delete()
      .eq('id', recordId);
    return { error };
  },

  // 获取日期范围内的膳食记录
  getMealRecordsByDateRange: async (userId, startDate, endDate) => {
    const { data, error } = await supabase
      .from('meal_records')
      .select(`
        *,
        foods (*)
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    return { data, error };
  }
};

// 膳食计划服务
export const mealPlanService = {
  // 获取膳食计划
  getMealPlans: async (userId) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // 创建膳食计划
  createMealPlan: async (planData) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([planData])
      .select()
      .single();
    return { data, error };
  },

  // 更新膳食计划
  updateMealPlan: async (planId, updates) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();
    return { data, error };
  },

  // 删除膳食计划
  deleteMealPlan: async (planId) => {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', planId);
    return { error };
  }
};

// 健康记录服务
export const healthRecordService = {
  // 获取健康记录
  getHealthRecords: async (userId, startDate, endDate) => {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    return { data, error };
  },

  // 添加健康记录
  addHealthRecord: async (recordData) => {
    const { data, error } = await supabase
      .from('health_records')
      .insert([recordData])
      .select()
      .single();
    return { data, error };
  },

  // 更新健康记录
  updateHealthRecord: async (recordId, updates) => {
    const { data, error } = await supabase
      .from('health_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single();
    return { data, error };
  },

  // 删除健康记录
  deleteHealthRecord: async (recordId) => {
    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', recordId);
    return { error };
  }
};

// 实时订阅服务
export const realtimeService = {
  // 订阅膳食记录变化
  subscribeMealRecords: (userId, callback) => {
    return supabase
      .channel('meal_records')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_records',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // 订阅健康记录变化
  subscribeHealthRecords: (userId, callback) => {
    return supabase
      .channel('health_records')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_records',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // 取消订阅
  unsubscribe: (subscription) => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
};

// 文件上传服务
export const storageService = {
  // 上传头像
  uploadAvatar: async (userId, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) return { data: null, error };
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return { data: { path: data.path, publicUrl }, error: null };
  },

  // 删除文件
  deleteFile: async (bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { error };
  },

  // 获取公共URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
};

// 错误处理工具
export const handleSupabaseError = (error) => {
  if (!error) return null;
  
  // 常见错误处理
  switch (error.code) {
    case 'invalid_credentials':
      return '邮箱或密码错误';
    case 'email_not_confirmed':
      return '请先验证您的邮箱';
    case 'signup_disabled':
      return '注册功能暂时关闭';
    case 'invalid_email':
      return '邮箱格式不正确';
    case 'weak_password':
      return '密码强度不够';
    case 'email_already_exists':
      return '该邮箱已被注册';
    case 'rate_limit_exceeded':
      return '操作过于频繁，请稍后再试';
    default:
      return error.message || '操作失败，请重试';
  }
};

// 统一的服务导出
export const supabaseService = {
  auth: authService,
  userProfile: userProfileService,
  food: foodService,
  mealRecord: mealRecordService,
  mealPlan: mealPlanService,
  healthRecord: healthRecordService,
  realtime: realtimeService,
  storage: storageService,
  handleError: handleSupabaseError
};

export default supabase;