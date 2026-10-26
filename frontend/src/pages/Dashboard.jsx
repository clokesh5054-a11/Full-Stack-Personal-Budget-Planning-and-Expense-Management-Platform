import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  PieChart,
  ArrowRight,
  PlusCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Utensils,
  Car,
  ShoppingBag,
  BookOpen,
  Film,
  Zap,
  MoreHorizontal
} from 'lucide-react';

const CATEGORY_ICONS = {
  FOOD: Utensils,
  TRAVEL: Car,
  SHOPPING: ShoppingBag,
  EDUCATION: BookOpen,
  ENTERTAINMENT: Film,
  BILLS: Zap,
  MISCELLANEOUS: MoreHorizontal,
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/finance/stats/', {
          params: { month: currentMonth, year: currentYear },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '₹';
    }
  };

  const symbol = getCurrencySymbol(profile?.currency || stats?.currency || 'INR');

  const monthlyIncome = stats?.monthly_income ?? 0;
  const monthlyExpense = stats?.monthly_expense ?? 0;
  const monthlyBalance = stats?.monthly_balance ?? 0;

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
            Here is your current monthly budget and pocket money overview for October {currentYear}.
          </p>
        </div>

        <div className="quick-actions-bar">
          <Link to="/expenses" className="btn-action-pill expense">
            <CreditCard size={15} />
            <span>Record Expense</span>
          </Link>
          <Link to="/incomes" className="btn-action-pill income">
            <TrendingUp size={15} />
            <span>Log Income</span>
          </Link>
          <Link to="/budgets" className="btn-action-pill budget">
            <PieChart size={15} />
            <span>Manage Budgets</span>
          </Link>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card income-metric">
          <div className="metric-header">
            <span className="metric-label">Monthly Income / Pocket Money</span>
            <div className="metric-icon icon-green">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">
            {symbol} {monthlyIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="metric-footer">
            Total allowances & earnings received this month
          </p>
        </div>

        <div className="metric-card expense-metric">
          <div className="metric-header">
            <span className="metric-label">Total Monthly Expenses</span>
            <div className="metric-icon icon-rose">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="metric-value">
            {symbol} {monthlyExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="metric-footer">
            Tracked spending across all campus categories
          </p>
        </div>

        <div className="metric-card balance-metric">
          <div className="metric-header">
            <span className="metric-label">Remaining Pocket Money</span>
            <div className="metric-icon icon-blue">
              <Wallet size={20} />
            </div>
          </div>
          <div className={`metric-value ${monthlyBalance >= 0 ? 'status-positive' : 'status-negative'}`}>
            {symbol} {monthlyBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="metric-footer">
            Net balance available for the rest of the month
          </p>
        </div>
      </div>

      {/* Two Column Layout: Category Spending & Active Budgets */}
      <div className="dashboard-two-col">
        {/* Left Column: Category Spending Distribution */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h3>Monthly Expense Breakdown</h3>
              <p className="dash-card-sub">Categorized student spending for this month</p>
            </div>
            <Link to="/expenses" className="dash-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {stats?.category_expenses && stats.category_expenses.length > 0 ? (
            <div className="category-spending-list">
              {stats.category_expenses.map((cat, idx) => {
                const Icon = CATEGORY_ICONS[cat.category] || MoreHorizontal;
                return (
                  <div key={idx} className="category-spending-item">
                    <div className="cat-item-top">
                      <div className="cat-title-wrap">
                        <div className="cat-mini-icon">
                          <Icon size={16} />
                        </div>
                        <span className="cat-name">{cat.category_display}</span>
                      </div>
                      <div className="cat-amount-wrap">
                        <strong>{symbol} {cat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        <span className="cat-percent">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="cat-bar-track">
                      <div
                        className="cat-bar-fill"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dash-empty">
              <CreditCard size={36} className="empty-icon-muted" />
              <p>No expenses logged for this month yet.</p>
              <Link to="/expenses" className="btn-dash-action">
                + Add your first expense
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Active Budgets with Live Utilization */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h3>Category Budget Allocations</h3>
              <p className="dash-card-sub">Live utilization and spending thresholds</p>
            </div>
            <Link to="/budgets" className="dash-link">
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {stats?.active_budgets && stats.active_budgets.length > 0 ? (
            <div className="dash-budgets-list">
              {stats.active_budgets.map((b) => {
                const isOver = b.is_over_budget;
                const isNear = b.is_near_limit && !isOver;
                let barColor = '#10b981';
                if (isOver) barColor = '#f43f5e';
                else if (isNear) barColor = '#f59e0b';

                return (
                  <div key={b.id} className="dash-budget-item">
                    <div className="dash-budget-top">
                      <div className="dash-budget-name">
                        <strong>{b.category_display}</strong>
                        {isOver && (
                          <span className="overbudget-pill">
                            <AlertTriangle size={12} /> Over Limit
                          </span>
                        )}
                        {isNear && (
                          <span className="nearlimit-pill">
                            Nearing Limit
                          </span>
                        )}
                      </div>
                      <span className="dash-budget-vals">
                        {symbol} {b.spent_amount.toFixed(0)} / {symbol} {b.amount_limit}
                      </span>
                    </div>

                    <div className="cat-bar-track">
                      <div
                        className="cat-bar-fill"
                        style={{
                          width: `${Math.min(b.utilization_percentage, 100)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>

                    <div className="dash-budget-footer">
                      <span>{b.utilization_percentage}% utilized</span>
                      <span>{symbol} {b.remaining_amount.toFixed(2)} remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dash-empty">
              <PieChart size={36} className="empty-icon-muted" />
              <p>No budgets assigned for this month.</p>
              <Link to="/budgets" className="btn-dash-action">
                + Set category budget
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h3>Recent Financial Transactions</h3>
            <p className="dash-card-sub">Combined feed of latest expenses and incomes</p>
          </div>
          <div className="header-links-group">
            <Link to="/expenses" className="dash-link">Expenses</Link>
            <span className="dot">•</span>
            <Link to="/incomes" className="dash-link">Incomes</Link>
          </div>
        </div>

        {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
          <div className="recent-tx-table">
            {stats.recent_transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} className="recent-tx-row">
                  <div className="recent-tx-left">
                    <div className={`recent-tx-badge ${isIncome ? 'income' : 'expense'}`}>
                      {isIncome ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <h4 className="recent-tx-title">{tx.title}</h4>
                      <span className="recent-tx-cat">{tx.category_display}</span>
                    </div>
                  </div>

                  <div className="recent-tx-right">
                    <span className={`recent-tx-amount ${isIncome ? 'text-positive' : 'text-negative'}`}>
                      {isIncome ? '+' : '-'}{symbol} {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="recent-tx-date">{tx.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dash-empty">
            <Clock size={36} className="empty-icon-muted" />
            <p>No recent transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
