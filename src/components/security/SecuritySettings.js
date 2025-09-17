import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Switch,
  Button,
  Form,
  Input,
  Select,
  Typography,
  Space,
  Alert,
  Modal,
  Divider,
  List,
  Avatar,
  Tag,
  Tooltip,
  Progress,
  notification,
  Popconfirm,
  Badge,
  Slider,
  TimePicker,
  Checkbox,
  Radio,
  InputNumber
} from 'antd';
import {
  SafetyOutlined,
  MobileOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  KeyOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  GlobalOutlined,
  WarningOutlined,
  RadarChartOutlined
} from '../../components/icons/PaperIcons';
import { securityService } from '../../services/securityService';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SecuritySettings = ({ userId, onSettingsChange }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [devices, setDevices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
  const [biometricModalVisible, setBiometricModalVisible] = useState(false);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [threatRules, setThreatRules] = useState([]);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    if (userId) {
      loadSecuritySettings();
    }
  }, [userId]);

  const loadSecuritySettings = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [userProfile, userDevices, userSessions, rules] = await Promise.all([
        securityService.getUserProfile(userId),
        securityService.getUserDevices(userId),
        securityService.getUserSessions(userId),
        securityService.getThreatDetectionRules()
      ]);

      setSettings(userProfile);
      setDevices(userDevices);
      setSessions(userSessions);
      setThreatRules(rules);
      
      form.setFieldsValue({
        email_notifications: userProfile.email_notifications,
        sms_notifications: userProfile.sms_notifications,
        push_notifications: userProfile.push_notifications,
        login_alerts: userProfile.login_alerts,
        security_alerts: userProfile.security_alerts,
        session_timeout: userProfile.session_timeout || 30,
        max_login_attempts: userProfile.max_login_attempts || 5,
        password_expiry_days: userProfile.password_expiry_days || 90,
        require_password_change: userProfile.require_password_change,
        allowed_ip_ranges: userProfile.allowed_ip_ranges,
        blocked_countries: userProfile.blocked_countries,
        auto_lock_time: userProfile.auto_lock_time || 15,
        privacy_mode: userProfile.privacy_mode,
        data_retention_days: userProfile.data_retention_days || 365
      });
    } catch (error) {
      console.error('Error loading security settings:', error);
      notification.error({
        message: 'Error Loading Settings',
        description: 'Failed to load security settings.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (values) => {
    try {
      setSaving(true);
      await securityService.updateUserProfile(userId, values);
      
      setSettings(prev => ({ ...prev, ...values }));
      
      notification.success({
        message: 'Settings Updated',
        description: 'Security settings have been updated successfully.'
      });
      
      if (onSettingsChange) {
        onSettingsChange(values);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      notification.error({
        message: 'Update Failed',
        description: 'Failed to update security settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setSaving(true);
      await securityService.changePassword(userId, values.currentPassword, values.newPassword);
      
      notification.success({
        message: 'Password Changed',
        description: 'Your password has been changed successfully.'
      });
      
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      console.error('Error changing password:', error);
      notification.error({
        message: 'Password Change Failed',
        description: error.message || 'Failed to change password.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async (enabled) => {
    try {
      await securityService.toggle2FA(userId, enabled);
      setSettings(prev => ({ ...prev, two_factor_enabled: enabled }));
      
      notification.success({
        message: enabled ? '2FA Enabled' : '2FA Disabled',
        description: `Two-factor authentication has been ${enabled ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      notification.error({
        message: '2FA Toggle Failed',
        description: 'Failed to update two-factor authentication settings.'
      });
    }
  };

  const handleToggleBiometric = async (enabled) => {
    try {
      await securityService.toggleBiometric(userId, enabled);
      setSettings(prev => ({ ...prev, biometric_enabled: enabled }));
      
      notification.success({
        message: enabled ? 'Biometric Enabled' : 'Biometric Disabled',
        description: `Biometric authentication has been ${enabled ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      console.error('Error toggling biometric:', error);
      notification.error({
        message: 'Biometric Toggle Failed',
        description: 'Failed to update biometric authentication settings.'
      });
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    try {
      await securityService.removeDevice(userId, deviceId);
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      
      notification.success({
        message: 'Device Removed',
        description: 'Device has been removed successfully.'
      });
    } catch (error) {
      console.error('Error removing device:', error);
      notification.error({
        message: 'Remove Failed',
        description: 'Failed to remove device.'
      });
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await securityService.revokeSession(userId, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      notification.success({
        message: 'Session Revoked',
        description: 'Session has been revoked successfully.'
      });
    } catch (error) {
      console.error('Error revoking session:', error);
      notification.error({
        message: 'Revoke Failed',
        description: 'Failed to revoke session.'
      });
    }
  };

  const handleTrustDevice = async (deviceId, trusted) => {
    try {
      await securityService.trustDevice(userId, deviceId, trusted);
      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, is_trusted: trusted } : d
      ));
      
      notification.success({
        message: trusted ? 'Device Trusted' : 'Device Untrusted',
        description: `Device has been ${trusted ? 'trusted' : 'untrusted'}.`
      });
    } catch (error) {
      console.error('Error updating device trust:', error);
      notification.error({
        message: 'Trust Update Failed',
        description: 'Failed to update device trust status.'
      });
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <MobileOutlined />;
      case 'desktop': return <UserOutlined />;
      case 'tablet': return <MobileOutlined />;
      default: return <GlobalOutlined />;
    }
  };

  const getSessionStatus = (session) => {
    const lastActivity = new Date(session.last_activity);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastActivity) / (1000 * 60));
    
    if (diffInMinutes < 5) return { status: 'active', color: '#52c41a' };
    if (diffInMinutes < 30) return { status: 'idle', color: '#faad14' };
    return { status: 'inactive', color: '#d9d9d9' };
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Authentication Settings" loading={loading}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Two-Factor Authentication">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Enable 2FA</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Add an extra layer of security
                        </Text>
                      </div>
                      <Switch
                        checked={settings.two_factor_enabled}
                        onChange={handleToggle2FA}
                        checkedChildren={<CheckCircleOutlined noMargin />}
                        unCheckedChildren={<ExclamationCircleOutlined noMargin />}
                      />
                    </div>
                    {settings.two_factor_enabled && (
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setTwoFactorModalVisible(true)}
                      >
                        Configure 2FA Settings
                      </Button>
                    )}
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card size="small" title="Biometric Authentication">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Enable Biometric</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Use fingerprint or face recognition
                        </Text>
                      </div>
                      <Switch
                        checked={settings.biometric_enabled}
                        onChange={handleToggleBiometric}
                        checkedChildren={<CheckCircleOutlined noMargin />}
                        unCheckedChildren={<ExclamationCircleOutlined noMargin />}
                      />
                    </div>
                    {settings.biometric_enabled && (
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => setBiometricModalVisible(true)}
                      >
                        Configure Biometric Settings
                      </Button>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card title="Password Settings">
            <Form
              form={form}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Current Password"
                    name="currentPassword"
                    rules={[{ required: true, message: 'Please enter current password' }]}
                  >
                    <Input.Password
                      placeholder="Enter current password"
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Please enter new password' },
                      { min: 8, message: 'Password must be at least 8 characters' }
                    ]}
                  >
                    <Input.Password
                      placeholder="Enter new password"
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Please confirm password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="Confirm new password"
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={saving}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card title="Security Preferences">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSettingsSubmit}
              initialValues={settings}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Notification Settings">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item name="email_notifications" valuePropName="checked">
                        <Checkbox>Email Notifications</Checkbox>
                      </Form.Item>
                      <Form.Item name="sms_notifications" valuePropName="checked">
                        <Checkbox>SMS Notifications</Checkbox>
                      </Form.Item>
                      <Form.Item name="push_notifications" valuePropName="checked">
                        <Checkbox>Push Notifications</Checkbox>
                      </Form.Item>
                      <Form.Item name="login_alerts" valuePropName="checked">
                        <Checkbox>Login Alerts</Checkbox>
                      </Form.Item>
                      <Form.Item name="security_alerts" valuePropName="checked">
                        <Checkbox>Security Alerts</Checkbox>
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card size="small" title="Session Settings">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item label="Session Timeout (minutes)" name="session_timeout">
                        <Slider
                          min={5}
                          max={120}
                          marks={{
                            5: '5m',
                            30: '30m',
                            60: '1h',
                            120: '2h'
                          }}
                        />
                      </Form.Item>
                      <Form.Item label="Max Login Attempts" name="max_login_attempts">
                        <InputNumber min={3} max={10} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="Auto Lock Time (minutes)" name="auto_lock_time">
                        <InputNumber min={1} max={60} style={{ width: '100%' }} />
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card size="small" title="Password Policy">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item label="Password Expiry (days)" name="password_expiry_days">
                        <InputNumber min={30} max={365} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item name="require_password_change" valuePropName="checked">
                        <Checkbox>Require Password Change on Next Login</Checkbox>
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
                
                <Col xs={24} md={12}>
                  <Card size="small" title="Privacy Settings">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item name="privacy_mode" valuePropName="checked">
                        <Checkbox>Enable Privacy Mode</Checkbox>
                      </Form.Item>
                      <Form.Item label="Data Retention (days)" name="data_retention_days">
                        <InputNumber min={30} max={1095} style={{ width: '100%' }} />
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
              </Row>
              
              <Divider />
              
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Save Settings
                  </Button>
                  <Button onClick={() => form.resetFields()}>
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title="Trusted Devices" 
            extra={
              <Button 
                type="link" 
                size="small"
                onClick={() => setDeviceModalVisible(true)}
              >
                Manage All
              </Button>
            }
          >
            <List
              size="small"
              dataSource={devices.slice(0, 3)}
              renderItem={device => {
                const isCurrentDevice = device.is_current;
                return (
                  <List.Item
                    actions={[
                      <Switch
                        key="trust"
                        size="small"
                        checked={device.is_trusted}
                        onChange={(checked) => handleTrustDevice(device.id, checked)}
                        disabled={isCurrentDevice}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={isCurrentDevice} color="green">
                          <Avatar 
                            size="small" 
                            icon={getDeviceIcon(device.device_type)}
                            style={{ backgroundColor: device.is_trusted ? '#52c41a' : '#d9d9d9' }}
                          />
                        </Badge>
                      }
                      title={
                        <Space>
                          <Text style={{ fontSize: '13px' }}>
                            {device.device_name || device.device_type}
                          </Text>
                          {isCurrentDevice && <Tag size="small" color="green">Current</Tag>}
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Last used: {formatTimeAgo(device.last_used)}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
            {devices.length === 0 && (
              <Alert
                message="No Devices"
                description="No trusted devices found."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Active Sessions">
            <List
              size="small"
              dataSource={sessions.slice(0, 3)}
              renderItem={session => {
                const sessionStatus = getSessionStatus(session);
                const isCurrentSession = session.is_current;
                return (
                  <List.Item
                    actions={[
                      !isCurrentSession && (
                        <Popconfirm
                          key="revoke"
                          title="Revoke this session?"
                          onConfirm={() => handleRevokeSession(session.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button type="link" size="small" danger>
                            Revoke
                          </Button>
                        </Popconfirm>
                      )
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={isCurrentSession} color="green">
                          <Avatar 
                            size="small" 
                            style={{ backgroundColor: sessionStatus.color }}
                          >
                            {sessionStatus.status.charAt(0).toUpperCase()}
                          </Avatar>
                        </Badge>
                      }
                      title={
                        <Space>
                          <Text style={{ fontSize: '13px' }}>
                            {session.ip_address}
                          </Text>
                          {isCurrentSession && <Tag size="small" color="green">Current</Tag>}
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {session.location} • {formatTimeAgo(session.last_activity)}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
            {sessions.length === 0 && (
              <Alert
                message="No Active Sessions"
                description="No active sessions found."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Two-Factor Authentication Settings"
        open={twoFactorModalVisible}
        onCancel={() => setTwoFactorModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTwoFactorModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Alert
          message="2FA Configuration"
          description="Two-factor authentication adds an extra layer of security to your account."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Text>Your 2FA is currently enabled and configured.</Text>
      </Modal>

      <Modal
        title="Biometric Authentication Settings"
        open={biometricModalVisible}
        onCancel={() => setBiometricModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setBiometricModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Alert
          message="Biometric Configuration"
          description="Biometric authentication allows you to use fingerprint or face recognition."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Text>Your biometric authentication is currently enabled and configured.</Text>
      </Modal>

      <Modal
        title="Device Management"
        open={deviceModalVisible}
        onCancel={() => setDeviceModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDeviceModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <List
          dataSource={devices}
          renderItem={device => {
            const isCurrentDevice = device.is_current;
            return (
              <List.Item
                actions={[
                  <Switch
                    key="trust"
                    checked={device.is_trusted}
                    onChange={(checked) => handleTrustDevice(device.id, checked)}
                    disabled={isCurrentDevice}
                  />,
                  !isCurrentDevice && (
                    <Popconfirm
                      key="remove"
                      title="Remove this device?"
                      onConfirm={() => handleRemoveDevice(device.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" size="small" danger>
                        Remove
                      </Button>
                    </Popconfirm>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={isCurrentDevice} color="green">
                      <Avatar 
                        icon={getDeviceIcon(device.device_type)}
                        style={{ backgroundColor: device.is_trusted ? '#52c41a' : '#d9d9d9' }}
                      />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text>{device.device_name || device.device_type}</Text>
                      {isCurrentDevice && <Tag color="green">Current Device</Tag>}
                      {device.is_trusted && <Tag color="blue">Trusted</Tag>}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">
                        {device.device_info} • {device.location}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Last used: {new Date(device.last_used).toLocaleString()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default SecuritySettings;