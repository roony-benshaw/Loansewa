import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mobile');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'mobile':
        return 'Enter 10-digit mobile number';
      case 'aadhar':
        return 'Enter 12-digit Aadhar number';
      case 'email':
        return 'Enter your email address';
      default:
        return '';
    }
  };

  const getLabel = () => {
    switch (activeTab) {
      case 'mobile':
        return 'Mobile Number';
      case 'aadhar':
        return 'Aadhar Number';
      case 'email':
        return 'Email';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({
        identifier: identifier,
        password: password,
      });

      console.log('Login response:', response);

      if (response && response.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        console.log('Navigating to dashboard...');
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your LoanSewa account</p>

          <div className="login-tabs">
            <p className="tabs-label">Login with</p>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'mobile' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('mobile');
                  setIdentifier('');
                  setError('');
                }}
              >
                <span className="tab-icon">📱</span>
                Mobile
              </button>
              <button
                className={`tab ${activeTab === 'aadhar' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('aadhar');
                  setIdentifier('');
                  setError('');
                }}
              >
                <span className="tab-icon">🆔</span>
                Aadhar
              </button>
              <button
                className={`tab ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('email');
                  setIdentifier('');
                  setError('');
                }}
              >
                <span className="tab-icon">✉️</span>
                Email
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>{getLabel()}</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={getPlaceholder()}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="signup-prompt">
              <span>New to LoanSewa? </span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="signup-link"
              >
                Create new account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
