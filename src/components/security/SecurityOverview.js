import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  List,
  Avatar,
  Tag,
  Space,
  Button,
  Typography,
  Divider,
  Timeline,
  Badge,
  Tooltip
} from 'antd';
import {
  SafetyOutlined,
  SafetyCertificateOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  MobileOutlined,
  LockOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BugOutlined,
  AlertOutlined,
  TrophyOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { securityService } from '../../services/securityService';

const { Title, Text } = Typography;

const SecurityOverview = ({ userProfile, securityScore, onRefresh }) => {
  // Get auth state from Redux to listen for login changes
  const { user, session, lastLoginTime } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [scanLogs, setScanLogs] = useState([]);

  // Load data when userProfile changes
  useEffect(() => {
    if (userProfile?.user_id) {
      loadOverviewData();
    }
  }, [userProfile]);

  // Auto-refresh when authentication state changes (login occurs)
  useEffect(() => {
    if (user && session && userProfile?.user_id) {
      console.log('🔄 Authentication state changed, refreshing security overview data...');
      console.log('Auth state details:', {
        userId: user?.id,
        sessionToken: session?.access_token?.substring(0, 20) + '...',
        lastLogin: lastLoginTime,
        profileId: userProfile?.user_id
      });
      
      // Small delay to ensure database writes are complete
      const timer = setTimeout(() => {
        console.log('🚀 Starting delayed refresh after login...');
        loadOverviewData();
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.log('⚠️ Skipping auto-refresh, missing auth data:', {
        hasUser: !!user,
        hasSession: !!session,
        hasUserProfile: !!userProfile?.user_id
      });
    }
  }, [user?.id, session?.access_token, lastLoginTime, userProfile?.user_id]);

  // Listen for immediate refresh events from login process
  useEffect(() => {
    const handleImmediateRefresh = (event) => {
      console.log('⚡ Immediate refresh triggered by login event:', event.detail);
      if (userProfile?.user_id && event.detail?.userId === userProfile.user_id) {
        loadOverviewData();
      }
    };

    window.addEventListener('refreshSecurityCenter', handleImmediateRefresh);
    
    return () => {
      window.removeEventListener('refreshSecurityCenter', handleImmediateRefresh);
    };
  }, [userProfile?.user_id]);

  const loadOverviewData = async () => {
    if (!userProfile?.user_id) return;

    try {
      setLoading(true);
      console.log('Loading security overview data for user:', userProfile.user_id);
      
      const [activity, userDevices, userSessions, history, scans] = await Promise.all([
        securityService.getActivityLogs(userProfile.user_id, 10),
        securityService.getUserDevices(userProfile.user_id),
        securityService.getUserSessions(userProfile.user_id),
        securityService.getSecurityScoreHistory(userProfile.user_id, 7),
        securityService.getSecurityScanLogs(userProfile.user_id, 5)
      ]);

      console.log('Security data loaded:', {
        devices: userDevices?.length || 0,
        activeSessions: userSessions?.filter(s => s.is_active)?.length || 0,
        activity: activity?.length || 0
      });

      setRecentActivity(activity || []);
      setDevices(userDevices || []);
      setSessions((userSessions || []).filter(s => s.is_active));
      setScoreHistory(history || []);
      setScanLogs(scans || []);
    } catch (error) {
      console.error('Error loading overview data:', error);
      // Set empty arrays on error to prevent undefined issues
      setRecentActivity([]);
      setDevices([]);
      setSessions([]);
      setScoreHistory([]);
      setScanLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function that can be called externally
  const refreshData = async () => {
    console.log('Manual refresh requested for security overview');
    await loadOverviewData();
  };

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

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'critical': return '#f5222d';
      case 'high': return '#fa541c';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <UserOutlined />;
      case 'logout': return <CloseCircleOutlined />;
      case 'password_change': return <LockOutlined />;
      case 'security_setting_change': return <SafetyOutlined />;
      case 'device_registration': return <MobileOutlined />;
      case 'suspicious_activity': return <BugOutlined />;
      default: return <EyeOutlined />;
    }
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

  const securityFeatures = [
    {
      key: 'email_verified',
      label: 'Email Verified',
      enabled: userProfile?.email_verified,
      icon: <CheckCircleOutlined />
    },
    {
      key: 'two_factor_enabled',
      label: 'Two-Factor Authentication',
      enabled: userProfile?.two_factor_enabled,
      icon: <SafetyCertificateOutlined />
    },
    {
      key: 'biometric_enabled',
      label: 'Biometric Authentication',
      enabled: userProfile?.biometric_enabled,
      icon: <SafetyOutlined />
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Security Score"
              value={securityScore?.score || 0}
              suffix="/ 100"
              valueStyle={{ color: getSecurityScoreColor(securityScore?.score || 0) }}
              prefix={<TrophyOutlined />}
            />
            <Progress
              percent={securityScore?.score || 0}
              strokeColor={getSecurityScoreColor(securityScore?.score || 0)}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Status: {getSecurityScoreStatus(securityScore?.score || 0)}
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Devices"
              value={devices.length}
              prefix={<MobileOutlined />}
              valueStyle={{ color: devices.length > 5 ? '#faad14' : '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 8, display: 'block' }}>
              Trusted: {devices.filter(d => d.is_trusted).length}
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={sessions.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: sessions.length > 3 ? '#faad14' : '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 8, display: 'block' }}>
              Last activity: {sessions.length > 0 ? formatTimeAgo(sessions[0]?.created_at) : 'None'}
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Security Features" extra={
            <Button type="link" onClick={refreshData} loading={loading}>
              Refresh
            </Button>
          }>
            <Space direction="vertical" style={{ width: '100%' }}>
              {securityFeatures.map(feature => (
                <div key={feature.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    {feature.icon}
                    <Text>{feature.label}</Text>
                  </Space>
                  <Tag color={feature.enabled ? 'success' : 'default'}>
                    {feature.enabled ? 'Enabled' : 'Disabled'}
                  </Tag>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Security Activity">
            <List
              size="small"
              dataSource={recentActivity.slice(0, 5)}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getActivityIcon(item.activity_type)} 
                        style={{ backgroundColor: getRiskLevelColor(item.risk_level) }}
                      />
                    }
                    title={
                      <Space>
                        <Text style={{ fontSize: '14px' }}>{item.description}</Text>
                        <Tag color={getRiskLevelColor(item.risk_level)} size="small">
                          {item.risk_level}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <ClockCircleOutlined style={{ fontSize: '12px' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatTimeAgo(item.created_at)}
                        </Text>
                        {item.ip_address && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            • {item.ip_address}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Security Score Trend">
            {scoreHistory.length > 0 ? (
              <Timeline
                items={scoreHistory.slice(0, 5).map(score => ({
                  key: score.id,
                  color: getSecurityScoreColor(score.score),
                  dot: (
                    <Badge 
                      count={score.score} 
                      style={{ backgroundColor: getSecurityScoreColor(score.score) }}
                    />
                  ),
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text strong>Score: {score.score}/100</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(score.created_at).toLocaleDateString()}
                      </Text>
                      {score.improvement_suggestions && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {score.improvement_suggestions.slice(0, 2).join(', ')}
                        </Text>
                      )}
                    </Space>
                  )
                }))}
              />
            ) : (
              <Alert
                message="No Score History"
                description="Security score history will appear here as it's calculated."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Security Scans">
            {scanLogs.length > 0 ? (
              <List
                size="small"
                dataSource={scanLogs}
                renderItem={scan => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<SafetyOutlined />}
                          style={{ 
                            backgroundColor: scan.status === 'completed' ? '#52c41a' : 
                                           scan.status === 'failed' ? '#f5222d' : '#faad14'
                          }}
                        />
                      }
                      title={
                        <Space>
                          <Text style={{ fontSize: '14px' }}>{scan.scan_type}</Text>
                          <Tag color={
                            scan.status === 'completed' ? 'success' : 
                            scan.status === 'failed' ? 'error' : 'processing'
                          }>
                            {scan.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {formatTimeAgo(scan.started_at)}
                          </Text>
                          {scan.findings_count > 0 && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {scan.findings_count} findings
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Alert
                message="No Recent Scans"
                description="Security scan results will appear here."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>

      {securityScore?.score < 60 && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Alert
              message="Security Score Needs Improvement"
              description={
                <div>
                  <Text>Your security score is below recommended levels. Consider:</Text>
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    {!userProfile?.email_verified && <li>Verify your email address</li>}
                    {!userProfile?.two_factor_enabled && <li>Enable two-factor authentication</li>}
                    {!userProfile?.biometric_enabled && <li>Set up biometric authentication</li>}
                    {devices.filter(d => !d.is_trusted).length > 0 && <li>Review and trust your devices</li>}
                  </ul>
                </div>
              }
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              action={
                <Button type="primary" onClick={refreshData}>
                  Improve Security
                </Button>
              }
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default SecurityOverview;