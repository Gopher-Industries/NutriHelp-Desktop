import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Spin,
  Button,
  Space,
  Breadcrumb,
  Badge,
  Statistic,
  Progress,
  notification,
  Avatar,
  Tooltip,
  Divider,
  Grid,
  App
} from 'antd';
import {
  SafetyCertificateOutlined,
  SecurityScanOutlined,
  EyeOutlined,
  SettingOutlined,
  BellOutlined,
  DashboardOutlined,
  RadarChartOutlined,
  BugOutlined,
  BarChartOutlined,
  HomeOutlined,
  SafetyOutlined,
  AlertOutlined,
  MonitorOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  EyeInvisibleOutlined
} from '../../components/icons/PaperIcons';
// import { supabaseService } from '../services/supabaseService';
import { securityService } from '../../services/securityService';
import SecurityOverview from '../../components/security/SecurityOverview';
import RealTimeMonitoring from '../../components/security/RealTimeMonitoring';
import ThreatDetection from '../../components/security/ThreatDetection';
import BehaviorAnalytics from '../../components/security/BehaviorAnalytics';
import SecuritySettings from '../../components/security/SecuritySettings';
import '../styles/SecurityCenterPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const SecurityCenterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notification } = App.useApp();
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [securityScore, setSecurityScore] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [realTimeEvents, setRealTimeEvents] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleView, setModuleView] = useState('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      let profile = await securityService.getUserProfile(user.id);
      if (!profile) {
        notification.warning({
          message: 'Profile Setup Required',
          description: 'Setting up your security profile for the first time...'
        });
        return;
      }
      
      setUserProfile(profile);
      
      const [score, alerts, events] = await Promise.allSettled([
        securityService.getSecurityScore(user.id),
        securityService.getSecurityAlerts(user.id, true),
        securityService.getRealTimeSecurityEvents(user.id, 10)
      ]);

      if (score.status === 'fulfilled' && score.value) {
        setSecurityScore(score.value);
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load security score:', score.reason?.message);
      }
      
      if (alerts.status === 'fulfilled') {
        setSecurityAlerts(alerts.value || []);
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load security alerts:', alerts.reason?.message);
      }
      
      if (events.status === 'fulfilled') {
        setRealTimeEvents(events.value || []);
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load security events:', events.reason?.message);
      }
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading user data:', error);
      }
      
      let errorMessage = 'Failed to load security information.';
      
      if (error.code === '23503' || error.message?.includes('user_profiles')) {
        errorMessage = 'Setting up your security profile. This may take a moment...';
        
        notification.info({
          message: 'Setting Up Profile',
          description: errorMessage
        });
        
        try {
          const newProfile = await securityService.getUserProfile(user.id);
          if (newProfile) {
            setUserProfile(newProfile);
            notification.success({
              message: 'Profile Setup Complete',
              description: 'Your security profile is now ready.'
            });
            setTimeout(() => loadUserData(), 1000);
            return;
          }
        } catch (retryError) {
          errorMessage = 'Unable to set up security profile. Please contact support.';
          if (process.env.NODE_ENV === 'development') {
            console.error('Profile creation retry failed:', retryError);
          }
        }
      }
      
      notification.error({
        message: 'Error Loading Security Data',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, notification]);

  const refreshSecurityData = async () => {
    if (!user?.id) {
      notification.error({
        message: 'Refresh Failed',
        description: 'User not logged in. Please login again.'
      });
      return;
    }

    setRefreshing(true);
    try {
      let profileCheck = await securityService.getUserProfile(user.id);
      if (!profileCheck) {
        notification.error({
          message: 'Profile Setup Failed',
          description: 'Unable to create user profile. Please contact support.'
        });
        return;
      }
      
      setUserProfile(profileCheck);
      
      try {
        const scoreResult = await securityService.calculateSecurityScore(user.id);
        if (scoreResult) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Security score calculated successfully:', scoreResult);
          }
          setSecurityScore(scoreResult);
        }
      } catch (scoreError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Security score calculation failed, continuing with other operations:', scoreError.message);
        }
        
        if (scoreError.code === '23503') {
          notification.warning({
            message: 'Profile Setup In Progress',
            description: 'Your security profile is being set up. Some features may be temporarily unavailable.'
          });
        }
      }
      
      await loadUserData();
      notification.success({
        message: 'Security Data Refreshed',
        description: 'Security information has been updated successfully.'
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error refreshing security data:', error);
      }
      
      let errorMessage = 'Failed to refresh security data. Please try again.';
      
      if (error.code === '23503') {
        errorMessage = 'Setting up your security profile. Please wait a moment and try again.';
      } else if (error.message?.includes('user_profiles')) {
        errorMessage = 'User profile setup in progress. Please try again in a moment.';
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication error. Please log out and log back in.';
      }
      
      notification.error({
        message: 'Refresh Failed',
        description: errorMessage
      });
    } finally {
      setRefreshing(false);
    }
  };

  const setupRealTimeSubscriptions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const eventSubscription = await securityService.subscribeToSecurityEvents(
        user.id,
        (payload) => {
          const newEvent = payload.new;
          setRealTimeEvents(prev => [newEvent, ...prev.slice(0, 9)]);
          
          if (newEvent.severity === 'critical' || newEvent.severity === 'high') {
            notification.warning({
              message: 'Security Alert',
              description: newEvent.title,
              placement: 'topRight'
            });
          }
        }
      );

      const alertSubscription = await securityService.subscribeToSecurityAlerts(
        user.id,
        (payload) => {
          const newAlert = payload.new;
          setSecurityAlerts(prev => [newAlert, ...prev]);
          
          notification.error({
            message: 'New Security Alert',
            description: newAlert.alert_message,
            placement: 'topRight'
          });
        }
      );

      const validSubscriptions = [eventSubscription, alertSubscription].filter(Boolean);
      setSubscriptions(validSubscriptions);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to setup real-time subscriptions:', error.message);
      }
    }
  }, [user?.id, notification]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUserData();
    setupRealTimeSubscriptions();

    return () => {
      subscriptions.forEach(subscription => {
        securityService.unsubscribe(subscription);
      });
    };
  }, [user, navigate, loadUserData, setupRealTimeSubscriptions]);

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    if (score >= 40) return '#fa8c16';
    return '#f5222d';
  };

  const getSecurityScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const securityModules = [
    {
      key: 'overview',
      title: 'Security Overview',
      description: 'View your overall security status and score',
      icon: <DashboardOutlined style={{ fontSize: '24px' }} />,
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      component: (
        <SecurityOverview 
          userProfile={userProfile}
          securityScore={securityScore}
          onRefresh={refreshSecurityData}
        />
      )
    },
    {
      key: 'realtime',
      title: 'Real-time Monitoring',
      description: 'Monitor security events in real-time',
      icon: <MonitorOutlined style={{ fontSize: '24px' }} />,
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      badge: realTimeEvents.length,
      component: (
        <RealTimeMonitoring 
          events={realTimeEvents}
          onRefresh={loadUserData}
        />
      )
    },
    {
      key: 'threats',
      title: 'Threat Detection',
      description: 'Advanced threat detection and analysis',
      icon: <BugOutlined style={{ fontSize: '24px' }} />,
      color: '#fa8c16',
      gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
      component: (
        <ThreatDetection 
          userId={user?.id}
          onThreatDetected={loadUserData}
        />
      )
    },
    {
      key: 'behavior',
      title: 'Behavior Analytics',
      description: 'Analyze user behavior patterns',
      icon: <BarChartOutlined style={{ fontSize: '24px' }} />,
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      component: (
        <BehaviorAnalytics 
          userId={user?.id}
          onAnalysisComplete={loadUserData}
        />
      )
    },
    {
      key: 'alerts',
      title: 'Security Alerts',
      description: 'Manage and review security alerts',
      icon: <BellOutlined style={{ fontSize: '24px' }} />,
      color: '#f5222d',
      gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
      badge: securityAlerts.length,
      component: (
        <div>
          {securityAlerts.length === 0 ? (
            <Alert
              message="No Security Alerts"
              description="You have no unread security alerts at this time."
              type="success"
              showIcon
            />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              {securityAlerts.map(alert => (
                <Alert
                  key={alert.id}
                  message={alert.alert_type}
                  description={alert.alert_message}
                  type={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'}
                  showIcon
                  closable
                  onClose={() => securityService.markAlertAsRead(alert.id)}
                  action={
                    <Button 
                      size="small" 
                      type="primary"
                      onClick={() => securityService.resolveAlert(alert.id, user.id)}
                    >
                      Resolve
                    </Button>
                  }
                />
              ))}
            </Space>
          )}
        </div>
      )
    },
    {
      key: 'settings',
      title: 'Security Settings',
      description: 'Configure security preferences',
      icon: <SettingOutlined style={{ fontSize: '24px' }} />,
      color: '#13c2c2',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      component: (
        <SecuritySettings 
          userProfile={userProfile}
          onSettingsUpdate={loadUserData}
        />
      )
    }
  ];

  const screens = useBreakpoint();

  const renderModuleCard = (module) => (
    <Card
      key={module.key}
      hoverable
      style={{
        height: '100%',
        background: module.gradient,
        border: 'none',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      styles={{
        body: {
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }
      }}
      onClick={() => setSelectedModule(module)}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Avatar
            size={48}
            style={{
              backgroundColor: module.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            icon={module.icon}
          />
          {module.badge > 0 && (
            <Badge count={module.badge} style={{ backgroundColor: module.color }} />
          )}
        </div>
        <Title level={4} style={{ margin: '0 0 8px 0', color: '#262626' }}>
          {module.title}
        </Title>
        <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
          {module.description}
        </Text>
      </div>
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <Button
          type="text"
          style={{ color: module.color, fontWeight: '500' }}
          icon={<EyeOutlined />}
        >
          View Details
        </Button>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large">
            <div style={{ marginTop: 16 }}>Loading security center...</div>
          </Spin>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="security-center-page">
      <Content className="security-center-content">
        <div className="security-center-container">
          <div className="security-navigation-header">
            <Button
              type="default"
              icon={<DashboardOutlined />}
              onClick={() => navigate('/dashboard')}
              className="security-back-button"
            >
              Back
            </Button>
          </div>

          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col span={24}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}
                styles={{
                  body: {
                    padding: '32px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }
                }}
              >
                <Row gutter={[24, 24]} align="middle">
                  <Col flex="auto">
                    <Space direction="vertical" size={8}>
                      <Title level={1} style={{ margin: 0, display: 'flex', alignItems: 'center', color: '#262626' }}>
                        <Avatar
                          size={56}
                          style={{
                            backgroundColor: '#1890ff',
                            marginRight: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          icon={<SafetyCertificateOutlined style={{ fontSize: '28px' }} />}
                        />
                        Security Center
                      </Title>
                      <Text style={{ fontSize: '16px', color: '#595959', lineHeight: '1.6' }}>
                        Comprehensive security monitoring and management dashboard with advanced threat detection
                      </Text>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      size="large"
                      icon={<SecurityScanOutlined />}
                      loading={refreshing}
                      onClick={refreshSecurityData}
                      style={{
                        borderRadius: '12px',
                        height: 'auto',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                      }}
                    >
                      Refresh Data
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {securityAlerts.length > 0 && (
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
              <Col span={24}>
                <Alert
                  message={`You have ${securityAlerts.length} unread security alert${securityAlerts.length > 1 ? 's' : ''}`}
                  description="Please review your security alerts immediately to maintain account security."
                  type="warning"
                  showIcon
                  icon={<AlertOutlined />}
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #fff7e6, #fff2e8)',
                    boxShadow: '0 4px 12px rgba(250, 173, 20, 0.1)'
                  }}
                  action={
                    <Button 
                      type="primary"
                      style={{
                        borderRadius: '8px',
                        background: '#fa8c16',
                        borderColor: '#fa8c16'
                      }}
                      onClick={() => setSelectedModule(securityModules.find(m => m.key === 'alerts'))}
                    >
                      View Alerts
                    </Button>
                  }
                  closable
                />
              </Col>
            </Row>
          )}

          {selectedModule ? (
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card
                  style={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                  }}
                  styles={{
                    body: { padding: '32px' }
                  }}
                >
                  <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Space size={16}>
                      <Avatar
                        size={48}
                        style={{
                          backgroundColor: selectedModule.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        icon={selectedModule.icon}
                      />
                      <div>
                        <Title level={2} style={{ margin: 0, color: '#262626' }}>
                          {selectedModule.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                          {selectedModule.description}
                        </Text>
                      </div>
                    </Space>
                    <Button
                      type="default"
                      icon={<EyeInvisibleOutlined />}
                      onClick={() => setSelectedModule(null)}
                      className="security-back-button"
                    >
                      Back to Security Center
                    </Button>
                  </div>
                  <Divider style={{ margin: '24px 0' }} />
                  <div className="security-module-view">
                    {selectedModule.component}
                  </div>
                </Card>
              </Col>
            </Row>
          ) : (
            <>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>
                  Security Modules
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Select a module to view detailed security information and controls
                </Text>
              </div>
              <Row gutter={[24, 24]}>
                {securityModules.map((module, index) => {
                  const colProps = screens.xl
                    ? { xs: 24, sm: 12, lg: 8 }
                    : screens.lg
                    ? { xs: 24, sm: 12, lg: 12 }
                    : { xs: 24, sm: 24 };
                  
                  return (
                    <Col key={module.key} {...colProps}>
                      {renderModuleCard(module)}
                    </Col>
                  );
                })}
              </Row>
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default SecurityCenterPage;