import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, userProfileService } from '../../services/supabase';
import { accountStorageService } from '../../services/accountStorage';
import { switchAccount } from './authSlice';

export const addAccount = createAsyncThunk(
  'accountSwitch/addAccount',
  async ({ email, password }, { rejectWithValue, getState }) => {
    try {
      const { accountSwitch, auth } = getState();
      
      if (accountSwitch.savedAccounts.some(account => account.email === email)) {
        throw new Error('Account already exists');
      }

      const currentUser = auth.user;
      const currentUserProfile = auth.userProfile;
      
      if (currentUser && !accountSwitch.savedAccounts.some(acc => acc.id === currentUser.id)) {
        const currentAccountData = {
          id: currentUser.id,
          email: currentUser.email,
          userProfile: currentUserProfile,
          nickname: currentUserProfile?.first_name || currentUser.email?.split('@')[0] || 'User',
          avatar: currentUserProfile?.avatar_url || null,
          lastUsed: new Date().toISOString(),
          isActive: true
        };
        
        const savedAccounts = accountStorageService.loadAccounts();
        savedAccounts.push(currentAccountData);
        accountStorageService.saveAccounts(savedAccounts);
        accountStorageService.setCurrentAccount(currentUser.id);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      let userProfile = null;
      if (data.user) {
        try {
          const { data: profileData, error: profileError } = await userProfileService.getProfile(data.user.id);
          if (!profileError && profileData) {
            userProfile = profileData;
          } else {
            userProfile = {
              user_id: data.user.id,
              role: 'user',
              email: data.user.email
            };
          }
        } catch (profileError) {
          userProfile = {
            user_id: data.user.id,
            role: 'user',
            email: data.user.email
          };
        }
      }

      const accountData = {
        id: data.user.id,
        email: data.user.email,
        userProfile,
        nickname: userProfile?.first_name || userProfile?.email?.split('@')[0] || 'User',
        avatar: userProfile?.avatar_url || null,
        lastUsed: new Date().toISOString(),
        isActive: false
      };

      await supabase.auth.signOut({ scope: 'local' });
      
      const savedAccounts = accountStorageService.loadAccounts();
      savedAccounts.push(accountData);
      accountStorageService.saveAccounts(savedAccounts);
      
      return accountData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const switchToAccount = createAsyncThunk(
  'accountSwitch/switchToAccount',
  async ({ accountId, password }, { rejectWithValue, getState, dispatch }) => {
    try {
      const { accountSwitch } = getState();
      const targetAccount = accountSwitch.savedAccounts.find(acc => acc.id === accountId);
      
      if (!targetAccount) {
        throw new Error('Account not found');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetAccount.email,
        password
      });
      
      if (error) throw error;
      
      let userProfile = null;
      if (data.user) {
        try {
          const { data: profileData, error: profileError } = await userProfileService.getProfile(data.user.id);
          if (!profileError && profileData) {
            userProfile = profileData;
          } else {
            userProfile = {
              user_id: data.user.id,
              role: 'user',
              email: data.user.email
            };
          }
        } catch (profileError) {
          userProfile = {
            user_id: data.user.id,
            role: 'user',
            email: data.user.email
          };
        }
      }
      
      return {
        user: data.user,
        session: data.session,
        userProfile,
        accountId
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeAccount = createAsyncThunk(
  'accountSwitch/removeAccount',
  async ({ accountId }, { rejectWithValue }) => {
    try {
      accountStorageService.removeAccount(accountId);
      return accountId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAccountNickname = createAsyncThunk(
  'accountSwitch/updateAccountNickname',
  async ({ accountId, nickname }, { rejectWithValue }) => {
    try {
      accountStorageService.updateAccount(accountId, { nickname });
      return { accountId, nickname };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const initializeAccounts = createAsyncThunk(
  'accountSwitch/initializeAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const savedAccounts = accountStorageService.loadAccounts();
      const currentAccount = accountStorageService.getCurrentAccount();
      return { savedAccounts, currentAccount };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const initializeCurrentAccount = createAsyncThunk(
  'accountSwitch/initializeCurrentAccount',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const currentUser = auth.user;
      const currentUserProfile = auth.userProfile;
      
      if (!currentUser) {
        return null;
      }
      
      const savedAccounts = accountStorageService.loadAccounts();
      const existingAccount = savedAccounts.find(acc => acc.id === currentUser.id);
      
      if (!existingAccount) {
        const currentAccountData = {
          id: currentUser.id,
          email: currentUser.email,
          userProfile: currentUserProfile,
          nickname: currentUserProfile?.first_name || currentUser.email?.split('@')[0] || 'User',
          avatar: currentUserProfile?.avatar_url || null,
          lastUsed: new Date().toISOString(),
          isActive: true
        };
        
        savedAccounts.forEach(acc => acc.isActive = false);
        savedAccounts.push(currentAccountData);
        accountStorageService.saveAccounts(savedAccounts);
        accountStorageService.setCurrentAccount(currentUser.id);
        
        return currentAccountData;
      } else {
        savedAccounts.forEach(acc => acc.isActive = acc.id === currentUser.id);
        if (existingAccount) {
          existingAccount.lastUsed = new Date().toISOString();
        }
        accountStorageService.saveAccounts(savedAccounts);
        accountStorageService.setCurrentAccount(currentUser.id);
        
        return existingAccount;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  savedAccounts: [],
  currentAccount: null,
  isLoading: false,
  isSwitching: false,
  isAddingAccount: false,
  error: null,
  switchError: null,
  showAccountSwitcher: false,
  lastSwitchTime: null,
  maxAccounts: 5
};

const accountSwitchSlice = createSlice({
  name: 'accountSwitch',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.switchError = null;
    },
    
    setShowAccountSwitcher: (state, action) => {
      state.showAccountSwitcher = action.payload;
    },
    
    updateAccountLastUsed: (state, action) => {
      const { accountId } = action.payload;
      const account = state.savedAccounts.find(acc => acc.id === accountId);
      if (account) {
        account.lastUsed = new Date().toISOString();
        accountStorageService.updateAccount(accountId, { lastUsed: account.lastUsed });
      }
    },
    
    setActiveAccount: (state, action) => {
      const { accountId } = action.payload;
      state.savedAccounts.forEach(account => {
        account.isActive = account.id === accountId;
        accountStorageService.updateAccount(account.id, { isActive: account.isActive });
      });
      state.currentAccount = accountId;
      accountStorageService.setCurrentAccount(accountId);
    },
    
    clearAllAccounts: (state) => {
      state.savedAccounts = [];
      state.currentAccount = null;
      accountStorageService.clearAllAccounts();
    },
    
    loadSavedAccounts: (state, action) => {
      state.savedAccounts = action.payload || [];
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(addAccount.pending, (state) => {
        state.isAddingAccount = true;
        state.error = null;
      })
      .addCase(addAccount.fulfilled, (state, action) => {
        state.isAddingAccount = false;
        if (state.savedAccounts.length < state.maxAccounts) {
          state.savedAccounts.push(action.payload);
          accountStorageService.saveAccounts(state.savedAccounts);
        } else {
          state.error = `Maximum ${state.maxAccounts} accounts allowed`;
        }
      })
      .addCase(addAccount.rejected, (state, action) => {
        state.isAddingAccount = false;
        state.error = action.payload;
      })
      
      .addCase(switchToAccount.pending, (state) => {
        state.isSwitching = true;
        state.switchError = null;
      })
      .addCase(switchToAccount.fulfilled, (state, action) => {
        state.isSwitching = false;
        state.lastSwitchTime = new Date().toISOString();
        
        const { accountId, user, session, userProfile } = action.payload;
        state.savedAccounts.forEach(account => {
          account.isActive = account.id === accountId;
          if (account.id === accountId) {
            account.lastUsed = new Date().toISOString();
          }
        });
        state.currentAccount = accountId;
        accountStorageService.saveAccounts(state.savedAccounts);
        accountStorageService.setCurrentAccount(accountId);
      })
      .addCase(switchToAccount.rejected, (state, action) => {
        state.isSwitching = false;
        state.switchError = action.payload;
      })
      
      .addCase(removeAccount.fulfilled, (state, action) => {
        const accountId = action.payload;
        state.savedAccounts = state.savedAccounts.filter(acc => acc.id !== accountId);
        if (state.currentAccount === accountId) {
          state.currentAccount = null;
        }
      })
      
      .addCase(updateAccountNickname.fulfilled, (state, action) => {
        const { accountId, nickname } = action.payload;
        const account = state.savedAccounts.find(acc => acc.id === accountId);
        if (account) {
          account.nickname = nickname;
          accountStorageService.saveAccounts(state.savedAccounts);
        }
      })
      
      .addCase(initializeAccounts.fulfilled, (state, action) => {
        const { savedAccounts, currentAccount } = action.payload;
        state.savedAccounts = savedAccounts;
        state.currentAccount = currentAccount;
      })
      
      .addCase(initializeCurrentAccount.fulfilled, (state, action) => {
        if (action.payload) {
          const existingIndex = state.savedAccounts.findIndex(acc => acc.id === action.payload.id);
          if (existingIndex >= 0) {
            state.savedAccounts[existingIndex] = action.payload;
          } else {
            state.savedAccounts.push(action.payload);
          }
          state.currentAccount = action.payload.id;
        }
      });
  }
});

export const {
  clearError,
  setShowAccountSwitcher,
  updateAccountLastUsed,
  setActiveAccount,
  clearAllAccounts,
  loadSavedAccounts
} = accountSwitchSlice.actions;

export default accountSwitchSlice.reducer;

export const selectSavedAccounts = (state) => state.accountSwitch.savedAccounts;
export const selectCurrentAccount = (state) => state.accountSwitch.currentAccount;
export const selectIsLoading = (state) => state.accountSwitch.isLoading;
export const selectIsSwitching = (state) => state.accountSwitch.isSwitching;
export const selectIsAddingAccount = (state) => state.accountSwitch.isAddingAccount;
export const selectAccountSwitchError = (state) => state.accountSwitch.error;
export const selectSwitchError = (state) => state.accountSwitch.switchError;
export const selectShowAccountSwitcher = (state) => state.accountSwitch.showAccountSwitcher;
export const selectMaxAccounts = (state) => state.accountSwitch.maxAccounts;