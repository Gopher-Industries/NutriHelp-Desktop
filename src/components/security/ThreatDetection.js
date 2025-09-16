import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Avatar,
  Tag,
  Space,
  Button,
  Typography,
  Alert,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Badge,
  Select,
  Input,
  Tooltip,
  Modal,
  Descriptions,
  notification,
  Empty,
  App
} from 'antd';
import {
  BugOutlined,
  AlertOutlined,
  SafetyOutlined,
  RadarChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { securityService } from '../../services/securityService';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const ThreatDetection = ({ userId, onThreatDetected }) => {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [threats, setThreats] = useState([]);
  const [detectionRules, setDetectionRules] = useState([]);
  const [threatStats, setThreatStats] = useState({});
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      loadThreatData();
    }
  }, [userId]);

  const loadThreatData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [rules, recentEvents] = await Promise.all([
        securityService.getThreatDetectionRules(),
        securityService.getRealTimeSecurityEvents(userId, 50)
      ]);

      setDetectionRules(rules);
      
      const threatEvents = recentEvents.filter(event => 
        event.severity === 'critical' || event.severity === 'high' ||
        (event.threat_indicators && event.threat_indicators.length > 0)
      );
      
      setThreats(threatEvents);
      calculateThreatStats(threatEvents);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading threat data:', error);
      }
      notification.error({
        message: 'Error Loading Threat Data',
        description: 'Failed to load threat detection information.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateThreatStats = (threatData) => {
    const stats = {
      total: threatData.length,
      critical: threatData.filter(t => t.severity === 'critical').length,
      high: threatData.filter(t => t.severity === 'high').length,
      medium: threatData.filter(t => t.severity === 'medium').length,
      resolved: threatData.filter(t => t.is_resolved).length,
      active: threatData.filter(t => !t.is_resolved).length
    };
    setThreatStats(stats);
  };

  const runThreatDetection = async () => {
    if (!userId) return;

    try {
      setScanning(true);
      const detectedThreats = await securityService.detectSecurityThreats(userId);
      
      if (detectedThreats && detectedThreats.length > 0) {
        notification.warning({
          message: 'Threats Detected',
          description: `Found ${detectedThreats.length} potential security threats.`
        });
      } else {
        notification.success({
          message: 'No Threats Found',
          description: 'Security scan completed successfully with no threats detected.'
        });
      }
      
      await loadThreatData();
      if (onThreatDetected) {
        onThreatDetected();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error running threat detection:', error);
      }
      
      let errorMessage = 'Failed to run threat detection scan.';
      if (error.code === '23503') {
        errorMessage = 'User profile setup required. Please complete your profile first.';
      }
      
      notification.error({
        message: 'Threat Detection Failed',
        description: errorMessage
      });
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#f5222d';
      case 'high': return '#fa541c';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertOutlined />;
      case 'high': return <ExclamationCircleOutlined />;
      case 'medium': return <WarningOutlined />;
      case 'low': return <CheckCircleOutlined />;
      default: return <EyeOutlined />;
    }
  };

  const getThreatTypeIcon = (threatType) => {
    switch (threatType) {
      case 'brute_force': return <ThunderboltOutlined />;
      case 'suspicious_login': return <EyeOutlined />;
      case 'malware': return <BugOutlined />;
      case 'data_breach': return <SafetyOutlined />;
      default: return <SafetyCertificateOutlined />;
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

  const filteredThreats = threats.filter(threat => {
    const matchesSeverity = filterSeverity === 'all' || threat.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'resolved' && threat.is_resolved) ||
      (filterStatus === 'active' && !threat.is_resolved);
    const matchesSearch = !searchTerm || 
      threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const threatColumns = [
    {
      title: 'Threat',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <Avatar 
            size="small" 
            icon={getThreatTypeIcon(record.event_type)}
            style={{ backgroundColor: getSeverityColor(record.severity) }}
          />
          <div>
            <Text strong style={{ fontSize: '14px' }}>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.event_category}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      render: (score) => (
        <div style={{ width: 80 }}>
          <Progress 
            percent={score} 
            size="small" 
            strokeColor={score > 70 ? '#f5222d' : score > 40 ? '#faad14' : '#52c41a'}
            format={() => score}
          />
        </div>
      )
    },
    {
      title: 'Detected',
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
      title: 'Status',
      dataIndex: 'is_resolved',
      key: 'status',
      render: (resolved) => (
        <Tag color={resolved ? 'success' : 'error'}>
          {resolved ? 'Resolved' : 'Active'}
        </Tag>
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
            setSelectedThreat(record);
            setModalVisible(true);
          }}
        >
          View Details
        </Button>
      )
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Threats"
              value={threatStats.total || 0}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Critical Threats"
              value={threatStats.critical || 0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Active Threats"
              value={threatStats.active || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Detection Rules"
              value={detectionRules.length}
              prefix={<RadarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Threat Detection" 
        extra={
          <Space>
            <Button
              type="primary"
              icon={<RadarChartOutlined />}
              loading={scanning}
              onClick={runThreatDetection}
            >
              Run Threat Scan
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadThreatData}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Severity"
              value={filterSeverity}
              onChange={setFilterSeverity}
              style={{ width: '100%' }}
            >
              <Option value="all">All Severities</Option>
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <Search
              placeholder="Search threats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
        </Row>

        {filteredThreats.length === 0 ? (
          <Empty
            description="No threats detected"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Alert
              message="No Security Threats"
              description="No security threats have been detected. Run a threat scan to check for potential issues."
              type="success"
              showIcon
              action={
                <Button type="primary" onClick={runThreatDetection} loading={scanning}>
                  Run Threat Scan
                </Button>
              }
            />
          </Empty>
        ) : (
          <Table
            columns={threatColumns}
            dataSource={filteredThreats}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} threats`
            }}
            loading={loading}
          />
        )}
      </Card>

      {detectionRules.length > 0 && (
        <Card title="Active Detection Rules" style={{ marginTop: 16 }}>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={detectionRules}
            renderItem={rule => (
              <List.Item>
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size={4}>
                    <Space>
                      <Avatar 
                        size="small" 
                        icon={<RadarChartOutlined />}
                        style={{ backgroundColor: rule.is_active ? '#52c41a' : '#d9d9d9' }}
                      />
                      <Text strong style={{ fontSize: '13px' }}>{rule.rule_name}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {rule.description}
                    </Text>
                    <Space>
                      <Tag color={rule.is_active ? 'success' : 'default'} size="small">
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Tag>
                      <Tag color="blue" size="small">
                        {rule.threat_type}
                      </Tag>
                    </Space>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}

      <Modal
        title="Threat Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedThreat && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Threat Type" span={2}>
                <Space>
                  <Avatar 
                    size="small" 
                    icon={getThreatTypeIcon(selectedThreat.event_type)}
                    style={{ backgroundColor: getSeverityColor(selectedThreat.severity) }}
                  />
                  {selectedThreat.title}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Severity">
                <Tag color={getSeverityColor(selectedThreat.severity)} icon={getSeverityIcon(selectedThreat.severity)}>
                  {selectedThreat.severity.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Risk Score">
                <Progress 
                  percent={selectedThreat.risk_score} 
                  size="small" 
                  strokeColor={selectedThreat.risk_score > 70 ? '#f5222d' : selectedThreat.risk_score > 40 ? '#faad14' : '#52c41a'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedThreat.event_category}
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                {selectedThreat.source || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                {selectedThreat.ip_address || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedThreat.location || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Detected At" span={2}>
                {new Date(selectedThreat.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedThreat.description}
              </Descriptions.Item>
            </Descriptions>
            
            {selectedThreat.threat_indicators && selectedThreat.threat_indicators.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>Threat Indicators</Title>
                <Space wrap>
                  {selectedThreat.threat_indicators.map((indicator, index) => (
                    <Tag key={index} color="red">
                      {indicator}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
            
            {selectedThreat.metadata && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>Additional Information</Title>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(selectedThreat.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ThreatDetection;