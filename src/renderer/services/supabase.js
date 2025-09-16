import { createClient } from '@supabase/supabase-js';

// Get environment variables from Electron's exposed nodeAPI or fallback to process.env
const getEnvVar = (key, fallback = '') => {
  // Try to get from Electron's exposed environment first
  if (typeof window !== 'undefined' && window.nodeAPI?.process?.env) {
    return window.nodeAPI.process.env[key] || fallback;
  }
  // Fallback to process.env for non-Electron environments
  return process.env[key] || fallback;
};

// Supabase configuration
const supabaseUrl = getEnvVar('REACT_APP_SUPABASE_URL', 'YOUR_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'YOUR_SUPABASE_ANON_KEY');
const useMockData = getEnvVar('REACT_APP_USE_MOCK_DATA', 'false') === 'true';

// Debug logging for configuration
if (process.env.NODE_ENV === 'development') {
  console.log('Environment check:');
  console.log('- Running in Electron:', typeof window !== 'undefined' && !!window.nodeAPI);
  console.log('- Supabase URL:', supabaseUrl);
  console.log('- Supabase Key exists:', !!supabaseAnonKey);
  console.log('- Supabase Key length:', supabaseAnonKey?.length);
  console.log('- Use Mock Data:', useMockData);
}

// Validate configuration
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('Supabase configuration is not properly set. Please check your .env file.');
  console.log('Available environment variables:', typeof window !== 'undefined' && window.nodeAPI?.process?.env ? Object.keys(window.nodeAPI.process.env) : 'process.env not available');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'nutrihelp-desktop@1.0.0'
    }
  },
  db: {
    schema: 'public'
  }
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase connection test failed:', error);
      }
      return false;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('Supabase connection test successful');
    }
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Supabase connection test error:', err);
    }
    return false;
  }
};

// Authentication service
export const authService = {
  // Sign in
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign up
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

  // Sign out
  signOut: async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      return { error: null };
    } catch (error) {
      console.warn('Local logout failed:', error.message);
      return { error: null };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Reset password
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  // Update password
  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  },

  // Update user info
  updateUser: async (updates) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },

  // Refresh session
  refreshSession: async () => {
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  }
};

// User profile service
export const userProfileService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn('Auth check failed:', authError);
        return { data: null, error: authError };
      }

      if (authUser.user && authUser.user.id === userId) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId);
        
        if (error) {
          return { data: null, error };
        }
        
        if (!data || data.length === 0) {
          return { data: null, error: { code: 'PGRST116', message: 'User profile not found' } };
        }
        
        return { data: data[0], error: null };
      } else {
        return { data: null, error: new Error('Unauthorized access to user profile') };
      }
    } catch (err) {
      console.error('Error in getProfile:', err);
      return { data: null, error: err };
    }
  },

  // Create user profile
  createProfile: async (profileData) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select();
    return { data: data && data.length > 0 ? data[0] : null, error };
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select();
    return { data: data && data.length > 0 ? data[0] : null, error };
  },

  // Delete user profile
  deleteProfile: async (userId) => {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);
    return { error };
  }
};























export const realtimeService = {
  unsubscribe: (subscription) => {
    if (subscription) {
      subscription.unsubscribe();
    }
  }
};

// File upload service
export const storageService = {
  // Upload avatar
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

  // Delete file
  deleteFile: async (bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { error };
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
};

// Error handling utility
export const handleSupabaseError = (error) => {
  if (!error) return null;
  
  // Common error handling
  switch (error.code) {
    case 'invalid_credentials':
      return 'Invalid email or password';
    case 'email_not_confirmed':
      return 'Please verify your email first';
    case 'signup_disabled':
      return 'Registration is temporarily disabled';
    case 'invalid_email':
      return 'Invalid email format';
    case 'weak_password':
      return 'Password is too weak';
    case 'email_already_exists':
      return 'This email is already registered';
    case 'rate_limit_exceeded':
      return 'Too many requests, please try again later';
    default:
      return error.message || 'Operation failed, please try again';
  }
};

// Notification service
export const notificationService = {
  // Get all notifications with read status for admin or personal notifications for user
  getNotifications: async (userId, userRole) => {
    try {
      const { data: notifications, error } = await supabase
        .from('sys_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (userRole === 'admin') {
        const notificationsWithReadStatus = [];
        
        for (const notification of notifications) {
          const { data: readStatus, error: readError } = await supabase
            .from('sys_notification_reads')
            .select('user_id, read_at')
            .eq('notification_id', notification.id);

          if (readError) throw readError;

          const { data: allUsers, error: usersError } = await supabase
            .from('user_profiles')
            .select('id, user_id, first_name, last_name, email')
            .eq('role', 'user');

          if (usersError) throw usersError;

          const readStatusMap = {};
          readStatus.forEach(status => {
            readStatusMap[status.user_id] = status.read_at;
          });

          const readDetails = allUsers.map(user => ({
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            readAt: readStatusMap[user.user_id] || null,
            isRead: !!readStatusMap[user.user_id]
          }));

          notificationsWithReadStatus.push({
            ...notification,
            readDetails
          });
        }

        return { data: notificationsWithReadStatus, error: null };
      } else {
        const notificationsWithPersonalStatus = [];
        
        for (const notification of notifications) {
          const { data: readStatus, error: readError } = await supabase
            .from('sys_notification_reads')
            .select('read_at')
            .eq('notification_id', notification.id)
            .eq('user_id', userId)
            .maybeSingle();

          if (readError) throw readError;

          notificationsWithPersonalStatus.push({
            ...notification,
            isRead: !!readStatus?.read_at,
            readAt: readStatus?.read_at || null
          });
        }

        return { data: notificationsWithPersonalStatus, error: null };
      }
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new notification (admin only)
  createNotification: async (title, content, createdBy) => {
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', createdBy);

    if (profileError) return { data: null, error: profileError };
    if (!profiles || profiles.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'User profile not found' } };
    }
    
    const profile = profiles[0];

    const { data, error } = await supabase
      .from('sys_notifications')
      .insert([{
        title,
        content,
        created_by: profile.id
      }])
      .select()
      .single();
    return { data, error };
  },

  // Mark notification as read
  markAsRead: async (notificationId, userId) => {
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId);

    if (profileError) return { data: null, error: profileError };
    if (!profiles || profiles.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'User profile not found' } };
    }
    
    const profile = profiles[0];

    const { data, error } = await supabase
      .from('sys_notification_reads')
      .upsert([{
        notification_id: notificationId,
        user_id: profile.id,
        read_at: new Date().toISOString()
      }])
      .select()
      .single();
    return { data, error };
  },

  // Get unread count for user
  getUnreadCount: async (userId) => {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId);

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) {
        return { data: 0, error: null };
      }
      
      const profile = profiles[0];

      const { data: totalNotifications, error: totalError } = await supabase
        .from('sys_notifications')
        .select('id');

      if (totalError) throw totalError;

      const { data: readNotifications, error: readError } = await supabase
        .from('sys_notification_reads')
        .select('notification_id')
        .eq('user_id', profile.id);

      if (readError) throw readError;

      const readIds = readNotifications.map(r => r.notification_id);
      const unreadCount = totalNotifications.filter(n => !readIds.includes(n.id)).length;

      return { data: unreadCount, error: null };
    } catch (error) {
      return { data: 0, error };
    }
  },

  // Check if user has admin role
  checkAdminRole: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) return { data: false, error };
    if (!data || data.length === 0) {
      return { data: false, error: null };
    }
    
    return { data: data[0].role === 'admin', error: null };
  }
};

