import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanAPI } from '../services/api';
import './Dashboard.css';
import './CreditAnalytics.css';

function CreditAnalytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6 Months');

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

  // Calculate credit score stats
  const calculateScoreStats = () => {
    if (applications.length === 0) {
      return { current: 0, highest: 0, lowest: 0, currentChange: 0, highestDate: null, lowestDate: null };
    }

    const scores = applications.map(app => app.credit_score);
    const current = applications[0].credit_score; // First item is latest (desc order)
    const previous = applications.length > 1 ? applications[1].credit_score : current;
    const currentChange = current - previous;
    
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    const highestApp = applications.find(app => app.credit_score === highest);
    const lowestApp = applications.find(app => app.credit_score === lowest);
    
    const getTimeAgo = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMonths = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30));
      return diffMonths === 0 ? 'this month' : `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    };
    
    return {
      current,
      highest,
      lowest,
      currentChange,
      highestDate: highestApp ? getTimeAgo(highestApp.created_at) : null,
      lowestDate: lowestApp ? getTimeAgo(lowestApp.created_at) : null
    };
  };

  const scoreStats = calculateScoreStats();

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
          <p className="page-subtitle">Deep dive into your credit score trends and factors affecting your creditworthiness</p>
        </div>

        {/* Time Period Filters */}
        <div className="period-filters">
          {['1 Month', '3 Months', '6 Months', '12 Months'].map(period => (
            <button
              key={period}
              className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Credit Score Trend Stats */}
        {applications.length > 0 && (
          <div className="score-trend-section">
            <h2 className="section-title">Credit Score Trend</h2>
            <div className="score-cards">
              <div className="score-card current-score">
                <div className="score-label">Current Score</div>
                <div className="score-value">{scoreStats.current}</div>
                {applications.length > 1 && (
                  <div className={`score-change ${scoreStats.currentChange < 0 ? 'negative' : scoreStats.currentChange === 0 ? 'neutral' : ''}`}>
                    <span className="trend-icon">
                      {scoreStats.currentChange > 0 ? '↗' : scoreStats.currentChange < 0 ? '↘' : '→'}
                    </span>
                    <span className="change-text">
                      {scoreStats.currentChange === 0 
                        ? 'Constant from last month' 
                        : `${scoreStats.currentChange > 0 ? '+' : ''}${scoreStats.currentChange} from last month`}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="score-card highest-score">
                <div className="score-label">Highest Score</div>
                <div className="score-value">{scoreStats.highest}</div>
                {scoreStats.highestDate && (
                  <div className="score-info">Achieved {scoreStats.highestDate}</div>
                )}
              </div>
              
              <div className="score-card lowest-score">
                <div className="score-label">Lowest Score</div>
                <div className="score-value">{scoreStats.lowest}</div>
                {scoreStats.lowestDate && (
                  <div className="score-info">Recorded {scoreStats.lowestDate}</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="analytics-grid">
          {/* Credit Score Graph */}
          <div className="chart-card">
            <div className="chart-header">
              <h2>Credit Score History Chart</h2>
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


        </div>
      </div>
    </div>
  );
}

export default CreditAnalytics;
