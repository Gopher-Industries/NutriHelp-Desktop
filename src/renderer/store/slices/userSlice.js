import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabaseService } from '../../services/supabase';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const profile = await supabaseService.userProfile.getProfile(userId);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      const profile = await supabaseService.userProfile.updateProfile(userId, updates);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      const avatarUrl = await supabaseService.storage.uploadAvatar(userId, file);
      return avatarUrl;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (userId, { rejectWithValue }) => {
    try {
      await supabaseService.userProfile.deleteProfile(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  profile: {
    id: null,
    email: null,
    username: null,
    fullName: null,
    avatar: null,
    bio: null,
    website: null,
    location: null,
    timezone: null,
    language: 'en',
    createdAt: null,
    updatedAt: null,
  },
  
  healthInfo: {
    age: null,
    gender: null,
    height: null, // in cm
    weight: null, // in kg
    activityLevel: 'moderate', // 'sedentary', 'light', 'moderate', 'active', 'very_active'
    fitnessGoal: 'maintain', // 'lose_weight', 'gain_weight', 'maintain', 'build_muscle'
    dietaryRestrictions: [],
    allergies: [],
    medicalConditions: [],
    medications: [],
  },
  
  nutritionGoals: {
    dailyCalories: 2000,
    macros: {
      protein: 150, // grams
      carbs: 250,   // grams
      fat: 65,      // grams
    },
    micronutrients: {
      fiber: 25,     // grams
      sugar: 50,     // grams
      sodium: 2300,  // mg
      potassium: 3500, // mg
      calcium: 1000,   // mg
      iron: 18,        // mg
      vitaminA: 900,   // mcg
      vitaminC: 90,    // mg
      vitaminD: 20,    // mcg
    },
    waterIntake: 2000, // ml
  },
  
  preferences: {
    units: 'metric', // 'metric' | 'imperial'
    theme: 'light',  // 'light' | 'dark' | 'auto'

    privacy: {
      profileVisibility: 'private', // 'public' | 'friends' | 'private'
      shareProgress: false,
      shareRecipes: true,
      allowFriendRequests: true,
    },
    mealPlanning: {
      defaultMealCount: 3,
      includeSnacks: true,
      planningDays: 7,
      autoGeneratePlans: false,
    },
  },
  
  progress: {
    currentStreak: 0,
    longestStreak: 0,
    totalDaysLogged: 0,
    weightHistory: [],
    measurementHistory: [],
    achievedGoals: [],
    badges: [],
  },
  
  social: {
    friends: [],
    friendRequests: [],
    following: [],
    followers: [],
    sharedRecipes: [],
    favoriteRecipes: [],
  },
  
  statistics: {
    totalMealsLogged: 0,
    totalRecipesCreated: 0,
    totalWorkoutsLogged: 0,
    averageDailyCalories: 0,
    mostLoggedFoods: [],
    favoriteCategories: [],
    appUsageTime: 0,
    lastActiveDate: null,
  },
  
  isLoading: false,
  isUpdating: false,
  isUploadingAvatar: false,
  isDeleting: false,
  
  error: null,
  validationErrors: {},
  
  activeTab: 'profile', // 'profile', 'health', 'goals', 'preferences'
  editMode: false,
  unsavedChanges: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      state.profile[field] = value;
      state.unsavedChanges = true;
    },
    clearProfile: (state) => {
      state.profile = initialState.profile;
    },
    
    setHealthInfo: (state, action) => {
      state.healthInfo = { ...state.healthInfo, ...action.payload };
      state.unsavedChanges = true;
    },
    updateHealthField: (state, action) => {
      const { field, value } = action.payload;
      state.healthInfo[field] = value;
      state.unsavedChanges = true;
    },
    addDietaryRestriction: (state, action) => {
      const restriction = action.payload;
      if (!state.healthInfo.dietaryRestrictions.includes(restriction)) {
        state.healthInfo.dietaryRestrictions.push(restriction);
        state.unsavedChanges = true;
      }
    },
    removeDietaryRestriction: (state, action) => {
      const restriction = action.payload;
      state.healthInfo.dietaryRestrictions = state.healthInfo.dietaryRestrictions.filter(
        r => r !== restriction
      );
      state.unsavedChanges = true;
    },
    addAllergy: (state, action) => {
      const allergy = action.payload;
      if (!state.healthInfo.allergies.includes(allergy)) {
        state.healthInfo.allergies.push(allergy);
        state.unsavedChanges = true;
      }
    },
    removeAllergy: (state, action) => {
      const allergy = action.payload;
      state.healthInfo.allergies = state.healthInfo.allergies.filter(a => a !== allergy);
      state.unsavedChanges = true;
    },
    
    setNutritionGoals: (state, action) => {
      state.nutritionGoals = { ...state.nutritionGoals, ...action.payload };
      state.unsavedChanges = true;
    },
    updateNutritionGoal: (state, action) => {
      const { category, field, value } = action.payload;
      if (category) {
        state.nutritionGoals[category][field] = value;
      } else {
        state.nutritionGoals[field] = value;
      }
      state.unsavedChanges = true;
    },
    resetNutritionGoals: (state) => {
      state.nutritionGoals = initialState.nutritionGoals;
      state.unsavedChanges = true;
    },
    
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.unsavedChanges = true;
    },
    updatePreference: (state, action) => {
      const { category, field, value } = action.payload;
      if (category) {
        state.preferences[category][field] = value;
      } else {
        state.preferences[field] = value;
      }
      state.unsavedChanges = true;
    },
    
    updateProgress: (state, action) => {
      state.progress = { ...state.progress, ...action.payload };
    },
    addWeightEntry: (state, action) => {
      const entry = {
        date: new Date().toISOString(),
        ...action.payload,
      };
      state.progress.weightHistory.push(entry);
      if (state.progress.weightHistory.length > 365) {
        state.progress.weightHistory = state.progress.weightHistory.slice(-365);
      }
    },
    addMeasurementEntry: (state, action) => {
      const entry = {
        date: new Date().toISOString(),
        ...action.payload,
      };
      state.progress.measurementHistory.push(entry);
      if (state.progress.measurementHistory.length > 365) {
        state.progress.measurementHistory = state.progress.measurementHistory.slice(-365);
      }
    },
    incrementStreak: (state) => {
      state.progress.currentStreak += 1;
      if (state.progress.currentStreak > state.progress.longestStreak) {
        state.progress.longestStreak = state.progress.currentStreak;
      }
    },
    resetStreak: (state) => {
      state.progress.currentStreak = 0;
    },
    addBadge: (state, action) => {
      const badge = {
        id: Date.now().toString(),
        earnedAt: new Date().toISOString(),
        ...action.payload,
      };
      state.progress.badges.push(badge);
    },
    
    addFriend: (state, action) => {
      const friend = action.payload;
      if (!state.social.friends.find(f => f.id === friend.id)) {
        state.social.friends.push(friend);
      }
    },
    removeFriend: (state, action) => {
      const friendId = action.payload;
      state.social.friends = state.social.friends.filter(f => f.id !== friendId);
    },
    addFriendRequest: (state, action) => {
      const request = action.payload;
      if (!state.social.friendRequests.find(r => r.id === request.id)) {
        state.social.friendRequests.push(request);
      }
    },
    removeFriendRequest: (state, action) => {
      const requestId = action.payload;
      state.social.friendRequests = state.social.friendRequests.filter(r => r.id !== requestId);
    },
    
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
    incrementMealsLogged: (state) => {
      state.statistics.totalMealsLogged += 1;
      state.statistics.totalDaysLogged += 1;
    },
    incrementRecipesCreated: (state) => {
      state.statistics.totalRecipesCreated += 1;
    },
    updateLastActiveDate: (state) => {
      state.statistics.lastActiveDate = new Date().toISOString();
    },
    
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setEditMode: (state, action) => {
      state.editMode = action.payload;
    },
    setUnsavedChanges: (state, action) => {
      state.unsavedChanges = action.payload;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.unsavedChanges = false;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(uploadAvatar.pending, (state) => {
        state.isUploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isUploadingAvatar = false;
        state.profile.avatar = action.payload;
        state.error = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isUploadingAvatar = false;
        state.error = action.payload;
      })
      
      .addCase(deleteAccount.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isDeleting = false;
        Object.assign(state, initialState);
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setProfile,
  updateProfileField,
  clearProfile,
  setHealthInfo,
  updateHealthField,
  addDietaryRestriction,
  removeDietaryRestriction,
  addAllergy,
  removeAllergy,
  setNutritionGoals,
  updateNutritionGoal,
  resetNutritionGoals,
  setPreferences,
  updatePreference,
  updateProgress,
  addWeightEntry,
  addMeasurementEntry,
  incrementStreak,
  resetStreak,
  addBadge,
  addFriend,
  removeFriend,
  addFriendRequest,
  removeFriendRequest,
  updateStatistics,
  incrementMealsLogged,
  incrementRecipesCreated,
  updateLastActiveDate,
  setActiveTab,
  setEditMode,
  setUnsavedChanges,
  setError,
  clearError,
  setValidationErrors,
  clearValidationErrors,
} = userSlice.actions;

export default userSlice.reducer;

export const selectUser = (state) => state.user;
export const selectProfile = (state) => state.user.profile;
export const selectHealthInfo = (state) => state.user.healthInfo;
export const selectNutritionGoals = (state) => state.user.nutritionGoals;
export const selectPreferences = (state) => state.user.preferences;
export const selectProgress = (state) => state.user.progress;
export const selectSocial = (state) => state.user.social;
export const selectStatistics = (state) => state.user.statistics;
export const selectIsLoading = (state) => state.user.isLoading;
export const selectIsUpdating = (state) => state.user.isUpdating;
export const selectError = (state) => state.user.error;
export const selectUnsavedChanges = (state) => state.user.unsavedChanges;