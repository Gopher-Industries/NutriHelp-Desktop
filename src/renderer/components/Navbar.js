import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src={require('../assets/images/login_register_page/logo.png')} alt="NutriHelp Logo" className="navbar-logo" />
        </div>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;