import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Typography,
  Button,
  Badge,
  Avatar,
  Space,
  Empty,
  Spin,
  Card,
  Row,
  Col,
  Divider,
  App
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '../../components/icons/PaperIcons';
import {
  fetchNotifications,
  markAsRead,
  selectNotifications,
  selectNotificationLoading,
  selectNotificationError,
  refreshForAccountSwitch
} from '../store/slices/notificationSlice';
import { selectUser } from '../store/slices/authSlice';
import { supabase } from '../services/supabase';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const NotificationPage = () => {
  const { message } = App.useApp();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotificationLoading);
  const error = useSelector(selectNotificationError);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user) {
      dispatch(refreshForAccountSwitch());
      dispatch(fetchNotifications());
    }

    // Listen for notification refresh events
    const handleRefreshNotifications = () => {
      if (user) {
        dispatch(fetchNotifications());
      }
    };

    window.addEventListener('refreshNotifications', handleRefreshNotifications);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
    };
  }, [user?.id, dispatch]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead({ notificationId })).unwrap();
      message.success('Marked as read');
    } catch (error) {
      message.error('Failed to mark as read');
    }
  };


  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const renderUserNotification = (notification) => (
    <Card
      key={notification.id}
      style={{
        marginBottom: 16,
        backgroundColor: '#fff',
        border: notification.isRead ? '1px solid #f0f0f0' : '2px solid #1890ff',
        borderRadius: 12,
        boxShadow: notification.isRead ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 4px 16px rgba(24, 144, 255, 0.15)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!notification.isRead && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: '#1890ff'
        }} />
      )}
      
      <Row align="middle">
        <Col flex="auto">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingLeft: notification.isRead ? 0 : 8 }}>
            <div style={{ position: 'relative' }}>
              <Avatar 
                icon={notification.isRead ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                style={{ 
                  backgroundColor: notification.isRead ? '#52c41a' : '#1890ff',
                  color: '#fff',
                  border: 'none',
                  fontSize: '16px'
                }} 
                size={40}
              />
              {!notification.isRead && (
                <Badge 
                  dot 
                  style={{ 
                    position: 'absolute', 
                    top: -2, 
                    right: -2,
                    backgroundColor: '#ff4d4f'
                  }} 
                />
              )}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Title 
                  level={5} 
                  style={{ 
                    margin: 0, 
                    color: notification.isRead ? '#666' : '#000', 
                    fontWeight: notification.isRead ? 500 : 600,
                    fontSize: '16px'
                  }}
                >
                  {notification.title}
                </Title>
                <Text style={{ fontSize: '12px', color: '#999', whiteSpace: 'nowrap', marginLeft: 16 }}>
                  {formatDate(notification.created_at)}
                </Text>
              </div>
              
              <div 
                style={{ 
                  color: notification.isRead ? '#999' : '#333',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  marginBottom: 12,
                  opacity: notification.isRead ? 0.8 : 1
                }}
              >
                {notification.content}
              </div>
              
              {notification.isRead && notification.readAt && (
                <Text style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  Read on {formatDate(notification.readAt)}
                </Text>
              )}
            </div>
          </div>
        </Col>
        
        {!notification.isRead && (
          <Col>
            <Button
              type="primary"
              size="middle"
              icon={<CheckOutlined />}
              onClick={() => handleMarkAsRead(notification.id)}
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                borderRadius: '8px',
                fontWeight: 500,
                height: '36px',
                paddingLeft: '16px',
                paddingRight: '16px'
              }}
            >
              Mark as Read
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#fafafa', height: '100vh' }}>
      <style>
        {`
          .ant-layout-content::-webkit-scrollbar {
            display: none;
          }
          .ant-layout-content {
            scrollbar-width: none;
            -ms-overflow-style: none;
            overflow-y: auto;
            height: calc(100vh - 64px);
          }
        `}
      </style>
      <Header style={{ 
        backgroundColor: '#fff', 
        borderBottom: '2px solid #f0f0f0',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
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
              <Divider type="vertical" style={{ borderColor: '#e8e8e8' }} />
              <Space>
                <BellOutlined style={{ color: '#000', fontSize: '20px' }} />
                <Title level={3} style={{ margin: 0, color: '#000', fontWeight: 600 }}>
                  Notifications
                </Title>
              </Space>
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ 
        padding: '32px 24px',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'transparent' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Spin size="large" style={{ color: '#000' }} />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Text style={{ fontSize: '16px', color: '#ff4d4f' }}>{error}</Text>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Empty
                description={
                  <Text style={{ color: '#999', fontSize: '16px', fontWeight: 500 }}>
                    No notifications available
                  </Text>
                }
              />
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: '14px', fontWeight: 500 }}>
                  {notifications.filter(n => !n.isRead).length} unread, {notifications.length} total
                </Text>
                <Space>
                   <Button
                     type="primary"
                     icon={<CheckCircleOutlined />}
                     onClick={() => {
                       const unreadNotifications = notifications.filter(n => !n.isRead);
                       unreadNotifications.forEach(notification => {
                         handleMarkAsRead(notification.id);
                       });
                     }}
                     disabled={notifications.filter(n => !n.isRead).length === 0}
                     style={{
                       backgroundColor: '#1890ff',
                       borderColor: '#1890ff',
                       fontWeight: 500,
                       borderRadius: '8px',
                       height: '36px'
                     }}
                   >
                     Mark All as Read ({notifications.filter(n => !n.isRead).length})
                   </Button>
                 </Space>
              </div>
              {notifications.map(renderUserNotification)}
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default NotificationPage;
