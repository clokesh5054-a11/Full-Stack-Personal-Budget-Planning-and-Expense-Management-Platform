import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Calendar,
  X,
  AlertCircle,
  CheckCircle2,
  Utensils,
  Car,
  ShoppingBag,
  BookOpen,
  Film,
  Zap,
  MoreHorizontal
} from 'lucide-react';

const CATEGORY_CHOICES = [
  { value: 'FOOD', label: 'Food & Dining', icon: Utensils, color: '#f87171' },
  { value: 'TRAVEL', label: 'Travel & Transport', icon: Car, color: '#38bdf8' },
  { value: 'SHOPPING', label: 'Shopping', icon: ShoppingBag, color: '#fb923c' },
  { value: 'EDUCATION', label: 'Education & Books', icon: BookOpen, color: '#818cf8' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: Film, color: '#c084fc' },
  { value: 'BILLS', label: 'Bills & Utilities', icon: Zap, color: '#facc15' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous', icon: MoreHorizontal, color: '#9ca3af' },
];

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
  { value: 'CASH', label: 'Cash' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'NET_BANKING', label: 'Net Banking' },
  { value: 'OTHER', label: 'Other' },
];

const Expenses = () => {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'FOOD',
    payment_method: 'UPI',
    date: todayStr,
    notes: '',
  });

  const currencySymbol = profile?.currency === 'USD' ? '$' : profile?.currency === 'EUR' ? '€' : '₹';

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/api/finance/expenses/', { params });
      const data = res.data.results ? res.data.results : res.data;
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      setError("Unable to load expenses. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      amount: '',
      category: 'FOOD',
      payment_method: 'UPI',
      date: todayStr,
      notes: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      payment_method: expense.payment_method,
      date: expense.date,
      notes: expense.notes || '',
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
      if (editingExpense) {
        await api.put(`/api/finance/expenses/${editingExpense.id}/`, formData);
        setSuccess("Expense updated successfully!");
      } else {
        await api.post('/api/finance/expenses/', formData);
        setSuccess("Expense added successfully!");
      }
      setIsModalOpen(false);
      fetchExpenses();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save expense. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      await api.delete(`/api/finance/expenses/${id}/`);
      setSuccess("Expense deleted successfully!");
      fetchExpenses();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete expense.");
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  return (
    <div className="finance-page-container">
      {/* Top Banner */}
      <div className="page-header-row">
        <div>
          <h2>Daily Student Expenses</h2>
          <p className="page-header-subtitle">
            Track where your pocket money goes with instant category tags and payment methods.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-add-primary">
          <Plus size={18} />
          <span>Add Expense</span>
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
        <div className="stat-card stat-expense">
          <span className="stat-label">Total Filtered Spending</span>
          <div className="stat-amount">
            {currencySymbol} {totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="stat-meta">{expenses.length} transaction(s) recorded</span>
        </div>

        <div className="filters-card">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search expenses (e.g. Canteen, Xerox, Bus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-pill-filter">
            <button
              className={`pill-btn ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </button>
            {CATEGORY_CHOICES.map((cat) => (
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

      {/* Expense List */}
      <div className="finance-table-card">
        {loading ? (
          <div className="loading-state">
            <p>Loading transactions...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={44} className="empty-icon" />
            <h3>No expenses recorded</h3>
            <p>Click "+ Add Expense" above to record your campus spending.</p>
          </div>
        ) : (
          <div className="transaction-list">
            {expenses.map((item) => {
              const catObj = CATEGORY_CHOICES.find((c) => c.value === item.category) || {};
              const CatIcon = catObj.icon || CreditCard;

              return (
                <div key={item.id} className="transaction-row">
                  <div className="tx-left">
                    <div className="tx-icon-wrapper" style={{ backgroundColor: `${catObj.color || '#6366f1'}22`, color: catObj.color || '#818cf8' }}>
                      <CatIcon size={20} />
                    </div>
                    <div className="tx-info">
                      <h4 className="tx-title">{item.title}</h4>
                      <div className="tx-meta">
                        <span className="cat-tag">{item.category_display}</span>
                        <span className="dot">•</span>
                        <span className="payment-tag">{item.payment_method_display || item.payment_method}</span>
                        <span className="dot">•</span>
                        <span className="date-tag">{item.date}</span>
                      </div>
                      {item.notes && <p className="tx-notes">{item.notes}</p>}
                    </div>
                  </div>

                  <div className="tx-right">
                    <span className="tx-amount negative">
                      -{currencySymbol} {parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{editingExpense ? 'Edit Expense' : 'Record New Expense'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title / Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Campus Cafeteria Lunch"
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
                    placeholder="150.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORY_CHOICES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.value} value={pm.value}>
                        {pm.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Remarks / Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Paid via UPI split with hostel roommate"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
