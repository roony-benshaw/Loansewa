import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanAPI } from '../services/api';
import './CreditAnalytics.css';

function CreditAnalytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        const applications = await loanAPI.getUserApplications(parsedUser.id);
        setApplications(applications || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Get credit score data (last 6 months or applications)
  const creditScoreData = applications.length > 0 
    ? applications.slice(-6).map((app, index) => ({
        month: `App ${index + 1}`,
        score: app.credit_score || 0,
        date: new Date(app.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      }))
    : [];

  // Get loan amount data
  const loanAmountData = applications.length > 0
    ? applications.slice(-6).map((app, index) => ({
        month: `App ${index + 1}`,
        amount: app.loan_amount || 0,
        date: new Date(app.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      }))
    : [];

  const maxCreditScore = 900;
  const maxLoanAmount = Math.max(...loanAmountData.map(d => d.amount), 500000);

  return (
    <div className="analytics-page">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">💳</div>
            <span className="logo-text">LoanSewa</span>
          </div>
          <nav className="nav-menu">
            <button 
              className="nav-item"
              onClick={() => navigate('/apply')}
            >
              Apply
            </button>
            <button 
              className="nav-item"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            <button 
              className="nav-item active"
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

      <div className="analytics-content">
        <div className="page-header">
          <h1>Credit Analytics</h1>
          <p className="page-subtitle">Track your credit score and loan history over time</p>
        </div>

        <div className="analytics-grid">
          {/* Credit Score Graph */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Credit Score Trend</h2>
              <span className="chart-period">Last {creditScoreData.length} Applications</span>
            </div>
            <div className="chart-container">
              {creditScoreData.length > 0 ? (
                <>
                  <div className="y-axis">
                    <span className="y-label">900</span>
                    <span className="y-label">750</span>
                    <span className="y-label">600</span>
                    <span className="y-label">450</span>
                    <span className="y-label">300</span>
                  </div>
                  <div className="chart-area">
                    <div className="grid-lines">
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                    </div>
                    <div className="bars-container">
                      {creditScoreData.map((data, index) => {
                        const heightPercent = (data.score / maxCreditScore) * 100;
                        const color = data.score >= 750 ? '#4CAF50' : data.score >= 650 ? '#2196F3' : data.score >= 500 ? '#FF9800' : '#F44336';
                        return (
                          <div key={index} className="bar-wrapper">
                            <div className="bar-item">
                              <div 
                                className="bar" 
                                style={{ 
                                  height: `${heightPercent}%`,
                                  backgroundColor: color
                                }}
                              >
                                <span className="bar-value">{data.score}</span>
                              </div>
                            </div>
                            <span className="x-label">{data.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-data">
                  <p>No credit score data available</p>
                  <button className="btn-apply" onClick={() => navigate('/apply')}>Apply for Loan</button>
                </div>
              )}
            </div>
          </div>

          {/* Loan Amount Graph */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Loan Amount Trend</h2>
              <span className="chart-period">Last {loanAmountData.length} Applications</span>
            </div>
            <div className="chart-container">
              {loanAmountData.length > 0 ? (
                <>
                  <div className="y-axis">
                    <span className="y-label">₹{(maxLoanAmount / 100000).toFixed(1)}L</span>
                    <span className="y-label">₹{(maxLoanAmount * 0.75 / 100000).toFixed(1)}L</span>
                    <span className="y-label">₹{(maxLoanAmount * 0.5 / 100000).toFixed(1)}L</span>
                    <span className="y-label">₹{(maxLoanAmount * 0.25 / 100000).toFixed(1)}L</span>
                    <span className="y-label">₹0</span>
                  </div>
                  <div className="chart-area">
                    <div className="grid-lines">
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                      <div className="grid-line"></div>
                    </div>
                    <div className="bars-container">
                      {loanAmountData.map((data, index) => {
                        const heightPercent = (data.amount / maxLoanAmount) * 100;
                        return (
                          <div key={index} className="bar-wrapper">
                            <div className="bar-item">
                              <div 
                                className="bar loan-bar" 
                                style={{ 
                                  height: `${heightPercent}%`,
                                  backgroundColor: '#9C27B0'
                                }}
                              >
                                <span className="bar-value">₹{(data.amount / 100000).toFixed(1)}L</span>
                              </div>
                            </div>
                            <span className="x-label">{data.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-data">
                  <p>No loan amount data available</p>
                  <button className="btn-apply" onClick={() => navigate('/apply')}>Apply for Loan</button>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="summary-card">
            <h2>Analytics Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Applications</span>
                <span className="summary-value">{applications.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Latest Credit Score</span>
                <span className="summary-value">
                  {applications.length > 0 ? applications[applications.length - 1].credit_score : '--'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Latest Loan Amount</span>
                <span className="summary-value">
                  {applications.length > 0 
                    ? `₹${(applications[applications.length - 1].loan_amount / 100000).toFixed(2)}L`
                    : '₹0'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Credit Score</span>
                <span className="summary-value">
                  {applications.length > 0 
                    ? Math.round(applications.reduce((sum, app) => sum + app.credit_score, 0) / applications.length)
                    : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditAnalytics;
