import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, UserCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setLocalError("Please enter your username/email and password.");
      return;
    }

    setLocalError('');
    setIsLoading(true);

    const result = await login(usernameOrEmail, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setLocalError(result.error || "Login failed. Please verify credentials.");
    }
  };

  // Helper for quick demo testing
  const handleQuickFill = (user, pass) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setLocalError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <LogIn size={26} />
          </div>
          <h2>Welcome to BudgetBuddy</h2>
          <p className="auth-subtitle">Sign in with your JWT-secured student account</p>
        </div>

        {localError && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-identity">Username or Email</label>
            <input
              id="login-identity"
              type="text"
              placeholder="e.g. rahul_student or email@college.edu"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Sign In with JWT"}
          </button>
        </form>

        <div className="quick-demo-section">
          <p className="quick-demo-title">
            <UserCheck size={14} /> Quick Demo Accounts:
          </p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo-pill student"
              onClick={() => handleQuickFill('rahul_student', 'Student@123')}
            >
              Student (Rahul)
            </button>
            <button
              type="button"
              className="btn-demo-pill premium"
              onClick={() => handleQuickFill('ananya_pro', 'Premium@123')}
            >
              Premium (Ananya)
            </button>
            <button
              type="button"
              className="btn-demo-pill admin"
              onClick={() => handleQuickFill('admin', 'Admin@12345')}
            >
              Admin
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
