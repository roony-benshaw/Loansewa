import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">💳</div>
          <span className="logo-text">LoanSewa</span>
        </div>
        <div className="header-buttons">
          <button className="btn-login" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="btn-signup" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Fast, Transparent,
            <br />
            <span className="hero-highlight">Digital Loans</span>
          </h1>
          <p className="hero-subtitle">
            Empowering citizens with AI-driven credit assessment and instant loan approvals
          </p>
          <button className="btn-apply" onClick={() => navigate('/signup')}>
            Apply Now
            <span className="arrow">→</span>
          </button>
        </div>
        <div className="hero-background"></div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple, transparent process from application to disbursement</p>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Apply Online</h3>
            <p>Fill simple digital application with basic details and documents</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Credit Scoring</h3>
            <p>Our system analyzes your business health and repayment capacity</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Approved</h3>
            <p>Receive instant decision and quick disbursement to your account</p>
          </div>
        </div>
      </section>

      <section className="why-choose">
        <h2 className="section-title">Why Choose LoanSewa?</h2>
        <p className="section-subtitle">Experience the future of digital lending with our innovative platform</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Approval</h3>
            <p>Get loan decisions in minutes, not days, with our AI-powered assessment</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure Platform</h3>
            <p>Bank-grade security ensures your data and transactions are protected</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>AI-Driven Analysis</h3>
            <p>Smart algorithms assess creditworthiness beyond traditional methods</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Minimal Documentation</h3>
            <p>Simple paperwork with easy upload process - no hassle, no delays</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Flexible Terms</h3>
            <p>Customized repayment plans that fit your business cash flow</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Transparent Process</h3>
            <p>Clear terms, no hidden fees - know exactly what you're getting</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">💳</div>
              <span className="logo-text">LoanSewa</span>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#compliance">Compliance</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Admin</h4>
              <ul>
                <li><a href="/admin/login" className="admin-link">Admin Login</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 LoanSewa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
