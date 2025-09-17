import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';
import { signOut } from '../store/slices/authSlice';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(signOut());
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src={require('../assets/images/login_register_page/logo.png')} alt="NutriHelp Logo" className="navbar-logo" />
        </div>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Button 
                type="text" 
                onClick={handleLogout}
                className="navbar-link"
                style={{ 
                  border: 'none', 
                  background: 'transparent',
                  color: 'inherit',
                  padding: 0,
                  height: 'auto'
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className={`navbar-link ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;