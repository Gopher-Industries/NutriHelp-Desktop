import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  App,
  Row,
  Col,
  Divider,
  Typography,
  Space,
  Tag,
  Switch,
  Select,
  DatePicker,
  InputNumber
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { updatePassword, updateUserProfile, fetchUserProfile, selectUserProfile } from '../store/slices/authSlice';

import { supabaseService } from '../services/supabase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const userProfile = useSelector(selectUserProfile);

  
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || null);

  const { message } = App.useApp();

  useEffect(() => {
    if (user?.id && !userProfile) {
      dispatch(fetchUserProfile());
    }
  }, [user?.id, userProfile, dispatch]);



  useEffect(() => {
    if (userProfile) {
      form.setFieldsValue({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        date_of_birth: userProfile.date_of_birth ? dayjs(userProfile.date_of_birth) : null,
        gender: userProfile.gender || '',
        height: userProfile.height || null,
        weight: userProfile.weight || null,
        activity_level: userProfile.activity_level || 'sedentary',
        health_goals: userProfile.health_goals || [],
        dietary_preferences: userProfile.dietary_preferences || [],
        allergies: userProfile.allergies || [],
        medical_conditions: userProfile.medical_conditions || []
      });
      setAvatarUrl(userProfile.avatar_url);
    }
  }, [userProfile, user?.email, form]);

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      const updateData = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };
      
      await dispatch(updateUserProfile({
        userId: user.id,
        profileData: updateData
      })).unwrap();
      

      
      message.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setPasswordLoading(true);
    try {
      await dispatch(updatePassword({
        password: values.newPassword
      })).unwrap();
      
      message.success('Password updated successfully!');
      passwordForm.resetFields();
    } catch (error) {
      message.error(error?.message || error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      setAvatarUrl(info.file.response?.url || URL.createObjectURL(info.file.originFileObj));
      message.success('Avatar updated successfully!');
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const uploadButton = (
    <div>
      <CameraOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const displayName = userProfile ? 
    `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'User Name' :
    user?.email || 'User Name';

  const userStatus = userProfile?.is_active ? 'Active' : 'Inactive';
  const userRole = userProfile?.role || 'user';

  return (
    <div style={{ 
      padding: '32px', 
      height: '100vh',
      backgroundColor: '#f5f5f5',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <Row gutter={[32, 32]}>
        {/* Profile Header */}
        <Col span={24}>
          <Card>
            <div style={{ marginBottom: '16px' }}>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Upload
                  name="avatar"
                  listType="picture-circle"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleAvatarChange}
                  disabled={!editMode}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" style={{ width: '100%', borderRadius: '50%' }} />
                  ) : (
                    <Avatar size={80} icon={<UserOutlined />} className="bg-green-600">
                      {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  {editMode && (
                    <div className="upload-overlay">
                      <CameraOutlined style={{ fontSize: '20px', color: 'white' }} />
                    </div>
                  )}
                </Upload>
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {displayName}
                  </Title>
                  <Text type="secondary">{userProfile?.email || user?.email}</Text>
                  <br />
                  <Space>
                    <Tag color={userProfile?.is_active ? 'green' : 'red'}>{userStatus}</Tag>
                    <Tag color="blue">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</Tag>
                    {userProfile?.created_at && (
                      <Tag color="cyan">
                        Member since {dayjs(userProfile.created_at).format('MMM YYYY')}
                      </Tag>
                    )}
                  </Space>
                </div>
              </div>
              <Button
                type={editMode ? 'default' : 'primary'}
                icon={editMode ? <CloseOutlined /> : <EditOutlined />}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </Card>
        </Col>

        {/* Profile Information */}
        <Col xs={24} lg={16}>
          <Card title="Personal Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Row gutter={[20, 16]}>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="First Name"
                    name="first_name"
                    rules={[{ required: true, message: 'Please input your first name!' }]}
                  >
                    <Input disabled={!editMode} prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Last Name"
                    name="last_name"
                    rules={[{ required: true, message: 'Please input your last name!' }]}
                  >
                    <Input disabled={!editMode} prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[20, 16]} style={{ marginTop: '12px' }}>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input disabled={!editMode} prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Phone Number"
                    name="phone"
                  >
                    <Input disabled={!editMode} prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[20, 16]} style={{ marginTop: '12px' }}>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Date of Birth"
                    name="date_of_birth"
                  >
                    <DatePicker 
                      disabled={!editMode} 
                      style={{ width: '100%' }}
                      placeholder="Select date"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Gender"
                    name="gender"
                  >
                    <Select disabled={!editMode} placeholder="Select gender">
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '32px 0' }}>Health Information</Divider>
              
              <div style={{ 
                background: '#f0f9ff', 
                border: '1px solid #91c7ff', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '16px' 
              }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Health data is synchronized with your detailed Health Records. 
                  Changes made here will update your health profile, and detailed records 
                  can be managed in the Health Records Setup page.
                </Text>
              </div>

              <Row gutter={[20, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Height (cm)"
                    name="height"
                    extra="Will sync to Health Records"
                  >
                    <InputNumber 
                      disabled={!editMode} 
                      style={{ width: '100%' }}
                      min={100}
                      max={250}
                      placeholder="170"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Weight (kg)"
                    name="weight"
                    extra="Will sync to Health Records"
                  >
                    <InputNumber 
                      disabled={!editMode} 
                      style={{ width: '100%' }}
                      min={30}
                      max={200}
                      placeholder="70"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="BMI (Calculated)"
                    extra="Will be calculated automatically"
                  >
                    <InputNumber 
                      disabled
                      style={{ width: '100%' }}
                      value={null}
                      placeholder="Auto-calculated"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Activity Level"
                    name="activity_level"
                  >
                    <Select disabled={!editMode} placeholder="Select activity level">
                      <Option value="sedentary">Sedentary</Option>
                      <Option value="light">Light</Option>
                      <Option value="moderate">Moderate</Option>
                      <Option value="active">Active</Option>
                      <Option value="very_active">Very Active</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[20, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Health Goals"
                    name="health_goals"
                  >
                    <Select 
                      mode="multiple" 
                      disabled={!editMode} 
                      placeholder="Select health goals"
                      options={[
                        { label: 'Weight Loss', value: 'weight_loss' },
                        { label: 'Weight Gain', value: 'weight_gain' },
                        { label: 'Muscle Building', value: 'muscle_building' },
                        { label: 'Maintenance', value: 'maintenance' },
                        { label: 'Athletic Performance', value: 'athletic_performance' }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Dietary Preferences"
                    name="dietary_preferences"
                  >
                    <Select 
                      mode="multiple" 
                      disabled={!editMode} 
                      placeholder="Select dietary preferences"
                      options={[
                        { label: 'Vegetarian', value: 'vegetarian' },
                        { label: 'Vegan', value: 'vegan' },
                        { label: 'Keto', value: 'keto' },
                        { label: 'Paleo', value: 'paleo' },
                        { label: 'Mediterranean', value: 'mediterranean' },
                        { label: 'Low Carb', value: 'low_carb' }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[20, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Allergies"
                    name="allergies"
                  >
                    <Select 
                      mode="multiple" 
                      disabled={!editMode} 
                      placeholder="Select allergies"
                      options={[
                        { label: 'Nuts', value: 'nuts' },
                        { label: 'Dairy', value: 'dairy' },
                        { label: 'Gluten', value: 'gluten' },
                        { label: 'Shellfish', value: 'shellfish' },
                        { label: 'Eggs', value: 'eggs' },
                        { label: 'Soy', value: 'soy' }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} style={{ marginBottom: '8px' }}>
                  <Form.Item
                    label="Medical Conditions"
                    name="medical_conditions"
                  >
                    <Select 
                      mode="multiple" 
                      disabled={!editMode} 
                      placeholder="Select medical conditions"
                      options={[
                        { label: 'Diabetes', value: 'diabetes' },
                        { label: 'Hypertension', value: 'hypertension' },
                        { label: 'Heart Disease', value: 'heart_disease' },
                        { label: 'Kidney Disease', value: 'kidney_disease' },
                        { label: 'Liver Disease', value: 'liver_disease' }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {editMode && (
                <Form.Item style={{ marginTop: '32px' }}>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Changes
                    </Button>
                    <Button onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col xs={24} lg={8}>
          {/* Health Summary */}
          <Card title="Health Summary" style={{ marginBottom: '32px' }}>            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Health data will be available when you start tracking your health records.</Text>
              
              <Button 
                type="primary" 
                block 
                onClick={() => navigate('/health-records')}
                style={{ marginTop: '8px' }}
              >
                View Complete Health Records
              </Button>
            </Space>
          </Card>
          
          <Card title="Security Settings" style={{ marginBottom: '24px' }}>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' }
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>

              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    }
                  })
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={passwordLoading}
                  block
                >
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Account Settings */}
          <Card title="Account Settings">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Email Updates</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Receive updates via email</Text>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Two-Factor Authentication</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Add extra security to your account</Text>
                </div>
                <Switch />
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Data Sharing</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Share anonymous usage data</Text>
                </div>
                <Switch defaultChecked />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;