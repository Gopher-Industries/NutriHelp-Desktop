import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Typography,
  App,
  Progress,
  Checkbox,
  Select,
  Tooltip,
  Space
} from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '../../components/icons/PaperIcons';
import { signUp, clearError } from '../store/slices/authSlice';
import '../styles/RegisterPage.css';

const { Title } = Typography;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const {
    isLoading,
    error,
    isAuthenticated
  } = useSelector((state) => state.auth);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Reset loading state on component mount to prevent stuck loading buttons
  useEffect(() => {
    if (isLoading && !isAuthenticated) {
      // If loading is stuck and user is not authenticated, clear the loading state
      dispatch(clearError());
    }
  }, []);



  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordCriteria({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      return;
    }

    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordCriteria(criteria);
    
    const score = Object.values(criteria).filter(Boolean).length;
    setPasswordStrength((score / 5) * 100);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return '#ff4d4f';
    if (passwordStrength < 80) return '#faad14';
    return '#52c41a';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 80) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (values) => {
    if (!agreedToTerms) {
      message.error('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    if (passwordStrength < 60) {
      message.error('Please choose a stronger password.');
      return;
    }

    try {
      const result = await dispatch(signUp({
        email: values.email,
        password: values.password,
        userData: {}
      })).unwrap();

      if (result) {
        message.success('Registration successful! Please check your email to verify your account.');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error?.message || error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-card">
        <div className="register-content">
          <div className="register-company-logo-section">
            <img src={require('../assets/images/login_register_page/companylogo.png')} alt="Company Logo" className="register-company-logo" />
          </div>
          <h1 className="register-title">SIGN UP</h1>

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            autoComplete="off"
            className="register-form"
          >


            <div className="form-group">
              <label className="form-label">Email*</label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email address!' }
                ]}
              >
                <Input placeholder="Email Address" autoComplete="email" />
              </Form.Item>
            </div>

            <div className="form-group">
              <label className="form-label">
                Password*
                <Tooltip title="Password must contain at least 8 characters with uppercase, lowercase, number and special character">
                  <InfoCircleOutlined style={{ marginLeft: '4px', color: '#1890ff' }} />
                </Tooltip>
              </label>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' },
                  {
                    validator: (_, value) => {
                      if (!value || passwordStrength >= 60) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password is too weak!'));
                    }
                  }
                ]}
              >
                <Input.Password 
                  placeholder="Password" 
                  autoComplete="new-password"
                  onChange={(e) => checkPasswordStrength(e.target.value)}
                />
              </Form.Item>
              {form.getFieldValue('password') && (
                <div style={{ marginTop: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Password Strength:</span>
                    <span style={{ fontSize: '12px', color: getPasswordStrengthColor(), fontWeight: '500' }}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <Progress 
                    percent={passwordStrength} 
                    strokeColor={getPasswordStrengthColor()}
                    showInfo={false}
                    size="small"
                    style={{ marginBottom: '12px' }}
                  />
                  <div style={{ marginTop: '12px', fontSize: '11px', lineHeight: '1.6' }}>
                    <Space direction="vertical" size={4}>
                      <div style={{ color: passwordCriteria.length ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {passwordCriteria.length ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        <span>At least 8 characters</span>
                      </div>
                      <div style={{ color: passwordCriteria.uppercase ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {passwordCriteria.uppercase ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        <span>Uppercase letter</span>
                      </div>
                      <div style={{ color: passwordCriteria.lowercase ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {passwordCriteria.lowercase ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        <span>Lowercase letter</span>
                      </div>
                      <div style={{ color: passwordCriteria.number ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {passwordCriteria.number ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        <span>Number</span>
                      </div>
                      <div style={{ color: passwordCriteria.special ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {passwordCriteria.special ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        <span>Special character</span>
                      </div>
                    </Space>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password*</label>
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    }
                  })
                ]}
              >
                <Input.Password placeholder="Confirm Password" autoComplete="new-password" />
              </Form.Item>
            </div>





            <div className="form-group">
              <Form.Item>
                <Checkbox 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                >
                  I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                </Checkbox>
              </Form.Item>
            </div>

            <Form.Item className="form-actions">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="register-button"
                block
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </Form.Item>
          </Form>

          <div className="signin-section">
            <span>Already have an account? </span>
            <Link to="/login" className="signin-link">
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="register-illustration">
          <img src={require('../assets/images/login_register_page/decoration.png')} alt="Decoration" className="decoration-image" />
        </div>
      </div>
      </div>
    </div>
  );
};

export default RegisterPage;