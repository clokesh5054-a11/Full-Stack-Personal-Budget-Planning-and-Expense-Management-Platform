import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  PieChart,
  Target,
  Bell,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [serviceStatus, setServiceStatus] = useState(null);

  useEffect(() => {
    const fetchServiceStatus = async () => {
      try {
        const res = await api.get('/api/finance/overview/');
        setServiceStatus(res.data);
      } catch (err) {
        console.error("Service check failed:", err);
      }
    };

    fetchServiceStatus();
  }, []);

  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '₹';
    }
  };

  const symbol = getCurrencySymbol(profile?.currency || 'INR');
  const formattedIncome = parseFloat(profile?.monthly_income || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="greeting-row">
            <h1>Welcome back, {user?.first_name || user?.username}!</h1>
            <span className={`role-pill badge-${user?.role?.toLowerCase() || 'student'}`}>
              {user?.role === 'STUDENT' ? 'Student Plan' : user?.role === 'PREMIUM' ? 'Premium Plan' : 'Admin'}
            </span>
          </div>
          <p className="welcome-subtext">
            Here is your personal finance baseline and pocket money management overview.
          </p>
        </div>

        <div className="quick-actions-bar">
          <Link to="/profile" className="btn-edit-profile">
            <User size={16} />
            <span>Profile & Settings</span>
          </Link>
        </div>
      </div>

      {/* Top Key Financial Metrics */}
      <div className="metrics-grid">
        <div className="metric-card highlight-card">
          <div className="metric-header">
            <span className="metric-label">Monthly Baseline Income</span>
            <div className="metric-icon icon-green">
              <Wallet size={20} />
            </div>
          </div>
          <div className="metric-value">
            {symbol} {formattedIncome}
          </div>
          <p className="metric-footer">
            Expected monthly pocket money & allowance
          </p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Preferred Currency</span>
            <div className="metric-icon icon-blue">
              <span className="currency-badge">{symbol}</span>
            </div>
          </div>
          <div className="metric-value">
            {profile?.currency || 'INR'}
          </div>
          <p className="metric-footer">
            Active display currency for transactions
          </p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Account Security</span>
            <div className="metric-icon icon-purple">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="metric-value status-active">
            Verified
          </div>
          <p className="metric-footer">
            JWT session authenticated & encrypted
          </p>
        </div>
      </div>

      {/* Financial Goals & Preferences Card */}
      <div className="baseline-banner-card">
        <div className="baseline-left">
          <div className="baseline-icon">
            <Target size={24} />
          </div>
          <div>
            <h3>Personal Savings Target & Aspiration</h3>
            <p className="baseline-text">
              {profile?.financial_goals_note
                ? `"${profile.financial_goals_note}"`
                : "No savings target note added yet. Set your target laptop fund or college trip goal in settings!"}
            </p>
          </div>
        </div>
        <Link to="/profile" className="btn-update-baseline">
          <span>Update Goals</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Student Financial Management Modules */}
      <div className="modules-section">
        <div className="modules-header">
          <div>
            <h2>Financial Management Modules</h2>
            <p>Integrated tools to organize your campus spending and savings</p>
          </div>
        </div>

        <div className="modules-grid">
          <div className="module-card">
            <div className="module-top">
              <div className="module-icon-wrap bg-green">
                <TrendingUp size={20} />
              </div>
              <span className="module-badge">Active</span>
            </div>
            <h4>Income & Allowance</h4>
            <p>
              Log monthly pocket money, merit scholarships, part-time jobs, and freelance stipends.
            </p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <div className="module-icon-wrap bg-rose">
                <CreditCard size={20} />
              </div>
              <span className="module-badge">Active</span>
            </div>
            <h4>Daily Expense Tracker</h4>
            <p>
              Categorize spending on food & dining, campus commute, study books, and weekend entertainment.
            </p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <div className="module-icon-wrap bg-amber">
                <PieChart size={20} />
              </div>
              <span className="module-badge">Active</span>
            </div>
            <h4>Monthly Budgets</h4>
            <p>
              Set category limits to keep student expenditures within your monthly pocket money allowance.
            </p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <div className="module-icon-wrap bg-purple">
                <Target size={20} />
              </div>
              <span className="module-badge">Active</span>
            </div>
            <h4>Savings Goals</h4>
            <p>
              Create dedicated target goals with visual completion bars and target deadlines.
            </p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <div className="module-icon-wrap bg-cyan">
                <Bell size={20} />
              </div>
              <span className="module-badge">Active</span>
            </div>
            <h4>Budget Alerts</h4>
            <p>
              Automated in-app reminders when approaching 80% of your category spending limit.
            </p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <div className="module-icon-wrap bg-blue">
                <FileText size={20} />
              </div>
              <span className="module-badge">Active</span>
            </div>
            <h4>Financial Reports</h4>
            <p>
              Monthly statements and spending summaries for reviewing money management discipline.
            </p>
          </div>
        </div>
      </div>

      {/* Account Information Card */}
      <div className="account-info-card">
        <h3>User Account Details</h3>
        <div className="account-details-grid">
          <div className="account-detail-item">
            <span>Username:</span>
            <strong>{user?.username}</strong>
          </div>
          <div className="account-detail-item">
            <span>Email Address:</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="account-detail-item">
            <span>Contact Number:</span>
            <strong>{user?.phone_number || 'Not provided'}</strong>
          </div>
          <div className="account-detail-item">
            <span>Account Role:</span>
            <strong className="role-text">{user?.role}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
