import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Space,
  App,
  Select,
  Transfer
} from 'antd';
import {
  NotificationOutlined,
  PlusOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import {
  createNotification,
  setCreateModalVisible,
  selectCreateModalVisible,
  selectCreateLoading,
  selectCreateError
} from '../../store/slices/notificationSlice';
import { selectUserProfile } from '../../store/slices/authSlice';
import authMiddleware from '../../services/authMiddleware';
import { supabase } from '../../services/supabase';

const { Title } = Typography;
const { TextArea } = Input;

const CreateNotificationModal = () => {
  const { message } = App.useApp();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [recipientType, setRecipientType] = useState('all');
  const isVisible = useSelector(selectCreateModalVisible);
  const loading = useSelector(selectCreateLoading);
  const error = useSelector(selectCreateError);
  const userProfile = useSelector(selectUserProfile);
  const userRole = userProfile?.role;

  useEffect(() => {
    const fetchUsers = async () => {
      if (isVisible && userRole === 'admin') {
        try {
          const users = await authMiddleware.getAllUsers();
          const userList = users
            .filter(user => user.role !== 'admin') // Exclude admin users, include all regular users (including users with null role)
            .map(user => ({
              key: user.id,
              title: `${user.first_name} ${user.last_name}`.trim() || user.email,
              description: user.email
            }));
          setAllUsers(userList);
        } catch (error) {
          message.error('Failed to load users');
        }
      }
    };
    fetchUsers();
  }, [isVisible, userRole, message]);

  const handleClose = () => {
    dispatch(setCreateModalVisible(false));
    form.resetFields();
    setRecipientType('all');
    setSelectedUsers([]);
  };

  const handleSubmit = async (values) => {
    if (userRole !== 'admin') {
      message.error('Admin privileges required');
      return;
    }

    if (recipientType === 'specific' && selectedUsers.length === 0) {
      message.error('Please select at least one user');
      return;
    }

    try {
      await dispatch(createNotification({
        title: values.title,
        content: values.content,
        recipientType,
        selectedUsers: recipientType === 'specific' ? selectedUsers : []
      })).unwrap();
      
      message.success('Notification created successfully');
      form.resetFields();
      setRecipientType('all');
      setSelectedUsers([]);
      dispatch(setCreateModalVisible(false));
      
      // Force refresh notifications to ensure immediate synchronization
      setTimeout(() => {
        console.log('Forcing notification refresh after creation...');
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }, 500);
    } catch (error) {
      if (error === 'Admin privileges required') {
        message.error('Admin privileges required');
      } else {
        message.error('Failed to create notification');
      }
    }
  };

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <Modal
      title={
        <Space>
          <NotificationOutlined style={{ color: '#1890ff' }} />
          <span style={{ color: '#000' }}>Create New Notification</span>
        </Space>
      }
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      width={600}
      style={{ top: 50, borderRadius: '12px' }}
      styles={{
        header: {
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #e8e8e8',
          borderRadius: '12px 12px 0 0',
          padding: '20px 24px'
        },
        body: { backgroundColor: '#fff', padding: '24px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: '16px' }}
      >
        <Form.Item
          name="title"
          label={<span style={{ color: '#000', fontWeight: 600 }}>Title</span>}
          rules={[
            { required: true, message: 'Please enter notification title' },
            { max: 100, message: 'Title cannot exceed 100 characters' }
          ]}
        >
          <Input
            placeholder="Enter notification title"
            style={{
              borderColor: '#d9d9d9',
              borderRadius: '6px',
              height: '40px'
            }}
          />
        </Form.Item>

        <Form.Item
          name="content"
          label={<span style={{ color: '#000', fontWeight: 600 }}>Content</span>}
          rules={[
            { required: true, message: 'Please enter notification content' },
            { max: 1000, message: 'Content cannot exceed 1000 characters' }
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Enter notification content"
            style={{
              borderColor: '#d9d9d9',
              borderRadius: '6px'
            }}
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#000', fontWeight: 600 }}>Send To</span>}
        >
          <Select
            value={recipientType}
            onChange={setRecipientType}
            style={{
              borderRadius: '6px',
              width: '100%'
            }}
          >
            <Select.Option value="all">
              <Space>
                <TeamOutlined />
                All Users
              </Space>
            </Select.Option>
            <Select.Option value="specific">
              <Space>
                <UserOutlined />
                Specific Users
              </Space>
            </Select.Option>
          </Select>
        </Form.Item>

        {recipientType === 'specific' && (
          <Form.Item
            label={<span style={{ color: '#000', fontWeight: 600 }}>Select Users</span>}
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
                height: '200px'
              }}
            />
          </Form.Item>
        )}

        {error && (
          <div style={{ 
            color: '#ff4d4f', 
            marginBottom: 16, 
            fontSize: '14px' 
          }}>
            {error}
          </div>
        )}

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button 
              onClick={handleClose}
              style={{
                borderColor: '#d9d9d9',
                borderRadius: '6px',
                fontWeight: 500,
                height: '36px'
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlusOutlined />}
              style={{
                backgroundColor: '#000',
                borderColor: '#000',
                borderRadius: '6px',
                fontWeight: 500,
                height: '36px'
              }}
            >
              Create Notification
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateNotificationModal;
