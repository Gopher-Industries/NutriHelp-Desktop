import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Typography,
  Checkbox,
  App
} from 'antd';
import {
  EyeInvisibleOutlined,
  EyeTwoTone
} from '../../components/icons/PaperIcons';
import { signIn, clearError, setRememberMe, addLoginHistoryEntry } from '../store/slices/authSlice';
import '../styles/LoginPage.css';

const { Title } = Typography;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  const {
    isLoading,
    error,
    isAuthenticated,
    rememberMe,
    loginAttempts,
    isLocked
  } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

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

  const handleSubmit = async (values) => {
    if (isLocked) {
      message.error('Account is temporarily locked due to multiple failed attempts');
      return;
    }

    try {
      // Use enhanced login with user saving if remember me is checked
      if (rememberMe) {
        await dispatch(signIn({
        email: values.email,
        password: values.password
      })).unwrap();
      } else {
        await dispatch(signIn({
          email: values.email,
          password: values.password
        })).unwrap();
      }
      
      // Add successful login to history
      dispatch(addLoginHistoryEntry({
        success: true,
        email: values.email
      }));
      
      message.success('Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Add failed login to history
      dispatch(addLoginHistoryEntry({
        success: false,
        email: values.email
      }));
      
      console.error('Login error:', error);
      message.error(error?.message || error || 'Login failed. Please try again.');
    }
  };

  const handleFormChange = (changedValues, allValues) => {
    setFormData(allValues);
  };

  const handleRememberMeChange = (e) => {
    dispatch(setRememberMe(e.target.checked));
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="login-container" style={{
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style>
        {`
          .login-container::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div className="login-card">
        <div className="login-content">
          <div className="login-company-logo-section">
            <img src={require('../assets/images/login_register_page/companylogo.png')} alt="Company Logo" className="login-company-logo" />
          </div>
          <h2 className="login-title">LOG IN</h2>
          <p className="login-subtitle">Enter your email and password to sign in!</p>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            onValuesChange={handleFormChange}
            autoComplete="off"
            className="login-form"
          >
            <div className="form-group">
              <label className="form-label">Email*</label>
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'Please input your email!'
                  },
                  {
                    type: 'email',
                    message: 'Please enter a valid email address!'
                  }
                ]}
              >
                <Input
                  placeholder="email"
                  autoComplete="email"
                  disabled={isLoading || isLocked}
                  className="form-input"
                />
              </Form.Item>
            </div>

            <div className="form-group">
              <label className="form-label">Password*</label>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please input your password!'
                  },
                  {
                    min: 8,
                    message: 'Password must be at least 8 characters!'
                  }
                ]}
              >
                <Input.Password
                  placeholder="Min. 8 characters"
                  autoComplete="current-password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  disabled={isLoading || isLocked}
                  className="form-input"
                />
              </Form.Item>
            </div>

            <div className="form-options">
              <Checkbox
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={isLoading || isLocked}
                className="remember-checkbox"
              >
                Keep me logged in
              </Checkbox>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                disabled={!isFormValid || isLocked}
                block
                className="login-button"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="signup-section">
            <span className="signup-text">
              Not registered yet? <Link to="/register" className="signup-link">Create an Account</Link>
            </span>
          </div>
          

        </div>
        
        <div className="login-illustration">
          <img src={require('../assets/images/login_register_page/decoration.png')} alt="Decoration" className="decoration-image" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;