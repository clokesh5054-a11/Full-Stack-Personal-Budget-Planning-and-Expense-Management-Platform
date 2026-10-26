import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ShieldCheck,
  PieChart,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle,
  Bell,
  Lock
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-tag">
          <Sparkles size={16} />
          <span>Smart Personal Finance for Students</span>
        </div>
        <h1 className="hero-title">
          Take Control of Your Pocket Money with <span className="highlight-text">BudgetBuddy</span>
        </h1>
        <p className="hero-description">
          A modern finance management web app designed specifically for college students.
          Track daily expenses, set monthly spending limits, configure savings goals, and build lifelong financial discipline.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-hero-primary">
              <span>Go to My Dashboard</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <div className="hero-btn-group">
              <Link to="/register" className="btn-hero-primary">
                <span>Create Free Student Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-hero-secondary">
                <span>Sign In to Your Account</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Key Application Features */}
      <section className="highlights-section">
        <div className="highlight-header">
          <h2>Everything You Need for Campus Finance</h2>
          <p>Simple, secure, and tailored to student life</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-blue">
              <ShieldCheck size={24} />
            </div>
            <h3>Role-Based Security</h3>
            <p>
              Industry-standard JWT authentication keeping your financial data private.
              Customized views for students, premium users, and platform administrators.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-green">
              <Wallet size={24} />
            </div>
            <h3>Income & Pocket Money</h3>
            <p>
              Set up your monthly baseline stipend or pocket money. Track multiple income sources
              including allowances, scholarships, and freelance earnings.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-purple">
              <PieChart size={24} />
            </div>
            <h3>Monthly Budget Limits</h3>
            <p>
              Categorize expenses by food, travel, shopping, and campus needs. Get alerted before you
              overspend your monthly allowance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-blue">
              <Target size={24} />
            </div>
            <h3>Target Savings Goals</h3>
            <p>
              Save towards your next laptop, campus trip, or emergency fund with real-time progress
              visualization and deadline reminders.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-green">
              <Bell size={24} />
            </div>
            <h3>Smart Notifications</h3>
            <p>
              Automated alerts when your spending reaches 80% of your category limit, plus periodic
              nudges to keep your savings on track.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-purple">
              <Lock size={24} />
            </div>
            <h3>Safe & Private</h3>
            <p>
              Protected by encrypted sessions, strict CORS policies, and secure password hashing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
