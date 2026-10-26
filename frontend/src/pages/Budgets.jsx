import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Utensils,
  Car,
  ShoppingBag,
  BookOpen,
  Film,
  Zap,
  MoreHorizontal
} from 'lucide-react';

const CATEGORY_MAP = {
  FOOD: { label: 'Food & Dining', icon: Utensils, color: '#f87171' },
  TRAVEL: { label: 'Travel & Transport', icon: Car, color: '#38bdf8' },
  SHOPPING: { label: 'Shopping', icon: ShoppingBag, color: '#fb923c' },
  EDUCATION: { label: 'Education & Books', icon: BookOpen, color: '#818cf8' },
  ENTERTAINMENT: { label: 'Entertainment', icon: Film, color: '#c084fc' },
  BILLS: { label: 'Bills & Utilities', icon: Zap, color: '#facc15' },
  MISCELLANEOUS: { label: 'Miscellaneous', icon: MoreHorizontal, color: '#9ca3af' },
};

const CATEGORIES_LIST = [
  { value: 'FOOD', label: 'Food & Dining' },
  { value: 'TRAVEL', label: 'Travel & Transport' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'EDUCATION', label: 'Education & Books' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'BILLS', label: 'Bills & Utilities' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

const MONTHS = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' },
];

const Budgets = () => {
  const { profile } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'FOOD',
    amount_limit: '',
    month: selectedMonth,
    year: selectedYear,
    alert_threshold_percentage: 80,
  });

  const currencySymbol = profile?.currency === 'USD' ? '$' : profile?.currency === 'EUR' ? '€' : '₹';

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/finance/budgets/', {
        params: { month: selectedMonth, year: selectedYear },
      });
      const data = res.data.results ? res.data.results : res.data;
      setBudgets(data);
    } catch (err) {
      console.error("Failed to load budgets:", err);
      setError("Unable to load budget allocations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleOpenAddModal = () => {
    setEditingBudget(null);
    setFormData({
      category: 'FOOD',
      amount_limit: '',
      month: selectedMonth,
      year: selectedYear,
      alert_threshold_percentage: 80,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount_limit: budget.amount_limit,
      month: budget.month,
      year: budget.year,
      alert_threshold_percentage: budget.alert_threshold_percentage,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount_limit || !formData.category) {
      setError("Please provide an allocation amount limit.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingBudget) {
        await api.put(`/api/finance/budgets/${editingBudget.id}/`, formData);
        setSuccess("Budget allocation updated successfully!");
      } else {
        await api.post('/api/finance/budgets/', formData);
        setSuccess("Category budget established successfully!");
      }
      setIsModalOpen(false);
      fetchBudgets();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Save error:", err);
      const backendErr = err.response?.data?.non_field_errors?.[0] || "A budget for this category and month already exists.";
      setError(backendErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget limit?")) return;

    try {
      await api.delete(`/api/finance/budgets/${id}/`);
      setSuccess("Budget limit removed successfully!");
      fetchBudgets();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete budget limit.");
    }
  };

  // Aggregations
  const totalAllocated = budgets.reduce((sum, b) => sum + parseFloat(b.amount_limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0);
  const totalRemaining = Math.max(totalAllocated - totalSpent, 0);
  const overallUtilization = totalAllocated > 0 ? Math.min(Math.round((totalSpent / totalAllocated) * 100), 100) : 0;

  return (
    <div className="finance-page-container">
      {/* Top Banner */}
      <div className="page-header-row">
        <div>
          <h2>Monthly Budget Planning</h2>
          <p className="page-header-subtitle">
            Establish category-wise spending limits to prevent overspending your pocket money allowance.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-add-primary">
          <Plus size={18} />
          <span>Set Category Budget</span>
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

      {/* Month & Period Selector */}
      <div className="period-selector-row">
        <div className="period-selectors">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="period-dropdown"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="period-dropdown"
          >
            {[2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="period-summary-text">
          Showing budget utilization for {MONTHS.find((m) => m.value === selectedMonth)?.name} {selectedYear}
        </div>
      </div>

      {/* Overall Utilization Summary */}
      <div className="budget-overview-card">
        <div className="budget-overview-stats">
          <div className="stat-item">
            <span>Total Budget Limit</span>
            <strong>
              {currencySymbol} {totalAllocated.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="stat-item">
            <span>Total Spent</span>
            <strong className="spent-val">
              {currencySymbol} {totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="stat-item">
            <span>Remaining Pocket Money</span>
            <strong className="remaining-val">
              {currencySymbol} {totalRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        <div className="overall-bar-wrap">
          <div className="bar-labels">
            <span>Overall Month Utilization</span>
            <span>{overallUtilization}% used</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${overallUtilization >= 80 ? 'fill-danger' : 'fill-primary'}`}
              style={{ width: `${overallUtilization}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="budgets-grid-section">
        {loading ? (
          <div className="loading-state">
            <p>Loading category budgets...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="empty-state">
            <PieChart size={44} className="empty-icon" />
            <h3>No budget limits set for this month</h3>
            <p>Click "+ Set Category Budget" above to assign an allowance limit for food, travel, or shopping.</p>
          </div>
        ) : (
          <div className="budget-cards-grid">
            {budgets.map((b) => {
              const catObj = CATEGORY_MAP[b.category] || {};
              const CatIcon = catObj.icon || PieChart;
              const isOver = b.is_over_budget;
              const isNear = b.is_near_limit && !isOver;

              let barClass = 'bar-safe';
              if (isOver) barClass = 'bar-over';
              else if (isNear) barClass = 'bar-warning';

              return (
                <div key={b.id} className={`budget-card ${isOver ? 'card-overbudget' : ''}`}>
                  <div className="budget-card-header">
                    <div className="cat-badge-wrap">
                      <div className="cat-icon-sq" style={{ backgroundColor: `${catObj.color || '#6366f1'}22`, color: catObj.color || '#818cf8' }}>
                        <CatIcon size={20} />
                      </div>
                      <div>
                        <h4>{b.category_display}</h4>
                        <span className="alert-meta">Alert at {b.alert_threshold_percentage}%</span>
                      </div>
                    </div>

                    <div className="budget-actions">
                      <button onClick={() => handleOpenEditModal(b)} className="btn-icon" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="btn-icon danger" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {isOver && (
                    <div className="overbudget-badge">
                      <AlertTriangle size={14} />
                      <span>Over budget by {currencySymbol} {(b.spent_amount - b.amount_limit).toFixed(2)}</span>
                    </div>
                  )}

                  {isNear && (
                    <div className="near-limit-badge">
                      <AlertCircle size={14} />
                      <span>Approaching limit ({b.utilization_percentage}%)</span>
                    </div>
                  )}

                  <div className="budget-values-row">
                    <div>
                      <span className="lbl">Spent</span>
                      <strong className="val-spent">
                        {currencySymbol} {parseFloat(b.spent_amount).toFixed(2)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="lbl">Monthly Limit</span>
                      <strong className="val-limit">
                        {currencySymbol} {parseFloat(b.amount_limit).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="progress-container">
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${barClass}`}
                        style={{ width: `${Math.min(b.utilization_percentage, 100)}%` }}
                      />
                    </div>
                    <div className="progress-footer">
                      <span>{b.utilization_percentage}% utilized</span>
                      <span>{currencySymbol} {b.remaining_amount.toFixed(2)} remaining</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editingBudget ? 'Edit Budget Limit' : 'Allocate Category Budget'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={!!editingBudget}
                >
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Monthly Spending Limit ({currencySymbol}) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="2000.00"
                  value={formData.amount_limit}
                  onChange={(e) => setFormData({ ...formData, amount_limit: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label>Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                    disabled={!!editingBudget}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    disabled={!!editingBudget}
                  >
                    {[2025, 2026, 2027].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Warning Alert Threshold (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="80"
                  value={formData.alert_threshold_percentage}
                  onChange={(e) => setFormData({ ...formData, alert_threshold_percentage: Number(e.target.value) })}
                />
                <span className="field-hint">You will be alerted when spending exceeds this percentage.</span>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Set Budget Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
