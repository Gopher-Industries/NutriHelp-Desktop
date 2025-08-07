import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabaseService } from '../../services/supabase';

export const fetchMealPlans = createAsyncThunk(
  'mealPlan/fetchMealPlans',
  async (userId, { rejectWithValue }) => {
    try {
      const mealPlans = await supabaseService.mealPlan.getMealPlans(userId);
      return mealPlans;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMealPlan = createAsyncThunk(
  'mealPlan/createMealPlan',
  async (mealPlanData, { rejectWithValue }) => {
    try {
      const mealPlan = await supabaseService.mealPlan.createMealPlan(mealPlanData);
      return mealPlan;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMealPlan = createAsyncThunk(
  'mealPlan/updateMealPlan',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const mealPlan = await supabaseService.mealPlan.updateMealPlan(id, updates);
      return mealPlan;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMealPlan = createAsyncThunk(
  'mealPlan/deleteMealPlan',
  async (mealPlanId, { rejectWithValue }) => {
    try {
      await supabaseService.mealPlan.deleteMealPlan(mealPlanId);
      return mealPlanId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateMealPlan = createAsyncThunk(
  'mealPlan/generateMealPlan',
  async (preferences, { rejectWithValue }) => {
    try {
      const generatedPlan = {
        id: Date.now().toString(),
        name: `Generated Plan - ${new Date().toLocaleDateString()}`,
        description: 'AI-generated meal plan based on your preferences',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        meals: generateWeeklyMeals(preferences),
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        createdAt: new Date().toISOString(),
      };
      
      const totals = calculateMealPlanTotals(generatedPlan.meals);
      generatedPlan.totalCalories = totals.calories;
      generatedPlan.totalProtein = totals.protein;
      generatedPlan.totalCarbs = totals.carbs;
      generatedPlan.totalFat = totals.fat;
      
      return generatedPlan;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const generateWeeklyMeals = (preferences) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  if (preferences.includeSnacks) {
    mealTypes.push('snack');
  }
  
  const meals = [];
  days.forEach(day => {
    mealTypes.forEach(type => {
      meals.push({
        id: `${day}-${type}-${Date.now()}`,
        day,
        type,
        name: `Sample ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: `Healthy ${type} option`,
        calories: type === 'snack' ? 150 : 400,
        protein: type === 'snack' ? 5 : 25,
        carbs: type === 'snack' ? 20 : 45,
        fat: type === 'snack' ? 8 : 15,
        ingredients: [],
        instructions: [],
        prepTime: 15,
        cookTime: type === 'snack' ? 0 : 20,
      });
    });
  });
  
  return meals;
};

const calculateMealPlanTotals = (meals) => {
  return meals.reduce((totals, meal) => ({
    calories: totals.calories + (meal.calories || 0),
    protein: totals.protein + (meal.protein || 0),
    carbs: totals.carbs + (meal.carbs || 0),
    fat: totals.fat + (meal.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

const initialState = {
  mealPlans: [],
  currentMealPlan: null,
  selectedMealPlan: null,
  
  currentWeek: {
    startDate: null,
    endDate: null,
    meals: [],
  },
  
  editingMealPlan: {
    id: null,
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    meals: [],
    preferences: {
      targetCalories: 2000,
      dietType: 'balanced', // 'balanced', 'low_carb', 'high_protein', 'vegetarian', 'vegan'
      mealsPerDay: 3,
      includeSnacks: true,
      cookingTime: 'medium', // 'quick', 'medium', 'elaborate'
      difficulty: 'easy', // 'easy', 'medium', 'hard'
      cuisinePreferences: [],
      avoidIngredients: [],
    },
  },
  
  mealTemplates: [],
  mealSuggestions: [],
  
  shoppingList: {
    items: [],
    checkedItems: [],
    categories: {
      produce: [],
      dairy: [],
      meat: [],
      pantry: [],
      frozen: [],
      other: [],
    },
    estimatedCost: 0,
  },
  
  mealPrep: {
    tasks: [],
    completedTasks: [],
    prepSchedule: {},
    batchCooking: [],
  },
  
  analytics: {
    weeklyNutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
    monthlyTrends: [],
    favoriteRecipes: [],
    mostUsedIngredients: [],
    costAnalysis: {
      weeklyAverage: 0,
      monthlyTotal: 0,
      costPerMeal: 0,
    },
  },
  
  activeView: 'week', // 'week', 'month', 'list'
  selectedDate: new Date().toISOString(),
  selectedMeal: null,
  showMealDetails: false,
  editMode: false,
  
  filters: {
    mealType: 'all', // 'all', 'breakfast', 'lunch', 'dinner', 'snack'
    dietType: 'all',
    difficulty: 'all',
    prepTime: 'all',
    calories: { min: 0, max: 1000 },
  },
  sortBy: 'date', // 'date', 'name', 'calories', 'prepTime'
  sortOrder: 'asc',
  
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isGenerating: false,
  
  error: null,
  validationErrors: {},
};

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    setCurrentMealPlan: (state, action) => {
      state.currentMealPlan = action.payload;
    },
    setSelectedMealPlan: (state, action) => {
      state.selectedMealPlan = action.payload;
    },
    clearCurrentMealPlan: (state) => {
      state.currentMealPlan = null;
    },

    setCurrentWeek: (state, action) => {
      state.currentWeek = action.payload;
    },
    navigateWeek: (state, action) => {
      const direction = action.payload; // 'prev' or 'next'
      const currentStart = new Date(state.currentWeek.startDate);
      const newStart = new Date(currentStart);
      
      if (direction === 'prev') {
        newStart.setDate(currentStart.getDate() - 7);
      } else {
        newStart.setDate(currentStart.getDate() + 7);
      }
      
      const newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + 6);
      
      state.currentWeek.startDate = newStart.toISOString();
      state.currentWeek.endDate = newEnd.toISOString();
    },
    
    setEditingMealPlan: (state, action) => {
      state.editingMealPlan = { ...state.editingMealPlan, ...action.payload };
    },
    updateEditingMealPlanField: (state, action) => {
      const { field, value } = action.payload;
      state.editingMealPlan[field] = value;
    },
    updateEditingPreferences: (state, action) => {
      state.editingMealPlan.preferences = {
        ...state.editingMealPlan.preferences,
        ...action.payload,
      };
    },
    addMealToEditing: (state, action) => {
      const meal = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.editingMealPlan.meals.push(meal);
    },
    updateMealInEditing: (state, action) => {
      const { mealId, updates } = action.payload;
      const mealIndex = state.editingMealPlan.meals.findIndex(m => m.id === mealId);
      if (mealIndex !== -1) {
        state.editingMealPlan.meals[mealIndex] = {
          ...state.editingMealPlan.meals[mealIndex],
          ...updates,
        };
      }
    },
    removeMealFromEditing: (state, action) => {
      const mealId = action.payload;
      state.editingMealPlan.meals = state.editingMealPlan.meals.filter(m => m.id !== mealId);
    },
    clearEditingMealPlan: (state) => {
      state.editingMealPlan = initialState.editingMealPlan;
    },

    addToShoppingList: (state, action) => {
      const item = {
        id: Date.now().toString(),
        checked: false,
        ...action.payload,
      };
      state.shoppingList.items.push(item);
    },
    removeFromShoppingList: (state, action) => {
      const itemId = action.payload;
      state.shoppingList.items = state.shoppingList.items.filter(item => item.id !== itemId);
    },
    toggleShoppingListItem: (state, action) => {
      const itemId = action.payload;
      const item = state.shoppingList.items.find(item => item.id === itemId);
      if (item) {
        item.checked = !item.checked;
        if (item.checked) {
          state.shoppingList.checkedItems.push(item);
        } else {
          state.shoppingList.checkedItems = state.shoppingList.checkedItems.filter(
            checkedItem => checkedItem.id !== itemId
          );
        }
      }
    },
    clearShoppingList: (state) => {
      state.shoppingList.items = [];
      state.shoppingList.checkedItems = [];
    },
    generateShoppingListFromMealPlan: (state, action) => {
      const mealPlan = action.payload;
      const ingredients = [];
      
      mealPlan.meals.forEach(meal => {
        meal.ingredients?.forEach(ingredient => {
          const existingItem = ingredients.find(item => item.name === ingredient.name);
          if (existingItem) {
            existingItem.quantity += ingredient.quantity;
          } else {
            ingredients.push({ ...ingredient });
          }
        });
      });
      
      state.shoppingList.items = ingredients.map(ingredient => ({
        id: Date.now().toString() + Math.random(),
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category || 'other',
        checked: false,
      }));
    },

    addPrepTask: (state, action) => {
      const task = {
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      state.mealPrep.tasks.push(task);
    },
    togglePrepTask: (state, action) => {
      const taskId = action.payload;
      const task = state.mealPrep.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
      }
    },
    removePrepTask: (state, action) => {
      const taskId = action.payload;
      state.mealPrep.tasks = state.mealPrep.tasks.filter(t => t.id !== taskId);
    },

    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedMeal: (state, action) => {
      state.selectedMeal = action.payload;
    },
    toggleMealDetails: (state) => {
      state.showMealDetails = !state.showMealDetails;
    },
    setEditMode: (state, action) => {
      state.editMode = action.payload;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
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
      .addCase(fetchMealPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMealPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mealPlans = action.payload;
        state.error = null;
      })
      .addCase(fetchMealPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createMealPlan.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createMealPlan.fulfilled, (state, action) => {
        state.isCreating = false;
        state.mealPlans.push(action.payload);
        state.currentMealPlan = action.payload;
        state.error = null;
      })
      .addCase(createMealPlan.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      .addCase(updateMealPlan.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMealPlan.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.mealPlans.findIndex(mp => mp.id === action.payload.id);
        if (index !== -1) {
          state.mealPlans[index] = action.payload;
        }
        if (state.currentMealPlan?.id === action.payload.id) {
          state.currentMealPlan = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMealPlan.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteMealPlan.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteMealPlan.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.mealPlans = state.mealPlans.filter(mp => mp.id !== action.payload);
        if (state.currentMealPlan?.id === action.payload) {
          state.currentMealPlan = null;
        }
        state.error = null;
      })
      .addCase(deleteMealPlan.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      .addCase(generateMealPlan.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateMealPlan.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.editingMealPlan = action.payload;
        state.error = null;
      })
      .addCase(generateMealPlan.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentMealPlan,
  setSelectedMealPlan,
  clearCurrentMealPlan,
  setCurrentWeek,
  navigateWeek,
  setEditingMealPlan,
  updateEditingMealPlanField,
  updateEditingPreferences,
  addMealToEditing,
  updateMealInEditing,
  removeMealFromEditing,
  clearEditingMealPlan,
  addToShoppingList,
  removeFromShoppingList,
  toggleShoppingListItem,
  clearShoppingList,
  generateShoppingListFromMealPlan,
  addPrepTask,
  togglePrepTask,
  removePrepTask,
  setActiveView,
  setSelectedDate,
  setSelectedMeal,
  toggleMealDetails,
  setEditMode,
  setFilters,
  resetFilters,
  setSorting,
  setError,
  clearError,
  setValidationErrors,
  clearValidationErrors,
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;

export const selectMealPlan = (state) => state.mealPlan;
export const selectMealPlans = (state) => state.mealPlan.mealPlans;
export const selectCurrentMealPlan = (state) => state.mealPlan.currentMealPlan;
export const selectCurrentWeek = (state) => state.mealPlan.currentWeek;
export const selectEditingMealPlan = (state) => state.mealPlan.editingMealPlan;
export const selectShoppingList = (state) => state.mealPlan.shoppingList;
export const selectMealPrep = (state) => state.mealPlan.mealPrep;
export const selectIsLoading = (state) => state.mealPlan.isLoading;
export const selectIsGenerating = (state) => state.mealPlan.isGenerating;
export const selectError = (state) => state.mealPlan.error;