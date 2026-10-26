import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', class: 'badge-admin' };
      case 'PREMIUM':
        return { label: 'Premium User', class: 'badge-premium' };
      default:
        return { label: 'Student', class: 'badge-student' };
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon-wrapper">
            <Wallet size={22} className="logo-icon" />
          </div>
          <div>
            <span className="logo-title">BudgetBuddy</span>
            <span className="logo-subtitle">Student Expense Management</span>
          </div>
        </Link>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="nav-logged-in">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/profile" className="nav-link">
                <User size={16} />
                <span>Profile & Settings</span>
              </Link>

              {user && (
                <div className="user-profile-badge">
                  <span className="user-name">{user.first_name || user.username}</span>
                  <span className={`role-pill ${getRoleBadge(user.role).class}`}>
                    {getRoleBadge(user.role).label}
                  </span>
                </div>
              )}

              <button onClick={handleLogout} className="btn-logout" title="Sign out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
