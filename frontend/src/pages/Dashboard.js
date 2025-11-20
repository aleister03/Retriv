import React, { useState, useEffect } from 'react';
import { tokenUtils, authAPI } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container dashboard-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-container">
      <h1 className="welcome-message">
        Welcome {user?.role === 'admin' ? 'Admin' : user?.name}
      </h1>
    </div>
  );
};

export default Dashboard;
