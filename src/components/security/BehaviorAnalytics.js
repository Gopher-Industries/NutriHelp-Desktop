import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Button,
  Typography,
  Alert,
  Select,
  DatePicker,
  Progress,
  Avatar,
  Tooltip,
  Modal,
  Descriptions,
  List,
  Badge,
  notification,
  Empty,
  App
} from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  MobileOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  RadarChartOutlined,
  RiseOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { securityService } from '../../services/securityService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BehaviorAnalytics = ({ userId, onAnalysisComplete }) => {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [behaviorData, setBehaviorData] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [behaviorType, setBehaviorType] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [behaviorStats, setBehaviorStats] = useState({});

  useEffect(() => {
    if (userId) {
      loadBehaviorData();
    }
  }, [userId]);

  const loadBehaviorData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [analytics, activityLogs] = await Promise.all([
        securityService.getBehaviorAnalytics(userId),
        securityService.getActivityLogs(userId, 100)
      ]);

      setAnalytics(analytics);
      setBehaviorData(activityLogs);
      calculateBehaviorStats(analytics, activityLogs);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading behavior data:', error);
      }
      notification.error({
        message: 'Error Loading Behavior Data',
        description: 'Failed to load user behavior analytics.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateBehaviorStats = (analyticsData, activityData) => {
    const stats = {
      totalAnalytics: analyticsData.length,
      anomalies: analyticsData.filter(a => a.anomaly_score > 70).length,
      patterns: analyticsData.filter(a => a.pattern_type).length,
      recentActivity: activityData.filter(a => {
        const activityDate = new Date(a.created_at);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return activityDate > oneDayAgo;
      }).length,
      uniqueLocations: [...new Set(activityData.map(a => a.location).filter(Boolean))].length,
      uniqueDevices: [...new Set(activityData.map(a => a.device_info).filter(Boolean))].length
    };
    setBehaviorStats(stats);
  };

  const runBehaviorAnalysis = async (type = 'comprehensive') => {
    if (!userId) return;

    try {
      setAnalyzing(true);
      const results = await securityService.analyzeUserBehavior(userId, type);
      
      if (results && results.length > 0) {
        const anomalies = results.filter(r => r.anomaly_score > 70);
        if (anomalies.length > 0) {
          notification.warning({
            message: 'Behavior Anomalies Detected',
            description: `Found ${anomalies.length} behavioral anomalies that require attention.`
          });
        } else {
          notification.success({
            message: 'Analysis Complete',
            description: 'Behavior analysis completed successfully with no significant anomalies.'
          });
        }
      }
      
      await loadBehaviorData();
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error running behavior analysis:', error);
      }
      
      let errorMessage = 'Failed to run behavior analysis.';
      if (error.code === 'PGRST202') {
        errorMessage = 'Behavior analysis function not available. Please contact support.';
      }
      
      notification.error({
        message: 'Analysis Failed',
        description: errorMessage
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getAnomalyColor = (score) => {
    if (score >= 80) return '#f5222d';
    if (score >= 60) return '#fa541c';
    if (score >= 40) return '#faad14';
    return '#52c41a';
  };

  const getAnomalyIcon = (score) => {
    if (score >= 80) return <AlertOutlined />;
    if (score >= 60) return <ExclamationCircleOutlined />;
    if (score >= 40) return <WarningOutlined />;
    return <CheckCircleOutlined />;
  };

  const getBehaviorTypeIcon = (type) => {
    switch (type) {
      case 'login_pattern': return <UserOutlined />;
      case 'location_pattern': return <EnvironmentOutlined />;
      case 'device_pattern': return <MobileOutlined />;
      case 'time_pattern': return <ClockCircleOutlined />;
      case 'activity_pattern': return <BarChartOutlined />;
      default: return <RadarChartOutlined />;
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

  const filteredAnalytics = analytics.filter(item => {
    const matchesType = behaviorType === 'all' || item.behavior_type === behaviorType;
    const matchesDate = !dateRange || !dateRange.length || (
      new Date(item.created_at) >= dateRange[0].toDate() &&
      new Date(item.created_at) <= dateRange[1].toDate()
    );
    return matchesType && matchesDate;
  });

  const analyticsColumns = [
    {
      title: 'Behavior Type',
      dataIndex: 'behavior_type',
      key: 'behavior_type',
      render: (type, record) => (
        <Space>
          <Avatar 
            size="small" 
            icon={getBehaviorTypeIcon(type)}
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Text strong style={{ fontSize: '14px' }}>{type.replace('_', ' ')}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.pattern_type || 'General Analysis'}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Anomaly Score',
      dataIndex: 'anomaly_score',
      key: 'anomaly_score',
      render: (score) => (
        <div style={{ width: 100 }}>
          <Progress 
            percent={score} 
            size="small" 
            strokeColor={getAnomalyColor(score)}
            format={() => `${score}%`}
          />
        </div>
      )
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk_level',
      key: 'risk_level',
      render: (level, record) => {
        const color = getAnomalyColor(record.anomaly_score);
        return (
          <Tag color={color} icon={getAnomalyIcon(record.anomaly_score)}>
            {level ? level.toUpperCase() : 'LOW'}
          </Tag>
        );
      }
    },
    {
      title: 'Analyzed',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formatTimeAgo(date)}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => {
            setSelectedBehavior(record);
            setModalVisible(true);
          }}
        >
          View Details
        </Button>
      )
    }
  ];

  const behaviorPatterns = [
    { type: 'login_pattern', label: 'Login Patterns', icon: <UserOutlined /> },
    { type: 'location_pattern', label: 'Location Patterns', icon: <EnvironmentOutlined /> },
    { type: 'device_pattern', label: 'Device Patterns', icon: <MobileOutlined /> },
    { type: 'time_pattern', label: 'Time Patterns', icon: <ClockCircleOutlined /> },
    { type: 'activity_pattern', label: 'Activity Patterns', icon: <BarChartOutlined /> }
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Analytics"
              value={behaviorStats.totalAnalytics || 0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Anomalies"
              value={behaviorStats.anomalies || 0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Recent Activity"
              value={behaviorStats.recentActivity || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Unique Locations"
              value={behaviorStats.uniqueLocations || 0}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Behavior Analytics" 
        extra={
          <Space>
            <Select
              placeholder="Analysis Type"
              style={{ width: 150 }}
              onChange={(value) => runBehaviorAnalysis(value)}
              loading={analyzing}
            >
              <Option value="comprehensive">Comprehensive</Option>
              <Option value="login_pattern">Login Patterns</Option>
              <Option value="location_pattern">Location Patterns</Option>
              <Option value="device_pattern">Device Patterns</Option>
              <Option value="time_pattern">Time Patterns</Option>
            </Select>
            <Button
              type="primary"
              icon={<RadarChartOutlined />}
              loading={analyzing}
              onClick={() => runBehaviorAnalysis()}
            >
              Run Analysis
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadBehaviorData}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12}>
            <Select
              placeholder="Filter by Behavior Type"
              value={behaviorType}
              onChange={setBehaviorType}
              style={{ width: '100%' }}
            >
              <Option value="all">All Behavior Types</Option>
              <Option value="login_pattern">Login Patterns</Option>
              <Option value="location_pattern">Location Patterns</Option>
              <Option value="device_pattern">Device Patterns</Option>
              <Option value="time_pattern">Time Patterns</Option>
              <Option value="activity_pattern">Activity Patterns</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              showTime
            />
          </Col>
        </Row>

        {filteredAnalytics.length === 0 ? (
          <Empty
            description="No behavior analytics available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Alert
              message="No Behavior Data"
              description="Run behavior analysis to generate insights about user patterns and anomalies."
              type="info"
              showIcon
              action={
                <Button type="primary" onClick={() => runBehaviorAnalysis()} loading={analyzing}>
                  Run Analysis
                </Button>
              }
            />
          </Empty>
        ) : (
          <Table
            columns={analyticsColumns}
            dataSource={filteredAnalytics}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} analytics`
            }}
            loading={loading}
          />
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Behavior Pattern Analysis">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 5 }}
              dataSource={behaviorPatterns}
              renderItem={pattern => {
                const patternData = analytics.filter(a => a.behavior_type === pattern.type);
                const avgAnomalyScore = patternData.length > 0 
                  ? Math.round(patternData.reduce((sum, item) => sum + item.anomaly_score, 0) / patternData.length)
                  : 0;
                
                return (
                  <List.Item>
                    <Card 
                      size="small" 
                      hoverable
                      onClick={() => runBehaviorAnalysis(pattern.type)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }} size={8}>
                        <Avatar 
                          size={40} 
                          icon={pattern.icon}
                          style={{ backgroundColor: getAnomalyColor(avgAnomalyScore) }}
                        />
                        <Text strong style={{ fontSize: '13px' }}>{pattern.label}</Text>
                        <Badge 
                          count={patternData.length} 
                          style={{ backgroundColor: '#1890ff' }}
                        />
                        {avgAnomalyScore > 0 && (
                          <Progress 
                            percent={avgAnomalyScore} 
                            size="small" 
                            strokeColor={getAnomalyColor(avgAnomalyScore)}
                            format={() => `${avgAnomalyScore}%`}
                          />
                        )}
                      </Space>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Behavior Analysis Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedBehavior && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Behavior Type" span={2}>
                <Space>
                  <Avatar 
                    size="small" 
                    icon={getBehaviorTypeIcon(selectedBehavior.behavior_type)}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  {selectedBehavior.behavior_type.replace('_', ' ')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Pattern Type">
                {selectedBehavior.pattern_type || 'General Analysis'}
              </Descriptions.Item>
              <Descriptions.Item label="Anomaly Score">
                <Progress 
                  percent={selectedBehavior.anomaly_score} 
                  size="small" 
                  strokeColor={getAnomalyColor(selectedBehavior.anomaly_score)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Risk Level">
                <Tag color={getAnomalyColor(selectedBehavior.anomaly_score)}>
                  {selectedBehavior.risk_level ? selectedBehavior.risk_level.toUpperCase() : 'LOW'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Confidence Score">
                {selectedBehavior.confidence_score || 'N/A'}%
              </Descriptions.Item>
              <Descriptions.Item label="Analysis Date" span={2}>
                {new Date(selectedBehavior.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
            
            {selectedBehavior.pattern_details && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>Pattern Details</Title>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(selectedBehavior.pattern_details, null, 2)}
                </pre>
              </div>
            )}
            
            {selectedBehavior.recommendations && selectedBehavior.recommendations.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>Recommendations</Title>
                <List
                  size="small"
                  dataSource={selectedBehavior.recommendations}
                  renderItem={recommendation => (
                    <List.Item>
                      <Text>{recommendation}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BehaviorAnalytics;