// Unified service export
export const securityService = {
  getSecuritySettings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.warn('Security settings fetch error:', error);
        return { data: null, error: null };
      }
      return { data, error: null };
    } catch (error) {
      console.warn('Security settings fetch failed:', error);
      return { data: null, error: null };
    }
  },

  updateSecuritySettings: async (userId, settings) => {
    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getUserDevices: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userId)
        .order('last_active_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  addUserDevice: async (deviceData) => {
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .insert(deviceData)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateUserDevice: async (deviceId, updates) => {
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', deviceId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  deleteUserDevice: async (deviceId) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  getUserSessions: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          user_devices(device_name, device_type, operating_system, browser)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  revokeSession: async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          revoked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getSecurityActivityLogs: async (userId, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('security_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  logSecurityActivity: async (activityData) => {
    try {
      const { data, error } = await supabase
        .rpc('log_security_activity', {
          p_user_id: activityData.user_id,
          p_activity_type: activityData.activity_type,
          p_activity_category: activityData.activity_category,
          p_description: activityData.description,
          p_ip_address: activityData.ip_address || null,
          p_user_agent: activityData.user_agent || null,
          p_location: activityData.location || null,
          p_risk_level: activityData.risk_level || 'low',
          p_success: activityData.success !== false,
          p_metadata: activityData.metadata || null
        });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getSecurityScore: async (userId) => {
    try {
      // First check if user profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!profile) {
        console.warn('User profile not found for security score calculation');
        return { data: { score: 75, last_calculated: new Date().toISOString() }, error: null };
      }
      
      const { data, error } = await supabase
        .rpc('calculate_security_score', { p_user_id: userId });
      
      if (error) {
        console.warn('Security score calculation error:', error);
        return { data: { score: 75, last_calculated: new Date().toISOString() }, error: null };
      }
      return { data, error: null };
    } catch (error) {
      console.warn('Security score calculation failed:', error);
      return { data: { score: 75, last_calculated: new Date().toISOString() }, error: null };
    }
  },

  getSecurityScoreHistory: async (userId, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('security_score_history')
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getSecurityAlerts: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  createSecurityAlert: async (alertData) => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .insert(alertData)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  markAlertAsRead: async (alertId) => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  dismissAlert: async (alertId) => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .update({ 
          is_dismissed: true, 
          dismissed_at: new Date().toISOString() 
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getPasswordHistory: async (userId, limit = 5) => {
    try {
      const { data, error } = await supabase
        .from('user_password_history')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  addPasswordHistory: async (userId, passwordHash) => {
    try {
      const { data, error } = await supabase
        .from('user_password_history')
        .insert({ user_id: userId, password_hash: passwordHash })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getSecurityScanLogs: async (userId, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('security_scan_logs')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  createSecurityScan: async (scanData) => {
    try {
      const { data, error } = await supabase
        .from('security_scan_logs')
        .insert(scanData)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateSecurityScan: async (scanId, updates) => {
    try {
      const { data, error } = await supabase
        .from('security_scan_logs')
        .update(updates)
        .eq('id', scanId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

export const supabaseService = {
  auth: authService,
  userProfile: userProfileService,
  realtime: realtimeService,
  storage: storageService,
  notification: notificationService,
  security: securityService,
  handleError: handleSupabaseError
};

export default supabase;