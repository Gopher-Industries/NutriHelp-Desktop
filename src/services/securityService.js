import { supabase } from '../renderer/services/supabase';

class SecurityService {
  constructor() {
    this.supabase = supabase;
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        if (process.env.NODE_ENV === 'development') {
          console.log('User profile found:', data);
        }
        return data;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('User profile not found, creating new profile for user:', userId);
      }
      
      return await this.createUserProfile(userId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting user profile:', error);
      }
      throw error;
    }
  }

  async createUserProfile(userId) {
    try {
      const { data: authUser } = await this.supabase.auth.getUser();
      if (!authUser.user || authUser.user.id !== userId) {
        throw new Error('Unauthorized: Cannot create profile for different user');
      }
      
      const existingCheck = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existingCheck.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log('User profile already exists, returning existing profile');
        }
        return existingCheck.data;
      }
      
      if (existingCheck.error && existingCheck.error.code !== 'PGRST116') {
        throw existingCheck.error;
      }
      
      const profileData = {
        user_id: userId,
        email: authUser.user.email,
        display_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0],
        email_verified: authUser.user.email_confirmed_at ? true : false,
        two_factor_enabled: false,
        biometric_enabled: false,
        session_timeout: 30,
        max_login_attempts: 5,
        password_expiry_days: 90,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        login_alerts: true,
        security_alerts: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newProfile, error: createError } = await this.supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();
        
      if (createError) {
        if (createError.code === '23505') {
          if (process.env.NODE_ENV === 'development') {
            console.log('Profile creation conflict, fetching existing profile');
          }
          const { data: existingProfile, error: fetchError } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
          if (fetchError) {
            throw fetchError;
          }
          return existingProfile;
        }
        throw createError;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('User profile created successfully:', newProfile);
      }
      
      return newProfile;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating user profile:', error);
      }
      throw error;
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating user profile:', error);
      }
      throw error;
    }
  }

  async getSecuritySettings(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return null;
      }
      
      const { data, error } = await this.supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', userProfile.id);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  }

  async updateSecuritySettings(userId, settings) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const { data, error } = await this.supabase
        .from('user_security_settings')
        .upsert({ user_id: userProfile.id, ...settings })
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  async getUserDevices(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('last_active_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user devices:', error);
      throw error;
    }
  }

  async trustDevice(deviceId) {
    try {
      const { data, error } = await this.supabase
        .from('user_devices')
        .update({ is_trusted: true })
        .eq('id', deviceId)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error trusting device:', error);
      throw error;
    }
  }

  async removeDevice(deviceId) {
    try {
      const { error } = await this.supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing device:', error);
      throw error;
    }
  }

  async registerDeviceOnLogin(userId) {
    try {
      console.log('📱 registerDeviceOnLogin started for user:', userId);
      
      console.log('📋 Step 1: Getting user profile...');
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        console.error('❌ User profile not found for user:', userId);
        throw new Error('User profile not found');
      }
      console.log('✅ User profile found:', { id: userProfile.id, email: userProfile.email });

      console.log('🔍 Step 2: Getting device info...');
      const deviceInfo = this.getDeviceInfo();
      console.log('✅ Device info:', deviceInfo);
      
      console.log('🔍 Step 3: Generating device fingerprint...');
      const deviceFingerprint = this.generateDeviceFingerprint(deviceInfo);
      console.log('✅ Device fingerprint generated:', deviceFingerprint);

      console.log('🔍 Step 4: Checking for existing device...');
      const existingDevice = await this.supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('device_fingerprint', deviceFingerprint)
        .maybeSingle();
      
      console.log('📋 Existing device check result:', existingDevice);

      if (existingDevice.data) {
        console.log('✅ Existing device found, updating last active...');
        const { data, error } = await this.supabase
          .from('user_devices')
          .update({ 
            last_active_at: new Date().toISOString()
            // ip_address and user_agent removed - invalid INET type and missing column
          })
          .eq('id', existingDevice.data.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating existing device:', error);
          throw error;
        }
        console.log('✅ Device updated successfully:', data);
        return { device: data, isNewDevice: false };
      }

      console.log('🆕 No existing device found, creating new device...');

      const deviceData = {
        user_id: userProfile.id,
        device_name: deviceInfo.deviceName,
        device_type: deviceInfo.deviceType,
        operating_system: deviceInfo.operatingSystem,
        browser: deviceInfo.browserName,
        browser_version: deviceInfo.browserVersion,
        device_fingerprint: deviceFingerprint,
        // ip_address removed - 'unknown' is invalid for INET type, and client-side IP detection is unreliable
        screen_resolution: deviceInfo.screenResolution,
        timezone: deviceInfo.timezone,
        language: deviceInfo.language,
        // Temporarily removing location fields that cause schema issues
        // location: deviceInfo.location,
        // country: deviceInfo.country,
        // city: deviceInfo.city,
        is_trusted: false,
        first_seen_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      };

      const { data: newDevice, error } = await this.supabase
        .from('user_devices')
        .insert([deviceData])
        .select()
        .single();

      if (error) throw error;

      // Log security activity - non-blocking operation
      try {
        await this.logSecurityActivity(userId, {
          activity_type: 'device_registration',
          activity_category: 'authentication',
          description: `New device registered: ${deviceInfo.deviceName}`,
          ip_address: deviceInfo.ipAddress,
          user_agent: deviceInfo.userAgent,
          risk_level: 'medium',
          metadata: { device_id: newDevice.id, device_fingerprint: deviceFingerprint }
        });
      } catch (activityError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Security activity logging failed for device registration, continuing anyway:', activityError.message);
        }
      }

      return { device: newDevice, isNewDevice: true };
    } catch (error) {
      console.error('Error registering device on login:', error);
      throw error;
    }
  }

  async createUserSession(userId, deviceId = null) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const deviceInfo = this.getDeviceInfo();
      const sessionToken = this.generateSessionToken();

      const sessionData = {
        user_id: userProfile.id,
        device_id: deviceId,
        session_token: sessionToken,
        // ip_address removed - 'unknown' is invalid for INET type
        user_agent: deviceInfo.userAgent,
        // Temporarily removing location fields
        // location: deviceInfo.location,
        // country: deviceInfo.country,
        // city: deviceInfo.city,
        is_active: true,
        created_at: new Date().toISOString()
      };

      const { data: newSession, error } = await this.supabase
        .from('user_sessions')
        .insert([sessionData])
        .select(`
          *,
          user_devices(device_name, device_type, operating_system, browser)
        `)
        .single();

      if (error) throw error;

      // Log security activity - non-blocking operation
      try {
        await this.logSecurityActivity(userId, {
          activity_type: 'login',
          activity_category: 'authentication',
          description: 'User session created',
          ip_address: deviceInfo.ipAddress,
          user_agent: deviceInfo.userAgent,
          risk_level: 'low',
          metadata: { session_id: newSession.id, device_id: deviceId }
        });
      } catch (activityError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Security activity logging failed for session creation, continuing anyway:', activityError.message);
        }
      }

      return newSession;
    } catch (error) {
      console.error('Error creating user session:', error);
      throw error;
    }
  }

  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screenResolution = `${screen.width}x${screen.height}`;

    let deviceType = 'desktop';
    let operatingSystem = 'Unknown';
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let deviceName = 'Unknown Device';

    if (/Android/i.test(userAgent)) {
      deviceType = 'mobile';
      operatingSystem = 'Android';
      deviceName = 'Android Device';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      deviceType = /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
      operatingSystem = 'iOS';
      deviceName = /iPad/i.test(userAgent) ? 'iPad' : 'iPhone';
    } else if (/Mac/i.test(platform)) {
      operatingSystem = 'macOS';
      deviceName = 'Mac';
    } else if (/Win/i.test(platform)) {
      operatingSystem = 'Windows';
      deviceName = 'Windows PC';
    } else if (/Linux/i.test(platform)) {
      operatingSystem = 'Linux';
      deviceName = 'Linux PC';
    }

    if (/Chrome/i.test(userAgent)) {
      browserName = 'Chrome';
      const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = chromeMatch ? chromeMatch[1] : 'Unknown';
    } else if (/Firefox/i.test(userAgent)) {
      browserName = 'Firefox';
      const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = firefoxMatch ? firefoxMatch[1] : 'Unknown';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      browserName = 'Safari';
      const safariMatch = userAgent.match(/Version\/(\d+)/);
      browserVersion = safariMatch ? safariMatch[1] : 'Unknown';
    } else if (/Edge/i.test(userAgent)) {
      browserName = 'Edge';
      const edgeMatch = userAgent.match(/Edge\/(\d+)/);
      browserVersion = edgeMatch ? edgeMatch[1] : 'Unknown';
    }

    if (deviceName === 'Unknown Device') {
      deviceName = `${browserName} on ${operatingSystem}`;
    }

    return {
      deviceName,
      deviceType,
      operatingSystem,
      browserName,
      browserVersion,
      userAgent,
      platform,
      language,
      timezone,
      screenResolution,
      ipAddress: 'unknown',
      location: 'Unknown',
      country: 'Unknown',
      city: 'Unknown'
    };
  }

  generateDeviceFingerprint(deviceInfo) {
    const fingerprint = [
      deviceInfo.userAgent,
      deviceInfo.screenResolution,
      deviceInfo.timezone,
      deviceInfo.language,
      deviceInfo.platform
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }

  generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async handleLoginDeviceAndSession(userId) {
    try {
      console.log('🔧 handleLoginDeviceAndSession started for user:', userId);
      
      console.log('📱 Step 1: Registering device...');
      const deviceResult = await this.registerDeviceOnLogin(userId);
      console.log('✅ Device registration result:', deviceResult);
      
      console.log('🔐 Step 2: Creating session...');
      const session = await this.createUserSession(userId, deviceResult.device.id);
      console.log('✅ Session creation result:', session);
      
      const result = {
        device: deviceResult.device,
        isNewDevice: deviceResult.isNewDevice,
        session: session
      };
      
      console.log('✅ handleLoginDeviceAndSession completed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ handleLoginDeviceAndSession failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      throw error;
    }
  }

  async getUserSessions(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select(`
          *,
          user_devices(device_name, device_type, operating_system, browser)
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }

  async revokeSession(sessionId) {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          revoked_at: new Date().toISOString() 
        })
        .eq('id', sessionId)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  }

  async terminateUserSessions(userId, currentSessionToken = null) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return { terminated: 0 };
      }

      let query = this.supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          revoked_at: new Date().toISOString() 
        })
        .eq('user_id', userProfile.id)
        .eq('is_active', true);

      // If current session token is provided, exclude it from termination
      if (currentSessionToken) {
        query = query.neq('session_token', currentSessionToken);
      }

      const { data, error } = await query.select();

      if (error) throw error;

      const terminatedCount = data ? data.length : 0;

      if (terminatedCount > 0) {
        // Log security activity - non-blocking operation
        try {
          await this.logSecurityActivity(userId, {
            activity_type: 'logout',
            activity_category: 'authentication',
            description: `${terminatedCount} session(s) terminated`,
            risk_level: 'low',
            metadata: { terminated_sessions: terminatedCount }
          });
        } catch (activityError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Security activity logging failed for session termination, continuing anyway:', activityError.message);
          }
        }
      }

      return { terminated: terminatedCount, sessions: data };
    } catch (error) {
      console.error('Error terminating user sessions:', error);
      throw error;
    }
  }

  async terminateCurrentSession(userId, sessionToken) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔓 Terminating session for user:', userId, 'with token:', sessionToken?.substring(0, 20) + '...');
      }
      
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('User profile not found for session termination');
        }
        return null;
      }

      // First try to find the session by token only, then verify user ownership
      const { data: sessionData, error: findError } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .maybeSingle();
      
      if (findError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error finding session:', findError);
        }
        return null;
      }
      
      if (!sessionData) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('No active session found with the provided token');
        }
        return null;
      }
      
      // Verify the session belongs to the user
      if (sessionData.user_id !== userProfile.id) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Session user ID mismatch:', {
            sessionUserId: sessionData.user_id,
            profileId: userProfile.id,
            authUserId: userId
          });
        }
        return null;
      }

      // Now update the session to mark it as inactive
      const { data, error } = await this.supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          revoked_at: new Date().toISOString() 
        })
        .eq('id', sessionData.id)
        .select()
        .single();

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error updating session to inactive:', error);
        }
        return null;
      }

      // Log security activity - non-blocking operation
      try {
        await this.logSecurityActivity(userId, {
          activity_type: 'logout',
          activity_category: 'authentication',
          description: 'User logged out',
          risk_level: 'low',
          metadata: { session_id: data.id }
        });
      } catch (activityError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Security activity logging failed for logout, continuing anyway:', activityError.message);
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Session terminated successfully:', data.id);
      }
      
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error terminating current session:', error);
      }
      // Return null instead of throwing to prevent logout failure
      return null;
    }
  }

  async updateSessionActivity(userId, sessionToken) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('user_sessions')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userProfile.id)
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .select()
        .single();

      if (error) {
        // Session might not exist or might be inactive, which is fine
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return null;
    }
  }

  async getActivityLogs(userId, limit = 50, offset = 0) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('security_activity_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  async logSecurityActivity(userId, activityData) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('User profile not found for security activity logging, skipping');
        }
        return null;
      }
      
      // Use direct table insertion instead of RPC function to avoid parameter conflicts
      const activityRecord = {
        user_id: userProfile.id,
        activity_type: activityData.activity_type,
        activity_category: activityData.activity_category,
        description: activityData.description,
        risk_level: activityData.risk_level || 'low',
        success: activityData.success !== false,
        metadata: activityData.metadata || {},
        created_at: new Date().toISOString()
      };
      
      // Only add optional fields if they have valid values
      if (activityData.session_id) {
        activityRecord.session_id = activityData.session_id;
      }
      if (activityData.device_id) {
        activityRecord.device_id = activityData.device_id;
      }
      if (activityData.ip_address && activityData.ip_address !== 'unknown') {
        activityRecord.ip_address = activityData.ip_address;
      }
      if (activityData.user_agent) {
        activityRecord.user_agent = activityData.user_agent;
      }
      if (activityData.error_message) {
        activityRecord.error_message = activityData.error_message;
      }
      if (activityData.threat_indicators) {
        activityRecord.threat_indicators = activityData.threat_indicators;
      }
      
      const { data, error } = await this.supabase
        .from('security_activity_logs')
        .insert([activityRecord])
        .select();

      if (error) {
        // Handle all types of database errors gracefully - make completely non-blocking
        if (process.env.NODE_ENV === 'development') {
          const errorDetails = {
            code: error.code,
            message: error.message,
            activityType: activityData.activity_type
          };
          
          if (error.code === '42501') {
            console.warn('RLS policy prevents security activity logging - this is expected in some configurations:', errorDetails);
          } else if (error.code === '23503') {
            console.warn('Foreign key violation in security activity logging - profile relationship issue:', errorDetails);
          } else if (error.code === '23505') {
            console.warn('Duplicate key violation in security activity logging:', errorDetails);
          } else if (error.code === '42P01') {
            console.warn('Table does not exist for security activity logging:', errorDetails);
          } else {
            console.warn('Database error in security activity logging, continuing anyway:', errorDetails);
          }
        }
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      // Enhanced error handling - absolutely non-blocking
      if (process.env.NODE_ENV === 'development') {
        console.warn('Security activity logging completely failed, continuing with main operation:', {
          error: error.message,
          code: error.code,
          userId: userId,
          activityType: activityData?.activity_type
        });
      }
      // Never throw the error to prevent it from breaking the main functionality
      return null;
    }
  }

  async getSecurityAlerts(userId, unreadOnly = false) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      let query = this.supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return [];
    }
  }

  async markAlertAsRead(alertId) {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  async resolveAlert(alertId, resolvedBy) {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .update({ 
          is_resolved: true, 
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  async getSecurityScore(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return null;
      }
      
      const { data, error } = await this.supabase
        .from('security_score_history')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }
      
      const scoreData = data && data.length > 0 ? data[0] : null;
      
      if (scoreData) {
        return {
          ...scoreData,
          score: scoreData.overall_score || scoreData.score
        };
      }
      
      return scoreData;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting security score:', error);
      }
      throw error;
    }
  }

  async calculateSecurityScore(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const { data, error } = await this.supabase
        .rpc('calculate_enhanced_security_score', {
          p_user_id: userProfile.id
        });

      if (error) {
        if (error.code === '42883') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Database function calculate_enhanced_security_score not found, creating basic score entry');
          }
          
          const basicScore = {
            user_id: userProfile.id,
            overall_score: 75,
            authentication_score: 80,
            device_security_score: 70,
            behavior_score: 75,
            compliance_score: 70,
            threat_resistance_score: 80,
            score_factors: {
              two_factor_enabled: userProfile.two_factor_enabled || false,
              biometric_enabled: userProfile.biometric_enabled || false,
              device_trust_level: 'medium',
              recent_activity: 'normal'
            },
            recommendations: ['Enable two-factor authentication', 'Review device security settings'],
            improvement_suggestions: ['Consider enabling biometric authentication']
          };
          
          const { data: scoreData, error: scoreError } = await this.supabase
            .from('security_score_history')
            .insert([basicScore])
            .select()
            .single();
            
          if (scoreError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error creating basic security score:', scoreError);
            }
            return null;
          }
          
          return scoreData;
        }
        throw error;
      }
      
      if (typeof data === 'number') {
        return {
          overall_score: data,
          score: data,
          calculated_at: new Date().toISOString()
        };
      }
      
      if (data && typeof data === 'object') {
        return {
          ...data,
          score: data.overall_score || data.score || data
        };
      }
      
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error calculating security score:', error);
      }
      throw error;
    }
  }

  async getSecurityScoreHistory(userId, limit = 30) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('security_score_history')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting security score history:', error);
      }
      return [];
    }
  }

  async getRealTimeSecurityEvents(userId, limit = 20) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('real_time_security_events')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching real-time security events:', error);
      }
      return [];
    }
  }

  async logRealTimeSecurityEvent(userId, eventData) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const { data, error } = await this.supabase
        .rpc('log_real_time_security_event', {
          p_user_id: userProfile.id,
          p_event_type: eventData.event_type,
          p_event_category: eventData.event_category,
          p_severity: eventData.severity,
          p_source: eventData.source,
          p_title: eventData.title,
          p_description: eventData.description,
          p_ip_address: eventData.ip_address,
          p_user_agent: eventData.user_agent,
          p_location: eventData.location,
          p_country: eventData.country,
          p_threat_indicators: eventData.threat_indicators,
          p_risk_score: eventData.risk_score || 0,
          p_metadata: eventData.metadata
        });

      if (error) throw error;
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logging real-time security event:', error);
      }
      throw error;
    }
  }

  async detectSecurityThreats(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const { data, error } = await this.supabase
        .rpc('detect_security_threats', {
          p_user_id: userProfile.id
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error detecting security threats:', error);
      }
      throw error;
    }
  }

  async analyzeUserBehavior(userId, behaviorType) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const { data, error } = await this.supabase
        .rpc('analyze_user_behavior', {
          p_user_id: userProfile.id
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error analyzing user behavior:', error);
      }
      throw error;
    }
  }

  async getBehaviorAnalytics(userId, limit = 30) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('user_behavior_analytics')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching behavior analytics:', error);
      }
      return [];
    }
  }

  async getComplianceLogs(userId, limit = 20) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('security_compliance_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('assessed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching compliance logs:', error);
      }
      return [];
    }
  }

  async getThreatDetectionRules() {
    const { data, error } = await this.supabase
      .from('threat_detection_rules')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getSecurityScanLogs(userId, limit = 10) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const { data, error } = await this.supabase
        .from('security_scan_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching security scan logs:', error);
      }
      return [];
    }
  }

  async enable2FA(userId, secret, backupCodes) {
    try {
      await this.getUserProfile(userId);
      
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret,
          backup_codes: backupCodes
        })
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Log security activity - non-blocking operation
      try {
        await this.logSecurityActivity(userId, {
          activity_type: 'security_setting_change',
          activity_category: 'authentication',
          description: 'Two-factor authentication enabled',
          risk_level: 'low'
        });
      } catch (activityError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Security activity logging failed for 2FA enable, continuing anyway:', activityError.message);
        }
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }
  }

  async disable2FA(userId) {
    try {
      await this.getUserProfile(userId);
      
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null
        })
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Log security activity - non-blocking operation
      try {
        await this.logSecurityActivity(userId, {
          activity_type: 'security_setting_change',
          activity_category: 'authentication',
          description: 'Two-factor authentication disabled',
          risk_level: 'medium'
        });
      } catch (activityError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Security activity logging failed for 2FA disable, continuing anyway:', activityError.message);
        }
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  async enableBiometric(userId) {
    try {
      await this.getUserProfile(userId);
      
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({ biometric_enabled: true })
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Log security activity - non-blocking operation
      try {
        await this.logSecurityActivity(userId, {
          activity_type: 'security_setting_change',
          activity_category: 'authentication',
          description: 'Biometric authentication enabled',
          risk_level: 'low'
        });
      } catch (activityError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Security activity logging failed for biometric enable, continuing anyway:', activityError.message);
        }
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      throw error;
    }
  }

  async disableBiometric(userId) {
    try {
      await this.getUserProfile(userId);
      
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({ biometric_enabled: false })
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Log security activity - non-blocking operation
      try {
        await this.logSecurityActivity(userId, {
          activity_type: 'security_setting_change',
          activity_category: 'authentication',
          description: 'Biometric authentication disabled',
          risk_level: 'low'
        });
      } catch (activityError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Security activity logging failed for biometric disable, continuing anyway:', activityError.message);
        }
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  }

  async subscribeToSecurityEvents(userId, callback) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const subscription = this.supabase
        .channel('security_events')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'real_time_security_events',
            filter: `user_id=eq.${userProfile.id}`
          },
          callback
        )
        .subscribe();

      return subscription;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error subscribing to security events:', error);
      }
      return null;
    }
  }

  async subscribeToSecurityAlerts(userId, callback) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const subscription = this.supabase
        .channel('security_alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'security_alerts',
            filter: `user_id=eq.${userProfile.id}`
          },
          callback
        )
        .subscribe();

      return subscription;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error subscribing to security alerts:', error);
      }
      return null;
    }
  }

  unsubscribe(subscription) {
    if (subscription) {
      this.supabase.removeChannel(subscription);
    }
  }
}

export const securityService = new SecurityService();
export default securityService;