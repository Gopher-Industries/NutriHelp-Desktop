import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

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
      
      return {
        user: data.user,
        session: data.session
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
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

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
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

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  user: null,
  session: null,
  
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
  mfaLoading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
    }
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
        state.loginAttempts = 0;
        state.isLocked = false;
        state.lockUntil = null;
        
        if (action.payload.session) {
          state.sessionExpiry = action.payload.session.expires_at;
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
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.session = null;
        state.sessionExpiry = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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
      });
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
  resetAuth
} = authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectSession = (state) => state.auth.session;
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