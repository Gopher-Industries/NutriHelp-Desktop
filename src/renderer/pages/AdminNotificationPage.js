import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  Popconfirm,
  Alert,
  App,
  Transfer
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ReloadOutlined,
  ToolOutlined,
  TeamOutlined,
  ArrowLeftOutlined
} from '../../components/icons/PaperIcons';
import notificationService from '../services/notificationService';
import authMiddleware from '../services/authMiddleware';
import { runDatabaseMigration, checkMigrationStatus } from '../utils/databaseMigration';
import '../styles/AdminNotificationPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminNotificationPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [readStatusData, setReadStatusData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalMessages: 0,
    totalUsers: 0,
    averageReadRate: 0
  });
  const [recipientType, setRecipientType] = useState('all');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      checkAdminAccess();
      loadMessages();
      checkDatabaseMigration();
      await fetchUsers();
      await loadReadStatusData();
    };
    
    initializeData();

    // Use periodic refresh instead of realtime subscription to avoid CSP issues
    const refreshInterval = setInterval(() => {
      loadReadStatusData();
    }, 5000); // Refresh every 5 seconds

    // Cleanup interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await authMiddleware.getAllUsers();
      const userList = users
        .filter(user => user.role !== 'admin') // Exclude admin users, include all regular users
        .map(user => ({
          key: user.id,
          title: `${user.first_name} ${user.last_name}`.trim() || user.email,
          description: user.email
        }));
      setAllUsers(userList);
      
      if (readStatusData.length > 0) {
        await calculateStatistics(readStatusData, userList);
      }
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const checkDatabaseMigration = async () => {
    try {
      const status = await checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Failed to check migration status:', error);
    }
  };

  const handleRunMigration = async () => {
    setMigrationLoading(true);
    try {
      const result = await runDatabaseMigration();
      if (result.success) {
        message.success('Database migration completed successfully');
        setMigrationStatus({ needsMigration: false });
        loadMessages(); // Reload data after migration
        loadReadStatusData();
      } else {
        message.error(`Migration failed: ${result.error}`);
      }
    } catch (error) {
      message.error(`Migration failed: ${error.message}`);
    } finally {
      setMigrationLoading(false);
    }
  };

  const checkAdminAccess = async () => {
    try {
      await authMiddleware.validateAdminAction('access notification management');
    } catch (error) {
      message.error('Access denied: Admin privileges required');
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await notificationService.getAllMessages();
      if (error) {
        throw error;
      }
      setMessages(data || []);
    } catch (error) {
      message.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadReadStatusData = async () => {
    try {
      const { data, error } = await notificationService.getAllUsersReadStatus();
      if (error) {
        throw error;
      }
      setReadStatusData(data || []);
      await calculateStatistics(data || [], allUsers);
    } catch (error) {
      message.error('Failed to load read status data');
    }
  };

  const calculateStatistics = async (data, userList = allUsers) => {
    const totalMessages = data.length;
    let totalReadCount = 0;
    let totalPossibleReads = 0;

    data.forEach(message => {
      message.userStatuses.forEach(userStatus => {
        totalPossibleReads++;
        if (userStatus.isRead) {
          totalReadCount++;
        }
      });
    });

    const averageReadRate = totalPossibleReads > 0 ? (totalReadCount / totalPossibleReads * 100) : 0;

    let totalUsers = userList.length;
    if (totalUsers === 0) {
      try {
        const users = await authMiddleware.getAllUsers();
        totalUsers = users.filter(user => user.role !== 'admin').length;
      } catch (error) {
        console.error('Failed to get user count:', error);
        totalUsers = 0;
      }
    }

    setStatistics({
      totalMessages,
      totalUsers,
      averageReadRate: Math.round(averageReadRate)
    });
  };

  const handleCreateMessage = async (values) => {
    if (recipientType === 'specific' && selectedUsers.length === 0) {
      message.error('Please select at least one user');
      return;
    }

    try {
      const messageData = {
        ...values,
        recipientType,
        selectedUsers: recipientType === 'specific' ? selectedUsers : []
      };
      
      const { error } = await notificationService.createMessage(messageData);
      if (error) {
        throw error;
      }
      message.success('Message created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      setRecipientType('all');
      setSelectedUsers([]);
      loadMessages();
      loadReadStatusData();
    } catch (error) {
      message.error('Failed to create message');
    }
  };

  const handleDeleteMessage = async (messageRecord) => {
    try {
      // For grouped messages, we delete by matching title, content, and created_by
      const deleteParams = {
        title: messageRecord.title,
        content: messageRecord.content,
        created_by: messageRecord.created_by,
        created_at: messageRecord.created_at
      };
      
      const { success, error } = await notificationService.deleteMessageGroup(deleteParams);
      if (!success) {
        throw error;
      }
      message.success('Message deleted successfully');
      loadMessages();
      loadReadStatusData();
    } catch (error) {
      console.error('Delete message error:', error);
      message.error(`Failed to delete message: ${error?.message || 'Unknown error'}`);
    }
  };

  const showMessageDetail = (message) => {
    setSelectedMessage(message);
    setDetailModalVisible(true);
  };

  const getMessageTypeColor = (type) => {
    const colors = {
      info: 'blue',
      warning: 'orange',
      error: 'red',
      success: 'green'
    };
    return colors[type] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'green',
      normal: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'default';
  };

  const messageColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      ellipsis: true
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type) => (
        <Tag color={getMessageTypeColor(type)}>
          {type?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 90,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Category',
      dataIndex: 'notification_category',
      key: 'category',
      width: 100,
      render: (category) => category || 'General'
    },
    {
      title: 'Recipients',
      dataIndex: 'recipients_count',
      key: 'recipients_count',
      width: 90,
      render: (count) => (
        <Tag color="blue">
          {count || 0}
        </Tag>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showMessageDetail(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this message?"
            onConfirm={() => handleDeleteMessage(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const readStatusColumns = [
    {
      title: 'Message',
      dataIndex: 'messageTitle',
      key: 'messageTitle',
      width: '25%',
      ellipsis: true,
      align: 'left',
      render: (text) => (
        <div style={{ 
          fontWeight: 500,
          color: '#000',
          lineHeight: '1.4',
          fontSize: '14px',
          textAlign: 'left'
        }}>
          {text}
        </div>
      )
    },
    {
      title: 'Created',
      dataIndex: 'messageCreatedAt',
      key: 'messageCreatedAt',
      width: '12%',
      align: 'left',
      render: (date) => (
        <div style={{ 
          color: '#666',
          fontSize: '12px',
          fontWeight: 500,
          textAlign: 'left'
        }}>
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'messageRecipientType',
      key: 'messageRecipientType',
      width: '10%',
      align: 'left',
      render: (type) => (
        <div style={{ textAlign: 'left' }}>
          <Tag 
            color={type === 'all' ? 'blue' : 'green'} 
            style={{ 
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px'
            }}
          >
            {type?.toUpperCase()}
          </Tag>
        </div>
      )
    },
    {
      title: 'Read Status',
      key: 'readStatus',
      width: '15%',
      align: 'left',
      render: (_, record) => {
        const readCount = record.userStatuses.filter(u => u.isRead).length;
        const totalCount = record.userStatuses.length;
        const percentage = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;
        
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            textAlign: 'left'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#000',
              minWidth: '30px'
            }}>
              {readCount}/{totalCount}
            </span>
            <Tag 
              color={percentage >= 80 ? 'green' : percentage >= 50 ? 'orange' : 'red'}
              style={{
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                margin: 0,
                fontSize: '12px'
              }}
            >
              {percentage}%
            </Tag>
          </div>
        );
      }
    },
    {
      title: 'User Details',
      key: 'userDetails',
      width: '38%',
      align: 'left',
      render: (_, record) => (
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          width: '100%',
          textAlign: 'left'
        }}>
          {record.userStatuses.map((userStatus, index) => (
            <Tooltip
              key={userStatus.userId || index}
              title={`${userStatus.userName} - ${userStatus.isRead ? 'Read' : 'Unread'}${userStatus.readAt ? ` at ${new Date(userStatus.readAt).toLocaleString()}` : ''}`}
            >
              <Tag
                icon={userStatus.isRead ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                color={userStatus.isRead ? 'success' : 'default'}
                style={{
                  fontWeight: 500,
                  border: userStatus.isRead ? 'none' : '1px solid #d9d9d9',
                  borderRadius: '6px',
                  backgroundColor: userStatus.isRead ? '#f6ffed' : '#fafafa',
                  color: userStatus.isRead ? '#52c41a' : '#666',
                  margin: '2px'
                }}
              >
                {userStatus.userName}
              </Tag>
            </Tooltip>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="admin-notification-page" style={{ 
      backgroundColor: '#f5f5f5', 
      height: '100vh',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style>
        {`
          .admin-notification-page::-webkit-scrollbar {
            display: none;
          }
          
          .ant-table {
            width: 100% !important;
            table-layout: fixed !important;
          }
          
          .ant-table-thead > tr > th {
            background-color: #fafafa !important;
            color: #000 !important;
            font-weight: 600 !important;
            border-bottom: 1px solid #e8e8e8 !important;
            text-align: left !important;
            padding: 12px 16px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
          }
          
          .ant-table-tbody > tr > td {
            border-bottom: 1px solid #f0f0f0 !important;
            vertical-align: middle !important;
            padding: 12px 16px !important;
            white-space: normal !important;
            word-wrap: break-word !important;
          }
          
          .read-status-card .ant-table {
            border-radius: 8px;
            width: 100%;
          }
          
          .read-status-card .ant-table-container {
            width: 100%;
          }
          
          .ant-table-col {
            position: relative !important;
          }
        `}
      </style>
      {migrationStatus?.needsMigration && (
        <Alert
          message="Database Migration Required"
          description={`Database schema needs to be updated: ${migrationStatus.reason}. Please run the migration to fix notification functionality.`}
          type="warning"
          showIcon
          action={
            <Button 
              size="small" 
              type="primary" 
              icon={<ToolOutlined />}
              loading={migrationLoading}
              onClick={handleRunMigration}
            >
              Run Migration
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      
      <div className="page-header" style={{ 
        backgroundColor: '#fff', 
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{
              color: '#000',
              fontWeight: 600,
              borderRadius: '8px',
              height: '40px',
              fontSize: '16px'
            }}
          >
            Back
          </Button>
          <Title level={2} style={{ margin: 0, color: '#000', fontWeight: 600 }}>Notification Management</Title>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            disabled={migrationStatus?.needsMigration}
            style={{
              backgroundColor: '#000',
              borderColor: '#000',
              borderRadius: '8px',
              fontWeight: 500,
              height: '40px',
              padding: '0 20px'
            }}
          >
            Create Message
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              loadMessages();
              loadReadStatusData();
            }}
            loading={loading}
            disabled={migrationStatus?.needsMigration}
            style={{
              borderColor: '#d9d9d9',
              borderRadius: '8px',
              height: '40px',
              fontWeight: 500
            }}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Row gutter={16} className="statistics-row" style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e8e8e8'
          }}>
            <Statistic
              title="Total Messages"
              value={statistics.totalMessages}
              prefix={<UserOutlined style={{ color: '#000' }} />}
              valueStyle={{ color: '#000', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e8e8e8'
          }}>
            <Statistic
              title="Total Users"
              value={statistics.totalUsers}
              prefix={<UserOutlined style={{ color: '#000' }} />}
              valueStyle={{ color: '#000', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e8e8e8'
          }}>
            <Statistic
              title="Average Read Rate"
              value={statistics.averageReadRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#000' }} />}
              valueStyle={{ color: '#000', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Messages" 
        className="messages-card"
        style={{ 
          marginBottom: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e8e8e8'
        }}
        styles={{ 
          header: {
            backgroundColor: '#fafafa',
            borderBottom: '1px solid #e8e8e8',
            fontWeight: 600,
            color: '#000'
          }
        }}
      >
        <Table
          columns={messageColumns}
          dataSource={messages}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ backgroundColor: '#fff' }}
        />
      </Card>

      <Card 
        title="User Read Status" 
        className="read-status-card"
        style={{ 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e8e8e8'
        }}
        styles={{ 
          header: {
            backgroundColor: '#fafafa',
            borderBottom: '1px solid #e8e8e8',
            fontWeight: 600,
            color: '#000'
          }
        }}
      >
        <Table
          columns={readStatusColumns}
          dataSource={readStatusData}
          rowKey="messageId"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          style={{ 
            backgroundColor: '#fff'
          }}
          tableLayout="fixed"
          size="middle"
        />
      </Card>

      <Modal
        title={
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#000',
            padding: '8px 0',
            borderBottom: '2px solid #f0f0f0',
            marginBottom: '20px'
          }}>
            Create New Message
          </div>
        }
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setRecipientType('all');
          setSelectedUsers([]);
        }}
        footer={null}
        width={700}
        destroyOnHidden
        style={{
          borderRadius: '12px'
        }}
        styles={{
          content: {
            padding: '32px',
            borderRadius: '12px'
          },
          header: {
            backgroundColor: '#fafafa',
            borderBottom: 'none',
            borderRadius: '12px 12px 0 0'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMessage}
          style={{
            maxWidth: '100%'
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <Form.Item
              name="title"
              label={
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Message Title
                </span>
              }
              rules={[{ required: true, message: 'Please enter message title' }]}
              style={{ gridColumn: '1 / -1' }}
            >
              <Input 
                placeholder="Enter a compelling message title..."
                style={{
                  height: '44px',
                  borderRadius: '8px',
                  border: '2px solid #e8e8e8',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1890ff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(24, 144, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8e8e8';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="content"
            label={
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '8px',
                display: 'block'
              }}>
                Message Content
              </span>
            }
            rules={[{ required: true, message: 'Please enter message content' }]}
            style={{ marginBottom: '24px' }}
          >
            <TextArea
              rows={5}
              placeholder="Write your message content here... Be clear and concise for better engagement."
              style={{
                borderRadius: '8px',
                border: '2px solid #e8e8e8',
                fontSize: '14px',
                lineHeight: '1.6',
                resize: 'vertical',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1890ff';
                e.target.style.boxShadow = '0 0 0 3px rgba(24, 144, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e8e8';
                e.target.style.boxShadow = 'none';
              }}
            />
          </Form.Item>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <Form.Item
              name="message_type"
              label={
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Type
                </span>
              }
              initialValue="info"
            >
              <Select
                style={{
                  height: '44px',
                  borderRadius: '8px'
                }}
              >
                <Option value="info">Info</Option>
                <Option value="warning">Warning</Option>
                <Option value="error">Error</Option>
                <Option value="success">Success</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label={
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Priority
                </span>
              }
              initialValue="normal"
            >
              <Select
                style={{
                  height: '44px',
                  borderRadius: '8px'
                }}
              >
                <Option value="low">Low</Option>
                <Option value="normal">Normal</Option>
                <Option value="high">High</Option>
                <Option value="urgent">Urgent</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label={
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333'
                }}>
                  Category
                </span>
              }
              initialValue="general"
            >
              <Select
                style={{
                  height: '44px',
                  borderRadius: '8px'
                }}
              >
                <Option value="general">General</Option>
                <Option value="system">System</Option>
                <Option value="security">Security</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="announcement">Announcement</Option>
                <Option value="message">Message</Option>
                <Option value="admin">Admin</Option>
                <Option value="internal">Internal</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '1px solid #dee2e6'
            }}>
              Recipients Configuration
            </div>
            
            <Form.Item
              label={
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Send To
                </span>
              }
              style={{ marginBottom: '16px' }}
            >
              <Select
                value={recipientType}
                onChange={setRecipientType}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px'
                }}
              >
                <Select.Option value="all">
                  <Space style={{ fontSize: '14px' }}>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <span>All Users</span>
                  </Space>
                </Select.Option>
                <Select.Option value="specific">
                  <Space style={{ fontSize: '14px' }}>
                    <UserOutlined style={{ color: '#52c41a' }} />
                    <span>Specific Users</span>
                  </Space>
                </Select.Option>
              </Select>
            </Form.Item>

            {recipientType === 'specific' && (
              <Form.Item
                label={
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333'
                  }}>
                    Select Users
                  </span>
                }
              >
                <Transfer
                  dataSource={allUsers}
                  targetKeys={selectedUsers}
                  onChange={setSelectedUsers}
                  render={item => item.title}
                  titles={['Available Users', 'Selected Users']}
                  style={{
                    marginBottom: '16px'
                  }}
                  listStyle={{
                    width: '45%',
                    height: '220px',
                    borderRadius: '8px',
                    border: '2px solid #e8e8e8'
                  }}
                  loading={usersLoading}
                />
              </Form.Item>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #e9ecef'
          }}>
            <Button 
              onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
                setRecipientType('all');
                setSelectedUsers([]);
              }}
              style={{
                height: '44px',
                padding: '0 24px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '14px',
                border: '2px solid #e8e8e8',
                color: '#666'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              style={{
                height: '44px',
                padding: '0 32px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
              }}
            >
              Create Message
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Message Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
        destroyOnHidden
      >
        {selectedMessage && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Title:</Text>
                <div>{selectedMessage.title}</div>
              </Col>
              <Col span={12}>
                <Text strong>Type:</Text>
                <div>
                  <Tag color={getMessageTypeColor(selectedMessage.message_type)}>
                    {selectedMessage.message_type?.toUpperCase()}
                  </Tag>
                </div>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Priority:</Text>
                <div>
                  <Tag color={getPriorityColor(selectedMessage.priority)}>
                    {selectedMessage.priority?.toUpperCase()}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Created:</Text>
                <div>{new Date(selectedMessage.created_at).toLocaleString()}</div>
              </Col>
            </Row>
            <Divider />
            <Text strong>Content:</Text>
            <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              {selectedMessage.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminNotificationPage;