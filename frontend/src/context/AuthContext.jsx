import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state on load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('budgetbuddy_access_token');
      const storedUser = localStorage.getItem('budgetbuddy_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Fetch latest user details and profile
          const userRes = await api.get('/api/auth/me/');
          setUser(userRes.data);
          localStorage.setItem('budgetbuddy_user', JSON.stringify(userRes.data));

          const profileRes = await api.get('/api/auth/profile/');
          setProfile(profileRes.data);
        } catch (err) {
          console.error("Session initialization failed:", err);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (usernameOrEmail, password) => {
    setAuthError(null);
    try {
      const response = await api.post('/api/auth/login/', {
        username_or_email: usernameOrEmail,
        password: password,
      });

      const { tokens, user: userData } = response.data;
      localStorage.setItem('budgetbuddy_access_token', tokens.access);
      localStorage.setItem('budgetbuddy_refresh_token', tokens.refresh);
      localStorage.setItem('budgetbuddy_user', JSON.stringify(userData));

      setUser(userData);
      if (userData.profile) {
        setProfile(userData.profile);
      }
      return { success: true };
    } catch (err) {
      const errorMsg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Unable to log in. Please check your credentials.";
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Register handler
  const register = async (formData) => {
    setAuthError(null);
    try {
      const response = await api.post('/api/auth/register/', formData);
      const { tokens, user: userData } = response.data;

      localStorage.setItem('budgetbuddy_access_token', tokens.access);
      localStorage.setItem('budgetbuddy_refresh_token', tokens.refresh);
      localStorage.setItem('budgetbuddy_user', JSON.stringify(userData));

      setUser(userData);
      if (userData.profile) {
        setProfile(userData.profile);
      }
      return { success: true };
    } catch (err) {
      const backendErrors = err.response?.data;
      let errorMsg = "Registration failed. Please check the inputs.";
      if (typeof backendErrors === 'object') {
        const firstKey = Object.keys(backendErrors)[0];
        if (firstKey) {
          const detail = backendErrors[firstKey];
          errorMsg = Array.isArray(detail) ? `${firstKey}: ${detail[0]}` : String(detail);
        }
      }
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile/', profileData);
      setProfile(response.data.profile);
      return { success: true, profile: response.data.profile };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || "Failed to update profile settings.",
      };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('budgetbuddy_refresh_token');
      if (refreshToken) {
        await api.post('/api/auth/logout/', { refresh: refreshToken });
      }
    } catch (err) {
      console.warn("Logout notification issue:", err);
    } finally {
      localStorage.removeItem('budgetbuddy_access_token');
      localStorage.removeItem('budgetbuddy_refresh_token');
      localStorage.removeItem('budgetbuddy_user');
      setUser(null);
      setProfile(null);
    }
  };

  const value = {
    user,
    profile,
    loading,
    authError,
    isAuthenticated: !!user,
    login,
    register,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
