# BudgetBuddy: A Full-Stack Personal Budget Planning and Expense Management Platform

> **Infosys Springboard Internship Project**  
> **Milestones Completed**: Milestone 1 & Milestone 2

---

## 📌 Project Overview

**BudgetBuddy** is a full-stack personal finance and budget planning web application designed for students to track daily pocket money, manage category budgets, build savings habits, and gain financial discipline.

---

## 🎯 Completed Milestones

### 🔹 Milestone 1: Requirements, Database Design & Backend Setup
1. **User Scope & Role-Based Access Control**:
   - `Student`: Pocket money and expense tracking.
   - `Premium User`: Advanced goals, investment tracking, and detailed reports.
   - `Admin`: System monitoring and user administration.
2. **Finalized Database Schema (8 Core Entities)**:
   - `Users`, `Profiles`, `Incomes`, `Expenses`, `Budgets`, `Savings Goals`, `Notifications`, `Reports`.
3. **Backend Scaffolding with JWT Authentication**:
   - Django REST Framework + `SimpleJWT` + `django-cors-headers`.
   - Registration, login, token refresh, and user profile management.
4. **React Frontend Skeleton**:
   - React 19 + Vite + React Router v7 + Axios Interceptors + Context API.

---

### 🔹 Milestone 2: Expense & Income Management
1. **Expense Tracking System**:
   - Complete CRUD endpoints (`/api/finance/expenses/`).
   - Categorized spending: Food & Dining, Travel & Transport, Shopping, Education & Books, Entertainment, Bills, Miscellaneous.
   - Payment methods supported: UPI (GPay/PhonePe), Cash, Debit Card, Credit Card, Net Banking.
   - Search by description and filter by category.
2. **Income & Pocket Money Management**:
   - Complete CRUD endpoints (`/api/finance/incomes/`).
   - Sources: Pocket Money, Scholarship, Freelance, Part-time Job, Allowance, Gifts, Other.
   - Real-time monthly income totals.
3. **Transaction Dashboard**:
   - Unified transaction feed (`/api/finance/transactions/`).
   - Combined chronological feed of all student inflows and outflows with type badges.
   - Filterable by type (All / Incomes / Expenses), category, and title search.
4. **Budget Planning & Utilization System**:
   - Category-wise monthly budget allocations (`/api/finance/budgets/`).
   - Automated real-time utilization calculation:
     * `spent_amount`: live aggregation of category expenses for the selected month/year.
     * `remaining_amount`: remaining pocket money limit.
     * `utilization_percentage`: percentage of allocated limit spent.
     * Overspending warning badges and near-limit indicators (default 80% threshold).
5. **Interactive Live Dashboard**:
   - Real-time KPI cards: Monthly Income, Monthly Expense, Remaining Net Balance.
   - Category-wise spending breakdown with visual progress bars.
   - Active monthly budget limits with dynamic status indicators.
   - Recent 5 transactions quick feed.

---

## 🧱 Database Schema Summary

| Model | App | Description |
| :--- | :--- | :--- |
| **`User`** | `authentication` | Custom user with unique email, role (`STUDENT`, `PREMIUM`, `ADMIN`), phone number. |
| **`Profile`** | `authentication` | 1:1 extension with monthly pocket money baseline, currency, bio, and alert preferences. |
| **`Income`** | `finance` | Source tracking (Pocket Money, Scholarship, Freelance, etc.) with date and amount. |
| **`Expense`** | `finance` | Categorized spending with payment methods (UPI, Cash, Card) and remarks. |
| **`Budget`** | `finance` | Category monthly limit with alert threshold percentage (default 80%). |
| **`SavingsGoal`** | `finance` | Target savings goals (e.g. New Laptop Fund) with progress calculation. |
| **`Notification`** | `finance` | In-app alerts for budget warnings, goal milestones, and reports. |
| **`Report`** | `finance` | Pre-calculated financial summaries, net savings, and JSON breakdown. |

---

## 🔑 Pre-Seeded Demo Credentials

For instant evaluation, sample transactions, budgets, and demo accounts are already pre-seeded:

| Role | Username / Email | Password | Pre-seeded Data |
| :--- | :--- | :--- | :--- |
| **Student** | `rahul_student` / `rahul.student@college.edu` | `Student@123` | Incomes (₹13,700), Expenses (₹3,110), 4 Monthly Budgets |
| **Premium User** | `ananya_pro` / `ananya.premium@domain.com` | `Premium@123` | Baseline Income (₹25,000) |
| **Admin** | `admin` / `admin@budgetbuddy.local` | `Admin@12345` | Staff & Superuser Access |

---

## 🚀 Running the Project Locally

### 1. Backend (Django REST Framework)

```powershell
cd backend
..\venv\Scripts\activate
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver 127.0.0.1:8000
```
- API Base: `http://127.0.0.1:8000/`
- Django Admin Panel: `http://127.0.0.1:8000/admin/`

### 2. Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://127.0.0.1:5173/`

---

## 🧪 Unit Tests

Run the test suite verifying authentication, expense CRUD, income tracking, budget utilization, and dashboard analytics:

```powershell
cd backend
..\venv\Scripts\python manage.py test
```
Result: `Ran 10 tests in 15.001s ... OK`
