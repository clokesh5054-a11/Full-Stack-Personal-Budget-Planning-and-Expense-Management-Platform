import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Award,
  Briefcase,
  Gift,
  Coins,
  DollarSign,
  MoreHorizontal
} from 'lucide-react';

const INCOME_CATEGORIES = [
  { value: 'POCKET_MONEY', label: 'Pocket Money', icon: Coins, color: '#34d399' },
  { value: 'SCHOLARSHIP', label: 'Scholarship', icon: Award, color: '#818cf8' },
  { value: 'FREELANCE', label: 'Freelance Gig', icon: Briefcase, color: '#38bdf8' },
  { value: 'PART_TIME', label: 'Part-time Job', icon: DollarSign, color: '#fbbf24' },
  { value: 'ALLOWANCE', label: 'Allowance', icon: Coins, color: '#a78bfa' },
  { value: 'GIFTS', label: 'Gifts', icon: Gift, color: '#f472b6' },
  { value: 'OTHER', label: 'Other', icon: MoreHorizontal, color: '#9ca3af' },
];

const Incomes = () => {
  const { profile } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'POCKET_MONEY',
    date: todayStr,
    description: '',
  });

  const currencySymbol = profile?.currency === 'USD' ? '$' : profile?.currency === 'EUR' ? '€' : '₹';

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/api/finance/incomes/', { params });
      const data = res.data.results ? res.data.results : res.data;
      setIncomes(data);
    } catch (err) {
      console.error("Failed to load incomes:", err);
      setError("Unable to load incomes. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [selectedCategory, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setFormData({
      title: '',
      amount: '',
      category: 'POCKET_MONEY',
      date: todayStr,
      description: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (income) => {
    setEditingIncome(income);
    setFormData({
      title: income.title,
      amount: income.amount,
      category: income.category,
      date: income.date,
      description: income.description || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingIncome) {
        await api.put(`/api/finance/incomes/${editingIncome.id}/`, formData);
        setSuccess("Income entry updated successfully!");
      } else {
        await api.post('/api/finance/incomes/', formData);
        setSuccess("Income recorded successfully!");
      }
      setIsModalOpen(false);
      fetchIncomes();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save income. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income entry?")) return;

    try {
      await api.delete(`/api/finance/incomes/${id}/`);
      setSuccess("Income entry removed successfully!");
      fetchIncomes();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete income.");
    }
  };

  const totalIncomeAmount = incomes.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <div className="finance-page-container">
      {/* Top Banner */}
      <div className="page-header-row">
        <div>
          <h2>Student Income & Pocket Money</h2>
          <p className="page-header-subtitle">
            Log monthly family allowances, academic scholarships, and student freelance earnings.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-add-primary">
          <Plus size={18} />
          <span>Add Income</span>
        </button>
      </div>

      {success && (
        <div className="alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Card & Controls */}
      <div className="finance-summary-grid">
        <div className="stat-card stat-income">
          <span className="stat-label">Total Filtered Income</span>
          <div className="stat-amount">
            {currencySymbol} {totalIncomeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-meta">{incomes.length} source(s) logged</span>
        </div>

        <div className="filters-card">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search income (e.g. Allowance, Scholarship, Freelance)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-pill-filter">
            <button
              className={`pill-btn ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All Sources
            </button>
            {INCOME_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`pill-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="finance-table-card">
        {loading ? (
          <div className="loading-state">
            <p>Loading income records...</p>
          </div>
        ) : incomes.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={44} className="empty-icon" />
            <h3>No income logged yet</h3>
            <p>Click "+ Add Income" above to log your pocket money or stipend.</p>
          </div>
        ) : (
          <div className="transaction-list">
            {incomes.map((item) => {
              const catObj = INCOME_CATEGORIES.find((c) => c.value === item.category) || {};
              const CatIcon = catObj.icon || TrendingUp;

              return (
                <div key={item.id} className="transaction-row">
                  <div className="tx-left">
                    <div className="tx-icon-wrapper" style={{ backgroundColor: `${catObj.color || '#10b981'}22`, color: catObj.color || '#34d399' }}>
                      <CatIcon size={20} />
                    </div>
                    <div className="tx-info">
                      <h4 className="tx-title">{item.title}</h4>
                      <div className="tx-meta">
                        <span className="cat-tag">{item.category_display}</span>
                        <span className="dot">•</span>
                        <span className="date-tag">{item.date}</span>
                      </div>
                      {item.description && <p className="tx-notes">{item.description}</p>}
                    </div>
                  </div>

                  <div className="tx-right">
                    <span className="tx-amount positive">
                      +{currencySymbol} {parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="tx-actions">
                      <button onClick={() => handleOpenEditModal(item)} className="btn-icon" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn-icon danger" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editingIncome ? 'Edit Income' : 'Log Income / Pocket Money'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title / Source *</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Pocket Money from Home"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label>Amount ({currencySymbol}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="8000.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date Received *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description / Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Received at beginning of the month"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : editingIncome ? 'Update Income' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incomes;
