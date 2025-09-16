import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const initializeApp = createAsyncThunk(
  'app/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const isOnline = navigator.onLine;
      
      let appInfo = {
        version: '1.0.0',
        platform: 'web'
      };
      
      if (window.electronAPI) {
        const [version, platform] = await Promise.all([
          window.electronAPI.getAppVersion(),
          window.electronAPI.getPlatform()
        ]);
        appInfo = { version, platform };
      }
      
      let preferences = {};
      if (window.electronAPI) {
        preferences = await window.electronAPI.store.get('userPreferences') || {};
      } else {
        const stored = localStorage.getItem('userPreferences');
        preferences = stored ? JSON.parse(stored) : {};
      }
      
      return {
        isOnline,
        appInfo,
        preferences
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const savePreferences = createAsyncThunk(
  'app/savePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.store.set('userPreferences', preferences);
      } else {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
      }
      return preferences;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkForUpdates = createAsyncThunk(
  'app/checkForUpdates',
  async (_, { rejectWithValue }) => {
    try {
      if (window.electronAPI && window.electronAPI.checkForUpdates) {
        const updateInfo = await window.electronAPI.checkForUpdates();
        return updateInfo;
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  
  isOnline: navigator.onLine,
  
  appInfo: {
    version: '1.0.0',
    platform: 'web'
  },
  
  preferences: {
    theme: 'light',
    language: 'zh-CN',
    autoSync: true,
    dataRetention: 30,
    units: {
      weight: 'kg',
      height: 'cm',
      energy: 'kcal'
    }
  },
  
  updateStatus: {
    checking: false,
    available: false,
    downloading: false,
    downloaded: false,
    error: null
  },
  

  
  sidebarCollapsed: false,
  
  currentPage: 'dashboard',
  
  globalLoading: false,
  
  globalError: null
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    

    
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    },
    
    resetApp: (state) => {
      return {
        ...initialState,
        isOnline: navigator.onLine
      };
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isOnline = action.payload.isOnline;
        state.appInfo = action.payload.appInfo;
        state.preferences = {
          ...state.preferences,
          ...action.payload.preferences
        };
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.preferences = {
          ...state.preferences,
          ...action.payload
        };
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      .addCase(checkForUpdates.pending, (state) => {
        state.updateStatus.checking = true;
        state.updateStatus.error = null;
      })
      .addCase(checkForUpdates.fulfilled, (state, action) => {
        state.updateStatus.checking = false;
        if (action.payload) {
          state.updateStatus.available = true;
        }
      })
      .addCase(checkForUpdates.rejected, (state, action) => {
        state.updateStatus.checking = false;
        state.updateStatus.error = action.payload;
      });
  }
});

export const {
  setOnlineStatus,
  setCurrentPage,
  toggleSidebar,
  setSidebarCollapsed,
  setGlobalLoading,
  setGlobalError,
  clearGlobalError,
  updatePreferences
} = appSlice.actions;

export default appSlice.reducer;

export const selectIsInitialized = (state) => state.app.isInitialized;
export const selectIsOnline = (state) => state.app.isOnline;
export const selectAppInfo = (state) => state.app.appInfo;
export const selectPreferences = (state) => state.app.preferences;

export const selectSidebarCollapsed = (state) => state.app.sidebarCollapsed;
export const selectCurrentPage = (state) => state.app.currentPage;
export const selectGlobalLoading = (state) => state.app.globalLoading;
export const selectGlobalError = (state) => state.app.globalError;
export const selectUpdateStatus = (state) => state.app.updateStatus;