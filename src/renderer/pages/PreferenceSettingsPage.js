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
  App
} from 'antd';
import {
  SettingOutlined,
  GlobalOutlined,
  EyeOutlined,
  BellOutlined,
  SecurityScanOutlined,
  CloudOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import {
  loadSettings,
  saveSettings,
  updateGeneralSettings,
  updateUnitsSettings,
  updateNutritionSettings,
  updateDisplaySettings,
  updatePrivacySettings,
  selectGeneralSettings,
  selectUnitsSettings,
  selectNutritionSettings,
  selectDisplaySettings,
  selectPrivacySettings,
  selectIsLoading,
  selectIsSaving
} from '../store/slices/settingsSlice';

const { Title, Text } = Typography;
const { Option } = Select;

const PreferenceSettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp();
  
  const generalSettings = useSelector(selectGeneralSettings);
  const unitsSettings = useSelector(selectUnitsSettings);
  const nutritionSettings = useSelector(selectNutritionSettings);
  const displaySettings = useSelector(selectDisplaySettings);
  const privacySettings = useSelector(selectPrivacySettings);
  const isLoading = useSelector(selectIsLoading);
  const isSaving = useSelector(selectIsSaving);
  
  const [activeTab, setActiveTab] = useState('general');
  const [generalForm] = Form.useForm();
  const [unitsForm] = Form.useForm();
  const [nutritionForm] = Form.useForm();
  const [displayForm] = Form.useForm();
  const [privacyForm] = Form.useForm();

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
    displayForm.setFieldsValue(displaySettings);
  }, [displaySettings, displayForm]);

  useEffect(() => {
    privacyForm.setFieldsValue(privacySettings);
  }, [privacySettings, privacyForm]);

  const handleSaveSettings = async (section, values) => {
    try {
      if (section === 'general') {
        dispatch(updateGeneralSettings(values));
      } else if (section === 'units') {
        dispatch(updateUnitsSettings(values));
      } else if (section === 'nutrition') {
        dispatch(updateNutritionSettings(values));
      } else if (section === 'display') {
        dispatch(updateDisplaySettings(values));
      } else if (section === 'privacy') {
        dispatch(updatePrivacySettings(values));
      }
      
      const allSettings = {
        general: section === 'general' ? values : generalSettings,
        units: section === 'units' ? values : unitsSettings,
        nutrition: section === 'nutrition' ? values : nutritionSettings,
        display: section === 'display' ? values : displaySettings,
        privacy: section === 'privacy' ? values : privacySettings
      };
      
      await dispatch(saveSettings(allSettings)).unwrap();
      message.success('Preferences saved successfully');
    } catch (error) {
      message.error('Failed to save preferences');
    }
  };

  const tabItems = [
    { key: 'general', label: 'General', icon: <GlobalOutlined /> },
    { key: 'units', label: 'Units', icon: <SettingOutlined /> },
    { key: 'nutrition', label: 'Nutrition', icon: <EyeOutlined /> },
    { key: 'display', label: 'Display', icon: <BellOutlined /> },
    { key: 'privacy', label: 'Privacy', icon: <SecurityScanOutlined /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <Card title="General Preferences" style={{ margin: 0 }}>
            <Form form={generalForm} layout="vertical" onFinish={(values) => handleSaveSettings('general', values)}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Language" name="language">
                    <Select>
                      <Option value="en">English</Option>
                      <Option value="es">Spanish</Option>
                      <Option value="fr">French</Option>
                      <Option value="de">German</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Theme" name="theme">
                    <Select>
                      <Option value="light">Light</Option>
                      <Option value="dark">Dark</Option>
                      <Option value="system">System</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Date Format" name="dateFormat">
                    <Select>
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Time Format" name="timeFormat">
                    <Select>
                      <Option value="12h">12 Hour</Option>
                      <Option value="24h">24 Hour</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="autoSave" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Auto Save</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="autoBackup" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Auto Backup</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="sendCrashReports" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Send Crash Reports</Text>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving}>
                  Save General Preferences
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'units':
        return (
          <Card title="Units & Measurements" style={{ margin: 0 }}>
            <Form form={unitsForm} layout="vertical" onFinish={(values) => handleSaveSettings('units', values)}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Weight" name="weight">
                    <Select>
                      <Option value="kg">Kilograms (kg)</Option>
                      <Option value="lbs">Pounds (lbs)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Height" name="height">
                    <Select>
                      <Option value="cm">Centimeters (cm)</Option>
                      <Option value="ft">Feet & Inches</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Temperature" name="temperature">
                    <Select>
                      <Option value="celsius">Celsius (°C)</Option>
                      <Option value="fahrenheit">Fahrenheit (°F)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Energy" name="energy">
                    <Select>
                      <Option value="kcal">Kilocalories (kcal)</Option>
                      <Option value="kj">Kilojoules (kJ)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving}>
                  Save Units Preferences
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'nutrition':
        return (
          <Card title="Nutrition Preferences" style={{ margin: 0 }}>
            <Form form={nutritionForm} layout="vertical" onFinish={(values) => handleSaveSettings('nutrition', values)}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Default Meal Plan" name="defaultMealPlan">
                    <Select>
                      <Option value="balanced">Balanced</Option>
                      <Option value="low_carb">Low Carb</Option>
                      <Option value="high_protein">High Protein</Option>
                      <Option value="mediterranean">Mediterranean</Option>
                      <Option value="vegetarian">Vegetarian</Option>
                      <Option value="vegan">Vegan</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Default Portion Size" name="defaultPortionSize">
                    <Select>
                      <Option value="small">Small</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="large">Large</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="showMacroPercentages" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Show Macro Percentages</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="trackWater" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Track Water</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="showNutritionScore" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Show Nutrition Score</Text>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving}>
                  Save Nutrition Preferences
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'display':
        return (
          <Card title="Display Preferences" style={{ margin: 0 }}>
            <Form form={displayForm} layout="vertical" onFinish={(values) => handleSaveSettings('display', values)}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Chart Type" name="chartType">
                    <Select>
                      <Option value="line">Line Chart</Option>
                      <Option value="bar">Bar Chart</Option>
                      <Option value="area">Area Chart</Option>
                      <Option value="pie">Pie Chart</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Font Size" name="fontSize">
                    <Select>
                      <Option value="small">Small</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="large">Large</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="compactMode" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Compact Mode</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="showSidebar" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Show Sidebar</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="showCharts" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Show Charts</Text>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving}>
                  Save Display Preferences
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 'privacy':
        return (
          <Card title="Privacy & Security" style={{ margin: 0 }}>
            <Form form={privacyForm} layout="vertical" onFinish={(values) => handleSaveSettings('privacy', values)}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Data Collection" name="dataCollection">
                    <Select>
                      <Option value="minimal">Minimal</Option>
                      <Option value="standard">Standard</Option>
                      <Option value="full">Full</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Session Timeout (minutes)" name="sessionTimeout">
                    <InputNumber min={5} max={120} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="shareAnonymousData" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Share Anonymous Data</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="twoFactorAuth" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Two-Factor Auth</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="autoLock" valuePropName="checked">
                    <Space>
                      <Switch />
                      <Text>Auto Lock</Text>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving}>
                  Save Privacy Preferences
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      height: '100vh',
      backgroundColor: '#f5f5f5',
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
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Space>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/dashboard')}
                >
                  Back
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                  Preference Settings
                </Title>
              </Space>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <Space wrap>
                {tabItems.map(item => (
                  <Button
                    key={item.key}
                    type={activeTab === item.key ? 'primary' : 'default'}
                    icon={item.icon}
                    onClick={() => setActiveTab(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </Space>
            </div>

            {renderTabContent()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PreferenceSettingsPage;