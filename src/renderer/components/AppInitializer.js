import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAccounts, initializeCurrentAccount } from '../store/slices/accountSwitchSlice';

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(initializeAccounts()).unwrap();
        
        if (isAuthenticated && user) {
          await dispatch(initializeCurrentAccount()).unwrap();
        }
      } catch (error) {
        console.warn('Failed to initialize accounts:', error);
      }
    };

    initializeApp();
  }, [dispatch, isAuthenticated, user]);

  return children;
};

export default AppInitializer;