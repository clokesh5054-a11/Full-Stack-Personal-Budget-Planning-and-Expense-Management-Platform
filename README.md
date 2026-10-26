# BudgetBuddy: A Full-Stack Personal Budget Planning and Expense Management Platform

> **Infosys Springboard Internship Project**  
> **Milestone 1 Deliverables**: Requirements, Database Design & Backend Setup (Week 1 & 2)

---

## 📌 Project Overview

**BudgetBuddy** is a personal finance management web application designed for students to track daily pocket money, manage category budgets, build savings habits, and gain financial discipline.

---

## 🎯 Milestone 1 Deliverables & Outcomes

In accordance with the project syllabus, **Milestone 1** requires:
1. **Define project scope and user roles**:
   - `Student`: Standard pocket money and expense tracking.
   - `Premium User`: Advanced goals, investment tracking, and detailed reports.
   - `Admin`: System monitoring and user administration.
2. **Design finalized database schema (8 core models)**:
   - `Users`: Custom user model inheriting Django `AbstractUser` with role-based access.
   - `Profiles`: 1-to-1 extension holding monthly baseline income, currency preference, goals, and notification settings.
   - `Incomes`: Tracks sources (Pocket Money, Scholarship, Freelance, Part-time, Allowance, Gifts, Other).
   - `Expenses`: Daily spending categories (Food & Dining, Travel, Shopping, Education, Entertainment, Bills, Miscellaneous) with payment methods (UPI, Cash, Cards, Net Banking).
   - `Budgets`: Monthly category-wise allocation limits with overspending alert thresholds.
   - `Savings Goals`: Target amounts, current savings progress, status tracking, and target dates.
   - `Notifications`: In-app budget limit alerts, savings nudges, and milestone notifications.
   - `Reports`: Financial summaries (monthly, annual, category breakdowns) ready for export.
3. **Initialize Django REST Framework backend**:
   - Clean scaffolding with `authentication` and `finance` modular apps.
   - SQLite configured for local development with environment switch for PostgreSQL.
4. **Implement JWT Authentication APIs**:
   - User registration with automatic profile generation via Django signals.
   - Secure login with JWT access and refresh token pair (`SimpleJWT`).
   - Token refresh and user profile retrieval/update endpoints.
5. **Create React frontend skeleton**:
   - Vite + React 19 + React Router v7.
   - Protected routes and Axios interceptors for automatic JWT Authorization header injection.
   - Responsive UI featuring landing page, registration, login, dashboard skeleton, and profile configuration.

---

## 🧱 Database Schema Summary

| Model | App | Description |
| :--- | :--- | :--- |
| **`User`** | `authentication` | Custom user with unique email, role (`STUDENT`, `PREMIUM`, `ADMIN`), phone number. |
| **`Profile`** | `authentication` | Linked 1:1 with `User`; stores monthly income baseline, currency, bio, and alert preferences. |
| **`Income`** | `finance` | Source tracking (Pocket Money, Scholarship, Freelance, etc.) with date and amount. |
| **`Expense`** | `finance` | Categorized spending with payment methods (UPI, Cash, Card) and notes. |
| **`Budget`** | `finance` | Category monthly limit with alert threshold percentage (default 80%). |
| **`SavingsGoal`** | `finance` | Target savings goals (e.g. New Laptop Fund) with progress calculation. |
| **`Notification`** | `finance` | In-app alerts for budget warnings, goal milestones, and reports. |
| **`Report`** | `finance` | Pre-calculated financial summaries, net savings, and JSON breakdown. |

---

## 🔑 Quick Demo Credentials (Pre-seeded)

For immediate evaluation, the following demo accounts are already seeded:

| Role | Username / Email | Password | Baseline Income |
| :--- | :--- | :--- | :--- |
| **Student** | `rahul_student` / `rahul.student@college.edu` | `Student@123` | ₹8,000.00 |
| **Premium User** | `ananya_pro` / `ananya.premium@domain.com` | `Premium@123` | ₹25,000.00 |
| **Admin** | `admin` / `admin@budgetbuddy.local` | `Admin@12345` | N/A (Staff & Superuser) |

*(Quick-fill buttons are also available directly on the login screen for 1-click testing).*

---

## 🚀 Running the Project Locally

### 1. Backend (Django REST Framework)

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
..\venv\Scripts\activate

# Run database migrations
python manage.py migrate

# (Optional) Re-seed demo users
python manage.py seed_demo_users

# Run backend unit tests (11 passing tests)
python manage.py test

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

Backend will be accessible at: `http://127.0.0.1:8000/`  
Django Admin Panel: `http://127.0.0.1:8000/admin/`

---

### 2. Frontend (React + Vite)

```powershell
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend will be accessible at: `http://127.0.0.1:5173/`

---

## 🧪 Unit Tests

Milestone 1 includes automated tests covering authentication, registration validations, JWT token generation, profile management, and schema validation for all 8 models:

```powershell
cd backend
..\venv\Scripts\python manage.py test
```
Result: `Ran 11 tests ... OK`

---

## 📋 Evaluation Criteria Checklist (Milestone 1)

- [x] Backend scaffolding complete (Django REST Framework).
- [x] JWT authentication implemented (`/api/auth/register/`, `/api/auth/login/`, `/api/auth/token/refresh/`, `/api/auth/profile/`).
- [x] Database schema finalized with all 8 entities (Users, Profiles, Incomes, Expenses, Budgets, Savings Goals, Notifications, Reports).
- [x] Frontend authentication flow working (Login, Register, Protected Routes, Profile settings, Logout).
