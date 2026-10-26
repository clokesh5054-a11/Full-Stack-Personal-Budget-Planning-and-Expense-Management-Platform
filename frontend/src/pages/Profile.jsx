import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Wallet, Bell, Target, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    monthly_income: '0.00',
    currency: 'INR',
    financial_goals_note: '',
    bio: '',
    notification_preferences: {
      budget_alert_threshold: 80,
      email_notifications: true,
      savings_reminders: true,
      monthly_summary_report: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        monthly_income: profile.monthly_income || '0.00',
        currency: profile.currency || 'INR',
        financial_goals_note: profile.financial_goals_note || '',
        bio: profile.bio || '',
        notification_preferences: {
          budget_alert_threshold: profile.notification_preferences?.budget_alert_threshold ?? 80,
          email_notifications: profile.notification_preferences?.email_notifications ?? true,
          savings_reminders: profile.notification_preferences?.savings_reminders ?? true,
          monthly_summary_report: profile.notification_preferences?.monthly_summary_report ?? true,
        },
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: !prev.notification_preferences[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    const res = await updateProfile(formData);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess("Financial profile settings saved successfully!");
      setTimeout(() => setSaveSuccess(''), 4000);
    } else {
      setSaveError("Failed to update profile settings.");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={36} />
          </div>
          <div className="profile-titles">
            <h2>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</h2>
            <div className="profile-meta">
              <span>{user?.email}</span>
              <span className="dot">•</span>
              <span className={`role-pill badge-${user?.role?.toLowerCase() || 'student'}`}>
                {user?.role || 'STUDENT'}
              </span>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="alert-success">
            <CheckCircle2 size={18} />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Section 1: Financial Baseline Setup */}
          <div className="form-section">
            <div className="section-header">
              <Wallet size={18} />
              <h3>Monthly Income Setup</h3>
            </div>
            <p className="section-subtext">
              Set your expected student allowance, pocket money, or monthly stipend to establish your budget baseline.
            </p>

            <div className="grid-2-col">
              <div className="form-group">
                <label htmlFor="monthly-income">Expected Monthly Income / Pocket Money</label>
                <input
                  id="monthly-income"
                  type="number"
                  step="0.01"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  placeholder="5000.00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency Preference</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Bio */}
          <div className="form-section">
            <div className="section-header">
              <Target size={18} />
              <h3>Financial Goals & Notes</h3>
            </div>

            <div className="form-group">
              <label htmlFor="goals-note">Savings Goals & Aspirations</label>
              <textarea
                id="goals-note"
                name="financial_goals_note"
                rows="3"
                value={formData.financial_goals_note}
                onChange={handleChange}
                placeholder="e.g. Save ₹20,000 for a new coding laptop and semester exam study materials."
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">About You / Bio</label>
              <input
                id="bio"
                type="text"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Computer Science Undergraduate, Class of 2027"
              />
            </div>
          </div>

          {/* Section 3: Notification Preferences */}
          <div className="form-section">
            <div className="section-header">
              <Bell size={18} />
              <h3>Notification & Alert Preferences</h3>
            </div>
            <p className="section-subtext">
              Choose alerts to receive when nearing budget limits or saving targets.
            </p>

            <div className="checkbox-list">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.notification_preferences.email_notifications}
                  onChange={() => handleNotificationToggle('email_notifications')}
                />
                <div>
                  <strong>Email Alerts & Monthly Summaries</strong>
                  <span>Receive monthly reports and digest updates</span>
                </div>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.notification_preferences.savings_reminders}
                  onChange={() => handleNotificationToggle('savings_reminders')}
                />
                <div>
                  <strong>Savings Goal Reminders</strong>
                  <span>Periodic nudges to deposit into your savings target</span>
                </div>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.notification_preferences.monthly_summary_report}
                  onChange={() => handleNotificationToggle('monthly_summary_report')}
                />
                <div>
                  <strong>Automated Month-End Reports</strong>
                  <span>Generate monthly expense breakdowns automatically</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? "Saving Settings..." : "Save Financial Preferences"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
