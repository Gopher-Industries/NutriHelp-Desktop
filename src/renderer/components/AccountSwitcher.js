import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Modal,
  List,
  Avatar,
  Button,
  Form,
  Input,
  Typography,
  Space,
  Divider,
  App,
  Tag,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SwapOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '../../components/icons/PaperIcons';
import {
  addAccount,
  switchToAccount,
  removeAccount,
  updateAccountNickname,
  setShowAccountSwitcher,
  clearError,
  selectSavedAccounts,
  selectCurrentAccount,
  selectIsSwitching,
  selectIsAddingAccount,
  selectAccountSwitchError,
  selectSwitchError,
  selectShowAccountSwitcher,
  selectMaxAccounts
} from '../store/slices/accountSwitchSlice';
import { signOut, switchAccount } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const AccountSwitcher = () => {
  const dispatch = useDispatch();
  const { message } = App.useApp();
  
  const savedAccounts = useSelector(selectSavedAccounts);
  const currentAccount = useSelector(selectCurrentAccount);
  const isSwitching = useSelector(selectIsSwitching);
  const isAddingAccount = useSelector(selectIsAddingAccount);
  const accountError = useSelector(selectAccountSwitchError);
  const switchError = useSelector(selectSwitchError);
  const showModal = useSelector(selectShowAccountSwitcher);
  const maxAccounts = useSelector(selectMaxAccounts);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [switchingAccountId, setSwitchingAccountId] = useState(null);
  
  const [addForm] = Form.useForm();
  const [switchForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleClose = () => {
    dispatch(setShowAccountSwitcher(false));
    setShowAddForm(false);
    setEditingAccount(null);
    setSwitchingAccountId(null);
    dispatch(clearError());
    addForm.resetFields();
    switchForm.resetFields();
    editForm.resetFields();
  };

  const handleAddAccount = async (values) => {
    try {
      await dispatch(addAccount({
        email: values.email,
        password: values.password
      })).unwrap();
      
      message.success('Account added successfully!');
      setShowAddForm(false);
      addForm.resetFields();
    } catch (error) {
      message.error(error || 'Failed to add account');
    }
  };

  const handleSwitchAccount = async (values) => {
    try {
      const result = await dispatch(switchToAccount({
        accountId: switchingAccountId,
        password: values.password
      })).unwrap();
      
      dispatch(switchAccount({
        user: result.user,
        session: result.session,
        userProfile: result.userProfile
      }));
      
      message.success('Account switched successfully!');
      setSwitchingAccountId(null);
      switchForm.resetFields();
      handleClose();
    } catch (error) {
      message.error(error || 'Failed to switch account');
    }
  };

  const handleRemoveAccount = async (accountId) => {
    try {
      await dispatch(removeAccount({ accountId })).unwrap();
      message.success('Account removed successfully!');
    } catch (error) {
      message.error('Failed to remove account');
    }
  };

  const handleUpdateNickname = async (values) => {
    try {
      await dispatch(updateAccountNickname({
        accountId: editingAccount,
        nickname: values.nickname
      })).unwrap();
      
      message.success('Nickname updated successfully!');
      setEditingAccount(null);
      editForm.resetFields();
    } catch (error) {
      message.error('Failed to update nickname');
    }
  };

  const formatLastUsed = (lastUsed) => {
    const date = new Date(lastUsed);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <>
      <style>
        {`
          .simple-account-switcher .ant-modal-content {
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .simple-account-switcher .ant-modal-header {
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            padding: 20px 24px;
            border-radius: 8px 8px 0 0;
          }
          
          .simple-account-switcher .ant-modal-title {
            color: #111827 !important;
            font-size: 18px;
            font-weight: 500;
            margin: 0;
          }
          
          .simple-account-switcher .ant-modal-close {
            color: #6b7280 !important;
            transition: color 0.2s ease;
          }
          
          .simple-account-switcher .ant-modal-close:hover {
            color: #374151 !important;
          }
          
          .simple-account-switcher .ant-modal-body {
            padding: 24px;
            background: #ffffff;
          }
          
          .simple-account-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 12px;
            transition: all 0.2s ease;
          }
          
          .simple-account-card:hover {
            border-color: #d1d5db;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }
          
          .simple-account-card.active {
            background: #f9fafb;
            border-color: #3b82f6;
          }
          
          .simple-action-button {
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            color: #6b7280;
            transition: all 0.2s ease;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .simple-action-button:hover {
            background: #f9fafb;
            color: #374151;
            border-color: #9ca3af;
          }
          
          .simple-primary-button {
            background: #3b82f6;
            border: 1px solid #3b82f6;
            border-radius: 4px;
            color: #ffffff;
            font-weight: 500;
            transition: all 0.2s ease;
            height: 36px;
            padding: 0 16px;
          }
          
          .simple-primary-button:hover {
            background: #2563eb;
            border-color: #2563eb;
            color: #ffffff;
          }
          
          .simple-secondary-button {
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            color: #374151;
            font-weight: 500;
            transition: all 0.2s ease;
            height: 36px;
            padding: 0 16px;
          }
          
          .simple-secondary-button:hover {
            background: #f9fafb;
            color: #111827;
            border-color: #9ca3af;
          }
          
          .simple-danger-button {
            background: #ffffff;
            border: 1px solid #fca5a5;
            border-radius: 4px;
            color: #dc2626;
            font-weight: 500;
            transition: all 0.2s ease;
            height: 36px;
            padding: 0 16px;
          }
          
          .simple-danger-button:hover {
            background: #fef2f2;
            color: #b91c1c;
            border-color: #f87171;
          }
          
          .simple-form-section {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
            margin-top: 20px;
          }
          
          .simple-form-input {
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          
          .simple-form-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }
        `}
      </style>
      <Modal
        className="simple-account-switcher"
        title={
          <Space>
            <SwapOutlined style={{ fontSize: '18px' }} />
            <span>Account Switcher</span>
          </Space>
        }
        open={showModal}
        onCancel={handleClose}
        footer={null}
        width={600}
        destroyOnHidden
        centered
      >
        <div style={{ marginBottom: '20px' }}>
          <Text style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
            Manage and switch between multiple accounts. You can have up to {maxAccounts} accounts saved.
          </Text>
        </div>

        {(accountError || switchError) && (
          <div style={{ 
            marginBottom: '20px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <Text style={{ color: '#dc2626' }}>{accountError || switchError}</Text>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          {savedAccounts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 20px',
              background: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <UserOutlined style={{ fontSize: '40px', color: '#9ca3af', marginBottom: '12px' }} />
              <Text style={{ color: '#6b7280', fontSize: '16px', display: 'block' }}>
                No saved accounts
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: '14px' }}>
                Add an account to get started
              </Text>
            </div>
          ) : (
            savedAccounts.map((account) => (
              <div
                key={account.id}
                className={`simple-account-card ${account.isActive ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <Avatar
                      src={account.avatar}
                      icon={<UserOutlined />}
                      size={48}
                      style={{
                        backgroundColor: account.isActive ? '#3b82f6' : '#6b7280',
                        border: 'none'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Text style={{ 
                          fontSize: '16px', 
                          fontWeight: 500, 
                          color: '#111827',
                          margin: 0
                        }}>
                          {account.nickname}
                        </Text>
                        {account.isActive && (
                          <Tag 
                            icon={<CheckCircleOutlined />}
                            style={{
                              background: '#dbeafe',
                              border: '1px solid #93c5fd',
                              borderRadius: '4px',
                              color: '#1d4ed8',
                              fontSize: '12px',
                              fontWeight: 500
                            }}
                          >
                            Current
                          </Tag>
                        )}
                      </div>
                      <Text style={{ 
                        color: '#6b7280', 
                        fontSize: '14px',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {account.email}
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ClockCircleOutlined style={{ fontSize: '12px', color: '#9ca3af' }} />
                        <Text style={{ 
                          fontSize: '12px', 
                          color: '#9ca3af'
                        }}>
                          Last used: {formatLastUsed(account.lastUsed)}
                        </Text>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tooltip title="Switch to this account">
                      <Button
                        className="simple-action-button"
                        icon={<SwapOutlined />}
                        onClick={() => setSwitchingAccountId(account.id)}
                        disabled={account.isActive || isSwitching}
                        loading={isSwitching && switchingAccountId === account.id}
                      />
                    </Tooltip>
                    <Tooltip title="Edit nickname">
                      <Button
                        className="simple-action-button"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingAccount(account.id);
                          editForm.setFieldsValue({ nickname: account.nickname });
                        }}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Remove account"
                      description="Are you sure you want to remove this account?"
                      onConfirm={() => handleRemoveAccount(account.id)}
                      okText="Remove"
                      cancelText="Cancel"
                      disabled={account.isActive}
                    >
                      <Button
                        className="simple-action-button"
                        icon={<DeleteOutlined />}
                        disabled={account.isActive}
                        style={{
                          color: account.isActive ? '#9ca3af' : '#dc2626',
                          borderColor: account.isActive ? '#e5e7eb' : '#fca5a5'
                        }}
                      />
                    </Popconfirm>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <Button
            className="simple-primary-button"
            icon={<PlusOutlined />}
            onClick={() => setShowAddForm(true)}
            disabled={savedAccounts.length >= maxAccounts || showAddForm}
          >
            Add Account ({savedAccounts.length}/{maxAccounts})
          </Button>
          
          <Button
            className="simple-danger-button"
            onClick={async () => {
              try {
                await dispatch(signOut()).unwrap();
                handleClose();
                window.location.href = '/login';
              } catch (error) {
                message.error('Failed to logout');
              }
            }}
          >
            Logout All
          </Button>
        </div>

        {showAddForm && (
          <div className="simple-form-section">
            <Title level={4} style={{ 
              color: '#111827', 
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: 500
            }}>
              Add New Account
            </Title>
            <Form
              form={addForm}
              layout="vertical"
              onFinish={handleAddAccount}
            >
              <Form.Item
                label={<span style={{ color: '#374151', fontWeight: 500 }}>Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please enter email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  className="simple-form-input"
                  prefix={<UserOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Enter email address"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: '#374151', fontWeight: 500 }}>Password</span>}
                name="password"
                rules={[{ required: true, message: 'Please enter password!' }]}
              >
                <Input.Password
                  className="simple-form-input"
                  prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Enter password"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: '20px' }}>
                <Space size={12}>
                  <Button
                    className="simple-primary-button"
                    htmlType="submit"
                    loading={isAddingAccount}
                    icon={<PlusOutlined />}
                  >
                    Add Account
                  </Button>
                  <Button 
                    className="simple-secondary-button"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        className="simple-account-switcher"
        title="Switch Account"
        open={!!switchingAccountId}
        onCancel={() => {
          setSwitchingAccountId(null);
          switchForm.resetFields();
        }}
        footer={null}
        destroyOnHidden
        centered
        width={450}
      >
        <div style={{ 
          marginBottom: '20px',
          padding: '16px',
          background: '#eff6ff',
          borderRadius: '6px',
          border: '1px solid #bfdbfe'
        }}>
          <Text style={{ 
            color: '#1d4ed8', 
            fontSize: '14px',
            lineHeight: '1.5',
            display: 'block'
          }}>
            Please enter your password to switch to this account for security.
          </Text>
        </div>
        
        <Form
          form={switchForm}
          layout="vertical"
          onFinish={handleSwitchAccount}
        >
          <Form.Item
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password
              className="simple-form-input"
              prefix={<LockOutlined style={{ color: '#6b7280' }} />}
              placeholder="Enter your password"
              autoFocus
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '20px' }}>
            <Space size={12}>
              <Button
                className="simple-primary-button"
                htmlType="submit"
                loading={isSwitching}
                icon={<SwapOutlined />}
              >
                Switch Account
              </Button>
              <Button 
                className="simple-secondary-button"
                onClick={() => {
                  setSwitchingAccountId(null);
                  switchForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        className="simple-account-switcher"
        title="Edit Nickname"
        open={!!editingAccount}
        onCancel={() => {
          setEditingAccount(null);
          editForm.resetFields();
        }}
        footer={null}
        destroyOnHidden
        centered
        width={450}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateNickname}
        >
          <Form.Item
            label={<span style={{ color: '#374151', fontWeight: 500 }}>Nickname</span>}
            name="nickname"
            rules={[
              { required: true, message: 'Please enter a nickname!' },
              { max: 50, message: 'Nickname must be less than 50 characters!' }
            ]}
          >
            <Input
              className="simple-form-input"
              prefix={<EditOutlined style={{ color: '#6b7280' }} />}
              placeholder="Enter nickname"
              autoFocus
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '20px' }}>
            <Space size={12}>
              <Button
                className="simple-primary-button"
                htmlType="submit"
                icon={<EditOutlined />}
              >
                Update
              </Button>
              <Button 
                className="simple-secondary-button"
                onClick={() => {
                  setEditingAccount(null);
                  editForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AccountSwitcher;