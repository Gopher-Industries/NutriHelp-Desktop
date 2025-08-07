import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import nutritionSlice from './slices/nutritionSlice';
import mealPlanSlice from './slices/mealPlanSlice';
import recipeSlice from './slices/recipeSlice';
import healthSlice from './slices/healthSlice';
import settingsSlice from './slices/settingsSlice';

const rootReducer = combineReducers({
  app: appSlice,
  auth: authSlice,
  user: userSlice,
  nutrition: nutritionSlice,
  mealPlan: mealPlanSlice,
  recipe: recipeSlice,
  health: healthSlice,
  settings: settingsSlice
});

const persistConfig = {
  key: 'nutrihelp-desktop',
  storage,
  whitelist: ['auth', 'user', 'settings'], 
  blacklist: ['app'] 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [
        'persist/FLUSH',
        'persist/REHYDRATE',
        'persist/PAUSE',
        'persist/PERSIST',
        'persist/PURGE',
        'persist/REGISTER'
      ]
    },
    immutableCheck: {
      warnAfter: 128
    }
  });

export const store = configureStore({
  reducer: persistedReducer,
  middleware,
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept([
    './slices/appSlice',
    './slices/authSlice',
    './slices/userSlice',
    './slices/nutritionSlice',
    './slices/mealPlanSlice',
    './slices/recipeSlice',
    './slices/healthSlice',
    './slices/settingsSlice'
  ], () => {
    store.replaceReducer(persistReducer(persistConfig, rootReducer));
  });
}

export default store;