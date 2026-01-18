import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanAPI } from '../services/api';
import './Apply.css';

function Apply() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    age: 28,
    income: 1200000,
    loan_amount: 2560000,
    loan_tenure_months: 36,
    avg_dpd_per_delinquency: 20,
    delinquency_ratio: 30,
    credit_utilization_ratio: 30,
    num_open_accounts: 2,
    residence_type: 'Owned',
    loan_purpose: 'Education',
    loan_type: 'Unsecured',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('type') || name.includes('purpose') ? value : parseFloat(value) || value,
    });
    setError('');
    setResult(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    navigate('/');
  };

  const loanToIncomeRatio = formData.income > 0 ? (formData.loan_amount / formData.income).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await loanAPI.applyForLoan(formData, user.id);
      console.log('Application response:', response);
      
      if (response.success) {
        setResult(response);
      }
    } catch (err) {
      console.error('Application error:', err);
      setError(err.response?.data?.detail || 'Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="apply-page">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">💳</div>
            <span className="logo-text">LoanSewa</span>
          </div>
          <nav className="nav-menu">
            <button 
              className="nav-item active"
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

      <div className="apply-container">
        <div className="apply-header">
          <h1>Loan Application</h1>
          <p className="apply-subtitle">Fill in your details for credit risk assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="apply-form">
          <div className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Income</label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  min="0"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Loan Amount</label>
                <input
                  type="number"
                  name="loan_amount"
                  value={formData.loan_amount}
                  onChange={handleChange}
                  min="0"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loan to Income Ratio</label>
                <input
                  type="text"
                  value={loanToIncomeRatio}
                  readOnly
                  className="form-input readonly"
                />
              </div>

              <div className="form-group">
                <label>Loan Tenure (months)</label>
                <input
                  type="number"
                  name="loan_tenure_months"
                  value={formData.loan_tenure_months}
                  onChange={handleChange}
                  min="0"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Avg DPD</label>
                <input
                  type="number"
                  name="avg_dpd_per_delinquency"
                  value={formData.avg_dpd_per_delinquency}
                  onChange={handleChange}
                  min="0"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Delinquency Ratio (%)</label>
                <input
                  type="number"
                  name="delinquency_ratio"
                  value={formData.delinquency_ratio}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Credit Utilization Ratio (%)</label>
                <input
                  type="number"
                  name="credit_utilization_ratio"
                  value={formData.credit_utilization_ratio}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Open Loan Accounts</label>
                <input
                  type="number"
                  name="num_open_accounts"
                  value={formData.num_open_accounts}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Residence Type</label>
                <select
                  name="residence_type"
                  value={formData.residence_type}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="Owned">Owned</option>
                  <option value="Rented">Rented</option>
                  <option value="Mortgage">Mortgage</option>
                </select>
              </div>

              <div className="form-group">
                <label>Loan Purpose</label>
                <select
                  name="loan_purpose"
                  value={formData.loan_purpose}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="Education">Education</option>
                  <option value="Home">Home</option>
                  <option value="Auto">Auto</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div className="form-group">
                <label>Loan Type</label>
                <select
                  name="loan_type"
                  value={formData.loan_type}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="Unsecured">Unsecured</option>
                  <option value="Secured">Secured</option>
                </select>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-calculate" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Risk'}
          </button>
        </form>

        {result && (
          <div className="result-section">
            <h2>Credit Risk Assessment</h2>
            <div className="result-grid">
              <div className={`result-card ${result.application.status.toLowerCase()}`}>
                <div className="result-label">Application Status</div>
                <div className="result-value">{result.application.status}</div>
              </div>
              <div className="result-card">
                <div className="result-label">Default Probability</div>
                <div className="result-value">
                  {(result.application.default_probability * 100).toFixed(2)}%
                </div>
              </div>
              <div className="result-card">
                <div className="result-label">Credit Score</div>
                <div className="result-value large">{result.application.credit_score}</div>
              </div>
              <div className="result-card">
                <div className="result-label">Rating</div>
                <div className="result-value">{result.application.rating}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Apply;
