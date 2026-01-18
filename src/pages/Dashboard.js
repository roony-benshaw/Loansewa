import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [latestApplication, setLatestApplication] = useState(null);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchLatestApplication(parsedUser.id);
    }
  }, [navigate]);

  const fetchLatestApplication = async (userId) => {
    try {
      const applications = await loanAPI.getUserApplications(userId);
      if (applications && applications.length > 0) {
        setLatestApplication(applications[0]); // Most recent application
        setAllApplications(applications); // Store all applications
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    navigate('/');
  };

  if (!user || loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Use application data if available, otherwise use defaults
  const creditScore = latestApplication?.credit_score || 0;
  const rating = latestApplication?.rating || 'N/A';
  const defaultProbability = latestApplication?.default_probability || 0;
  const hasApplication = latestApplication !== null;
  
  // Calculate stroke offset for credit score circle (762 max score = 534 circumference)
  const maxScore = 900;
  const minScore = 300;
  const scoreRange = maxScore - minScore;
  const normalizedScore = hasApplication ? ((creditScore - minScore) / scoreRange) : 0;
  const circumference = 534;
  const strokeOffset = circumference - (normalizedScore * circumference);

  // Determine risk status
  let riskStatus = 'No Application';
  let riskColor = 'gray';
  if (hasApplication) {
    if (creditScore >= 750) {
      riskStatus = 'Low Risk - High Need';
      riskColor = 'green';
    } else if (creditScore >= 650) {
      riskStatus = 'Low Risk - Moderate Need';
      riskColor = 'green';
    } else if (creditScore >= 500) {
      riskStatus = 'Moderate Risk';
      riskColor = 'orange';
    } else {
      riskStatus = 'High Risk';
      riskColor = 'red';
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">💳</div>
            <span className="logo-text">LoanSewa</span>
          </div>
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeTab === 'apply' ? 'active' : ''}`}
              onClick={() => navigate('/apply')}
            >
              Apply
            </button>
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => navigate('/analytics')}
            >
              Credit Analytics
            </button>
            <button 
              className="nav-item"
              onClick={() => navigate('/improve')}
            >
              Improve Score
            </button>
          </nav>
        </div>
        <div className="header-right">
          <span className="welcome-text">Welcome, {user.full_name}</span>
          <button className="icon-btn">👤</button>
          <button className="icon-btn" onClick={handleLogout}>🚪</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user.full_name}! Here's your financial overview</p>
        </div>

        <div className="dashboard-grid">
          <div className="main-section">
            <div className="credit-analysis-card">
              <div className="card-header">
                <h2>Credit & Risk Analysis</h2>
                <a href="#view" className="view-details">View Details</a>
              </div>
              <div className="credit-content">
                <div className="credit-score-circle">
                  <svg viewBox="0 0 200 200" className="score-svg">
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="12"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke={hasApplication ? "#4169E1" : "#ccc"}
                      strokeWidth="12"
                      strokeDasharray="534"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="score-text">
                    <div className="score-number">{hasApplication ? creditScore : '--'}</div>
                    <div className="score-label">out of 900</div>
                  </div>
                </div>
                <div className="credit-info">
                  {hasApplication ? (
                    <>
                      <div className="risk-badge">
                        <span className={`status-dot ${riskColor}`}></span>
                        <span className="risk-text">{riskStatus}</span>
                      </div>
                      <p className="credit-description">
                        {creditScore >= 750 
                          ? 'Your credit score is in the excellent range. Maintain your current financial habits to keep your score high.'
                          : creditScore >= 650
                          ? 'Your credit score is good. Continue managing your finances responsibly.'
                          : creditScore >= 500
                          ? 'Your credit score is average. Consider improving your financial habits.'
                          : 'Your credit score needs improvement. Focus on better financial management.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="risk-badge gray">
                        <span className="status-dot gray"></span>
                        <span className="risk-text">No Application Yet</span>
                      </div>
                      <p className="credit-description">
                        Apply for a loan to get your credit score and risk assessment.
                      </p>
                      <button className="btn-apply-now" onClick={() => navigate('/apply')}>
                        Apply Now
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="user-profile-card">
              <h2>Your Profile Information</h2>
              <div className="profile-grid">
                <div className="profile-item">
                  <span className="profile-label">Full Name</span>
                  <span className="profile-value">{user.full_name}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Email Address</span>
                  <span className="profile-value">{user.email}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Mobile Number</span>
                  <span className="profile-value">{user.mobile_number}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Aadhar Number</span>
                  <span className="profile-value">{user.aadhar}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Account Created</span>
                  <span className="profile-value">{new Date(user.created_at).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">User ID</span>
                  <span className="profile-value">#{user.id}</span>
                </div>
              </div>
            </div>

            <div className="risk-bands-card">
              <h2>Risk Bands</h2>
              {hasApplication ? (
                <div className={`risk-item active ${riskColor}`}>
                  <div className={`risk-indicator ${riskColor}`}></div>
                  <div className="risk-details">
                    <div className="risk-title">{riskStatus}</div>
                    <div className="risk-subtitle">
                      {latestApplication.status === 'Approved' 
                        ? 'Instant approval eligible' 
                        : latestApplication.status === 'Under Review'
                        ? 'Under review by team'
                        : 'Application needs improvement'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="risk-item inactive">
                  <div className="risk-indicator gray"></div>
                  <div className="risk-details">
                    <div className="risk-title">No Assessment Available</div>
                    <div className="risk-subtitle">Apply for a loan to see your risk band</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Loan Applications</span>
                <span className="stat-icon">💰</span>
              </div>
              <div className="stat-value">
                {allApplications.length}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Borrowed</span>
                <span className="stat-icon">📈</span>
              </div>
              <div className="stat-value">
                {allApplications.length > 0
                  ? `₹${(allApplications.reduce((sum, app) => sum + app.loan_amount, 0) / 100000).toFixed(2)}L`
                  : '₹0'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Credit Utilization</span>
                <span className="stat-icon">🎯</span>
              </div>
              <div className="stat-value">
                {hasApplication ? `${latestApplication.credit_utilization_ratio}%` : '0%'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
