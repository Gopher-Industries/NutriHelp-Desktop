import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import enUS from 'antd/locale/en_US';
import { store, persistor } from './renderer/store';
import AppInitializer from './renderer/components/AppInitializer';
import Navbar from './renderer/components/Navbar';
import HomePage from './renderer/pages/HomePage';
import LoginPage from './renderer/pages/LoginPage';
import RegisterPage from './renderer/pages/RegisterPage';
import DashboardPage from './renderer/pages/DashboardPage';
import SecurityCenterPage from './renderer/pages/SecurityCenterPage';
import ProfilePage from './renderer/pages/ProfilePage';
import NotificationPage from './renderer/pages/NotificationPage';
import AdminNotificationPage from './renderer/pages/AdminNotificationPage';

import HealthRecordsPage from './renderer/pages/HealthRecordsPage';

import SettingsPage from './renderer/pages/SettingsPage';
import UnderDevelopment from './renderer/components/UnderDevelopment';

import './renderer/styles/Navbar.css';
import './renderer/styles/HomePage.css';
import './renderer/styles/LoginPage.css';
import './renderer/styles/RegisterPage.css';
import './renderer/styles/DashboardPage.css';



const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          locale={enUS}
          theme={{
            token: {
              colorPrimary: '#16a085',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            },
            algorithm: [
              // Add dark mode support if needed
            ],
          }}
        >
          <AntdApp>
            <AppInitializer>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
              <div className="app-layout">
                <Routes>
                  <Route path="/" element={<><Navbar /><HomePage /></>} />
                  <Route path="/login" element={<><Navbar /><LoginPage /></>} />
                  <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/security" element={<SecurityCenterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/health-records" element={<HealthRecordsPage />} />

                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/nutrition-analysis" element={<UnderDevelopment moduleName="Nutrition Analysis" />} />
                  <Route path="/meal-planning" element={<UnderDevelopment moduleName="Meal Planning" />} />
                  <Route path="/health-monitoring" element={<UnderDevelopment moduleName="Health Monitoring" />} />
                  <Route path="/smart-assistant" element={<UnderDevelopment moduleName="Smart Assistant" />} />
                  <Route path="/reports" element={<UnderDevelopment moduleName="Reports & Analytics" />} />
                  <Route path="/notifications" element={<NotificationPage />} />
                  <Route path="/admin/notifications" element={<AdminNotificationPage />} />


                </Routes>
              </div>
            </Router>
            </AppInitializer>
          </AntdApp>
        </ConfigProvider>

      </PersistGate>
    </Provider>
  );
};

export default App;