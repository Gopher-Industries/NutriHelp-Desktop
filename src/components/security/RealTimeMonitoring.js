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
  Timeline,
  Badge,
  Select,
  DatePicker,
  Input,
  Tooltip,
  Empty
} from 'antd';
import {
  DesktopOutlined,
  AlertOutlined,
  BugOutlined,
  UserOutlined,
  LockOutlined,
  MobileOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { securityService } from '../../services/securityService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const RealTimeMonitoring = ({ events, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    applyFilters();
  }, [events, filterSeverity, filterCategory, searchTerm, dateRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        onRefresh();
      }, 30000);
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, onRefresh]);

  const applyFilters = () => {
    let filtered = [...events];

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(event => event.severity === filterSeverity);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.event_category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.created_at);
        return eventDate >= start.toDate() && eventDate <= end.toDate();
      });
    }

    setFilteredEvents(filtered);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#f5222d';
      case 'high': return '#fa541c';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      case 'info': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertOutlined />;
      case 'high': return <ExclamationCircleOutlined />;
      case 'medium': return <WarningOutlined />;
      case 'low': return <CheckCircleOutlined />;
      case 'info': return <EyeOutlined />;
      default: return <DesktopOutlined />;
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'login_attempt': return <UserOutlined />;
      case 'password_change': return <LockOutlined />;
      case 'device_access': return <MobileOutlined />;
      case 'suspicious_activity': return <BugOutlined />;
      case 'security_scan': return <DesktopOutlined />;
      default: return <EyeOutlined />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getEventCategoryStats = () => {
    const stats = {};
    events.forEach(event => {
      stats[event.event_category] = (stats[event.event_category] || 0) + 1;
    });
    return stats;
  };

  const getSeverityStats = () => {
    const stats = {};
    events.forEach(event => {
      stats[event.severity] = (stats[event.severity] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getEventCategoryStats();
  const severityStats = getSeverityStats();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Events"
              value={events.length}
              prefix={<DesktopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Critical Events"
              value={severityStats.critical || 0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="High Priority"
              value={severityStats.high || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Last Event"
              value={events.length > 0 ? formatTimeAgo(events[0].created_at) : 'None'}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Real-time Security Events" 
        extra={
          <Space>
            <Button
              type={autoRefresh ? 'primary' : 'default'}
              icon={<ReloadOutlined spin={autoRefresh} />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="small"
            >
              {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
              size="small"
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
              size="small"
            >
              <Option value="all">All Severities</Option>
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
              <Option value="info">Info</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by Category"
              value={filterCategory}
              onChange={setFilterCategory}
              style={{ width: '100%' }}
              size="small"
            >
              <Option value="all">All Categories</Option>
              <Option value="authentication">Authentication</Option>
              <Option value="access_control">Access Control</Option>
              <Option value="data_protection">Data Protection</Option>
              <Option value="network_security">Network Security</Option>
              <Option value="system_security">System Security</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Search
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              size="small"
              showTime
            />
          </Col>
        </Row>

        {filteredEvents.length === 0 ? (
          <Empty
            description="No security events found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {events.length === 0 ? (
              <Alert
                message="No Real-time Events"
                description="Security events will appear here as they occur in real-time."
                type="info"
                showIcon
              />
            ) : (
              <Button type="primary" onClick={() => {
                setFilterSeverity('all');
                setFilterCategory('all');
                setSearchTerm('');
                setDateRange(null);
              }}>
                Clear Filters
              </Button>
            )}
          </Empty>
        ) : (
          <Timeline 
            mode="left"
            items={filteredEvents.map(event => ({
              key: event.id,
              color: getSeverityColor(event.severity),
              dot: (
                <Avatar
                  size="small"
                  icon={getSeverityIcon(event.severity)}
                  style={{ backgroundColor: getSeverityColor(event.severity) }}
                />
              ),
              label: (
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(event.created_at).toLocaleTimeString()}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {formatTimeAgo(event.created_at)}
                  </Text>
                </Space>
              ),
              children: (
                <Card size="small" style={{ marginBottom: 8 }}>
                  <Space direction="vertical" style={{ width: '100%' }} size={4}>
                    <Space>
                      <Avatar 
                        size="small" 
                        icon={getEventIcon(event.event_type)}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                      <Text strong style={{ fontSize: '14px' }}>{event.title}</Text>
                      <Tag color={getSeverityColor(event.severity)} size="small">
                        {event.severity.toUpperCase()}
                      </Tag>
                      <Tag color="blue" size="small">
                        {event.event_category}
                      </Tag>
                    </Space>
                    
                    <Text style={{ fontSize: '13px' }}>{event.description}</Text>
                    
                    <Space wrap>
                      {event.source && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Source: {event.source}
                        </Text>
                      )}
                      {event.ip_address && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          IP: {event.ip_address}
                        </Text>
                      )}
                      {event.location && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Location: {event.location}
                        </Text>
                      )}
                      {event.risk_score > 0 && (
                        <Tooltip title="Risk Score">
                          <Badge 
                            count={event.risk_score} 
                            style={{ 
                              backgroundColor: event.risk_score > 70 ? '#f5222d' : 
                                             event.risk_score > 40 ? '#faad14' : '#52c41a'
                            }}
                          />
                        </Tooltip>
                      )}
                    </Space>
                    
                    {event.threat_indicators && event.threat_indicators.length > 0 && (
                      <Space wrap>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Threats:</Text>
                        {event.threat_indicators.map((threat, index) => (
                          <Tag key={index} color="red" size="small">
                            {threat}
                          </Tag>
                        ))}
                      </Space>
                    )}
                  </Space>
                </Card>
              )
            }))}
          />
        )}
      </Card>

      {events.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} sm={12}>
            <Card title="Event Categories" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: '13px' }}>{category}</Text>
                    <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card title="Severity Distribution" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(severityStats).map(([severity, count]) => (
                  <div key={severity} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                      <Avatar 
                        size="small" 
                        icon={getSeverityIcon(severity)}
                        style={{ backgroundColor: getSeverityColor(severity) }}
                      />
                      <Text style={{ fontSize: '13px' }}>{severity}</Text>
                    </Space>
                    <Badge count={count} style={{ backgroundColor: getSeverityColor(severity) }} />
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default RealTimeMonitoring;