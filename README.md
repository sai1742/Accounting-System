# ApexLedger Enterprise — Office Accounting Management System

**ApexLedger** is a modern, responsive, corporate SaaS-style Accounting and Office Financial Management web application built with **HTML5, Vanilla CSS3 (custom design system), and Vanilla JavaScript**.

---

## 🚀 Live Access & Quick Start

The local web server is currently active and serving the application at:
👉 **[http://localhost:8080](http://localhost:8080)**

Alternatively, you can open [index.html](file:///c:/Users/nilesh%20chavan/OneDrive/Desktop/SAINATH%20MINI%20PROJECT/index.html) directly in any modern browser (Chrome, Edge, Firefox, Brave).

---

## 🔑 Demo Credentials & Instant Switching

You can log in manually or use the **One-Click Demo Role Switcher** available on the Login screen and in the top navigation bar:

| Role | Email / ID | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@apexledger.com` | `admin123` | Full unrestricted access to all modules, users & audit logs |
| **Accountant** | `accountant@apexledger.com` | `acc123` | Transactions, Income, Expenses, Invoices, Reports, Settings |
| **Staff Member** | `staff@apexledger.com` | `staff123` | Add Incomes, Record Expenses, View Personal Invoices |
| **Viewer** | `viewer@apexledger.com` | `view123` | Read-only analytics & financial statements |

---

## 💼 Core Financial Modules & Metrics

The system is pre-loaded with realistic corporate office accounting data in Indian Rupees (**₹**):

### 1. Executive Summary Cards
* **Total Income**: ₹ 8,45,000 (+14.2% quarterly growth)
* **Total Expenses**: ₹ 3,25,000 (Controlled operational spending)
* **Net Balance**: ₹ 5,20,000 (Positive operating surplus)
* **Pending Payments**: ₹ 78,500 (Receivables awaiting clearance)

### 2. Financial Health & Liquidity Overview
* **Total Assets**: ₹ 14,50,000 (82% liquidity ratio)
* **Total Liabilities**: ₹ 1,85,000 (24% debt-to-equity ratio)
* **Income Ratio**: 72.2% | **Expense Ratio**: 27.8%

### 3. Interactive Chart.js Visualizations
* **Income vs Expense**: Monthly comparative bar chart spanning May – October.
* **Expense Distribution**: Donut chart detailing Salaries (₹ 1,45,000), Rent (₹ 85,000), Equipment (₹ 32,000), Marketing (₹ 24,000), Utilities (₹ 26,000), and Travel.
* **Cash Flow Velocity**: Smooth area chart illustrating net monthly cash generation.
* **Theme-Aware**: Charts dynamically re-render their axes, legends, and tooltip colors when toggling between Dark and Light mode.

### 4. Transaction Management
* Searchable and filterable by Category, Type (Income/Expense), and Status (Completed/Pending/Cancelled).
* Sortable columns (Date, Amount).
* Instant **Export to CSV / Excel**.
* Modal workflows to record Income (Client retainers, software consulting) and Expenses (Rent, electricity, salary, equipment).

### 5. Invoicing & Billing Generator
* Interactive Invoice creation with dynamic item row addition, real-time GST tax calculation (18%), and discount rate adjustments.
* Corporate Tax Invoice Preview modal with printable sheet format (`window.print()` / PDF export ready).
* One-click status updates (Mark as Paid).

### 6. User Management & Access Control (Admin Exclusive)
* Add, edit, activate/deactivate, and delete staff accounts.
* Role-based access control: Non-admin users attempting to open restricted sections receive a **403 Unauthorized Access** screen.

### 7. Global Search & Micro-Interactions
* Global Search Command Palette (`Ctrl + K` or `Cmd + K`) with live filtering across Transactions, Invoices, and Team members.
* Dark / Light Mode with persistent LocalStorage state.
* Toast notifications for all actions.
* Collapsible sidebar with desktop and mobile responsive drawer support.

---

## 📂 Project Architecture

```
SAINATH MINI PROJECT/
├── index.html                   # Master application entry point
├── README.md                    # System documentation and credentials
├── css/
│   ├── variables.css            # Dark/light tokens, financial color palette, glassmorphism
│   ├── base.css                 # Reset, typography (Plus Jakarta Sans & Outfit), animations
│   ├── components.css           # Cards, buttons, tables, badges, modals, toasts, dropdowns
│   └── dashboard.css            # Layout shell, widgets, invoice paper, charts, print styles
└── js/
    ├── data.js                  # Initial ₹ accounting dataset, default users & settings
    ├── store.js                 # Reactive LocalStorage store with metric recalculations
    ├── auth.js                  # Session authentication, password strength meter & role guards
    ├── charts.js                # Theme-responsive Chart.js integration
    ├── ui.js                    # Global search (Ctrl+K), toasts, modals, theme toggler, CSV export
    └── app.js                   # SPA router, dynamic view rendering, event listeners
```
