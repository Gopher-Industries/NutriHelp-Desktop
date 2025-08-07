import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabaseService } from '../../services/supabase';

export const fetchRecipes = createAsyncThunk(
  'recipe/fetchRecipes',
  async (filters, { rejectWithValue }) => {
    try {
      const recipes = await new Promise(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              name: 'Grilled Chicken Salad',
              description: 'Healthy and delicious grilled chicken salad',
              image: null,
              prepTime: 15,
              cookTime: 20,
              servings: 2,
              difficulty: 'easy',
              cuisine: 'american',
              dietType: 'high_protein',
              calories: 350,
              protein: 35,
              carbs: 15,
              fat: 18,
              ingredients: [
                { name: 'Chicken breast', quantity: 200, unit: 'g' },
                { name: 'Mixed greens', quantity: 100, unit: 'g' },
                { name: 'Cherry tomatoes', quantity: 50, unit: 'g' },
              ],
              instructions: [
                'Season chicken breast with salt and pepper',
                'Grill chicken for 6-8 minutes per side',
                'Let chicken rest, then slice',
                'Combine greens and tomatoes in a bowl',
                'Top with sliced chicken and serve',
              ],
              tags: ['healthy', 'protein', 'salad'],
              rating: 4.5,
              reviews: 23,
              createdBy: 'user1',
              createdAt: '2024-01-01T00:00:00Z',
            },
          ]);
        }, 1000);
      });
      return recipes;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchRecipes = createAsyncThunk(
  'recipe/searchRecipes',
  async (query, { rejectWithValue }) => {
    try {
      const results = await new Promise(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '2',
              name: 'Vegetable Stir Fry',
              description: 'Quick and healthy vegetable stir fry',
              image: null,
              prepTime: 10,
              cookTime: 15,
              servings: 4,
              difficulty: 'easy',
              cuisine: 'asian',
              dietType: 'vegetarian',
              calories: 180,
              protein: 8,
              carbs: 25,
              fat: 6,
              ingredients: [
                { name: 'Mixed vegetables', quantity: 300, unit: 'g' },
                { name: 'Soy sauce', quantity: 2, unit: 'tbsp' },
                { name: 'Garlic', quantity: 2, unit: 'cloves' },
              ],
              instructions: [
                'Heat oil in a wok or large pan',
                'Add garlic and stir for 30 seconds',
                'Add vegetables and stir fry for 5-7 minutes',
                'Add soy sauce and toss to combine',
                'Serve immediately',
              ],
              tags: ['vegetarian', 'quick', 'healthy'],
              rating: 4.2,
              reviews: 15,
              createdBy: 'user2',
              createdAt: '2024-01-02T00:00:00Z',
            },
          ]);
        }, 800);
      });
      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRecipe = createAsyncThunk(
  'recipe/createRecipe',
  async (recipeData, { rejectWithValue }) => {
    try {
      const recipe = {
        id: Date.now().toString(),
        ...recipeData,
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return recipe;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRecipe = createAsyncThunk(
  'recipe/updateRecipe',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updatedRecipe = {
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };
      return updatedRecipe;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  'recipe/deleteRecipe',
  async (recipeId, { rejectWithValue }) => {
    try {
      return recipeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rateRecipe = createAsyncThunk(
  'recipe/rateRecipe',
  async ({ recipeId, rating, review }, { rejectWithValue }) => {
    try {
      const ratingData = {
        recipeId,
        rating,
        review,
        userId: 'current_user',
        createdAt: new Date().toISOString(),
      };
      return ratingData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  recipes: [],
  searchResults: [],
  favoriteRecipes: [],
  myRecipes: [],
  recentRecipes: [],
  
  selectedRecipe: null,
  recipeDetails: null,
  
  editingRecipe: {
    id: null,
    name: '',
    description: '',
    image: null,
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    cuisine: '',
    dietType: '',
    ingredients: [],
    instructions: [],
    tags: [],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
  },
  
  searchQuery: '',
  filters: {
    cuisine: 'all',
    dietType: 'all',
    difficulty: 'all',
    prepTime: 'all',
    calories: { min: 0, max: 1000 },
    ingredients: [],
    excludeIngredients: [],
  },
  sortBy: 'name',
  sortOrder: 'asc',
  
  categories: [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'dessert',
    'appetizer',
    'beverage',
  ],
  cuisines: [
    'american',
    'italian',
    'mexican',
    'asian',
    'indian',
    'mediterranean',
    'french',
    'thai',
    'chinese',
    'japanese',
  ],
  dietTypes: [
    'balanced',
    'vegetarian',
    'vegan',
    'keto',
    'paleo',
    'low_carb',
    'high_protein',
    'gluten_free',
    'dairy_free',
  ],
  popularTags: [
    'healthy',
    'quick',
    'easy',
    'comfort_food',
    'family_friendly',
    'budget_friendly',
    'meal_prep',
    'one_pot',
    'no_cook',
    'spicy',
  ],
  
  scalingFactor: 1,
  scaledIngredients: [],
  
  cookingMode: {
    active: false,
    currentStep: 0,
    timer: {
      active: false,
      duration: 0,
      remaining: 0,
    },
  },
  
  ratings: [],
  reviews: [],
  
  addToShoppingList: [],
  
  suggestions: {
    basedOnPreferences: [],
    basedOnIngredients: [],
    trending: [],
    seasonal: [],
  },
  
  activeTab: 'all',
  viewMode: 'grid',
  showFilters: false,
  editMode: false,
  
  isLoading: false,
  isSearching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isRating: false,
  
  error: null,
  searchError: null,
  validationErrors: {},
};

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setSelectedRecipe: (state, action) => {
      state.selectedRecipe = action.payload;
    },
    clearSelectedRecipe: (state) => {
      state.selectedRecipe = null;
      state.recipeDetails = null;
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchError = null;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    toggleShowFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    
    setEditingRecipe: (state, action) => {
      state.editingRecipe = { ...state.editingRecipe, ...action.payload };
    },
    updateEditingRecipeField: (state, action) => {
      const { field, value } = action.payload;
      state.editingRecipe[field] = value;
    },
    addIngredientToEditing: (state, action) => {
      const ingredient = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.editingRecipe.ingredients.push(ingredient);
    },
    updateIngredientInEditing: (state, action) => {
      const { ingredientId, updates } = action.payload;
      const index = state.editingRecipe.ingredients.findIndex(ing => ing.id === ingredientId);
      if (index !== -1) {
        state.editingRecipe.ingredients[index] = {
          ...state.editingRecipe.ingredients[index],
          ...updates,
        };
      }
    },
    removeIngredientFromEditing: (state, action) => {
      const ingredientId = action.payload;
      state.editingRecipe.ingredients = state.editingRecipe.ingredients.filter(
        ing => ing.id !== ingredientId
      );
    },
    addInstructionToEditing: (state, action) => {
      const instruction = {
        id: Date.now().toString(),
        step: state.editingRecipe.instructions.length + 1,
        text: action.payload,
      };
      state.editingRecipe.instructions.push(instruction);
    },
    updateInstructionInEditing: (state, action) => {
      const { instructionId, text } = action.payload;
      const index = state.editingRecipe.instructions.findIndex(inst => inst.id === instructionId);
      if (index !== -1) {
        state.editingRecipe.instructions[index].text = text;
      }
    },
    removeInstructionFromEditing: (state, action) => {
      const instructionId = action.payload;
      state.editingRecipe.instructions = state.editingRecipe.instructions.filter(
        inst => inst.id !== instructionId
      );
      state.editingRecipe.instructions.forEach((inst, index) => {
        inst.step = index + 1;
      });
    },
    addTagToEditing: (state, action) => {
      const tag = action.payload;
      if (!state.editingRecipe.tags.includes(tag)) {
        state.editingRecipe.tags.push(tag);
      }
    },
    removeTagFromEditing: (state, action) => {
      const tag = action.payload;
      state.editingRecipe.tags = state.editingRecipe.tags.filter(t => t !== tag);
    },
    clearEditingRecipe: (state) => {
      state.editingRecipe = initialState.editingRecipe;
    },
    
    addToFavorites: (state, action) => {
      const recipe = action.payload;
      if (!state.favoriteRecipes.find(r => r.id === recipe.id)) {
        state.favoriteRecipes.push(recipe);
      }
    },
    removeFromFavorites: (state, action) => {
      const recipeId = action.payload;
      state.favoriteRecipes = state.favoriteRecipes.filter(r => r.id !== recipeId);
    },
    
    addToRecent: (state, action) => {
      const recipe = action.payload;
      state.recentRecipes = state.recentRecipes.filter(r => r.id !== recipe.id);
      state.recentRecipes.unshift(recipe);
      if (state.recentRecipes.length > 20) {
        state.recentRecipes = state.recentRecipes.slice(0, 20);
      }
    },
    clearRecentRecipes: (state) => {
      state.recentRecipes = [];
    },
    
    setScalingFactor: (state, action) => {
      state.scalingFactor = action.payload;
      if (state.selectedRecipe) {
        state.scaledIngredients = state.selectedRecipe.ingredients.map(ingredient => ({
          ...ingredient,
          quantity: ingredient.quantity * action.payload,
        }));
      }
    },
    
    startCookingMode: (state, action) => {
      state.cookingMode.active = true;
      state.cookingMode.currentStep = 0;
      if (action.payload?.recipe) {
        state.selectedRecipe = action.payload.recipe;
      }
    },
    stopCookingMode: (state) => {
      state.cookingMode.active = false;
      state.cookingMode.currentStep = 0;
      state.cookingMode.timer.active = false;
    },
    nextCookingStep: (state) => {
      if (state.selectedRecipe && state.cookingMode.currentStep < state.selectedRecipe.instructions.length - 1) {
        state.cookingMode.currentStep += 1;
      }
    },
    previousCookingStep: (state) => {
      if (state.cookingMode.currentStep > 0) {
        state.cookingMode.currentStep -= 1;
      }
    },
    startTimer: (state, action) => {
      state.cookingMode.timer.active = true;
      state.cookingMode.timer.duration = action.payload;
      state.cookingMode.timer.remaining = action.payload;
    },
    stopTimer: (state) => {
      state.cookingMode.timer.active = false;
      state.cookingMode.timer.remaining = 0;
    },
    updateTimer: (state, action) => {
      state.cookingMode.timer.remaining = action.payload;
      if (action.payload <= 0) {
        state.cookingMode.timer.active = false;
      }
    },
    
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setEditMode: (state, action) => {
      state.editMode = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSearchError: (state, action) => {
      state.searchError = action.payload;
    },
    clearSearchError: (state) => {
      state.searchError = null;
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
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload;
        state.error = null;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(searchRecipes.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
        state.searchError = null;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
        state.searchResults = [];
      })
      
      .addCase(createRecipe.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.isCreating = false;
        state.recipes.push(action.payload);
        state.myRecipes.push(action.payload);
        state.error = null;
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      .addCase(updateRecipe.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.recipes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.recipes[index] = { ...state.recipes[index], ...action.payload };
        }
        if (state.selectedRecipe?.id === action.payload.id) {
          state.selectedRecipe = { ...state.selectedRecipe, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteRecipe.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.recipes = state.recipes.filter(r => r.id !== action.payload);
        state.myRecipes = state.myRecipes.filter(r => r.id !== action.payload);
        state.favoriteRecipes = state.favoriteRecipes.filter(r => r.id !== action.payload);
        if (state.selectedRecipe?.id === action.payload) {
          state.selectedRecipe = null;
        }
        state.error = null;
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      .addCase(rateRecipe.pending, (state) => {
        state.isRating = true;
        state.error = null;
      })
      .addCase(rateRecipe.fulfilled, (state, action) => {
        state.isRating = false;
        state.ratings.push(action.payload);
        state.error = null;
      })
      .addCase(rateRecipe.rejected, (state, action) => {
        state.isRating = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedRecipe,
  clearSelectedRecipe,
  setSearchQuery,
  clearSearchResults,
  setFilters,
  resetFilters,
  toggleShowFilters,
  setSorting,
  setEditingRecipe,
  updateEditingRecipeField,
  addIngredientToEditing,
  updateIngredientInEditing,
  removeIngredientFromEditing,
  addInstructionToEditing,
  updateInstructionInEditing,
  removeInstructionFromEditing,
  addTagToEditing,
  removeTagFromEditing,
  clearEditingRecipe,
  addToFavorites,
  removeFromFavorites,
  addToRecent,
  clearRecentRecipes,
  setScalingFactor,
  startCookingMode,
  stopCookingMode,
  nextCookingStep,
  previousCookingStep,
  startTimer,
  stopTimer,
  updateTimer,
  setActiveTab,
  setViewMode,
  setEditMode,
  setError,
  clearError,
  setSearchError,
  clearSearchError,
  setValidationErrors,
  clearValidationErrors,
} = recipeSlice.actions;

export default recipeSlice.reducer;

export const selectRecipe = (state) => state.recipe;
export const selectRecipes = (state) => state.recipe.recipes;
export const selectSearchResults = (state) => state.recipe.searchResults;
export const selectSelectedRecipe = (state) => state.recipe.selectedRecipe;
export const selectEditingRecipe = (state) => state.recipe.editingRecipe;
export const selectFavoriteRecipes = (state) => state.recipe.favoriteRecipes;
export const selectMyRecipes = (state) => state.recipe.myRecipes;
export const selectRecentRecipes = (state) => state.recipe.recentRecipes;
export const selectCookingMode = (state) => state.recipe.cookingMode;
export const selectFilters = (state) => state.recipe.filters;
export const selectIsLoading = (state) => state.recipe.isLoading;