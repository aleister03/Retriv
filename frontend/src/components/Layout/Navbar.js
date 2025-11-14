import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tokenUtils } from '../../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = tokenUtils.isAuthenticated();
  const user = tokenUtils.getUser();

  const handleLogout = () => {
    tokenUtils.logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <h2>Retriv</h2>
        </Link>
        
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <span>Welcome, {user?.name} ({user?.role})</span>
              <Link 
                to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} 
                className="nav-link"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="nav-link logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                Home
              </Link>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
