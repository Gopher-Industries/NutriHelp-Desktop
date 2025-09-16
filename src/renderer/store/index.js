import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';

import settingsSlice from './slices/settingsSlice';
import notificationSlice from './slices/notificationSlice';
import accountSwitchSlice from './slices/accountSwitchSlice';

const rootReducer = combineReducers({
  app: appSlice,
  auth: authSlice,
  user: userSlice,
  settings: settingsSlice,
  notifications: notificationSlice,
  accountSwitch: accountSwitchSlice
});

const persistConfig = {
  key: 'nutrihelp-desktop',
  storage,
  whitelist: ['auth', 'user', 'settings', 'accountSwitch'], 
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
    './slices/settingsSlice',
    './slices/notificationSlice',
    './slices/accountSwitchSlice'
  ], () => {
    store.replaceReducer(persistReducer(persistConfig, rootReducer));
  });
}

export default store;