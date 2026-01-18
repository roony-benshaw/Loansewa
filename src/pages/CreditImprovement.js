import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import './CreditImprovement.css';

function CreditImprovement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [creditScore, setCreditScore] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchSuggestions(parsedUser.id);
  }, [navigate]);

  const fetchSuggestions = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/credit/improvement/${userId}`);
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
        setCreditScore(response.data.credit_score);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };

  return (
    <div className="improvement-page">
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
              className="nav-item"
              onClick={() => navigate('/analytics')}
            >
              Credit Analytics
            </button>
            <button 
              className="nav-item active"
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

      <div className="improvement-content">
        <div className="page-header">
          <h1>Credit Score Improvement</h1>
          <p className="page-subtitle">Personalized suggestions to boost your credit score</p>
        </div>

        {error ? (
          <div className="error-card">
            <h2>⚠️ No Data Available</h2>
            <p>{error}</p>
            <button className="btn-apply" onClick={() => navigate('/apply')}>
              Apply for Loan
            </button>
          </div>
        ) : (
          <>
            <div className="score-overview">
              <div className="current-score">
                <div className="score-label">Your Current Score</div>
                <div className="score-number">{creditScore}</div>
                <div className="score-range">out of 900</div>
              </div>
              <div className="score-info">
                <h3>What Your Score Means</h3>
                <div className="score-ranges">
                  <div className={`range-item ${creditScore >= 750 ? 'active' : ''}`}>
                    <span className="range-color excellent"></span>
                    <span className="range-text">750-900: Excellent</span>
                  </div>
                  <div className={`range-item ${creditScore >= 650 && creditScore < 750 ? 'active' : ''}`}>
                    <span className="range-color good"></span>
                    <span className="range-text">650-749: Good</span>
                  </div>
                  <div className={`range-item ${creditScore >= 500 && creditScore < 650 ? 'active' : ''}`}>
                    <span className="range-color fair"></span>
                    <span className="range-text">500-649: Fair</span>
                  </div>
                  <div className={`range-item ${creditScore < 500 ? 'active' : ''}`}>
                    <span className="range-color poor"></span>
                    <span className="range-text">300-499: Poor</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="suggestions-section">
              <h2>Personalized Recommendations</h2>
              <div className="suggestions-grid">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className={`suggestion-card ${getPriorityColor(suggestion.priority)}`}>
                    <div className="suggestion-header">
                      <span className="suggestion-icon">{suggestion.icon}</span>
                      <span className={`priority-badge ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority} Priority
                      </span>
                    </div>
                    <h3 className="suggestion-title">{suggestion.title}</h3>
                    <p className="suggestion-description">{suggestion.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="tips-section">
              <h2>Quick Tips for Credit Health</h2>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-icon">💡</div>
                  <div className="tip-text">Set up automatic payments to never miss a due date</div>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">📊</div>
                  <div className="tip-text">Check your credit report monthly for errors</div>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">💰</div>
                  <div className="tip-text">Keep credit card balances below 30% of limit</div>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🎯</div>
                  <div className="tip-text">Avoid applying for multiple loans at once</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CreditImprovement;
