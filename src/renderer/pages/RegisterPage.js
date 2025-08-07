import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Typography,
  message
} from 'antd';
import { signUp, clearError } from '../store/slices/authSlice';
import '../styles/RegisterPage.css';

const { Title } = Typography;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
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

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName
      })).unwrap();

      if (result) {
        message.success('Registration successful! Please check your email to verify your account.');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
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
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name*</label>
                <Form.Item
                  name="firstName"
                  rules={[{ required: true, message: 'Please input your first name!' }]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
              </div>
              <div className="form-group">
                <label className="form-label">Last Name*</label>
                <Form.Item
                  name="lastName"
                  rules={[{ required: true, message: 'Please input your last name!' }]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
              </div>
            </div>

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
              <label className="form-label">Password*</label>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' }
                ]}
              >
                <Input.Password placeholder="Password" autoComplete="new-password" />
              </Form.Item>
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
  );
};

export default RegisterPage;