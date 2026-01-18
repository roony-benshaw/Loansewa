import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Dashboard state
  const [stats, setStats] = useState({});
  const [pendingApplications, setPendingApplications] = useState([]);
  
  // History state
  const [history, setHistory] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  
  // Insights state
  const [insights, setInsights] = useState({});
  
  // Users state
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(adminData));
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const [statsRes, pendingRes, usersRes, insightsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/dashboard/stats'),
        axios.get('http://localhost:8000/api/admin/applications/pending'),
        axios.get('http://localhost:8000/api/admin/users'),
        axios.get('http://localhost:8000/api/admin/analytics/insights')
      ]);
      
      setStats(statsRes.data);
      setPendingApplications(pendingRes.data);
      setUsers(usersRes.data);
      setInsights(insightsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const handleApprove = async (appId) => {
    try {
      await axios.post(`http://localhost:8000/api/admin/applications/${appId}/approve`, {}, {
        params: { admin_id: admin.id }
      });
      alert('Application approved successfully');
      fetchAllData();
    } catch (err) {
      alert('Error approving application: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleReject = async (appId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await axios.post(`http://localhost:8000/api/admin/applications/${appId}/reject`, {
        rejection_reason: reason
      }, {
        params: { admin_id: admin.id }
      });
      alert('Application rejected successfully');
      fetchAllData();
    } catch (err) {
      alert('Error rejecting application: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/applications/history', {
        params: historyFilters
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, historyFilters]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all associated applications?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      alert('Error deleting user: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  if (loading || !admin) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard-page">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <div className="admin-logo-icon">🔐</div>
            <span className="admin-logo-text">LoanSewa Admin</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="sidebar-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="sidebar-icon">📜</span>
            <span>History</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <span className="sidebar-icon">📈</span>
            <span>Loan Insights</span>
          </button>
          <button
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="sidebar-icon">⚙️</span>
            <span>Settings</span>
          </button>
          <button
            className="sidebar-item logout-btn"
            onClick={handleLogout}
          >
            <span className="sidebar-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-top-bar">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="admin-profile">
            <span className="admin-name">Welcome, {admin.full_name}</span>
            <div className="admin-avatar">👤</div>
          </div>
        </header>

        <div className="admin-content">
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon" style={{background: '#dbeafe'}}>👥</div>
                  <div className="kpi-content">
                    <div className="kpi-label">Total Users</div>
                    <div className="kpi-value">{stats.total_users || 0}</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{background: '#d1fae5'}}>✅</div>
                  <div className="kpi-content">
                    <div className="kpi-label">Approved Loans</div>
                    <div className="kpi-value">{stats.approved_count || 0}</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{background: '#fee2e2'}}>❌</div>
                  <div className="kpi-content">
                    <div className="kpi-label">Rejected Loans</div>
                    <div className="kpi-value">{stats.rejected_count || 0}</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{background: '#fef3c7'}}>⏳</div>
                  <div className="kpi-content">
                    <div className="kpi-label">Pending Loans</div>
                    <div className="kpi-value">{stats.pending_count || 0}</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{background: '#e9d5ff'}}>💰</div>
                  <div className="kpi-content">
                    <div className="kpi-label">Total Disbursed</div>
                    <div className="kpi-value">₹{((stats.total_disbursed || 0) / 100000).toFixed(2)}L</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{background: '#d1fae5'}}>💸</div>
                  <div className="kpi-content">
                    <div className="kpi-label">Total Repaid</div>
                    <div className="kpi-value">₹{((stats.total_repaid || 0) / 100000).toFixed(2)}L</div>
                  </div>
                </div>
              </div>

              <div className="section-title">
                <h2>Pending Loan Applications</h2>
                <span className="badge">{pendingApplications.length} Applications</span>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Member Name</th>
                      <th>Email</th>
                      <th>Loan Amount</th>
                      <th>Credit Score</th>
                      <th>Eligibility</th>
                      <th>Loan Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApplications.map(app => (
                      <tr key={app.id}>
                        <td>{app.user_name}</td>
                        <td>{app.user_email}</td>
                        <td>₹{(app.loan_amount / 100000).toFixed(2)}L</td>
                        <td>
                          <span className="score-badge">{app.credit_score}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${app.rating?.toLowerCase()}`}>
                            {app.rating}
                          </span>
                        </td>
                        <td>{app.loan_type}</td>
                        <td className="actions-cell">
                          <button
                            className="approve-btn"
                            onClick={() => handleApprove(app.id)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleReject(app.id)}
                          >
                            ✗ Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingApplications.length === 0 && (
                  <div className="no-data">No pending applications</div>
                )}
              </div>
            </>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <>
              <div className="filters-bar">
                <input
                  type="text"
                  placeholder="Search by member name..."
                  className="search-input"
                  value={historyFilters.search}
                  onChange={(e) => setHistoryFilters({...historyFilters, search: e.target.value})}
                />
                <select
                  className="filter-select"
                  value={historyFilters.status}
                  onChange={(e) => setHistoryFilters({...historyFilters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <input
                  type="date"
                  className="filter-date"
                  value={historyFilters.startDate}
                  onChange={(e) => setHistoryFilters({...historyFilters, startDate: e.target.value})}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  className="filter-date"
                  value={historyFilters.endDate}
                  onChange={(e) => setHistoryFilters({...historyFilters, endDate: e.target.value})}
                  placeholder="End Date"
                />
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Member Name</th>
                      <th>Loan Amount</th>
                      <th>Status</th>
                      <th>Credit Score</th>
                      <th>Disbursed</th>
                      <th>Repaid</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(app => (
                      <tr key={app.id}>
                        <td>{new Date(app.created_at).toLocaleDateString()}</td>
                        <td>{app.user_name}</td>
                        <td>₹{(app.loan_amount / 100000).toFixed(2)}L</td>
                        <td>
                          <span className={`status-badge ${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>{app.credit_score}</td>
                        <td>{app.disbursed_amount ? `₹${(app.disbursed_amount / 100000).toFixed(2)}L` : '-'}</td>
                        <td>{app.repaid_amount ? `₹${(app.repaid_amount / 100000).toFixed(2)}L` : '-'}</td>
                        <td>{app.rejection_reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {history.length === 0 && (
                  <div className="no-data">No history found</div>
                )}
              </div>
            </>
          )}

          {/* Insights */}
          {activeTab === 'insights' && (
            <>
              <div className="insights-grid">
                {/* Disbursed vs Repaid */}
                <div className="insight-card">
                  <h3>Amount Disbursed vs Repaid</h3>
                  <div className="insight-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Disbursed</span>
                      <span className="stat-value">₹{((insights.disbursed_vs_repaid?.total_disbursed || 0) / 100000).toFixed(2)}L</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Repaid</span>
                      <span className="stat-value">₹{((insights.disbursed_vs_repaid?.total_repaid || 0) / 100000).toFixed(2)}L</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Outstanding</span>
                      <span className="stat-value">₹{((insights.disbursed_vs_repaid?.outstanding || 0) / 100000).toFixed(2)}L</span>
                    </div>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div className="insight-card">
                  <h3>Risk Distribution</h3>
                  <div className="risk-chart">
                    <div className="risk-bar" style={{width: '100%'}}>
                      <div className="risk-segment low" style={{width: `${(insights.risk_distribution?.low_risk || 0) / (insights.risk_distribution?.low_risk + insights.risk_distribution?.medium_risk + insights.risk_distribution?.high_risk || 1) * 100}%`}}>
                        <span>Low: {insights.risk_distribution?.low_risk || 0}</span>
                      </div>
                      <div className="risk-segment medium" style={{width: `${(insights.risk_distribution?.medium_risk || 0) / (insights.risk_distribution?.low_risk + insights.risk_distribution?.medium_risk + insights.risk_distribution?.high_risk || 1) * 100}%`}}>
                        <span>Medium: {insights.risk_distribution?.medium_risk || 0}</span>
                      </div>
                      <div className="risk-segment high" style={{width: `${(insights.risk_distribution?.high_risk || 0) / (insights.risk_distribution?.low_risk + insights.risk_distribution?.medium_risk + insights.risk_distribution?.high_risk || 1) * 100}%`}}>
                        <span>High: {insights.risk_distribution?.high_risk || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Score Distribution */}
                <div className="insight-card full-width">
                  <h3>Credit Score Distribution</h3>
                  <div className="score-distribution">
                    {Object.entries(insights.credit_score_distribution || {}).map(([range, count]) => (
                      <div key={range} className="score-bar-item">
                        <div className="score-range">{range}</div>
                        <div className="score-bar-bg">
                          <div className="score-bar-fill" style={{width: `${(count / Math.max(...Object.values(insights.credit_score_distribution || {}), 1)) * 100}%`}}>
                            {count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active vs Closed */}
                <div className="insight-card">
                  <h3>Active vs Closed Loans</h3>
                  <div className="pie-chart">
                    <div className="pie-stat">
                      <span className="pie-label">Active</span>
                      <span className="pie-value">{insights.active_vs_closed?.active || 0}</span>
                    </div>
                    <div className="pie-stat">
                      <span className="pie-label">Closed</span>
                      <span className="pie-value">{insights.active_vs_closed?.closed || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <>
              <div className="settings-section">
                <h2>Admin Profile</h2>
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Full Name:</span>
                    <span className="info-value">{admin.full_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{admin.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Mobile:</span>
                    <span className="info-value">{admin.mobile_number}</span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2>User Management</h2>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.full_name}</td>
                          <td>{user.email}</td>
                          <td>{user.mobile_number}</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
