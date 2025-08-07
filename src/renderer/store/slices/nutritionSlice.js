import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabaseService } from '../../services/supabase';

export const searchFoods = createAsyncThunk(
  'nutrition/searchFoods',
  async (query, { rejectWithValue }) => {
    try {
      const foods = await supabaseService.food.searchFoods(query);
      return foods;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFoodDetails = createAsyncThunk(
  'nutrition/getFoodDetails',
  async (foodId, { rejectWithValue }) => {
    try {
      const food = await supabaseService.food.getFoodById(foodId);
      return food;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addFoodToDatabase = createAsyncThunk(
  'nutrition/addFoodToDatabase',
  async (foodData, { rejectWithValue }) => {
    try {
      const food = await supabaseService.food.createFood(foodData);
      return food;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFoodInDatabase = createAsyncThunk(
  'nutrition/updateFoodInDatabase',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const food = await supabaseService.food.updateFood(id, updates);
      return food;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFoodFromDatabase = createAsyncThunk(
  'nutrition/deleteFoodFromDatabase',
  async (foodId, { rejectWithValue }) => {
    try {
      await supabaseService.food.deleteFood(foodId);
      return foodId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const calculateNutrition = createAsyncThunk(
  'nutrition/calculateNutrition',
  async (foods, { rejectWithValue }) => {
    try {
      const totalNutrition = foods.reduce((total, item) => {
        const { food, quantity } = item;
        const multiplier = quantity / 100; 
        
        return {
          calories: (total.calories || 0) + (food.calories || 0) * multiplier,
          protein: (total.protein || 0) + (food.protein || 0) * multiplier,
          carbs: (total.carbs || 0) + (food.carbs || 0) * multiplier,
          fat: (total.fat || 0) + (food.fat || 0) * multiplier,
          fiber: (total.fiber || 0) + (food.fiber || 0) * multiplier,
          sugar: (total.sugar || 0) + (food.sugar || 0) * multiplier,
          sodium: (total.sodium || 0) + (food.sodium || 0) * multiplier,
          potassium: (total.potassium || 0) + (food.potassium || 0) * multiplier,
          calcium: (total.calcium || 0) + (food.calcium || 0) * multiplier,
          iron: (total.iron || 0) + (food.iron || 0) * multiplier,
          vitaminA: (total.vitaminA || 0) + (food.vitaminA || 0) * multiplier,
          vitaminC: (total.vitaminC || 0) + (food.vitaminC || 0) * multiplier,
          vitaminD: (total.vitaminD || 0) + (food.vitaminD || 0) * multiplier,
        };
      }, {});
      
      return totalNutrition;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  foods: [],
  searchResults: [],
  selectedFood: null,
  searchQuery: '',
  isSearching: false,
  searchError: null,
  
  currentNutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    potassium: 0,
    calcium: 0,
    iron: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
  },
  dailyGoals: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25,
    sugar: 50,
    sodium: 2300,
  },
  
  isLoading: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  
  showNutritionDetails: false,
  activeTab: 'search', // 'search', 'favorites', 'recent'
  filters: {
    category: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  },
  
  favoriteFoods: [],
  recentFoods: [],

  nutritionAnalysis: {
    macroBreakdown: {
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    micronutrients: {},
    recommendations: [],
  },
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchError = null;
    },
    setSelectedFood: (state, action) => {
      state.selectedFood = action.payload;
    },
    clearSelectedFood: (state) => {
      state.selectedFood = null;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleNutritionDetails: (state) => {
      state.showNutritionDetails = !state.showNutritionDetails;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: 'all',
        sortBy: 'name',
        sortOrder: 'asc',
      };
    },
    
    addToFavorites: (state, action) => {
      const food = action.payload;
      if (!state.favoriteFoods.find(f => f.id === food.id)) {
        state.favoriteFoods.push(food);
      }
    },
    removeFromFavorites: (state, action) => {
      const foodId = action.payload;
      state.favoriteFoods = state.favoriteFoods.filter(f => f.id !== foodId);
    },
    
    addToRecent: (state, action) => {
      const food = action.payload;
      state.recentFoods = state.recentFoods.filter(f => f.id !== food.id);
      state.recentFoods.unshift(food);
      if (state.recentFoods.length > 20) {
        state.recentFoods = state.recentFoods.slice(0, 20);
      }
    },
    clearRecentFoods: (state) => {
      state.recentFoods = [];
    },
    
    updateDailyGoals: (state, action) => {
      state.dailyGoals = { ...state.dailyGoals, ...action.payload };
    },
    resetDailyGoals: (state) => {
      state.dailyGoals = {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
        fiber: 25,
        sugar: 50,
        sodium: 2300,
      };
    },
    
    updateCurrentNutrition: (state, action) => {
      state.currentNutrition = { ...state.currentNutrition, ...action.payload };
    },
    resetCurrentNutrition: (state) => {
      state.currentNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        potassium: 0,
        calcium: 0,
        iron: 0,
        vitaminA: 0,
        vitaminC: 0,
        vitaminD: 0,
      };
    },
    
    clearError: (state) => {
      state.error = null;
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFoods.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchFoods.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
        state.searchError = null;
      })
      .addCase(searchFoods.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
        state.searchResults = [];
      })
      
      .addCase(getFoodDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFoodDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedFood = action.payload;
        state.error = null;
      })
      .addCase(getFoodDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(addFoodToDatabase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFoodToDatabase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.foods.push(action.payload);
        state.error = null;
      })
      .addCase(addFoodToDatabase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateFoodInDatabase.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateFoodInDatabase.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.foods.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.foods[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateFoodInDatabase.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteFoodFromDatabase.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteFoodFromDatabase.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.foods = state.foods.filter(f => f.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteFoodFromDatabase.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      .addCase(calculateNutrition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculateNutrition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNutrition = action.payload;

        const totalCalories = action.payload.calories || 0;
        if (totalCalories > 0) {
          state.nutritionAnalysis.macroBreakdown = {
            protein: Math.round(((action.payload.protein || 0) * 4 / totalCalories) * 100),
            carbs: Math.round(((action.payload.carbs || 0) * 4 / totalCalories) * 100),
            fat: Math.round(((action.payload.fat || 0) * 9 / totalCalories) * 100),
          };
        }
        
        state.error = null;
      })
      .addCase(calculateNutrition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  clearSearchResults,
  setSelectedFood,
  clearSelectedFood,
  setActiveTab,
  toggleNutritionDetails,
  setFilters,
  resetFilters,
  addToFavorites,
  removeFromFavorites,
  addToRecent,
  clearRecentFoods,
  updateDailyGoals,
  resetDailyGoals,
  updateCurrentNutrition,
  resetCurrentNutrition,
  clearError,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;

export const selectNutrition = (state) => state.nutrition;
export const selectSearchResults = (state) => state.nutrition.searchResults;
export const selectSelectedFood = (state) => state.nutrition.selectedFood;
export const selectCurrentNutrition = (state) => state.nutrition.currentNutrition;
export const selectDailyGoals = (state) => state.nutrition.dailyGoals;
export const selectFavoriteFoods = (state) => state.nutrition.favoriteFoods;
export const selectRecentFoods = (state) => state.nutrition.recentFoods;
export const selectNutritionAnalysis = (state) => state.nutrition.nutritionAnalysis;
export const selectIsSearching = (state) => state.nutrition.isSearching;
export const selectIsLoading = (state) => state.nutrition.isLoading;
export const selectError = (state) => state.nutrition.error;
export const selectSearchError = (state) => state.nutrition.searchError;