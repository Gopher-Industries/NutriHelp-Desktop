import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Switch,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  InputNumber,
  Upload,
  Modal,
  Alert,
  List,
  Tag,
  Tooltip,
  App,
  Radio,
  Slider,
  TimePicker,
  Checkbox
} from 'antd';
import {
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  DeleteOutlined,
  CloudOutlined,
  MobileOutlined,
  BellOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  SaveOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  BookOutlined,
  HeartOutlined,
  BgColorsOutlined
} from '../../components/icons/PaperIcons';
import {
  loadSettings,
  saveSettings,
  resetSettings,
  exportSettings,
  importSettings,
  updateGeneralSettings,
  updateUnitsSettings,
  updateNutritionSettings,
  updateMealPlanningSettings,
  updateRecipeSettings,
  updateHealthSettings,
  updateAdvancedSettings,
  updateIntegrationSettings,
  updateAccessibilitySettings,
  updatePerformanceSettings,
  updateDisplaySettings,
  updateSyncSettings,
  updatePrivacySettings,
  updateCustomizationSettings,
  setTheme,
  setLanguage,
  selectGeneralSettings,
  selectUnitsSettings,
  selectNutritionSettings,
  selectMealPlanningSettings,
  selectRecipeSettings,
  selectHealthSettings,
  selectAdvancedSettings,
  selectIntegrationSettings,
  selectAccessibilitySettings,
  selectPerformanceSettings,
  selectDisplaySettings,
  selectSyncSettings,
  selectPrivacySettings,
  selectCustomizationSettings,
  selectIsLoading,
  selectIsSaving,
  selectIsExporting,
  selectIsImporting,
  selectIsResetting
} from '../store/slices/settingsSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  
  const generalSettings = useSelector(selectGeneralSettings);
  const unitsSettings = useSelector(selectUnitsSettings);
  const nutritionSettings = useSelector(selectNutritionSettings);
  const mealPlanningSettings = useSelector(selectMealPlanningSettings);
  const recipeSettings = useSelector(selectRecipeSettings);
  const healthSettings = useSelector(selectHealthSettings);
  const advancedSettings = useSelector(selectAdvancedSettings);
  const integrationSettings = useSelector(selectIntegrationSettings);
  const accessibilitySettings = useSelector(selectAccessibilitySettings);
  const performanceSettings = useSelector(selectPerformanceSettings);
  const displaySettings = useSelector(selectDisplaySettings);
  const syncSettings = useSelector(selectSyncSettings);
  const privacySettings = useSelector(selectPrivacySettings);
  const customizationSettings = useSelector(selectCustomizationSettings);
  const isLoading = useSelector(selectIsLoading);
  const isSaving = useSelector(selectIsSaving);
  const isExporting = useSelector(selectIsExporting);
  const isImporting = useSelector(selectIsImporting);
  const isResetting = useSelector(selectIsResetting);
  
  const [activeTab, setActiveTab] = useState('general');
  const [generalForm] = Form.useForm();
  const [unitsForm] = Form.useForm();
  const [nutritionForm] = Form.useForm();
  const [mealPlanningForm] = Form.useForm();
  const [recipeForm] = Form.useForm();
  const [healthForm] = Form.useForm();
  const [advancedForm] = Form.useForm();
  const [integrationForm] = Form.useForm();
  const [accessibilityForm] = Form.useForm();
  const [performanceForm] = Form.useForm();
  const [displayForm] = Form.useForm();
  const [syncForm] = Form.useForm();
  const [privacyForm] = Form.useForm();
  const [customizationForm] = Form.useForm();
  
  // Local state for cache info
  const [cacheInfo, setCacheInfo] = useState({
    cacheSize: '45 MB',
    localData: '12 MB',
    tempFiles: '8 MB'
  });

  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  useEffect(() => {
    generalForm.setFieldsValue(generalSettings);
  }, [generalSettings, generalForm]);

  useEffect(() => {
    unitsForm.setFieldsValue(unitsSettings);
  }, [unitsSettings, unitsForm]);

  useEffect(() => {
    nutritionForm.setFieldsValue(nutritionSettings);
  }, [nutritionSettings, nutritionForm]);

  useEffect(() => {
    mealPlanningForm.setFieldsValue(mealPlanningSettings);
  }, [mealPlanningSettings, mealPlanningForm]);

  useEffect(() => {
    recipeForm.setFieldsValue(recipeSettings);
  }, [recipeSettings, recipeForm]);

  useEffect(() => {
    healthForm.setFieldsValue(healthSettings);
  }, [healthSettings, healthForm]);

  useEffect(() => {
    advancedForm.setFieldsValue(advancedSettings);
  }, [advancedSettings, advancedForm]);

  useEffect(() => {
    integrationForm.setFieldsValue(integrationSettings);
  }, [integrationSettings, integrationForm]);

  useEffect(() => {
    accessibilityForm.setFieldsValue(accessibilitySettings);
  }, [accessibilitySettings, accessibilityForm]);

  useEffect(() => {
    performanceForm.setFieldsValue(performanceSettings);
  }, [performanceSettings, performanceForm]);

  useEffect(() => {
    displayForm.setFieldsValue(displaySettings);
  }, [displaySettings, displayForm]);

  useEffect(() => {
    syncForm.setFieldsValue(syncSettings);
  }, [syncSettings, syncForm]);

  useEffect(() => {
    privacyForm.setFieldsValue(privacySettings);
  }, [privacySettings, privacyForm]);

  useEffect(() => {
    customizationForm.setFieldsValue(customizationSettings);
  }, [customizationSettings, customizationForm]);

  const handleGeneralSubmit = async (values) => {
    try {
      dispatch(updateGeneralSettings(values));
      await dispatch(saveSettings({ general: values })).unwrap();
      message.success('General settings saved successfully');
    } catch (error) {
      message.error('Failed to save general settings');
    }
  };

  const handleUnitsSubmit = async (values) => {
    try {
      dispatch(updateUnitsSettings(values));
      await dispatch(saveSettings({ units: values })).unwrap();
      message.success('Units settings saved successfully');
    } catch (error) {
      message.error('Failed to save units settings');
    }
  };

  const handleNutritionSubmit = async (values) => {
    try {
      dispatch(updateNutritionSettings(values));
      await dispatch(saveSettings({ nutrition: values })).unwrap();
      message.success('Nutrition settings saved successfully');
    } catch (error) {
      message.error('Failed to save nutrition settings');
    }
  };

  const handleMealPlanningSubmit = async (values) => {
    try {
      dispatch(updateMealPlanningSettings(values));
      await dispatch(saveSettings({ mealPlanning: values })).unwrap();
      message.success('Meal planning settings saved successfully');
    } catch (error) {
      message.error('Failed to save meal planning settings');
    }
  };

  const handleRecipeSubmit = async (values) => {
    try {
      dispatch(updateRecipeSettings(values));
      await dispatch(saveSettings({ recipes: values })).unwrap();
      message.success('Recipe settings saved successfully');
    } catch (error) {
      message.error('Failed to save recipe settings');
    }
  };

  const handleHealthSubmit = async (values) => {
    try {
      dispatch(updateHealthSettings(values));
      await dispatch(saveSettings({ health: values })).unwrap();
      message.success('Health settings saved successfully');
    } catch (error) {
      message.error('Failed to save health settings');
    }
  };

  const handleCustomizationSubmit = async (values) => {
    try {
      dispatch(updateCustomizationSettings(values));
      await dispatch(saveSettings({ customization: values })).unwrap();
      message.success('Customization settings saved successfully');
    } catch (error) {
      message.error('Failed to save customization settings');
    }
  };

  const handleDisplaySubmit = async (values) => {
    try {
      dispatch(updateDisplaySettings(values));
      await dispatch(saveSettings({ display: values })).unwrap();
      message.success('Display settings saved successfully');
    } catch (error) {
      message.error('Failed to save display settings');
    }
  };

  const handleSyncSubmit = async (values) => {
    try {
      dispatch(updateSyncSettings(values));
      await dispatch(saveSettings({ sync: values })).unwrap();
      message.success('Sync settings saved successfully');
    } catch (error) {
      message.error('Failed to save sync settings');
    }
  };

  const handlePrivacySubmit = async (values) => {
    try {
      dispatch(updatePrivacySettings(values));
      await dispatch(saveSettings({ privacy: values })).unwrap();
      message.success('Privacy settings saved successfully');
    } catch (error) {
      message.error('Failed to save privacy settings');
    }
  };

  const handleThemeChange = async (theme) => {
    try {
      dispatch(setTheme(theme));
      await dispatch(saveSettings({ general: { ...generalSettings, theme } })).unwrap();
      message.success('Theme updated successfully');
      // Force immediate UI update
      document.documentElement.setAttribute('data-theme', theme);
    } catch (error) {
      message.error('Failed to update theme');
    }
  };

  const handleLanguageChange = async (language) => {
    try {
      dispatch(setLanguage(language));
      await dispatch(saveSettings({ general: { ...generalSettings, language } })).unwrap();
      message.success('Language updated successfully');
      // Language change will be reflected in real-time through Redux
    } catch (error) {
      message.error('Failed to update language');
    }
  };

  const handleTimezoneChange = async (timezone) => {
    try {
      dispatch(updateGeneralSettings({ timezone }));
      await dispatch(saveSettings({ general: { ...generalSettings, timezone } })).unwrap();
      message.success('Timezone updated successfully');
    } catch (error) {
      message.error('Failed to update timezone');
    }
  };

  const handleDateFormatChange = async (dateFormat) => {
    try {
      dispatch(updateGeneralSettings({ dateFormat }));
      await dispatch(saveSettings({ general: { ...generalSettings, dateFormat } })).unwrap();
      message.success('Date format updated successfully');
    } catch (error) {
      message.error('Failed to update date format');
    }
  };

  const handleTimeFormatChange = async (timeFormat) => {
    try {
      dispatch(updateGeneralSettings({ timeFormat }));
      await dispatch(saveSettings({ general: { ...generalSettings, timeFormat } })).unwrap();
      message.success('Time format updated successfully');
    } catch (error) {
      message.error('Failed to update time format');
    }
  };

  const handleCurrencyChange = async (currency) => {
    try {
      dispatch(updateGeneralSettings({ currency }));
      await dispatch(saveSettings({ general: { ...generalSettings, currency } })).unwrap();
      message.success('Currency updated successfully');
    } catch (error) {
      message.error('Failed to update currency');
    }
  };

  const handleFirstDayOfWeekChange = async (firstDayOfWeek) => {
    try {
      dispatch(updateGeneralSettings({ firstDayOfWeek }));
      await dispatch(saveSettings({ general: { ...generalSettings, firstDayOfWeek } })).unwrap();
      message.success('First day of week updated successfully');
    } catch (error) {
      message.error('Failed to update first day of week');
    }
  };

  const handleClearCache = () => {
    modal.confirm({
      title: 'Clear Cache',
      content: 'Are you sure you want to clear all cached data? This will improve performance but may slow down initial loading.',
      okText: 'Clear Cache',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Simulate cache clearing
          localStorage.removeItem('nutrihelp_cache');
          sessionStorage.clear();
          
          // Update cache info
          setCacheInfo({
            cacheSize: '0 MB',
            localData: '0 MB',
            tempFiles: '0 MB'
          });
          
          message.success('Cache cleared successfully');
        } catch (error) {
          message.error('Failed to clear cache');
        }
      }
    });
  };

  const handleClearLocalData = () => {
    modal.confirm({
      title: 'Clear Local Data',
      content: 'This will remove all locally stored data except settings. You will need to sync again to restore your data.',
      okText: 'Clear Data',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Clear specific local storage items but keep settings
          const settingsBackup = localStorage.getItem('nutrihelp_settings');
          localStorage.clear();
          if (settingsBackup) {
            localStorage.setItem('nutrihelp_settings', settingsBackup);
          }
          
          setCacheInfo({
            cacheSize: '0 MB',
            localData: '0 MB',
            tempFiles: '0 MB'
          });
          
          message.success('Local data cleared successfully');
        } catch (error) {
          message.error('Failed to clear local data');
        }
      }
    });
  };

  const handleIntegrationSubmit = async (values) => {
    try {
      dispatch(updateIntegrationSettings(values));
      await dispatch(saveSettings({ integrations: values })).unwrap();
      message.success('Integration settings saved successfully');
    } catch (error) {
      message.error('Failed to save integration settings');
    }
  };

  const handleAccessibilitySubmit = async (values) => {
    try {
      dispatch(updateAccessibilitySettings(values));
      await dispatch(saveSettings({ accessibility: values })).unwrap();
      message.success('Accessibility settings saved successfully');
    } catch (error) {
      message.error('Failed to save accessibility settings');
    }
  };

  const handlePerformanceSubmit = async (values) => {
    try {
      dispatch(updatePerformanceSettings(values));
      await dispatch(saveSettings({ performance: values })).unwrap();
      message.success('Performance settings saved successfully');
    } catch (error) {
      message.error('Failed to save performance settings');
    }
  };

  const handleAdvancedSubmit = async (values) => {
    try {
      dispatch(updateAdvancedSettings(values));
      await dispatch(saveSettings({ advanced: values })).unwrap();
      message.success('Advanced settings saved successfully');
    } catch (error) {
      message.error('Failed to save advanced settings');
    }
  };

  const handleExportSettings = async () => {
    try {
      await dispatch(exportSettings()).unwrap();
      message.success('Settings exported successfully');
    } catch (error) {
      message.error('Failed to export settings');
    }
  };

  const handleImportSettings = async (file) => {
    try {
      await dispatch(importSettings(file)).unwrap();
      message.success('Settings imported successfully');
    } catch (error) {
      message.error('Failed to import settings');
    }
  };

  const handleResetSettings = () => {
    modal.confirm({
      title: 'Reset All Settings',
      content: 'Are you sure you want to reset all settings to default values? This action cannot be undone.',
      okText: 'Reset',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(resetSettings()).unwrap();
          message.success('Settings reset to default values');
        } catch (error) {
          message.error('Failed to reset settings');
        }
      }
    });
  };

  const uploadProps = {
    accept: '.json',
    beforeUpload: (file) => {
      handleImportSettings(file);
      return false;
    },
    showUploadList: false
  };

  const tabItems = [
    { key: 'general', label: 'General', icon: <SettingOutlined /> },
    { key: 'units', label: 'Units', icon: <DatabaseOutlined /> },
    { key: 'nutrition', label: 'Nutrition', icon: <InfoCircleOutlined /> },
    { key: 'mealPlanning', label: 'Meal Planning', icon: <CalendarOutlined /> },
    { key: 'recipes', label: 'Recipes', icon: <BookOutlined /> },
    { key: 'health', label: 'Health', icon: <HeartOutlined /> },
    { key: 'display', label: 'Display', icon: <DatabaseOutlined /> },
    { key: 'sync', label: 'Sync & Backup', icon: <CloudOutlined /> },
    { key: 'privacy', label: 'Privacy', icon: <SafetyOutlined /> },
    { key: 'integrations', label: 'Integrations', icon: <CloudOutlined /> },
    { key: 'accessibility', label: 'Accessibility', icon: <SafetyOutlined /> },
    { key: 'performance', label: 'Performance', icon: <DatabaseOutlined /> },
    { key: 'customization', label: 'Customization', icon: <BgColorsOutlined /> },
    { key: 'advanced', label: 'Advanced', icon: <WarningOutlined /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div>
            <Card title="Application Preferences" style={{ marginBottom: '24px' }}>
              <Form form={generalForm} layout="vertical" onFinish={handleGeneralSubmit}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Theme" name="theme">
                      <Select
                        size="large"
                        onChange={handleThemeChange}
                        placeholder="Select theme"
                      >
                        <Option value="light">Light</Option>
                        <Option value="dark">Dark</Option>
                        <Option value="system">System Default</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Language" name="language">
                      <Select
                        size="large"
                        onChange={handleLanguageChange}
                        placeholder="Select language"
                      >
                        <Option value="en">English</Option>
                        <Option value="es">Español</Option>
                        <Option value="fr">Français</Option>
                        <Option value="de">Deutsch</Option>
                        <Option value="zh">Chinese</Option>
                        <Option value="ja">Japanese</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Timezone" name="timezone">
                      <Select size="large" placeholder="Select timezone" onChange={handleTimezoneChange}>
                        <Option value="America/New_York">Eastern Time</Option>
                        <Option value="America/Chicago">Central Time</Option>
                        <Option value="America/Denver">Mountain Time</Option>
                        <Option value="America/Los_Angeles">Pacific Time</Option>
                        <Option value="Europe/London">GMT</Option>
                        <Option value="Europe/Paris">CET</Option>
                        <Option value="Asia/Tokyo">JST</Option>
                        <Option value="Asia/Shanghai">CST</Option>
                        <Option value="Australia/Sydney">Australia/Sydney</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={6}>
                    <Form.Item label="Date Format" name="dateFormat">
                      <Select size="large" onChange={handleDateFormatChange}>
                        <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                        <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                        <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                        <Option value="MMM DD, YYYY">MMM DD, YYYY</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="Time Format" name="timeFormat">
                      <Select size="large" onChange={handleTimeFormatChange}>
                        <Option value="12h">12 Hour</Option>
                        <Option value="24h">24 Hour</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="Currency" name="currency">
                      <Select size="large" onChange={handleCurrencyChange}>
                        <Option value="USD">USD ($)</Option>
                        <Option value="EUR">EUR (€)</Option>
                        <Option value="GBP">GBP (£)</Option>
                        <Option value="JPY">JPY (¥)</Option>
                        <Option value="CNY">CNY (¥)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="First Day of Week" name="firstDayOfWeek">
                      <Select size="large" onChange={handleFirstDayOfWeekChange}>
                        <Option value={0}>Sunday</Option>
                        <Option value={1}>Monday</Option>
                        <Option value={6}>Saturday</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider>Application Behavior</Divider>
                
                <Row gutter={[24, 20]}>
                  <Col xs={24} md={8}>
                    <Form.Item name="autoSave" valuePropName="checked">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div>
                          <Text strong style={{ fontSize: '15px', color: '#262626' }}>Auto-save</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '13px', marginTop: '4px' }}>Automatically save changes</Text>
                        </div>
                        <Switch size="default" style={{ minWidth: '44px' }} />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="autoBackup" valuePropName="checked">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div>
                          <Text strong style={{ fontSize: '15px', color: '#262626' }}>Auto-backup</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '13px', marginTop: '4px' }}>Automatic data backup</Text>
                        </div>
                        <Switch size="default" style={{ minWidth: '44px' }} />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="sendCrashReports" valuePropName="checked">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div>
                          <Text strong style={{ fontSize: '15px', color: '#262626' }}>Crash Reports</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '13px', marginTop: '4px' }}>Help improve the app</Text>
                        </div>
                        <Switch size="default" style={{ minWidth: '44px' }} />
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
                
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />} 
                    loading={isSaving} 
                    size="large"
                    style={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      height: '48px',
                      minWidth: '180px',
                      background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                    }}
                  >
                    Save General Settings
                  </Button>
                </div>
              </Form>
            </Card>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card title="Data Management" size="small" style={{ height: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Button
                      type="primary"
                      icon={<ExportOutlined />}
                      onClick={handleExportSettings}
                      loading={isExporting}
                      block
                      size="large"
                      style={{ borderRadius: '8px', fontWeight: 500 }}
                    >
                      Export Settings
                    </Button>
                    <Upload {...uploadProps}>
                      <Button
                        icon={<ImportOutlined />}
                        loading={isImporting}
                        block
                        size="large"
                        style={{ borderRadius: '8px', fontWeight: 500 }}
                      >
                        Import Settings
                      </Button>
                    </Upload>
                    <Button
                      danger
                      icon={<ReloadOutlined />}
                      onClick={handleResetSettings}
                      loading={isResetting}
                      block
                      size="large"
                      style={{ borderRadius: '8px', fontWeight: 500 }}
                    >
                      Reset to Defaults
                    </Button>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card title="Storage & Cache" size="small" style={{ height: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div style={{ padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text style={{ fontSize: '14px', color: '#666' }}>Cache Size</Text>
                        <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>{cacheInfo.cacheSize}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text style={{ fontSize: '14px', color: '#666' }}>Local Data</Text>
                        <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>{cacheInfo.localData}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: '14px', color: '#666' }}>Temp Files</Text>
                        <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>{cacheInfo.tempFiles}</Text>
                      </div>
                    </div>
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={handleClearCache}
                      size="large"
                      block
                      style={{ borderRadius: '8px', fontWeight: 500 }}
                    >
                      Clear Cache
                    </Button>
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={handleClearLocalData}
                      type="text"
                      danger
                      size="large"
                      block
                      style={{ borderRadius: '8px', fontWeight: 500 }}
                    >
                      Clear All Local Data
                    </Button>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card title="App Information" size="small" style={{ height: '100%' }}>
                  <div style={{ padding: '12px', backgroundColor: '#f6f8fa', borderRadius: '6px' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e8e8e8' }}>
                        <Text style={{ fontSize: '16px', color: '#666', fontWeight: 500 }}>Version</Text>
                        <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>1.0.0</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                        <Text style={{ fontSize: '16px', color: '#666', fontWeight: 500 }}>Platform</Text>
                        <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>Desktop</Text>
                      </div>
                    </Space>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 'units':
        return (
          <Card title="Units & Measurements" style={{ margin: 0 }}>
            <Form form={unitsForm} layout="vertical" onFinish={handleUnitsSubmit}>
              <Alert
                message="Measurement Units"
                description="Configure the units of measurement used throughout the application."
                type="info"
                style={{ marginBottom: '24px' }}
              />
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item label="Weight" name="weight">
                    <Select size="large">
                      <Option value="kg">Kilograms (kg)</Option>
                      <Option value="lb">Pounds (lb)</Option>
                      <Option value="st">Stones (st)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Height" name="height">
                    <Select size="large">
                      <Option value="cm">Centimeters (cm)</Option>
                      <Option value="ft">Feet & Inches (ft/in)</Option>
                      <Option value="m">Meters (m)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Distance" name="distance">
                    <Select size="large">
                      <Option value="km">Kilometers (km)</Option>
                      <Option value="mi">Miles (mi)</Option>
                      <Option value="m">Meters (m)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item label="Temperature" name="temperature">
                    <Select size="large">
                      <Option value="celsius">Celsius (°C)</Option>
                      <Option value="fahrenheit">Fahrenheit (°F)</Option>
                      <Option value="kelvin">Kelvin (K)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Volume" name="volume">
                    <Select size="large">
                      <Option value="ml">Milliliters (ml)</Option>
                      <Option value="fl_oz">Fluid Ounces (fl oz)</Option>
                      <Option value="cups">Cups</Option>
                      <Option value="l">Liters (l)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Energy" name="energy">
                    <Select size="large">
                      <Option value="kcal">Kilocalories (kcal)</Option>
                      <Option value="kj">Kilojoules (kJ)</Option>
                      <Option value="cal">Calories (cal)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Units Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'nutrition':
        return (
          <Card title="Nutrition Preferences" style={{ margin: 0 }}>
            <Form form={nutritionForm} layout="vertical" onFinish={handleNutritionSubmit}>
              <Alert
                message="Nutrition Tracking"
                description="Configure how nutrition information is displayed and tracked."
                type="info"
                style={{ marginBottom: '24px' }}
              />
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item label="Default Meal Plan" name="defaultMealPlan">
                    <Select size="large">
                      <Option value="balanced">Balanced</Option>
                      <Option value="low_carb">Low Carb</Option>
                      <Option value="high_protein">High Protein</Option>
                      <Option value="mediterranean">Mediterranean</Option>
                      <Option value="vegetarian">Vegetarian</Option>
                      <Option value="vegan">Vegan</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Nutrition Label Format" name="nutritionLabelFormat">
                    <Select size="large">
                      <Option value="standard">Standard</Option>
                      <Option value="detailed">Detailed</Option>
                      <Option value="simplified">Simplified</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Default Portion Size" name="defaultPortionSize">
                    <Select size="large">
                      <Option value="small">Small</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="large">Large</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={6}>
                  <Form.Item label="Rounding Precision" name="roundingPrecision">
                    <InputNumber min={0} max={3} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>Tracking Options</Divider>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="showMacroPercentages" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Show Macro Percentages</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Display macronutrient percentages</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="showMicronutrients" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Show Micronutrients</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Display vitamins and minerals</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="trackWater" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Track Water Intake</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Monitor daily water consumption</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="trackSupplements" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Track Supplements</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Monitor supplement intake</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="barcodeScannerEnabled" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Barcode Scanner</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Enable barcode scanning</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="showNutritionScore" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Nutrition Score</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Show nutrition quality score</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Nutrition Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'mealPlanning':
        return (
          <Card title="Meal Planning Preferences" style={{ margin: 0 }}>
            <Form form={mealPlanningForm} layout="vertical" onFinish={handleMealPlanningSubmit}>
              <Alert
                message="Meal Planning"
                description="Configure your meal planning preferences and automation settings."
                type="info"
                style={{ marginBottom: '24px' }}
              />
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item label="Default Meals Per Day" name="defaultMealsPerDay">
                    <InputNumber min={1} max={10} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Planning Horizon (days)" name="planningHorizon">
                    <InputNumber min={1} max={30} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Max Budget Per Meal" name="maxBudgetPerMeal">
                    <InputNumber min={1} max={100} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item label="Preferred Cooking Time (minutes)" name="preferredCookingTime">
                    <InputNumber min={5} max={180} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>Planning Options</Divider>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="includeSnacks" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Include Snacks</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Add snacks to meal plans</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="autoGenerateMealPlans" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Auto Generate Plans</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Automatically create meal plans</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="considerLeftovers" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Consider Leftovers</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Plan for leftover meals</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="budgetConstraints" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Budget Constraints</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Apply budget limits</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="allergenAlerts" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Allergen Alerts</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Warn about allergens</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Meal Planning Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'recipes':
        return (
          <Card title="Recipe Preferences" style={{ margin: 0 }}>
            <Form form={recipeForm} layout="vertical" onFinish={handleRecipeSubmit}>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item label="Default Serving Size" name="defaultServingSize">
                    <InputNumber min={1} max={20} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Cooking Skill Level" name="cookingSkillLevel">
                    <Select size="large">
                      <Option value="beginner">Beginner</Option>
                      <Option value="intermediate">Intermediate</Option>
                      <Option value="advanced">Advanced</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]}>
                {[
                  { key: 'showNutritionInfo', label: 'Show Nutrition Info', desc: 'Display nutrition information' },
                  { key: 'showCookingTime', label: 'Show Cooking Time', desc: 'Display preparation time' },
                  { key: 'enableRatings', label: 'Enable Ratings', desc: 'Allow recipe ratings' },
                  { key: 'autoScaleIngredients', label: 'Auto Scale Ingredients', desc: 'Scale ingredients by serving size' }
                ].map(item => (
                  <Col xs={24} md={12} key={item.key}>
                    <Form.Item name={item.key} valuePropName="checked">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>{item.label}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>{item.desc}</Text>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Recipe Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'health':
        return (
          <Card title="Health Tracking" style={{ margin: 0 }}>
            <Form form={healthForm} layout="vertical" onFinish={handleHealthSubmit}>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={6}>
                  <Form.Item label="Data Retention (days)" name="healthDataRetention">
                    <InputNumber min={30} max={3650} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[24, 16]}>
                {[
                  { key: 'trackWeight', label: 'Track Weight', desc: 'Monitor weight changes' },
                  { key: 'trackBodyComposition', label: 'Track Body Composition', desc: 'Monitor body fat, muscle mass' },
                  { key: 'trackBloodPressure', label: 'Track Blood Pressure', desc: 'Monitor blood pressure' },
                  { key: 'trackExercise', label: 'Track Exercise', desc: 'Monitor physical activity' },
                  { key: 'healthReminders', label: 'Health Reminders', desc: 'Enable health notifications' },
                  { key: 'shareHealthData', label: 'Share Health Data', desc: 'Allow data sharing for analysis' }
                ].map(item => (
                  <Col xs={24} md={8} key={item.key}>
                    <Form.Item name={item.key} valuePropName="checked">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>{item.label}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>{item.desc}</Text>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Health Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'customization':
        return (
          <Card title="Customization" style={{ margin: 0 }}>
            <Form form={customizationForm} layout="vertical" onFinish={handleCustomizationSubmit}>
              <Alert
                message="Interface Customization"
                description="Personalize your dashboard and interface layout."
                type="info"
                style={{ marginBottom: '24px' }}
              />
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Dashboard Layout" name="dashboardLayout">
                    <Select size="large">
                      <Option value="default">Default Layout</Option>
                      <Option value="compact">Compact Layout</Option>
                      <Option value="detailed">Detailed Layout</Option>
                      <Option value="minimal">Minimal Layout</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Customization Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'display':
        return (
          <Card title="Display & Interface" style={{ margin: 0 }}>
            <Form form={displayForm} layout="vertical" onFinish={handleDisplaySubmit}>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Font Size" name="fontSize">
                    <Radio.Group>
                      <Radio value="small">Small</Radio>
                      <Radio value="medium">Medium</Radio>
                      <Radio value="large">Large</Radio>
                      <Radio value="extra-large">Extra Large</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Color Scheme" name="colorScheme">
                    <Select size="large">
                      <Option value="default">Default</Option>
                      <Option value="blue">Blue</Option>
                      <Option value="green">Green</Option>
                      <Option value="purple">Purple</Option>
                      <Option value="red">Red</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>Layout Options</Divider>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="compactMode" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Compact Mode</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Reduce spacing for more content</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="showSidebar" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Show Sidebar</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Display navigation sidebar</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="showQuickActions" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Quick Actions</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Show quick action buttons</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="showProgressBars" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Progress Bars</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Show progress indicators</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="showCharts" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Charts & Graphs</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Display data visualizations</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="showTooltips" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Tooltips</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Show helpful tooltips</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Display Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'sync':
        return (
          <Card title="Sync & Backup" style={{ margin: 0 }}>
            <Form form={syncForm} layout="vertical" onFinish={handleSyncSubmit}>
              <Alert
                message="Cloud Synchronization"
                description="Keep your data synchronized across all devices and create automatic backups."
                type="info"
                style={{ marginBottom: '24px' }}
              />
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="enabled" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Enable Sync</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Synchronize data across devices</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="autoSync" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Auto Sync</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Automatically sync changes</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item label="Sync Interval (minutes)" name="syncInterval">
                    <InputNumber min={5} max={60} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Backup Frequency" name="backupFrequency">
                    <Select size="large">
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Max Backups" name="maxBackups">
                    <InputNumber min={1} max={20} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>Backup Options</Divider>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="cloudBackup" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Cloud Backup</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Store backups in the cloud</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="syncOnWifiOnly" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>WiFi Only</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Sync only on WiFi</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Conflict Resolution" name="syncConflictResolution">
                    <Select size="large">
                      <Option value="ask">Ask Me</Option>
                      <Option value="local">Prefer Local</Option>
                      <Option value="remote">Prefer Remote</Option>
                      <Option value="newest">Use Newest</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Sync Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'privacy':
        return (
          <Card title="Privacy & Security" style={{ margin: 0 }}>
            <Form form={privacyForm} layout="vertical" onFinish={handlePrivacySubmit}>
              <Alert
                message="Privacy Protection"
                description="Control how your data is collected, stored, and shared to protect your privacy."
                type="warning"
                style={{ marginBottom: '24px' }}
              />
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Data Collection" name="dataCollection">
                    <Radio.Group>
                      <Radio value="none">None</Radio>
                      <Radio value="minimal">Minimal</Radio>
                      <Radio value="standard">Standard</Radio>
                      <Radio value="full">Full</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Session Timeout (minutes)" name="sessionTimeout">
                    <InputNumber min={5} max={120} size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>Security Features</Divider>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="twoFactorAuth" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Two-Factor Auth</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Extra security for login</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="autoLock" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Auto Lock</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Lock app when idle</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="encryptLocalData" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Encrypt Local Data</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Encrypt stored data</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item name="shareAnonymousData" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Anonymous Analytics</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Help improve the app</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="allowCookies" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Allow Cookies</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Enable website cookies</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="deleteDataOnUninstall" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Delete on Uninstall</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>Remove all data when uninstalling</Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving} 
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Privacy Settings
                </Button>
              </div>
            </Form>
          </Card>
        );

      case 'integrations':
        return (
          <Card title="Integrations" style={{ margin: 0 }}>
            <Form form={integrationForm} layout="vertical" onFinish={handleIntegrationSubmit}>
              <Alert
                message="Third-party Integrations"
                description="Connect with external services and devices to enhance your experience."
                type="info"
                style={{ marginBottom: '24px' }}
              />
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Fitness Apps" extra={
                    <Form.Item name={['fitnessApps', 'enabled']} valuePropName="checked" style={{ margin: 0 }}>
                      <Switch size="small" />
                    </Form.Item>
                  }>
                    <List
                      size="small"
                      dataSource={[
                        { name: 'Google Fit', status: 'disconnected' },
                        { name: 'Apple Health', status: 'disconnected' },
                        { name: 'Fitbit', status: 'disconnected' }
                      ]}
                      renderItem={item => (
                        <List.Item>
                          <Space>
                            <Text>{item.name}</Text>
                            <Tag color={item.status === 'connected' ? 'green' : 'default'}>
                              {item.status}
                            </Tag>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card size="small" title="Smart Devices" extra={
                    <Form.Item name={['smartDevices', 'enabled']} valuePropName="checked" style={{ margin: 0 }}>
                      <Switch size="small" />
                    </Form.Item>
                  }>
                    <List
                      size="small"
                      dataSource={[
                        { name: 'Smart Scale', status: 'disconnected' },
                        { name: 'Heart Rate Monitor', status: 'disconnected' },
                        { name: 'Blood Pressure Monitor', status: 'disconnected' }
                      ]}
                      renderItem={item => (
                        <List.Item>
                          <Space>
                            <Text>{item.name}</Text>
                            <Tag color={item.status === 'connected' ? 'green' : 'default'}>
                              {item.status}
                            </Tag>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Form.Item style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isSaving}
                  size="large"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '48px',
                    minWidth: '180px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                  }}
                >
                  Save Integration Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'accessibility':
        return (
          <div style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffd666 100%)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
            <Title level={3} style={{ color: 'white', marginBottom: '8px', fontWeight: 600 }}>Accessibility</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Customize accessibility features for better usability</Text>
            
            <Form form={accessibilityForm} layout="vertical" onFinish={handleAccessibilitySubmit} style={{ marginTop: '32px' }}>
              <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} styles={{ body: { padding: '32px' } }}>
                <Row gutter={[24, 32]}>
                  {[
                    { key: 'screenReader', label: 'Screen Reader Support', desc: 'Enhanced support for screen readers' },
                    { key: 'keyboardNavigation', label: 'Keyboard Navigation', desc: 'Navigate using keyboard shortcuts' },
                    { key: 'largeText', label: 'Large Text', desc: 'Increase text size for better readability' },
                    { key: 'highContrast', label: 'High Contrast', desc: 'Enhance visual contrast' },
                    { key: 'reduceMotion', label: 'Reduce Motion', desc: 'Minimize animations and transitions' },
                    { key: 'audioFeedback', label: 'Audio Feedback', desc: 'Enable sound notifications' }
                  ].map((item, index) => (
                    <Col xs={24} sm={12} lg={8} key={item.key}>
                      <div style={{ 
                        padding: '20px', 
                        border: '2px solid #f0f0f0', 
                        borderRadius: '12px',
                        background: 'white',
                        transition: 'all 0.3s ease'
                      }}>
                        <Form.Item name={item.key} valuePropName="checked" style={{ margin: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, marginRight: '16px' }}>
                              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{item.label}</Text>
                              <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>{item.desc}</Text>
                            </div>
                            <Switch />
                          </div>
                        </Form.Item>
                      </div>
                    </Col>
                  ))}
                </Row>
                
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />} 
                    loading={isSaving}
                    size="large"
                    style={{ 
                      borderRadius: '12px', 
                      fontWeight: 600, 
                      minWidth: '200px',
                      background: 'linear-gradient(45deg, #fa8c16, #ffd666)'
                    }}
                  >
                    Save Accessibility Settings
                  </Button>
                </div>
              </Card>
            </Form>
          </div>
        );

      case 'performance':
        return (
          <div style={{ background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
            <Title level={3} style={{ color: 'white', marginBottom: '8px', fontWeight: 600 }}>Performance</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Optimize application performance for your device</Text>
            
            <Form form={performanceForm} layout="vertical" onFinish={handlePerformanceSubmit} style={{ marginTop: '32px' }}>
              <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} styles={{ body: { padding: '32px' } }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Form.Item label={<Text strong style={{ fontSize: '16px' }}>Image Quality</Text>} name="imageQuality">
                      <Select size="large" style={{ borderRadius: '8px' }}>
                        <Option value="low">Low Quality</Option>
                        <Option value="medium">Medium Quality</Option>
                        <Option value="high">High Quality</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label={<Text strong style={{ fontSize: '16px' }}>Compression Level</Text>} name="compressionLevel">
                      <Select size="large" style={{ borderRadius: '8px' }}>
                        <Option value="low">Low Compression</Option>
                        <Option value="medium">Medium Compression</Option>
                        <Option value="high">High Compression</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label={<Text strong style={{ fontSize: '16px' }}>Max Concurrent Requests</Text>} name="maxConcurrentRequests">
                      <InputNumber min={1} max={10} size="large" style={{ width: '100%', borderRadius: '8px' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider style={{ margin: '32px 0' }} />
                
                <Row gutter={[24, 24]}>
                  {[
                    { key: 'animationsEnabled', label: 'Enable Animations', desc: 'Show smooth transitions and effects' },
                    { key: 'cacheImages', label: 'Cache Images', desc: 'Store images locally for faster loading' },
                    { key: 'lazyLoadImages', label: 'Lazy Load Images', desc: 'Load images only when needed' }
                  ].map(item => (
                    <Col xs={24} lg={8} key={item.key}>
                      <div style={{ 
                        padding: '20px', 
                        border: '2px solid #f0f0f0', 
                        borderRadius: '12px',
                        background: 'white'
                      }}>
                        <Form.Item name={item.key} valuePropName="checked" style={{ margin: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, marginRight: '16px' }}>
                              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{item.label}</Text>
                              <Text type="secondary" style={{ fontSize: '12px' }}>{item.desc}</Text>
                            </div>
                            <Switch />
                          </div>
                        </Form.Item>
                      </div>
                    </Col>
                  ))}
                </Row>
                
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />} 
                    loading={isSaving}
                    size="large"
                    style={{ 
                      borderRadius: '12px', 
                      fontWeight: 600, 
                      minWidth: '200px',
                      background: 'linear-gradient(45deg, #722ed1, #b37feb)'
                    }}
                  >
                    Save Performance Settings
                  </Button>
                </div>
              </Card>
            </Form>
          </div>
        );

      case 'advanced':
        return (
          <div style={{ background: 'linear-gradient(135deg, #f5222d 0%, #ff7875 100%)', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
            <Title level={3} style={{ color: 'white', marginBottom: '8px', fontWeight: 600 }}>Advanced Settings</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Advanced configuration options for experienced users</Text>
            
            <Form form={advancedForm} layout="vertical" onFinish={handleAdvancedSubmit} style={{ marginTop: '32px' }}>
              <Alert
                message="Warning: Advanced Settings"
                description="These settings are for advanced users only. Changing these may affect app stability and performance."
                type="warning"
                showIcon
                style={{ marginBottom: '24px', borderRadius: '12px' }}
              />
              
              <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} styles={{ body: { padding: '32px' } }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Form.Item label={<Text strong style={{ fontSize: '16px' }}>Log Level</Text>} name="logLevel">
                      <Select size="large" style={{ borderRadius: '8px' }}>
                        <Option value="error">Error Only</Option>
                        <Option value="warn">Warning & Error</Option>
                        <Option value="info">Info, Warning & Error</Option>
                        <Option value="debug">Debug (All Logs)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label={<Text strong style={{ fontSize: '16px' }}>Cache Size (MB)</Text>} name="cacheSize">
                      <InputNumber 
                        min={50} 
                        max={500} 
                        size="large" 
                        style={{ width: '100%', borderRadius: '8px' }}
                        formatter={value => `${value} MB`}
                        parser={value => value.replace(' MB', '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider style={{ margin: '32px 0' }} />
                
                <Row gutter={[24, 24]}>
                  {[
                    { key: 'debugMode', label: 'Debug Mode', desc: 'Enable detailed debugging information', icon: '🐛' },
                    { key: 'experimentalFeatures', label: 'Experimental Features', desc: 'Access to experimental functionality', icon: '🧪' },
                    { key: 'betaFeatures', label: 'Beta Features', desc: 'Enable beta testing features', icon: '🚀' }
                  ].map(item => (
                    <Col xs={24} lg={8} key={item.key}>
                      <div style={{ 
                        padding: '20px', 
                        border: '2px solid #ffebee', 
                        borderRadius: '12px',
                        background: 'white'
                      }}>
                        <Form.Item name={item.key} valuePropName="checked" style={{ margin: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, marginRight: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '16px', marginRight: '8px' }}>{item.icon}</span>
                                <Text strong style={{ fontSize: '14px' }}>{item.label}</Text>
                              </div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>{item.desc}</Text>
                            </div>
                            <Switch />
                          </div>
                        </Form.Item>
                      </div>
                    </Col>
                  ))}
                </Row>
                
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />} 
                    loading={isSaving}
                    size="large"
                    style={{ 
                      borderRadius: '12px', 
                      fontWeight: 600, 
                      minWidth: '200px',
                      background: 'linear-gradient(45deg, #f5222d, #ff7875)'
                    }}
                  >
                    Save Advanced Settings
                  </Button>
                </div>
              </Card>
            </Form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      padding: '32px', 
      height: '100vh',
      backgroundColor: '#f8f9fa',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '8px 0' }}>
              <Space size="large">
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/dashboard')}
                  style={{ 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '8px 16px',
                    color: '#666'
                  }}
                >
                  Back to Dashboard
                </Button>
                <div style={{ height: '24px', width: '1px', backgroundColor: '#e8e8e8' }} />
                <div>
                  <Title level={2} style={{ margin: 0, fontSize: '28px', fontWeight: 600, color: '#262626' }}>
                    Settings
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px' }}>Customize your application preferences</Text>
                </div>
              </Space>
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '12px',
                border: '1px solid #f0f0f0'
              }}>
                {tabItems.map(item => (
                  <Button
                    key={item.key}
                    type={activeTab === item.key ? 'primary' : 'default'}
                    icon={item.icon}
                    onClick={() => setActiveTab(item.key)}
                    style={{
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '13px',
                      height: '40px',
                      minWidth: '120px',
                      ...(activeTab === item.key ? {
                        background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
                      } : {
                        backgroundColor: 'white',
                        borderColor: '#d9d9d9',
                        color: '#595959'
                      })
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {renderTabContent()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;