import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, tokenUtils } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ADMIN_EMAIL = 'admin@system.com';
      const ADMIN_PASSWORD = 'admin123';

      // Check if credentials match admin
      if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
        // Login as admin
        try {
          const response = await authAPI.loginAdmin(formData);
          const { token, admin } = response.data;
          tokenUtils.setToken(token);
          tokenUtils.setUser(admin);
          navigate('/admin/dashboard');
          return;
        } catch (error) {
          console.error('Admin login error:', error);
          setError('Admin login failed. Please try again.');
          setLoading(false);
          return;
        }
      }

      // If not admin credentials, verify as student
      try {
        const response = await authAPI.loginStudent(formData);
        const { token, student } = response.data;
        tokenUtils.setToken(token);
        tokenUtils.setUser(student);
        navigate('/student/dashboard');
      } catch (studentError) {
        console.error('Student login error:', studentError);
        setError(
          studentError.response?.data?.message || 
          'Invalid credentials. Please check your email and password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="form-container">
          <div className="card form-card">
            <div className="form-header">
              <h2>Login to Retriv</h2>
              <p>Sign in to your account</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner button-spinner"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Don't have a student account?{' '}
                <Link to="/register" className="form-link">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
