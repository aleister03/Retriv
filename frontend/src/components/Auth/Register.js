import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, tokenUtils } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: '',
    semester: '',
    phone: '',
    idCardPhoto: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        idCardPhoto: file
      });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    // Clear messages when user selects file
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email.endsWith('@g.bracu.ac.bd')) {
      setError('Email must end with @g.bracu.ac.bd');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { confirmPassword, idCardPhoto, ...submitData } = formData;
      // Map semester to year for backend compatibility
      const dataToSubmit = {
        ...submitData,
        year: submitData.semester
      };
      delete dataToSubmit.semester;
      
      // Send regular JSON data (no file upload for now)
      const response = await authAPI.registerStudent(dataToSubmit);
      const { token, student } = response.data;
      
      setSuccess('Student account created successfully! Redirecting...');
      
      // Store token and user data
      tokenUtils.setToken(token);
      tokenUtils.setUser(student);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Student registration error:', error);
      setError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
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
              <h2>Student Registration</h2>
              <p>Create your student account</p>
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

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>

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
                  placeholder="Enter your email (must end with @g.bracu.ac.bd)"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="studentId" className="form-label">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    className="form-input"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                    placeholder="Enter your student ID"
                    disabled={loading}
                  />
                </div>

                <div className="form-group half-width">
                  <label htmlFor="semester" className="form-label">
                    Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    className="form-select"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                    <option value="9">Semester 9</option>
                    <option value="10">Semester 10</option>
                    <option value="11">Semester 11</option>
                    <option value="12">Semester 12</option>
                    <option value="13">Semester 13</option>
                    <option value="14">Semester 14</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="department" className="form-label">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={loading}
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
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>

              {/* File upload for ID Card Photo - Optional */}
              <div className="form-group">
                <label htmlFor="idCardPhoto" className="form-label">
                  ID Card Photo <span style={{color: '#999', fontSize: '14px'}}>(Optional)</span>
                </label>
                <input
                  type="file"
                  id="idCardPhoto"
                  name="idCardPhoto"
                  className="file-input"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={loading}
                />
                {photoPreview && (
                  <div className="file-preview">
                    <img src={photoPreview} alt="ID Card Preview" />
                  </div>
                )}
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
                  placeholder="Enter your password (min. 6 characters)"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
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
                    Creating Account...
                  </>
                ) : (
                  'Create Student Account'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="form-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
