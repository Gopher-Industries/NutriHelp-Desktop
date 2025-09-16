const ACCOUNT_STORAGE_KEY = 'nutrihelp_saved_accounts';
const CURRENT_ACCOUNT_KEY = 'nutrihelp_current_account';

export const accountStorageService = {
  saveAccounts: (accounts) => {
    try {
      const accountsToSave = accounts.map(account => ({
        ...account,
        password: undefined
      }));
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accountsToSave));
      return true;
    } catch (error) {
      console.error('Failed to save accounts:', error);
      return false;
    }
  },

  loadAccounts: () => {
    try {
      const savedAccounts = localStorage.getItem(ACCOUNT_STORAGE_KEY);
      return savedAccounts ? JSON.parse(savedAccounts) : [];
    } catch (error) {
      console.error('Failed to load accounts:', error);
      return [];
    }
  },

  removeAccount: (accountId) => {
    try {
      const accounts = accountStorageService.loadAccounts();
      const filteredAccounts = accounts.filter(acc => acc.id !== accountId);
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(filteredAccounts));
      
      const currentAccount = accountStorageService.getCurrentAccount();
      if (currentAccount === accountId) {
        accountStorageService.setCurrentAccount(null);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove account:', error);
      return false;
    }
  },

  updateAccount: (accountId, updates) => {
    try {
      const accounts = accountStorageService.loadAccounts();
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      
      if (accountIndex !== -1) {
        accounts[accountIndex] = { ...accounts[accountIndex], ...updates };
        localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update account:', error);
      return false;
    }
  },

  setCurrentAccount: (accountId) => {
    try {
      if (accountId) {
        localStorage.setItem(CURRENT_ACCOUNT_KEY, accountId);
      } else {
        localStorage.removeItem(CURRENT_ACCOUNT_KEY);
      }
      return true;
    } catch (error) {
      console.error('Failed to set current account:', error);
      return false;
    }
  },

  getCurrentAccount: () => {
    try {
      return localStorage.getItem(CURRENT_ACCOUNT_KEY);
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  },

  clearAllAccounts: () => {
    try {
      localStorage.removeItem(ACCOUNT_STORAGE_KEY);
      localStorage.removeItem(CURRENT_ACCOUNT_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear accounts:', error);
      return false;
    }
  }
};

export default accountStorageService;