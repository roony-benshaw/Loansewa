import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🏦</div>
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
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up with your basic details</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Submit Documents</h3>
            <p>Upload required documents securely</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Approved</h3>
            <p>Instant AI-powered credit assessment</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Receive Funds</h3>
            <p>Money transferred to your account</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
