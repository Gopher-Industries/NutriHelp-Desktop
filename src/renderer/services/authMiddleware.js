import { supabase } from './supabase';

// Get environment variables from Electron's exposed nodeAPI or fallback to process.env
const getEnvVar = (key, fallback = '') => {
  // Try to get from Electron's exposed environment first
  if (typeof window !== 'undefined' && window.nodeAPI?.process?.env) {
    return window.nodeAPI.process.env[key] || fallback;
  }
  // Fallback to process.env for non-Electron environments
  return process.env[key] || fallback;
};

const useMockData = getEnvVar('REACT_APP_USE_MOCK_DATA', 'false') === 'true';

export const authMiddleware = {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return user;
  },

  async getCurrentUserProfile() {
    try {
      const user = await this.getCurrentUser();
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create one
        console.log('User profile not found, creating new profile for user:', user.id);
        
        const defaultRole = user.email === 's224384905@deakin.edu.au' ? 'admin' : 'user';
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const newProfile = {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          role: defaultRole,
          is_active: true,
          last_login: new Date().toISOString()
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select();
        
        if (createError) {
          console.error('Failed to create user profile:', createError);
          throw createError;
        }
        
        console.log('User profile created successfully:', createdProfile);
        return { user, profile: createdProfile && createdProfile.length > 0 ? createdProfile[0] : null };
      } else if (error) {
        console.error('Database error when fetching user profile:', error);
        throw error;
      }
      
      // Update last_login when user profile is accessed
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.warn('Failed to update last_login:', updateError);
      }
      
      return { user, profile: { ...(profile && profile.length > 0 ? profile[0] : {}), last_login: new Date().toISOString() } };
    } catch (error) {
      console.error('Authentication failed:', error.message);
      
      // Check if this is a real authentication issue or just missing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session && !sessionError) {
        console.warn('No active session found, user needs to log in');
        throw new Error('Auth session missing!');
      }
      
      // If there's a session but profile fetch failed, try to create a minimal profile
      if (session && session.user) {
        console.warn('Session exists but profile fetch failed, attempting to use session user data');
        
        const user = session.user;
        const mockProfile = {
          id: user.id,
          user_id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
          last_name: user.user_metadata?.last_name || '',
          role: user.email === 's224384905@deakin.edu.au' ? 'admin' : 'user',
          is_active: true,
          created_at: user.created_at,
          updated_at: new Date().toISOString()
        };
        
        return { user, profile: mockProfile };
      }
      
      throw error;
    }
  },

  async requireAuth() {
    try {
      const { user, profile } = await this.getCurrentUserProfile();
      return { user, profile, isAuthenticated: true };
    } catch (error) {
      console.error('Authentication required but failed:', error.message);
      
      // Check for development environment or specific conditions where mock might be acceptable
      if (process.env.NODE_ENV === 'development' && window.mockUser) {
        console.warn('Using mock user in development environment');
        return {
          user: window.mockUser,
          profile: { ...window.mockUser, role: window.mockUser.role || 'user' },
          isAuthenticated: true
        };
      }
      
      // In production or when no mock is available, throw the error
      throw new Error(`Authentication required: ${error.message}`);
    }
  },

  async requireAdmin() {
    const authResult = await this.requireAuth();
    
    if (!authResult.isAuthenticated) {
      return { ...authResult, isAdmin: false };
    }
    
    const isAdmin = authResult.profile.role === 'admin';
    
    return {
      ...authResult,
      isAdmin,
      error: !isAdmin ? 'Admin privileges required' : null
    };
  },

  async validateAdminAction(action = 'perform admin action') {
    const adminCheck = await this.requireAdmin();
    
    if (!adminCheck.isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    if (!adminCheck.isAdmin) {
      throw new Error(`Admin privileges required to ${action}`);
    }
    
    return adminCheck;
  },

  async createUserSession(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', data.user.id)
      .select();
    
    if (profileError) {
      console.warn('Failed to update last login:', profileError.message);
    }
    
    return { user: data.user, session: data.session, profile: profile && profile.length > 0 ? profile[0] : null };
  },

  async registerUser(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
    
    if (data.user) {
      const fullName = userData.fullName || data.user.user_metadata?.full_name || email.split('@')[0] || 'User';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const profileData = {
        user_id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: email === 's224384905@deakin.edu.au' ? 'admin' : 'user',
        is_active: true,
        ...userData
      };
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert([profileData], {
          onConflict: 'user_id'
        })
        .select();
      
      if (profileError) {
        console.error('Failed to create user profile:', profileError.message);
      }
      
      return { user: data.user, session: data.session, profile: profile && profile.length > 0 ? profile[0] : null };
    }
    
    return data && data.length > 0 ? data[0] : null;
  },

  async updateUserRole(userId, newRole) {
    const adminCheck = await this.validateAdminAction('update user roles');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('user_id', userId)
      .select();
    
    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
    
    return data && data.length > 0 ? data[0] : null;
  },

  async deactivateUser(userId) {
    const adminCheck = await this.validateAdminAction('deactivate users');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('user_id', userId)
      .select();
    
    if (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] : null;
  },

  async getAllUsers() {
    const adminCheck = await this.validateAdminAction('view all users');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, user_id, email, first_name, last_name, role, is_active, created_at, last_login')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
    
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
    
    return true;
  }
};

export default authMiddleware;