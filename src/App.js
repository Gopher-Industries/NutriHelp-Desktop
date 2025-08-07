import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { store, persistor } from './renderer/store';
import Navbar from './renderer/components/Navbar';
import HomePage from './renderer/pages/HomePage';
import LoginPage from './renderer/pages/LoginPage';
import RegisterPage from './renderer/pages/RegisterPage';
import DashboardPage from './renderer/pages/DashboardPage';
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
          <Router>
            <div className="app-layout">
              <Navbar />
              <div className="app-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Routes>
              </div>
            </div>
          </Router>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;