import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, userProfileService } from '../../services/supabase';
import { authMiddleware } from '../../services/authMiddleware';

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Ensure user profile exists and fetch it
      let userProfile = null;
      if (data.user) {
        try {
          // Use authMiddleware to get or create user profile
          const result = await authMiddleware.getCurrentUserProfile();
          userProfile = result.profile;
        } catch (profileError) {
          console.warn('Error getting/creating user profile during login:', profileError);
          // Fallback to minimal profile if middleware fails
          userProfile = {
            user_id: data.user.id,
            role: 'user',
            email: data.user.email
          };
        }
      }

      // Automatically register device and create session
      let deviceSessionResult = null;
      if (data.user && userProfile) {
        try {
          console.log('🔧 Starting device and session registration...');
          console.log('User ID:', data.user.id);
          console.log('User Profile:', userProfile);
          
          // Import securityService instance
          console.log('📦 Importing securityService...');
          const { securityService } = await import('../../../services/securityService');
          console.log('✅ securityService imported successfully');
          
          console.log('🚀 Calling handleLoginDeviceAndSession...');
          deviceSessionResult = await securityService.handleLoginDeviceAndSession(data.user.id);
          console.log('✅ Device and session registration successful:', deviceSessionResult);
          
          // Trigger immediate refresh of Security Center
          window.dispatchEvent(new CustomEvent('refreshSecurityCenter', {
            detail: { userId: data.user.id, deviceSession: deviceSessionResult }
          }));
        } catch (deviceError) {
          console.error('❌ Error registering device/session during login:', deviceError);
          console.error('Error details:', {
            message: deviceError.message,
            code: deviceError.code,
            stack: deviceError.stack
          });
          // Don't fail login if device/session registration fails
        }
      } else {
        console.log('⚠️ Skipping device/session registration:', {
          hasUser: !!data.user,
          hasUserProfile: !!userProfile
        });
      }
      
      return {
        user: data.user,
        session: data.session,
        userProfile,
        deviceSessionInfo: deviceSessionResult
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, userData }, { rejectWithValue }) => {
    try {
      // Use authMiddleware.registerUser which handles both auth signup and profile creation
      const result = await authMiddleware.registerUser(email, password, userData);
      
      console.log('User registration completed:', result);
      
      return {
        user: result.user,
        session: result.session,
        userProfile: result.profile
      };
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const user = state.auth.user;
      const session = state.auth.session;

      // Terminate current session in security tracking
      if (user && session) {
        try {
          // Import securityService instance
          const { securityService } = await import('../../../services/securityService');
          
          // Generate a session token from the current session if available
          const sessionToken = session.access_token || 'unknown';
          await securityService.terminateCurrentSession(user.id, sessionToken);
        } catch (sessionError) {
          console.warn('Error terminating session during logout:', sessionError);
          // Don't fail logout if session termination fails
        }
      }

      await supabase.auth.signOut({ scope: 'local' });
      
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      } catch (storageError) {
        console.warn('Failed to clear storage:', storageError);
      }
      
      return true;
    } catch (error) {
      console.warn('Logout error, but continuing with local cleanup:', error.message);
      
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      } catch (storageError) {
        console.warn('Failed to clear storage:', storageError);
      }
      
      return true;
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ password }, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { data: profileData, error: profileError } = await userProfileService.getProfile(userId);
      if (profileError) {
        console.warn('Failed to fetch user profile:', profileError);
        // Return a default profile if fetch fails
        return {
          user_id: userId,
          role: 'user', // Default role
          email: auth.user?.email
        };
      }
      
      return profileData;
    } catch (error) {
      console.warn('Error in fetchUserProfile:', error);
      // Return a default profile on error
      const { auth } = getState();
      return {
        user_id: auth.user?.id,
        role: 'user', // Default role
        email: auth.user?.email
      };
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const { data, error } = await userProfileService.updateProfile(userId, profileData);
      if (error) throw error;
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



const initialState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  user: null,
  session: null,
  userProfile: null,

  
  loginAttempts: 0,
  lastLoginAttempt: null,
  isLocked: false,
  lockUntil: null,
  
  passwordResetSent: false,
  passwordResetLoading: false,
  passwordResetError: null,
  
  sessionExpiry: null,
  autoRefresh: true,
  
  rememberMe: false,
  
  mfaEnabled: false,
  mfaRequired: false,
  mfaLoading: false,
  
  // Enhanced features
  biometricEnabled: false,
  lastLoginTime: null,
  loginHistory: [],

};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.isLoading = false;
      state.passwordResetError = null;
    },
    
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = new Date().toISOString();
      
      if (state.loginAttempts >= 5) {
        state.isLocked = true;
        state.lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }
    },
    
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
      state.isLocked = false;
      state.lockUntil = null;
    },
    
    checkLockStatus: (state) => {
      if (state.isLocked && state.lockUntil) {
        const now = new Date();
        const lockUntil = new Date(state.lockUntil);
        
        if (now > lockUntil) {
          state.isLocked = false;
          state.lockUntil = null;
          state.loginAttempts = 0;
        }
      }
    },
    
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },
    
    setAutoRefresh: (state, action) => {
      state.autoRefresh = action.payload;
    },
    
    clearPasswordReset: (state) => {
      state.passwordResetSent = false;
      state.passwordResetError = null;
    },
    
    setMfaRequired: (state, action) => {
      state.mfaRequired = action.payload;
    },
    
    resetAuth: (state) => {
      return {
        ...initialState,
        rememberMe: state.rememberMe
      };
    },
    
    // Enhanced security features
    setBiometricEnabled: (state, action) => {
      state.biometricEnabled = action.payload;
    },
    
    addLoginHistoryEntry: (state, action) => {
      const entry = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        success: action.payload.success,
        email: action.payload.email,
        ipAddress: action.payload.ipAddress || 'unknown'
      };
      
      // Ensure loginHistory is initialized as an array
      if (!Array.isArray(state.loginHistory)) {
        state.loginHistory = [];
      }
      
      state.loginHistory.unshift(entry);
      if (state.loginHistory.length > 50) {
        state.loginHistory = state.loginHistory.slice(0, 50);
      }
    },
    
    switchAccount: (state, action) => {
      const { user, session, userProfile } = action.payload;
      state.user = user;
      state.session = session;
      state.userProfile = userProfile;
      state.isAuthenticated = true;
      state.lastLoginTime = new Date().toISOString();
      
      if (session) {
        state.sessionExpiry = session.expires_at;
      }
      
      const historyEntry = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        success: true,
        email: user.email,
        ipAddress: 'unknown'
      };
      
      if (!Array.isArray(state.loginHistory)) {
        state.loginHistory = [];
      }
      
      state.loginHistory.unshift(historyEntry);
      if (state.loginHistory.length > 50) {
        state.loginHistory = state.loginHistory.slice(0, 50);
      }
    },
    

  },
  
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.userProfile = action.payload.userProfile;
        state.lastLoginTime = new Date().toISOString();
        state.loginAttempts = 0;
        state.isLocked = false;
        state.lockUntil = null;
        
        if (action.payload.session) {
          state.sessionExpiry = action.payload.session.expires_at;
        }
        
        // Add to login history with device/session information
        const historyEntry = {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          success: true,
          email: action.payload.user.email,
          ipAddress: 'unknown',
          deviceInfo: action.payload.deviceSessionInfo || null
        };
        
        if (!Array.isArray(state.loginHistory)) {
          state.loginHistory = [];
        }
        state.loginHistory.unshift(historyEntry);
        if (state.loginHistory.length > 50) {
          state.loginHistory = state.loginHistory.slice(0, 50);
        }

        // Log device registration information
        if (action.payload.deviceSessionInfo) {
          const { device, isNewDevice, session } = action.payload.deviceSessionInfo;
          if (isNewDevice) {
            console.log('New device registered:', device.device_name);
          } else {
            console.log('Existing device updated:', device.device_name);
          }
          console.log('New session created:', session.id);
        }
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
        state.lastLoginAttempt = new Date().toISOString();
        
        if (state.loginAttempts >= 5) {
          state.isLocked = true;
          state.lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        }
      })
      
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user && action.payload.session) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.session = action.payload.session;
        }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        // Always clear all auth state regardless of remote logout success
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.session = null;
        state.userProfile = null;
        state.sessionExpiry = null;
        state.error = null;
        
        // Reset login attempts and locks
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
        state.isLocked = false;
        state.lockUntil = null;
        
        // Clear password reset state
        state.passwordResetSent = false;
        state.passwordResetError = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        // Even if signOut is rejected, we should still clear the auth state
        // because the rejection might be due to network issues
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.session = null;
        state.userProfile = null;
        state.sessionExpiry = null;
        
        // Log the error but don't prevent logout
        console.warn('SignOut rejected, but clearing local state anyway:', action.payload);
        state.error = null; // Don't show error to user for logout
      })
      
      .addCase(resetPassword.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError = action.payload;
      })
      
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(refreshSession.fulfilled, (state, action) => {
        if (action.payload.user && action.payload.session) {
          state.user = action.payload.user;
          state.session = action.payload.session;
          state.sessionExpiry = action.payload.session.expires_at;
        }
      })
      
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
      })
      
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProfile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      ;
  }
});

