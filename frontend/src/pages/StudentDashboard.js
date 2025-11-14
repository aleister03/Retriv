import React, { useState, useEffect } from 'react';
import { tokenUtils, authAPI } from '../services/api';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    year: '',
    phone: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        studentId: userData.studentId || '',
        department: userData.department || '',
        year: userData.year || '',
        phone: userData.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // For now, we'll just update the local state
      // In a real app, you'd send this to the backend
      const updatedUser = {
        ...user,
        ...formData
      };
      
      setUser(updatedUser);
      tokenUtils.setUser(updatedUser);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePhoto(null);
    setPhotoPreview(null);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      studentId: user.studentId || '',
      department: user.department || '',
      year: user.year || '',
      phone: user.phone || ''
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && !user) {
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
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="welcome-message">
            Welcome, {user?.name}
          </h1>
          <button 
            className="btn btn-primary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="profile-card card">
          <div className="profile-header">
            <div className="profile-photo-section">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="profile-photo" />
              ) : (
                <div className="profile-photo-placeholder">
                  <span>👤</span>
                </div>
              )}
              {isEditing && (
                <div className="photo-upload-section">
                  <label htmlFor="profilePhoto" className="form-label">
                    Upload Profile Photo
                  </label>
                  <input
                    type="file"
                    id="profilePhoto"
                    name="profilePhoto"
                    className="file-input"
                    onChange={handlePhotoChange}
                    accept="image/*"
                  />
                </div>
              )}
            </div>

            <div className="profile-info">
              <div className="info-item">
                <label className="info-label">Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="info-value">{user?.name}</span>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Email:</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                ) : (
                  <span className="info-value">{user?.email}</span>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Student ID:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                ) : (
                  <span className="info-value">{user?.studentId}</span>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Department:</label>
                {isEditing ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science & Engineering (CSE)</option>
                    <option value="EEE">Electrical & Electronic Engineering (EEE)</option>
                    <option value="ME">Mechanical Engineering (ME)</option>
                    <option value="CE">Civil Engineering (CE)</option>
                    <option value="BBA">Business Administration (BBA)</option>
                    <option value="BIOTEC">Biotechnology (BIOTEC)</option>
                    <option value="CHE">Chemical Engineering (CHE)</option>
                    <option value="SE">Software Engineering (SE)</option>
                    <option value="AIE">Artificial Intelligence & Engineering (AIE)</option>
                    <option value="ENG">English</option>
                    <option value="ARCH">Architecture</option>
                  </select>
                ) : (
                  <span className="info-value">{user?.department}</span>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Semester:</label>
                {isEditing ? (
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Semester</option>
                    {[...Array(14)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Semester {i + 1}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="info-value">Semester {user?.year}</span>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Phone:</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <span className="info-value">{user?.phone}</span>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button 
                className="btn btn-primary"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
