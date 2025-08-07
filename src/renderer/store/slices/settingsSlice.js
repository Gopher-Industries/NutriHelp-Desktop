import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabaseService } from '../../services/supabase';

export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const savedSettings = localStorage.getItem('nutrihelp_settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings, { rejectWithValue }) => {
    try {
      localStorage.setItem('nutrihelp_settings', JSON.stringify(settings));
      
      return settings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('nutrihelp_settings');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportSettings = createAsyncThunk(
  'settings/exportSettings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { settings } = getState();
      const exportData = {
        settings: settings,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nutrihelp-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return exportData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const importSettings = createAsyncThunk(
  'settings/importSettings',
  async (file, { rejectWithValue }) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.settings) {
        throw new Error('Invalid settings file format');
      }
      
      return importData.settings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  general: {
    language: 'en',
    theme: 'system',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    firstDayOfWeek: 0,
    autoSave: true,
    autoBackup: false,
    sendCrashReports: true,
    sendUsageStats: false,
  },
  
  units: {
    weight: 'kg',
    height: 'cm',
    distance: 'km',
    temperature: 'celsius',
    volume: 'ml',
    energy: 'kcal',
  },
  
  nutrition: {
    defaultMealPlan: 'balanced',
    showMacroPercentages: true,
    showMicronutrients: false,
    trackWater: true,
    trackSupplements: true,
    barcodeScannerEnabled: true,
    nutritionLabelFormat: 'standard',
    roundingPrecision: 1,
    hideZeroValues: false,
    showNutritionScore: true,
    defaultPortionSize: 'medium',
  },
  
  mealPlanning: {
    defaultMealsPerDay: 3,
    includeSnacks: true,
    planningHorizon: 7,
    autoGenerateMealPlans: false,
    considerLeftovers: true,
    budgetConstraints: false,
    maxBudgetPerMeal: 10,
    preferredCookingTime: 30,
    kitchenEquipment: ['oven', 'stovetop', 'microwave'],
    dietaryRestrictions: [],
    allergenAlerts: true,
  },
  
  recipes: {
    defaultServingSize: 4,
    showNutritionInfo: true,
    showCookingTime: true,
    showDifficulty: true,
    enableRatings: true,
    enableComments: true,
    autoScaleIngredients: true,
    preferredCuisines: [],
    hiddenIngredients: [],
    cookingSkillLevel: 'intermediate',
  },
  
  health: {
    trackWeight: true,
    trackBodyComposition: false,
    trackBloodPressure: false,
    trackBloodSugar: false,
    trackMedications: false,
    trackSymptoms: false,
    trackMood: false,
    trackSleep: false,
    trackExercise: true,
    healthDataRetention: 365,
    shareHealthData: false,
    healthReminders: true,
  },
  
  notifications: {
    enabled: true,
    mealReminders: true,
    waterReminders: true,
    medicationReminders: false,
    workoutReminders: false,
    goalAchievements: true,
    weeklyReports: true,
    systemUpdates: true,
    marketingEmails: false,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    reminderTimes: {
      breakfast: '08:00',
      lunch: '12:00',
      dinner: '18:00',
      water: ['09:00', '12:00', '15:00', '18:00'],
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00',
    },
  },
  
  privacy: {
    dataCollection: 'minimal',
    shareAnonymousData: false,
    allowCookies: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    autoLock: false,
    biometricAuth: false,
    encryptLocalData: false,
    deleteDataOnUninstall: false,
  },
  
  sync: {
    enabled: true,
    autoSync: true,
    syncInterval: 15,
    syncOnWifiOnly: false,
    cloudBackup: false,
    backupFrequency: 'weekly',
    maxBackups: 5,
    syncConflictResolution: 'ask',
  },
  
  display: {
    compactMode: false,
    showSidebar: true,
    sidebarCollapsed: false,
    showQuickActions: true,
    showProgressBars: true,
    showCharts: true,
    chartType: 'line',
    colorScheme: 'default',
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    showTooltips: true,
  },
  
  advanced: {
    debugMode: false,
    developerMode: false,
    experimentalFeatures: false,
    betaFeatures: false,
    logLevel: 'info',
    maxLogSize: 10,
    cacheSize: 100,
    offlineMode: false,
    preloadData: true,
    lazyLoading: true,
  },
  
  integrations: {
    fitnessApps: {
      enabled: false,
      connectedApps: [],
    },
    healthApps: {
      enabled: false,
      connectedApps: [],
    },
    smartDevices: {
      enabled: false,
      connectedDevices: [],
    },
    socialMedia: {
      enabled: false,
      shareAchievements: false,
      connectedAccounts: [],
    },
    calendar: {
      enabled: false,
      syncMealPlans: false,
      syncWorkouts: false,
    },
  },
  
  accessibility: {
    screenReader: false,
    keyboardNavigation: true,
    voiceCommands: false,
    largeText: false,
    highContrast: false,
    colorBlindSupport: false,
    reduceMotion: false,
    audioFeedback: false,
    hapticFeedback: true,
  },
  
  performance: {
    animationsEnabled: true,
    transitionsEnabled: true,
    imageQuality: 'high',
    cacheImages: true,
    preloadImages: false,
    lazyLoadImages: true,
    compressionLevel: 'medium',
    maxConcurrentRequests: 5,
  },
  
  customization: {
    dashboardLayout: 'default',
    favoriteFeatures: [],
    hiddenFeatures: [],
    customShortcuts: [],
    widgetPreferences: {},
    colorPreferences: {},
  },
  
  lastUpdated: null,
  version: '1.0',
  migrationVersion: 1,
  
  activeSection: 'general',
  searchQuery: '',
  showAdvanced: false,
  hasUnsavedChanges: false,
  
  isLoading: false,
  isSaving: false,
  isExporting: false,
  isImporting: false,
  isResetting: false,
  
  error: null,
  validationErrors: {},
  importError: null,
  exportError: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateGeneralSettings: (state, action) => {
      state.general = { ...state.general, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateUnitsSettings: (state, action) => {
      state.units = { ...state.units, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateNutritionSettings: (state, action) => {
      state.nutrition = { ...state.nutrition, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateMealPlanningSettings: (state, action) => {
      state.mealPlanning = { ...state.mealPlanning, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateRecipeSettings: (state, action) => {
      state.recipes = { ...state.recipes, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateHealthSettings: (state, action) => {
      state.health = { ...state.health, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updatePrivacySettings: (state, action) => {
      state.privacy = { ...state.privacy, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateSyncSettings: (state, action) => {
      state.sync = { ...state.sync, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateDisplaySettings: (state, action) => {
      state.display = { ...state.display, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateAdvancedSettings: (state, action) => {
      state.advanced = { ...state.advanced, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateIntegrationSettings: (state, action) => {
      state.integrations = { ...state.integrations, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateAccessibilitySettings: (state, action) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updatePerformanceSettings: (state, action) => {
      state.performance = { ...state.performance, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateCustomizationSettings: (state, action) => {
      state.customization = { ...state.customization, ...action.payload };
      state.hasUnsavedChanges = true;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateSingleSetting: (state, action) => {
      const { section, key, value } = action.payload;
      if (state[section]) {
        state[section][key] = value;
        state.hasUnsavedChanges = true;
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    setTheme: (state, action) => {
      state.general.theme = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    setLanguage: (state, action) => {
      state.general.language = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    toggleNotifications: (state) => {
      state.notifications.enabled = !state.notifications.enabled;
      state.hasUnsavedChanges = true;
    },
    
    updateReminderTime: (state, action) => {
      const { meal, time } = action.payload;
      state.notifications.reminderTimes[meal] = time;
      state.hasUnsavedChanges = true;
    },
    
    addIntegration: (state, action) => {
      const { type, integration } = action.payload;
      if (state.integrations[type] && state.integrations[type].connectedApps) {
        state.integrations[type].connectedApps.push(integration);
        state.hasUnsavedChanges = true;
      }
    },
    
    removeIntegration: (state, action) => {
      const { type, integrationId } = action.payload;
      if (state.integrations[type] && state.integrations[type].connectedApps) {
        state.integrations[type].connectedApps = state.integrations[type].connectedApps.filter(
          app => app.id !== integrationId
        );
        state.hasUnsavedChanges = true;
      }
    },
    
    addFavoriteFeature: (state, action) => {
      const feature = action.payload;
      if (!state.customization.favoriteFeatures.includes(feature)) {
        state.customization.favoriteFeatures.push(feature);
        state.hasUnsavedChanges = true;
      }
    },
    
    removeFavoriteFeature: (state, action) => {
      const feature = action.payload;
      state.customization.favoriteFeatures = state.customization.favoriteFeatures.filter(
        f => f !== feature
      );
      state.hasUnsavedChanges = true;
    },
    
    addCustomShortcut: (state, action) => {
      const shortcut = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      state.customization.customShortcuts.push(shortcut);
      state.hasUnsavedChanges = true;
    },
    
    removeCustomShortcut: (state, action) => {
      const shortcutId = action.payload;
      state.customization.customShortcuts = state.customization.customShortcuts.filter(
        s => s.id !== shortcutId
      );
      state.hasUnsavedChanges = true;
    },
    
    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    toggleShowAdvanced: (state) => {
      state.showAdvanced = !state.showAdvanced;
    },
    
    markChangesSaved: (state) => {
      state.hasUnsavedChanges = false;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },
    
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
    
    setImportError: (state, action) => {
      state.importError = action.payload;
    },
    
    clearImportError: (state) => {
      state.importError = null;
    },
    
    setExportError: (state, action) => {
      state.exportError = action.payload;
    },
    
    clearExportError: (state) => {
      state.exportError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          Object.keys(action.payload).forEach(key => {
            if (state[key] && typeof state[key] === 'object' && !Array.isArray(state[key])) {
              state[key] = { ...state[key], ...action.payload[key] };
            } else {
              state[key] = action.payload[key];
            }
          });
        }
        state.hasUnsavedChanges = false;
        state.error = null;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(saveSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        state.hasUnsavedChanges = false;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      
      .addCase(resetSettings.pending, (state) => {
        state.isResetting = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.isResetting = false;
        Object.assign(state, initialState);
        state.error = null;
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.isResetting = false;
        state.error = action.payload;
      })
      
      .addCase(exportSettings.pending, (state) => {
        state.isExporting = true;
        state.exportError = null;
      })
      .addCase(exportSettings.fulfilled, (state, action) => {
        state.isExporting = false;
        state.exportError = null;
      })
      .addCase(exportSettings.rejected, (state, action) => {
        state.isExporting = false;
        state.exportError = action.payload;
      })
      
      .addCase(importSettings.pending, (state) => {
        state.isImporting = true;
        state.importError = null;
      })
      .addCase(importSettings.fulfilled, (state, action) => {
        state.isImporting = false;
        Object.keys(action.payload).forEach(key => {
          if (state[key] && typeof state[key] === 'object' && !Array.isArray(state[key])) {
            state[key] = { ...state[key], ...action.payload[key] };
          } else {
            state[key] = action.payload[key];
          }
        });
        state.hasUnsavedChanges = true;
        state.lastUpdated = new Date().toISOString();
        state.importError = null;
      })
      .addCase(importSettings.rejected, (state, action) => {
        state.isImporting = false;
        state.importError = action.payload;
      });
  },
});

export const {
  updateGeneralSettings,
  updateUnitsSettings,
  updateNutritionSettings,
  updateMealPlanningSettings,
  updateRecipeSettings,
  updateHealthSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updateSyncSettings,
  updateDisplaySettings,
  updateAdvancedSettings,
  updateIntegrationSettings,
  updateAccessibilitySettings,
  updatePerformanceSettings,
  updateCustomizationSettings,
  updateSingleSetting,
  setTheme,
  setLanguage,
  toggleNotifications,
  updateReminderTime,
  addIntegration,
  removeIntegration,
  addFavoriteFeature,
  removeFavoriteFeature,
  addCustomShortcut,
  removeCustomShortcut,
  setActiveSection,
  setSearchQuery,
  toggleShowAdvanced,
  markChangesSaved,
  setError,
  clearError,
  setValidationErrors,
  clearValidationErrors,
  setImportError,
  clearImportError,
  setExportError,
  clearExportError,
} = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectSettings = (state) => state.settings;
export const selectGeneralSettings = (state) => state.settings.general;
export const selectUnitsSettings = (state) => state.settings.units;
export const selectNutritionSettings = (state) => state.settings.nutrition;
export const selectMealPlanningSettings = (state) => state.settings.mealPlanning;
export const selectRecipeSettings = (state) => state.settings.recipes;
export const selectHealthSettings = (state) => state.settings.health;
export const selectNotificationSettings = (state) => state.settings.notifications;
export const selectPrivacySettings = (state) => state.settings.privacy;
export const selectSyncSettings = (state) => state.settings.sync;
export const selectDisplaySettings = (state) => state.settings.display;
export const selectAdvancedSettings = (state) => state.settings.advanced;
export const selectIntegrationSettings = (state) => state.settings.integrations;
export const selectAccessibilitySettings = (state) => state.settings.accessibility;
export const selectPerformanceSettings = (state) => state.settings.performance;
export const selectCustomizationSettings = (state) => state.settings.customization;
export const selectTheme = (state) => state.settings.general.theme;
export const selectLanguage = (state) => state.settings.general.language;
export const selectHasUnsavedChanges = (state) => state.settings.hasUnsavedChanges;
export const selectIsLoading = (state) => state.settings.isLoading;
export const selectIsSaving = (state) => state.settings.isSaving;
export const selectError = (state) => state.settings.error;