export const {
  clearError,
  setRememberMe,
  incrementLoginAttempts,
  resetLoginAttempts,
  checkLockStatus,
  setSessionExpiry,
  setAutoRefresh,
  clearPasswordReset,
  setMfaRequired,
  resetAuth,
  setBiometricEnabled,
  addLoginHistoryEntry,
  switchAccount
} = authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectSession = (state) => state.auth.session;
export const selectUserProfile = (state) => state.auth.userProfile;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectLoginAttempts = (state) => state.auth.loginAttempts;
export const selectIsLocked = (state) => state.auth.isLocked;
export const selectLockUntil = (state) => state.auth.lockUntil;
export const selectPasswordResetSent = (state) => state.auth.passwordResetSent;
export const selectPasswordResetLoading = (state) => state.auth.passwordResetLoading;
export const selectPasswordResetError = (state) => state.auth.passwordResetError;
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;
export const selectRememberMe = (state) => state.auth.rememberMe;
export const selectMfaRequired = (state) => state.auth.mfaRequired;

// Enhanced feature selectors
export const selectBiometricEnabled = (state) => state.auth.biometricEnabled;
export const selectLastLoginTime = (state) => state.auth.lastLoginTime;
export const selectLoginHistory = (state) => state.auth.loginHistory;