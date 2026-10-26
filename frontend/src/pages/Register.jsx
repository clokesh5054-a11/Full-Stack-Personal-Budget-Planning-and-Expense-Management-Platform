import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'STUDENT',
    phone_number: '',
    password: '',
    confirm_password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    setLocalError('');
    setIsLoading(true);

    const result = await register(formData);
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setLocalError(result.error || "Failed to register. Please try again.");
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserPlus size={26} />
          </div>
          <h2>Create BudgetBuddy Account</h2>
          <p className="auth-subtitle">Register to manage your student finances and monthly budget</p>
        </div>

        {localError && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{localError}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form grid-form">
          <div className="form-group">
            <label htmlFor="reg-username">Username *</label>
            <input
              id="reg-username"
              type="text"
              name="username"
              placeholder="e.g. priya_campus"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">College / Personal Email *</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="priya@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-first-name">First Name</label>
            <input
              id="reg-first-name"
              type="text"
              name="first_name"
              placeholder="Priya"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-last-name">Last Name</label>
            <input
              id="reg-last-name"
              type="text"
              name="last_name"
              placeholder="Nair"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Account Type *</label>
            <select
              id="reg-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="STUDENT">Student (Standard Pocket Money & Expenses)</option>
              <option value="PREMIUM">Premium User (Advanced Goals & Analytics)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">Phone Number</label>
            <input
              id="reg-phone"
              type="tel"
              name="phone_number"
              placeholder="9876543210"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password *</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm-password">Confirm Password *</label>
            <input
              id="reg-confirm-password"
              type="password"
              name="confirm_password"
              placeholder="Re-enter password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-full-width">
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Setting Up Account..." : "Create Account & Sign In"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
