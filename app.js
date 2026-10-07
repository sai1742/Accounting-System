/**
 * ApexLedger - Main Application Controller & View Router
 * Handles all navigation, forms, interactive tables, charts, invoices, and role logic
 */

const App = {
  currentView: "dashboard",

  init() {
    Store.init();
    UI.init();
    this.setupNavigation();
    this.setupEventListeners();
    this.updateHeaderProfile();
    this.updateNotificationBadge();

    // Check URL hash or default to dashboard
    const initialHash = window.location.hash.replace("#", "");
    this.navigate(initialHash || "dashboard");
  },

  /* --------------------------------------------------------------------------
     Navigation & Role Enforcement
     -------------------------------------------------------------------------- */
  setupNavigation() {
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && hash !== this.currentView) {
        this.navigate(hash);
      }
    });
  },

  navigate(viewName) {
    if (!viewName) viewName = "dashboard";

    // Auth & public pages
    const isPublicPage = ["landing", "login", "admin-login", "register"].includes(viewName);

    // Check permission for internal views
    if (!isPublicPage && !Auth.canAccess(viewName)) {
      this.renderUnauthorized();
      this.currentView = "unauthorized";
      window.location.hash = "unauthorized";
      return;
    }

    this.currentView = viewName;
    window.location.hash = viewName;

    // Toggle app shell visibility vs full-screen auth pages
    const appShell = document.getElementById("appShell");
    const publicContainer = document.getElementById("publicContainer");

    if (isPublicPage) {
      if (appShell) appShell.style.display = "none";
      if (publicContainer) {
        publicContainer.style.display = "block";
        this.renderPublicView(viewName, publicContainer);
      }
      return;
    }

    if (appShell) appShell.style.display = "flex";
    if (publicContainer) publicContainer.style.display = "none";

    // Update active state in sidebar
    document.querySelectorAll(".nav-link").forEach(link => {
      const target = link.getAttribute("data-view");
      if (target === viewName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    UI.closeMobileSidebar();
    this.updateHeaderProfile();

    // Render corresponding view
    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return;

    window.scrollTo({ top: 0, behavior: "smooth" });

    switch (viewName) {
      case "dashboard":
        this.renderDashboard(contentArea);
        break;
      case "transactions":
        this.renderTransactions(contentArea);
        break;
      case "income":
        this.renderIncome(contentArea);
        break;
      case "expenses":
        this.renderExpenses(contentArea);
        break;
      case "invoices":
        this.renderInvoices(contentArea);
        break;
      case "users":
        this.renderUsers(contentArea);
        break;
      case "reports":
        this.renderReports(contentArea);
        break;
      case "notifications":
        this.renderNotifications(contentArea);
        break;
      case "settings":
        this.renderSettings(contentArea);
        break;
      case "audit":
        this.renderAuditLogs(contentArea);
        break;
      default:
        this.render404(contentArea);
        break;
    }
  },

  updateHeaderProfile() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const nameElem = document.getElementById("topbarUserName");
    const roleElem = document.getElementById("topbarUserRole");
    const avatarElem = document.getElementById("topbarUserAvatar");
    const sidebarAvatar = document.getElementById("sidebarUserAvatar");
    const sidebarName = document.getElementById("sidebarUserName");
    const sidebarRole = document.getElementById("sidebarUserRole");

    if (nameElem) nameElem.textContent = user.name;
    if (roleElem) roleElem.textContent = user.role;
    if (avatarElem) avatarElem.textContent = user.avatar || "AP";
    if (sidebarAvatar) sidebarAvatar.textContent = user.avatar || "AP";
    if (sidebarName) sidebarName.textContent = user.name;
    if (sidebarRole) sidebarRole.textContent = user.role;

    // Hide admin-only sidebar links if user is not admin
    const isAdmin = user.role === "Super Admin" || user.role === "Admin";
    document.querySelectorAll(".admin-only").forEach(el => {
      el.style.display = isAdmin ? "flex" : "none";
    });
  },

  updateNotificationBadge() {
    const notifs = Store.getNotifications();
    const unread = notifs.filter(n => !n.read).length;
    const badge = document.getElementById("notifBadge");
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? "inline-flex" : "none";
    }

    // Populate dropdown list
    const list = document.getElementById("notifDropdownList");
    if (list) {
      if (notifs.length === 0) {
        list.innerHTML = `<div class="empty-state" style="padding: 1.5rem;"><p>No notifications</p></div>`;
      } else {
        list.innerHTML = notifs.slice(0, 4).map(n => `
          <div class="dropdown-item" style="flex-direction: column; align-items: flex-start; gap: 0.2rem; border-bottom: 1px solid var(--border-subtle);">
            <div style="display: flex; justify-content: space-between; width: 100%;">
              <strong style="color: var(--text-primary); font-size: 0.8rem;">${n.title}</strong>
              <small style="color: var(--text-tertiary); font-size: 0.7rem;">${n.time}</small>
            </div>
            <p style="font-size: 0.75rem; margin: 0; color: var(--text-secondary);">${n.message}</p>
          </div>
        `).join("");
      }
    }
  },

  /* --------------------------------------------------------------------------
     1. Dashboard View
     -------------------------------------------------------------------------- */
  renderDashboard(container) {
    const metrics = Store.recalculateMetrics();
    const user = Auth.getCurrentUser();
    const recentTxns = Store.getTransactions().slice(0, 5);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${user.role === "Super Admin" || user.role === "Admin" ? "Admin Management Dashboard" : "Office Finance Dashboard"}</h1>
          <p class="page-subtitle">Welcome back, <strong>${user.name}</strong>. Here is your enterprise financial overview.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline btn-sm" onclick="App.quickRoleSwitchPrompt()">
            <i class="fas fa-users-cog"></i> Switch Demo Role
          </button>
          <button class="btn btn-primary btn-sm" onclick="UI.openModal('addIncomeModal')">
            <i class="fas fa-plus-circle"></i> Add Income
          </button>
          <button class="btn btn-danger btn-sm" onclick="UI.openModal('addExpenseModal')">
            <i class="fas fa-minus-circle"></i> Add Expense
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('reports')">
            <i class="fas fa-file-export"></i> Reports
          </button>
        </div>
      </div>

      <!-- Financial Summary Cards -->
      <div class="stats-grid">
        <div class="card stat-card stat-income">
          <div class="stat-header">
            <span class="stat-title">Total Income</span>
            <div class="stat-icon bg-profit-subtle"><i class="fas fa-arrow-down-left text-profit"></i></div>
          </div>
          <div class="stat-amount" id="dashTotalIncome">₹ ${metrics.totalIncome.toLocaleString('en-IN')}</div>
          <div class="stat-meta">
            <span class="stat-trend text-profit"><i class="fas fa-arrow-trend-up"></i> +14.2%</span>
            <span>vs previous quarter</span>
          </div>
        </div>

        <div class="card stat-card stat-expense">
          <div class="stat-header">
            <span class="stat-title">Total Expenses</span>
            <div class="stat-icon bg-expense-subtle"><i class="fas fa-arrow-up-right text-expense"></i></div>
          </div>
          <div class="stat-amount" id="dashTotalExpenses">₹ ${metrics.totalExpenses.toLocaleString('en-IN')}</div>
          <div class="stat-meta">
            <span class="stat-trend text-expense"><i class="fas fa-arrow-trend-up"></i> +4.8%</span>
            <span>within monthly budget</span>
          </div>
        </div>

        <div class="card stat-card stat-balance">
          <div class="stat-header">
            <span class="stat-title">Net Balance</span>
            <div class="stat-icon bg-primary-subtle"><i class="fas fa-wallet text-primary"></i></div>
          </div>
          <div class="stat-amount" id="dashNetBalance">₹ ${metrics.netBalance.toLocaleString('en-IN')}</div>
          <div class="stat-meta">
            <span class="stat-trend text-profit"><i class="fas fa-circle-check"></i> Healthy Surplus</span>
            <span>Operating reserve</span>
          </div>
        </div>

        <div class="card stat-card stat-pending">
          <div class="stat-header">
            <span class="stat-title">Pending Payments</span>
            <div class="stat-icon bg-warning-subtle"><i class="fas fa-clock text-warning"></i></div>
          </div>
          <div class="stat-amount" id="dashPendingPayments">₹ ${metrics.pendingPayments.toLocaleString('en-IN')}</div>
          <div class="stat-meta">
            <span class="stat-trend text-warning"><i class="fas fa-hourglass-half"></i> 2 Invoices</span>
            <span>Awaiting clearance</span>
          </div>
        </div>
      </div>

      <!-- Financial Health Overview Widget -->
      <div class="card health-widget">
        <div class="card-header">
          <div class="card-title">
            <i class="fas fa-shield-halved text-primary"></i> Financial Health & Asset Overview
          </div>
          <span class="badge badge-success"><i class="fas fa-check"></i> Strong Liquidity</span>
        </div>
        <div class="card-body">
          <div class="health-grid">
            <div class="health-item">
              <div class="health-label">Total Assets</div>
              <div class="health-value text-primary">₹ ${metrics.totalAssets.toLocaleString('en-IN')}</div>
              <div class="health-progress"><div class="health-progress-bar" style="width: 82%; background: var(--primary-500);"></div></div>
            </div>
            <div class="health-item">
              <div class="health-label">Total Liabilities</div>
              <div class="health-value text-expense">₹ ${metrics.totalLiabilities.toLocaleString('en-IN')}</div>
              <div class="health-progress"><div class="health-progress-bar" style="width: 24%; background: var(--expense-500);"></div></div>
            </div>
            <div class="health-item">
              <div class="health-label">Income Ratio</div>
              <div class="health-value text-profit">${metrics.incomeRatio}</div>
              <div class="health-progress"><div class="health-progress-bar" style="width: 72%; background: var(--profit-500);"></div></div>
            </div>
            <div class="health-item">
              <div class="health-label">Expense Ratio</div>
              <div class="health-value text-warning">${metrics.expenseRatio}</div>
              <div class="health-progress"><div class="health-progress-bar" style="width: 28%; background: var(--warning-500);"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Financial Charts -->
      <div class="charts-grid">
        <div class="card chart-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-column text-primary"></i> Income vs Expense Comparison</div>
            <span class="badge badge-neutral">Last 6 Months</span>
          </div>
          <div class="card-body chart-card-body">
            <canvas id="incomeExpenseChart"></canvas>
          </div>
        </div>

        <div class="card chart-card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie text-cyan"></i> Expense Distribution</div>
            <span class="badge badge-neutral">Categorical</span>
          </div>
          <div class="card-body chart-card-body">
            <canvas id="expenseDonutChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Cash Flow Area Chart -->
      <div class="card chart-card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-chart-area text-info"></i> Monthly Net Cash Flow Velocity</div>
          <span class="badge badge-success"><i class="fas fa-arrow-trend-up"></i> Sustained Positive Growth</span>
        </div>
        <div class="card-body chart-card-body" style="min-height: 220px;">
          <canvas id="cashFlowChart"></canvas>
        </div>
      </div>

      <!-- Recent Transactions Table & Widgets -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-list-check text-primary"></i> Recent Office Transactions</div>
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('transactions')">View All Transactions <i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${recentTxns.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td><strong>${t.id}</strong></td>
                  <td>${t.description}</td>
                  <td><span class="badge badge-neutral">${t.category}</span></td>
                  <td>
                    <span class="badge ${t.type === 'Income' ? 'badge-success' : 'badge-danger'}">
                      <span class="badge-dot"></span> ${t.type}
                    </span>
                  </td>
                  <td class="font-mono font-bold ${t.type === 'Income' ? 'text-profit' : 'text-expense'}">
                    ${t.type === 'Income' ? '+' : '-'} ₹ ${Number(t.amount).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span class="badge ${t.status === 'Completed' ? 'badge-success' : (t.status === 'Pending' ? 'badge-warning' : 'badge-danger')}">
                      ${t.status}
                    </span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render Chart.js charts
    setTimeout(() => {
      ChartsManager.renderIncomeExpenseChart();
      ChartsManager.renderExpenseDonutChart();
      ChartsManager.renderCashFlowChart();
    }, 50);
  },

  /* --------------------------------------------------------------------------
     2. Transactions Management View
     -------------------------------------------------------------------------- */
  renderTransactions(container) {
    const transactions = Store.getTransactions();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Transaction Management</h1>
          <p class="page-subtitle">Track, filter, and audit all office incomes, vendor expenses, and account transfers.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline btn-sm" onclick="App.exportTransactionsCSV()">
            <i class="fas fa-file-csv"></i> Export CSV
          </button>
          <button class="btn btn-primary btn-sm" onclick="UI.openModal('addIncomeModal')">
            <i class="fas fa-plus"></i> Add Income
          </button>
          <button class="btn btn-danger btn-sm" onclick="UI.openModal('addExpenseModal')">
            <i class="fas fa-minus"></i> Add Expense
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="filter-bar">
            <div class="filter-group">
              <div class="filter-search">
                <i class="fas fa-search"></i>
                <input type="text" id="txnSearchInput" class="form-input" placeholder="Search by ID, desc, category..." oninput="App.filterTransactionsTable()">
              </div>
              <select id="txnTypeFilter" class="form-select" style="max-width: 150px;" onchange="App.filterTransactionsTable()">
                <option value="ALL">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
              <select id="txnCategoryFilter" class="form-select" style="max-width: 180px;" onchange="App.filterTransactionsTable()">
                <option value="ALL">All Categories</option>
                ${[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => `<option value="${c}">${c}</option>`).join("")}
              </select>
              <select id="txnStatusFilter" class="form-select" style="max-width: 150px;" onchange="App.filterTransactionsTable()">
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="App.resetTxnFilters()">
              <i class="fas fa-rotate-left"></i> Reset
            </button>
          </div>

          <div class="table-responsive">
            <table class="table" id="transactionsTable">
              <thead>
                <tr>
                  <th class="sortable" onclick="App.sortTransactions('date')">Date <i class="fas fa-sort"></i></th>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th class="sortable" onclick="App.sortTransactions('amount')">Amount <i class="fas fa-sort"></i></th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="txnTableBody">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
          <div id="txnEmptyState" style="display: none;">
            <div class="empty-state">
              <div class="empty-state-icon"><i class="fas fa-receipt"></i></div>
              <div class="empty-state-title">No transactions found</div>
              <p class="empty-state-desc">Try clearing the search query or adjusting your filters to find records.</p>
              <button class="btn btn-secondary btn-sm" onclick="App.resetTxnFilters()">Reset Filters</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.filterTransactionsTable();
  },

  filterTransactionsTable() {
    const search = (document.getElementById("txnSearchInput")?.value || "").toLowerCase();
    const typeFilter = document.getElementById("txnTypeFilter")?.value || "ALL";
    const catFilter = document.getElementById("txnCategoryFilter")?.value || "ALL";
    const statusFilter = document.getElementById("txnStatusFilter")?.value || "ALL";

    let transactions = Store.getTransactions();

    const filtered = transactions.filter(t => {
      const matchSearch = t.id.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search) ||
        (t.reference && t.reference.toLowerCase().includes(search));

      const matchType = typeFilter === "ALL" || t.type === typeFilter;
      const matchCat = catFilter === "ALL" || t.category === catFilter;
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;

      return matchSearch && matchType && matchCat && matchStatus;
    });

    const tbody = document.getElementById("txnTableBody");
    const emptyState = document.getElementById("txnEmptyState");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    tbody.innerHTML = filtered.map(t => `
      <tr>
        <td>${t.date}</td>
        <td><strong>${t.id}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${t.description}</div>
          <small style="color: var(--text-tertiary);">${t.notes || "No additional notes"}</small>
        </td>
        <td><span class="badge badge-neutral">${t.category}</span></td>
        <td>
          <span class="badge ${t.type === 'Income' ? 'badge-success' : 'badge-danger'}">
            <span class="badge-dot"></span> ${t.type}
          </span>
        </td>
        <td class="font-mono font-bold ${t.type === 'Income' ? 'text-profit' : 'text-expense'}">
          ${t.type === 'Income' ? '+' : '-'} ₹ ${Number(t.amount).toLocaleString('en-IN')}
        </td>
        <td><span class="badge badge-neutral">${t.paymentMethod}</span></td>
        <td>
          <span class="badge ${t.status === 'Completed' ? 'badge-success' : (t.status === 'Pending' ? 'badge-warning' : 'badge-danger')}">
            ${t.status}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.35rem;">
            <button class="btn btn-secondary btn-sm" title="View Details" onclick="App.viewTransactionDetail('${t.id}')">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete" onclick="App.deleteTransactionPrompt('${t.id}')">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  resetTxnFilters() {
    const s = document.getElementById("txnSearchInput");
    const t = document.getElementById("txnTypeFilter");
    const c = document.getElementById("txnCategoryFilter");
    const st = document.getElementById("txnStatusFilter");
    if (s) s.value = "";
    if (t) t.value = "ALL";
    if (c) c.value = "ALL";
    if (st) st.value = "ALL";
    this.filterTransactionsTable();
  },

  sortAsc: false,
  sortTransactions(field) {
    this.sortAsc = !this.sortAsc;
    const list = Store.getTransactions();
    list.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
      if (field === "amount") {
        return this.sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }
      return this.sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
    Store.set(Store.KEYS.TRANSACTIONS, list);
    this.filterTransactionsTable();
    UI.showToast("Sorted", `Transactions sorted by ${field} (${this.sortAsc ? 'Ascending' : 'Descending'})`, "info", 1500);
  },

  deleteTransactionPrompt(id) {
    if (confirm(`Are you sure you want to delete transaction ${id}?`)) {
      Store.deleteTransaction(id);
      this.filterTransactionsTable();
      UI.showToast("Deleted", `Transaction ${id} removed.`, "success");
    }
  },

  viewTransactionDetail(id) {
    const txn = Store.getTransactions().find(t => t.id === id);
    if (!txn) return;
    this.openPaymentVoucher(txn);
  },

  openPaymentVoucher(txn) {
    const settings = Store.getSettings();
    const modalBody = document.getElementById("voucherModalBody");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="invoice-paper" style="border: 2px dashed #CBD5E1; padding: 2rem; position: relative;">
        <div style="position: absolute; right: 2rem; top: 1.5rem; opacity: 0.12; font-size: 5rem; font-weight: 900; color: #4338CA; pointer-events: none; text-transform: uppercase;">
          ${txn.status}
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #E2E8F0; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div>
            <h2 style="font-size: 1.3rem; color: #0F172A; margin-bottom: 0.2rem;">${settings.companyName}</h2>
            <p style="font-size: 0.8rem; color: #64748B;">GSTIN: ${settings.companyGSTIN} | ${settings.companyPhone}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #6366F1; text-transform: uppercase;">OFFICIAL PAYMENT VOUCHER</div>
            <div style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 800; color: #0F172A;">${txn.id}</div>
            <div style="font-size: 0.75rem; color: #64748B;">Date: ${txn.date}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; font-size: 0.9rem;">
          <div>
            <div style="color: #94A3B8; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.2rem;">TRANSACTION TYPE & CATEGORY</div>
            <div style="font-weight: 700; color: #0F172A; font-size: 1.05rem;">${txn.type} &mdash; ${txn.category}</div>
            <div style="color: #475569; margin-top: 0.35rem;">${txn.description}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #94A3B8; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.2rem;">SETTLED AMOUNT</div>
            <div style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: ${txn.type === 'Income' ? '#10B981' : '#F43F5E'};">
              ₹ ${Number(txn.amount).toLocaleString('en-IN')}
            </div>
            <span class="badge ${txn.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${txn.status}</span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.85rem;">
          <tbody>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 0.6rem 0; color: #64748B; width: 35%;">Payment Method:</td>
              <td style="padding: 0.6rem 0; font-weight: 600; color: #0F172A;">${txn.paymentMethod}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 0.6rem 0; color: #64748B;">UTR / Bank Reference:</td>
              <td style="padding: 0.6rem 0; font-family: var(--font-mono); font-weight: 600; color: #0F172A;">${txn.reference || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 0.6rem 0; color: #64748B;">Purpose / Notes:</td>
              <td style="padding: 0.6rem 0; color: #475569;">${txn.notes || 'Internal accounting reconciliation voucher.'}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0;">
          <div style="font-size: 0.75rem; color: #94A3B8;">
            Generated electronically by ApexLedger ERP.<br>
            Audit Verified & Reconciled.
          </div>
          <div style="text-align: center;">
            <div style="width: 160px; border-bottom: 1.5px solid #0F172A; margin-bottom: 0.4rem; padding-bottom: 0.2rem; font-style: italic; font-weight: 600; font-size: 0.9rem; color: #4338CA;">
              Rajesh Sharma
            </div>
            <div style="font-size: 0.72rem; color: #64748B; text-transform: uppercase;">Authorized Signatory</div>
          </div>
        </div>
      </div>
    `;

    UI.openModal("paymentVoucherModal");
  },

  exportTransactionsCSV() {
    const transactions = Store.getTransactions();
    UI.exportToCSV("ApexLedger_Transactions.csv", transactions);
  },

  /* --------------------------------------------------------------------------
     3. Dedicated Income & Expense Views
     -------------------------------------------------------------------------- */
  renderIncome(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Office Income Management</h1>
          <p class="page-subtitle">Record and audit consulting retainers, product licenses, and incoming receipts.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="UI.openModal('addIncomeModal')">
            <i class="fas fa-plus"></i> Record New Income
          </button>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-arrow-down-left text-profit"></i> Received & Pending Incomes</div>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Income ID</th>
                <th>Source / Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${Store.getTransactions().filter(t => t.type === 'Income').map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td><strong>${t.id}</strong></td>
                  <td>${t.description}</td>
                  <td><span class="badge badge-neutral">${t.category}</span></td>
                  <td class="font-mono font-bold text-profit">+ ₹ ${Number(t.amount).toLocaleString('en-IN')}</td>
                  <td><span class="badge badge-neutral">${t.paymentMethod}</span></td>
                  <td><small class="font-mono">${t.reference}</small></td>
                  <td><span class="badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderExpenses(container) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Office Expense Management</h1>
          <p class="page-subtitle">Monitor rent, salaries, utilities, equipment purchases, and departmental spending.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-danger" onclick="UI.openModal('addExpenseModal')">
            <i class="fas fa-minus"></i> Add New Expense
          </button>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-arrow-up-right text-expense"></i> Disbursed Expenses</div>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Expense ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${Store.getTransactions().filter(t => t.type === 'Expense').map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td><strong>${t.id}</strong></td>
                  <td>${t.description}</td>
                  <td><span class="badge badge-neutral">${t.category}</span></td>
                  <td class="font-mono font-bold text-expense">- ₹ ${Number(t.amount).toLocaleString('en-IN')}</td>
                  <td><span class="badge badge-neutral">${t.paymentMethod}</span></td>
                  <td><small class="font-mono">${t.reference}</small></td>
                  <td><span class="badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------------------------
     4. Invoice Management View
     -------------------------------------------------------------------------- */
  renderInvoices(container) {
    const invoices = Store.getInvoices();
    let totalInvoiced = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    invoices.forEach(inv => {
      const subtotal = inv.items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);
      const discount = (subtotal * (Number(inv.discountRate) || 0)) / 100;
      const taxable = subtotal - discount;
      const tax = (taxable * (Number(inv.taxRate) || 0)) / 100;
      totalInvoiced += (taxable + tax);

      if (inv.status === "Paid") paidCount++;
      if (inv.status === "Pending") pendingCount++;
      if (inv.status === "Overdue") overdueCount++;
    });

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Invoice Management</h1>
          <p class="page-subtitle">Generate client invoices, track receivables, and print GST-compliant billing receipts.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="UI.openModal('createInvoiceModal')">
            <i class="fas fa-plus"></i> Create Invoice
          </button>
        </div>
      </div>

      <!-- Invoice Summary Widgets -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="card stat-card">
          <div class="stat-header"><span class="stat-title">Total Invoices</span><i class="fas fa-file-invoice text-primary"></i></div>
          <div class="stat-amount">${invoices.length}</div>
          <div class="stat-meta">Valued at ₹ ${Math.round(totalInvoiced).toLocaleString('en-IN')}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-header"><span class="stat-title">Paid Invoices</span><i class="fas fa-circle-check text-profit"></i></div>
          <div class="stat-amount text-profit">${paidCount}</div>
          <div class="stat-meta">Cleared & reconciled</div>
        </div>
        <div class="card stat-card">
          <div class="stat-header"><span class="stat-title">Pending Invoices</span><i class="fas fa-hourglass-half text-warning"></i></div>
          <div class="stat-amount text-warning">${pendingCount}</div>
          <div class="stat-meta">Awaiting payment</div>
        </div>
        <div class="card stat-card">
          <div class="stat-header"><span class="stat-title">Overdue Invoices</span><i class="fas fa-triangle-exclamation text-expense"></i></div>
          <div class="stat-amount text-expense">${overdueCount}</div>
          <div class="stat-meta">Requires follow-up</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-receipt text-primary"></i> All Client Invoices</div>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client Name</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(inv => {
                const subtotal = inv.items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);
                const discount = (subtotal * (Number(inv.discountRate) || 0)) / 100;
                const taxable = subtotal - discount;
                const tax = (taxable * (Number(inv.taxRate) || 0)) / 100;
                const total = Math.round(taxable + tax);

                return `
                  <tr>
                    <td><strong>${inv.id}</strong></td>
                    <td>
                      <div style="font-weight: 600; color: var(--text-primary);">${inv.customerName}</div>
                      <small style="color: var(--text-tertiary);">${inv.customerEmail}</small>
                    </td>
                    <td>${inv.date}</td>
                    <td>${inv.dueDate}</td>
                    <td class="font-mono font-bold text-primary">₹ ${total.toLocaleString('en-IN')}</td>
                    <td>
                      <span class="badge ${inv.status === 'Paid' ? 'badge-success' : (inv.status === 'Pending' ? 'badge-warning' : 'badge-danger')}">
                        ${inv.status}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 0.35rem;">
                        <button class="btn btn-secondary btn-sm" title="Preview / Print" onclick="App.viewInvoiceDetail('${inv.id}')">
                          <i class="fas fa-print"></i>
                        </button>
                        ${inv.status !== 'Paid' ? `
                          <button class="btn btn-success btn-sm" title="Mark Paid" onclick="App.markInvoicePaid('${inv.id}')">
                            <i class="fas fa-check"></i>
                          </button>
                        ` : ''}
                        <button class="btn btn-danger btn-sm" title="Delete" onclick="App.deleteInvoicePrompt('${inv.id}')">
                          <i class="fas fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  markInvoicePaid(id) {
    Store.updateInvoiceStatus(id, "Paid");
    UI.showToast("Invoice Updated", `${id} marked as Paid.`, "success");
    this.navigate("invoices");
  },

  deleteInvoicePrompt(id) {
    if (confirm(`Delete invoice ${id}?`)) {
      Store.deleteInvoice(id);
      UI.showToast("Invoice Removed", `${id} deleted successfully.`, "success");
      this.navigate("invoices");
    }
  },

  viewInvoiceDetail(id) {
    const inv = Store.getInvoices().find(i => i.id === id);
    if (!inv) return;

    const settings = Store.getSettings();
    const subtotal = inv.items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);
    const discount = (subtotal * (Number(inv.discountRate) || 0)) / 100;
    const taxable = subtotal - discount;
    const tax = (taxable * (Number(inv.taxRate) || 0)) / 100;
    const grandTotal = Math.round(taxable + tax);

    const modalBody = document.getElementById("invoiceViewModalBody");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="invoice-paper" id="printableInvoice">
        <div class="inv-head">
          <div class="inv-company">
            <h2>${settings.companyName}</h2>
            <p style="font-size: 0.85rem; color: #64748B;">GSTIN: ${settings.companyGSTIN}</p>
            <p style="font-size: 0.85rem; color: #64748B;">${settings.companyAddress}</p>
            <p style="font-size: 0.85rem; color: #64748B;">Email: ${settings.companyEmail} | Phone: ${settings.companyPhone}</p>
          </div>
          <div style="text-align: right;">
            <h1 style="font-size: 1.8rem; color: #4338CA; margin-bottom: 0.2rem;">TAX INVOICE</h1>
            <div style="font-size: 1rem; font-weight: 700; color: #0F172A;">${inv.id}</div>
            <div class="inv-badge ${inv.status === 'Paid' ? 'bg-profit-subtle text-profit' : (inv.status === 'Pending' ? 'bg-warning-subtle text-warning' : 'bg-expense-subtle text-expense')}">
              ${inv.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
          <div>
            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #94A3B8; margin-bottom: 0.4rem;">BILLED TO</h4>
            <div style="font-size: 1.1rem; font-weight: 700; color: #0F172A;">${inv.customerName}</div>
            <p style="font-size: 0.85rem; color: #475569;">${inv.customerEmail}</p>
            <p style="font-size: 0.85rem; color: #475569;">${inv.customerAddress}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 0.85rem; color: #475569;"><strong>Invoice Date:</strong> ${inv.date}</p>
            <p style="font-size: 0.85rem; color: #475569;"><strong>Due Date:</strong> ${inv.dueDate}</p>
            <p style="font-size: 0.85rem; color: #475569;"><strong>Payment Mode:</strong> Bank Transfer / NEFT</p>
          </div>
        </div>

        <table class="invoice-items-table">
          <thead>
            <tr>
              <th style="text-align: left;">Item & Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map(it => `
              <tr>
                <td style="color: #0F172A; font-weight: 600;">${it.description}</td>
                <td style="text-align: center; color: #475569;">${it.quantity}</td>
                <td style="text-align: right; color: #475569;">₹ ${Number(it.price).toLocaleString('en-IN')}</td>
                <td style="text-align: right; font-weight: 700; color: #0F172A;">₹ ${(Number(it.quantity) * Number(it.price)).toLocaleString('en-IN')}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="invoice-summary-box">
          <div class="invoice-summary-row">
            <span>Subtotal:</span>
            <span>₹ ${subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${discount > 0 ? `
            <div class="invoice-summary-row text-profit">
              <span>Discount (${inv.discountRate}%):</span>
              <span>- ₹ ${discount.toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          <div class="invoice-summary-row">
            <span>GST / Tax (${inv.taxRate}%):</span>
            <span>+ ₹ ${Math.round(tax).toLocaleString('en-IN')}</span>
          </div>
          <div class="invoice-summary-row total">
            <span>Total Payable:</span>
            <span>₹ ${grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; font-size: 0.8rem; color: #64748B;">
          <strong>Notes & Payment Instructions:</strong><br>
          ${inv.notes}<br>
          Bank: HDFC Bank Ltd. | A/C No: 50200088991122 | IFSC: HDFC0001234
        </div>
      </div>
    `;

    UI.openModal("invoiceViewModal");
  },

  /* --------------------------------------------------------------------------
     5. User Management View (Admin Only)
     -------------------------------------------------------------------------- */
  renderUsers(container) {
    const users = Store.getUsers();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Configure staff accounts, manage role permissions, and track active platform members.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="UI.openModal('addUserModal')">
            <i class="fas fa-user-plus"></i> Add New User
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-users-gear text-primary"></i> Registered Staff & Personnel</div>
          <span class="badge badge-primary">${users.length} Active Accounts</span>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Phone</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div class="avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">${u.avatar || 'U'}</div>
                      <div style="font-weight: 700; color: var(--text-primary);">${u.name}</div>
                    </div>
                  </td>
                  <td>${u.email}</td>
                  <td>
                    <span class="badge ${u.role.includes('Admin') ? 'badge-primary' : (u.role === 'Accountant' ? 'badge-info' : 'badge-neutral')}">
                      ${u.role}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}">
                      <span class="badge-dot"></span> ${u.status}
                    </span>
                  </td>
                  <td>${u.joinedDate}</td>
                  <td>${u.phone}</td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.35rem;">
                      <button class="btn btn-secondary btn-sm" onclick="App.toggleUserStatusAction('${u.id}')" title="Toggle Active/Inactive">
                        <i class="fas fa-power-off"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="App.deleteUserPrompt('${u.id}')" title="Remove User">
                        <i class="fas fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  toggleUserStatusAction(id) {
    const status = Store.toggleUserStatus(id);
    UI.showToast("User Status Updated", `User is now ${status}.`, "info");
    this.renderUsers(document.getElementById("contentArea"));
  },

  deleteUserPrompt(id) {
    if (confirm("Are you sure you want to permanently delete this user?")) {
      Store.deleteUser(id);
      UI.showToast("User Deleted", "User has been removed.", "success");
      this.renderUsers(document.getElementById("contentArea"));
    }
  },

  /* --------------------------------------------------------------------------
     6. Financial Reports View & Comprehensive Analytics Suite
     -------------------------------------------------------------------------- */
  activeReportTab: "pnl",

  renderReports(container) {
    const metrics = Store.recalculateMetrics();
    const budgets = Store.getBudgets();
    const gst = Store.getGSTReport();
    const aging = Store.getReceivablesAging();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Financial Statements & Analytical Reports</h1>
          <p class="page-subtitle">GAAP & GST compliant corporate reports, expense budget variances, and liquidity aging.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline btn-sm" onclick="window.print()">
            <i class="fas fa-print"></i> Print Active Report
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.exportTransactionsCSV()">
            <i class="fas fa-file-excel"></i> Export Raw CSV
          </button>
          <button class="btn btn-primary btn-sm" onclick="UI.openModal('gstCalcModal')">
            <i class="fas fa-calculator"></i> GST Calculator
          </button>
        </div>
      </div>

      <!-- Reports Navigation Tabs -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; flex-wrap: wrap;">
        <button class="btn btn-sm ${this.activeReportTab === 'pnl' ? 'btn-primary' : 'btn-secondary'}" onclick="App.switchReportTab('pnl')">
          <i class="fas fa-scale-balanced"></i> Profit & Loss (P&L)
        </button>
        <button class="btn btn-sm ${this.activeReportTab === 'budget' ? 'btn-primary' : 'btn-secondary'}" onclick="App.switchReportTab('budget')">
          <i class="fas fa-chart-pie"></i> Category Budgets & Variance
        </button>
        <button class="btn btn-sm ${this.activeReportTab === 'gst' ? 'btn-primary' : 'btn-secondary'}" onclick="App.switchReportTab('gst')">
          <i class="fas fa-receipt"></i> GST & Tax Compliance
        </button>
        <button class="btn btn-sm ${this.activeReportTab === 'aging' ? 'btn-primary' : 'btn-secondary'}" onclick="App.switchReportTab('aging')">
          <i class="fas fa-hourglass-half"></i> A/R Aging Analysis
        </button>
      </div>

      <div id="reportTabContent">
        <!-- Rendered based on activeReportTab -->
      </div>
    `;

    this.renderActiveReportTabContent();
  },

  switchReportTab(tabKey) {
    this.activeReportTab = tabKey;
    this.renderReports(document.getElementById("contentArea"));
  },

  renderActiveReportTabContent() {
    const container = document.getElementById("reportTabContent");
    if (!container) return;

    const metrics = Store.recalculateMetrics();

    if (this.activeReportTab === "pnl") {
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-scale-balanced text-primary"></i> Income Statement / Profit & Loss (Fiscal Year 2026-27)</div>
            <span class="badge badge-success"><i class="fas fa-check"></i> Reconciled & Audited</span>
          </div>
          <div class="card-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div>
                <h3 style="margin-bottom: 1rem; color: var(--profit-500);"><i class="fas fa-plus-circle"></i> Operating Revenues</h3>
                <div class="invoice-summary-row" style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Software Consulting & Custom Dev</span>
                  <strong>₹ 5,45,000</strong>
                </div>
                <div class="invoice-summary-row" style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Enterprise Cloud ERP Retainers</span>
                  <strong>₹ 2,10,000</strong>
                </div>
                <div class="invoice-summary-row" style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Annual Maintenance Contracts (AMC)</span>
                  <strong>₹ 90,000</strong>
                </div>
                <div class="invoice-summary-row total text-profit" style="font-size: 1.15rem; margin-top: 1rem;">
                  <span>Total Operating Revenue (A):</span>
                  <span>₹ ${metrics.totalIncome.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <h3 style="margin-bottom: 1rem; color: var(--expense-500);"><i class="fas fa-minus-circle"></i> Operating Expenses</h3>
                <div class="invoice-summary-row" style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Staff Salaries & Payroll</span>
                  <strong>₹ 1,45,000</strong>
                </div>
                <div class="invoice-summary-row" style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Commercial Office Lease (Rent)</span>
                  <strong>₹ 85,000</strong>
                </div>
                <div class="invoice-summary-row" style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Utilities (Electricity & Leased Line)</span>
                  <strong>₹ 26,000</strong>
                </div>
                <div class="invoice-summary-row" style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Hardware & Equipment Depreciation</span>
                  <strong>₹ 32,000</strong>
                </div>
                <div class="invoice-summary-row" style="padding: 0.65rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <span>Marketing, Travel & Office Supplies</span>
                  <strong>₹ 37,000</strong>
                </div>
                <div class="invoice-summary-row total text-expense" style="font-size: 1.15rem; margin-top: 1rem;">
                  <span>Total Operating Expenditure (B):</span>
                  <span>₹ ${metrics.totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div style="margin-top: 2rem; padding: 1.75rem; background: var(--bg-surface-subtle); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-subtle);">
              <div>
                <h2 style="font-size: 1.35rem; color: var(--text-primary); margin-bottom: 0.25rem;">Net Operating Profit / Surplus (A - B)</h2>
                <p style="margin: 0; font-size: 0.85rem;">Pre-tax commercial office operating margin: <strong>61.5%</strong></p>
              </div>
              <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: var(--profit-500);">
                ₹ ${metrics.netBalance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeReportTab === "budget") {
      const budgets = Store.getBudgets();
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-pie text-cyan"></i> Monthly Expense Budgets vs Actual Spend</div>
            <span class="badge badge-neutral">Fiscal Cycle: October 2026</span>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Expense Category</th>
                    <th>Monthly Budget</th>
                    <th>Actual Spent</th>
                    <th style="width: 250px;">Budget Utilization</th>
                    <th>Variance (Under / Over)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${budgets.map(b => `
                    <tr>
                      <td><strong>${b.category}</strong></td>
                      <td class="font-mono">₹ ${b.monthlyBudget.toLocaleString('en-IN')}</td>
                      <td class="font-mono font-bold ${b.isOverBudget ? 'text-expense' : 'text-primary'}">
                        ₹ ${b.spent.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <div class="health-progress" style="flex-grow: 1;">
                            <div class="health-progress-bar" style="width: ${Math.min(b.percentage, 100)}%; background: ${b.percentage > 100 ? 'var(--expense-500)' : (b.percentage > 85 ? 'var(--warning-500)' : 'var(--profit-500)')};"></div>
                          </div>
                          <span style="font-size: 0.8rem; font-weight: 700; width: 42px;">${b.percentage}%</span>
                        </div>
                      </td>
                      <td class="font-mono ${b.variance >= 0 ? 'text-profit' : 'text-expense'}">
                        ${b.variance >= 0 ? '+' : '-'} ₹ ${Math.abs(b.variance).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span class="badge ${b.isOverBudget ? 'badge-danger' : (b.percentage > 85 ? 'badge-warning' : 'badge-success')}">
                          ${b.isOverBudget ? 'Over Budget' : (b.percentage > 85 ? 'Near Limit' : 'Within Budget')}
                        </span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeReportTab === "gst") {
      const gst = Store.getGSTReport();
      const settings = Store.getSettings();
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-receipt text-primary"></i> GST & Indirect Tax Compliance (GSTR-1 & 3B Summary)</div>
            <span class="badge badge-primary">GSTIN: ${settings.companyGSTIN}</span>
          </div>
          <div class="card-body">
            <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 2rem;">
              <div class="card stat-card">
                <div class="stat-header"><span class="stat-title">Taxable Sales</span><i class="fas fa-file-lines text-primary"></i></div>
                <div class="stat-amount font-mono">₹ ${gst.grossTaxableSales.toLocaleString('en-IN')}</div>
                <div class="stat-meta">Invoiced client supplies</div>
              </div>
              <div class="card stat-card">
                <div class="stat-header"><span class="stat-title">Total Output GST</span><i class="fas fa-arrow-up text-warning"></i></div>
                <div class="stat-amount font-mono text-warning">₹ ${gst.totalOutputGST.toLocaleString('en-IN')}</div>
                <div class="stat-meta">CGST: ₹ ${gst.cgstOutput.toLocaleString('en-IN')} | SGST: ₹ ${gst.sgstOutput.toLocaleString('en-IN')}</div>
              </div>
              <div class="card stat-card">
                <div class="stat-header"><span class="stat-title">Input Tax Credit (ITC)</span><i class="fas fa-arrow-down text-profit"></i></div>
                <div class="stat-amount font-mono text-profit">₹ ${gst.eligibleITC.toLocaleString('en-IN')}</div>
                <div class="stat-meta">Eligible commercial expenses</div>
              </div>
              <div class="card stat-card">
                <div class="stat-header"><span class="stat-title">Net GST Payable</span><i class="fas fa-wallet text-expense"></i></div>
                <div class="stat-amount font-mono text-expense">₹ ${gst.netGSTPayable.toLocaleString('en-IN')}</div>
                <div class="stat-meta">After ITC offset</div>
              </div>
            </div>

            <div style="background: var(--bg-surface-subtle); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.85rem; color: var(--text-secondary);">
              <i class="fas fa-circle-info text-info"></i> <strong>Compliance Note:</strong> GSTR-1 for monthly supplies is due on the 11th of each month. Output GST liability has been computed using standard ${settings.defaultTaxRate}% IGST/CGST rates.
            </div>
          </div>
        </div>
      `;
    } else if (this.activeReportTab === "aging") {
      const aging = Store.getReceivablesAging();
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-hourglass-half text-warning"></i> Accounts Receivable (A/R) Aging Schedule</div>
            <span class="badge badge-neutral">Client Liquidity Analysis</span>
          </div>
          <div class="card-body">
            <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 2rem;">
              <div class="card stat-card">
                <div class="stat-header"><span class="stat-title">0 - 15 Days</span><span class="badge badge-success">Current</span></div>
                <div class="stat-amount font-mono">₹ ${aging.current.total.toLocaleString('en-IN')}</div>
                <div class="stat-meta">${aging.current.items.length} Pending Invoices</div>
              </div>
              <div class="card stat-card">
                <div class="stat-header"><span class="stat-title">16 - 30 Days</span><span class="badge badge-neutral">Past Due</span></div>
                <div class="stat-amount font-mono">₹ ${aging.overdue1.total.toLocaleString('en-IN')}</div>
                <div class="stat-meta">${aging.overdue1.items.length} Invoices</div>
              </div>
              <div class="card stat-card">
                <div class="stat-header"><span class="stat-title">31 - 60 Days</span><span class="badge badge-warning">Aging</span></div>
                <div class="stat-amount font-mono text-warning">₹ ${aging.overdue2.total.toLocaleString('en-IN')}</div>
                <div class="stat-meta">${aging.overdue2.items.length} Invoices</div>
              </div>
              <div class="card stat-card">
                <div class="stat-header"><span class="stat-title">60+ Days</span><span class="badge badge-danger">Critical</span></div>
                <div class="stat-amount font-mono text-expense">₹ ${aging.critical.total.toLocaleString('en-IN')}</div>
                <div class="stat-meta">${aging.critical.items.length} Invoices</div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client Organization</th>
                    <th>Due Date</th>
                    <th>Days Outstanding</th>
                    <th>Total Outstanding</th>
                    <th>Risk Category</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${[...aging.current.items, ...aging.overdue1.items, ...aging.overdue2.items, ...aging.critical.items].map(it => `
                    <tr>
                      <td><strong>${it.id}</strong></td>
                      <td>${it.customerName}</td>
                      <td>${it.dueDate}</td>
                      <td class="font-mono">${it.daysDiff > 0 ? it.daysDiff + ' days past due' : 'Due in ' + Math.abs(it.daysDiff) + ' days'}</td>
                      <td class="font-mono font-bold text-primary">₹ ${it.total.toLocaleString('en-IN')}</td>
                      <td>
                        <span class="badge ${it.daysDiff > 60 ? 'badge-danger' : (it.daysDiff > 15 ? 'badge-warning' : 'badge-success')}">
                          ${it.daysDiff > 60 ? 'High Risk' : (it.daysDiff > 15 ? 'Follow-Up Needed' : 'Normal')}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="alert('Payment reminder email dispatched to ${it.customerEmail}'); UI.showToast('Reminder Sent', 'Dispatched reminder to ${it.customerName}', 'info');">
                          <i class="fas fa-paper-plane"></i> Send Notice
                        </button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }
  },

  /* --------------------------------------------------------------------------
     7. Notifications View
     -------------------------------------------------------------------------- */
  renderNotifications(container) {
    const notifs = Store.getNotifications();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Notification Center</h1>
          <p class="page-subtitle">Real-time alerts on inbound bank transfers, pending invoices, and system security.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="App.markAllReadAction()">
            <i class="fas fa-check-double"></i> Mark All as Read
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          ${notifs.map(n => `
            <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem 0; border-bottom: 1px solid var(--border-subtle);">
              <div class="stat-icon ${n.type === 'success' ? 'bg-profit-subtle' : (n.type === 'warning' ? 'bg-warning-subtle' : (n.type === 'danger' ? 'bg-expense-subtle' : 'bg-primary-subtle'))}" style="width: 40px; height: 40px; font-size: 1rem;">
                <i class="fas ${n.type === 'success' ? 'fa-check text-profit' : (n.type === 'warning' ? 'fa-bell text-warning' : (n.type === 'danger' ? 'fa-triangle-exclamation text-expense' : 'fa-info text-primary'))}"></i>
              </div>
              <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <h4 style="font-size: 0.95rem; color: var(--text-primary); margin: 0;">${n.title}</h4>
                  <small style="color: var(--text-tertiary);">${n.time}</small>
                </div>
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">${n.message}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  markAllReadAction() {
    Store.markAllNotificationsRead();
    this.updateNotificationBadge();
    UI.showToast("Marked Read", "All notifications cleared.", "success");
    this.renderNotifications(document.getElementById("contentArea"));
  },

  /* --------------------------------------------------------------------------
     8. Audit Logs View (Admin Only)
     -------------------------------------------------------------------------- */
  renderAuditLogs(container) {
    const logs = Store.getAuditLogs();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">System Audit & Security Logs</h1>
          <p class="page-subtitle">Immutable chronological tracking of user authentications, financial edits, and administrative actions.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline btn-sm" onclick="UI.exportToCSV('ApexLedger_AuditLogs.csv', Store.getAuditLogs())">
            <i class="fas fa-download"></i> Export Logs
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-shield-cat text-primary"></i> Activity Trail</div>
          <span class="badge badge-neutral">${logs.length} Logged Events</span>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td class="font-mono" style="font-size: 0.8rem;">${l.timestamp}</td>
                  <td><strong>${l.user}</strong></td>
                  <td><span class="badge badge-neutral">${l.role}</span></td>
                  <td><span class="badge badge-info">${l.action}</span></td>
                  <td style="color: var(--text-secondary);">${l.details}</td>
                  <td class="font-mono" style="font-size: 0.8rem; color: var(--text-tertiary);">${l.ip}</td>
                  <td><span class="badge badge-success"><span class="badge-dot"></span> ${l.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* --------------------------------------------------------------------------
     9. Settings & Profile View
     -------------------------------------------------------------------------- */
  renderSettings(container) {
    const user = Auth.getCurrentUser();
    const settings = Store.getSettings();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Settings & Enterprise Profile</h1>
          <p class="page-subtitle">Configure organization details, financial tax settings, and individual account security.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <!-- Profile Form -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-user-circle text-primary"></i> Personal Profile</div>
          </div>
          <div class="card-body">
            <form onsubmit="App.handleProfileSave(event)">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="profName" class="form-input" value="${user.name}">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="profEmail" class="form-input" value="${user.email}" readonly style="opacity: 0.8;">
              </div>
              <div class="form-group">
                <label class="form-label">Account Role</label>
                <input type="text" class="form-input" value="${user.role}" readonly style="opacity: 0.8;">
              </div>
              <div class="form-group">
                <label class="form-label">Contact Number</label>
                <input type="text" id="profPhone" class="form-input" value="${user.phone || '+91 98000 12345'}">
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">
                <i class="fas fa-save"></i> Save Profile
              </button>
            </form>
          </div>
        </div>

        <!-- System & Financial Settings -->
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fas fa-sliders text-cyan"></i> Organization & Tax Settings</div>
          </div>
          <div class="card-body">
            <form onsubmit="App.handleSystemSettingsSave(event)">
              <div class="form-group">
                <label class="form-label">Company Legal Name</label>
                <input type="text" id="sysCompanyName" class="form-input" value="${settings.companyName}">
              </div>
              <div class="form-group">
                <label class="form-label">GSTIN / Tax ID</label>
                <input type="text" id="sysGSTIN" class="form-input" value="${settings.companyGSTIN}">
              </div>
              <div class="form-group">
                <label class="form-label">Default GST Rate (%)</label>
                <input type="number" id="sysTaxRate" class="form-input" value="${settings.defaultTaxRate}">
              </div>
              <div class="form-group">
                <label class="form-label">Currency Symbol</label>
                <input type="text" id="sysCurrency" class="form-input" value="${settings.currencySymbol}">
              </div>
              <button type="submit" class="btn btn-secondary" style="margin-top: 1rem;">
                <i class="fas fa-building-circle-check"></i> Update System Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  handleProfileSave(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    user.name = document.getElementById("profName").value;
    user.phone = document.getElementById("profPhone").value;
    Auth.setCurrentUser(user);
    Store.updateUser(user.id, { name: user.name, phone: user.phone });
    this.updateHeaderProfile();
    UI.showToast("Profile Updated", "Your profile details have been saved.", "success");
  },

  handleSystemSettingsSave(e) {
    e.preventDefault();
    const companyName = document.getElementById("sysCompanyName").value;
    const companyGSTIN = document.getElementById("sysGSTIN").value;
    const defaultTaxRate = Number(document.getElementById("sysTaxRate").value);
    const currencySymbol = document.getElementById("sysCurrency").value;

    Store.updateSettings({ companyName, companyGSTIN, defaultTaxRate, currencySymbol });
    UI.showToast("Settings Updated", "Organization settings have been updated.", "success");
  },

  /* --------------------------------------------------------------------------
     10. Public Views: Landing, Login, Admin Login, Register
     -------------------------------------------------------------------------- */
  renderPublicView(view, container) {
    if (view === "landing") {
      container.innerHTML = `
        <div style="background: var(--bg-app); min-height: 100vh;">
          <header style="padding: 1.5rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="brand-icon"><i class="fas fa-coins"></i></div>
              <div class="brand-name">Apex<span>Ledger</span></div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <button class="btn btn-outline btn-sm" onclick="App.navigate('admin-login')"><i class="fas fa-shield-halved"></i> Admin Portal</button>
              <button class="btn btn-primary btn-sm" onclick="App.navigate('login')">Sign In</button>
            </div>
          </header>

          <section class="landing-hero">
            <div class="landing-badge"><i class="fas fa-sparkles"></i> Enterprise SaaS Office Accounting</div>
            <h1 class="landing-title">Manage Your Office Finances <span>Smarter, Faster & Compliant</span></h1>
            <p class="landing-subtitle">A centralized corporate platform for managing office income, vendor expenses, GST invoices, team roles, and real-time cash flow analytics.</p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-primary btn-lg" onclick="App.navigate('login')">
                <i class="fas fa-arrow-right-to-bracket"></i> Launch Dashboard Demo
              </button>
              <button class="btn btn-secondary btn-lg" onclick="App.navigate('register')">
                <i class="fas fa-user-plus"></i> Create Account
              </button>
            </div>
          </section>

          <section class="landing-features-grid">
            <div class="landing-feature-card">
              <div class="stat-icon bg-profit-subtle" style="margin-bottom: 1rem;"><i class="fas fa-chart-line text-profit"></i></div>
              <h3 style="margin-bottom: 0.5rem;">Live Financial Intelligence</h3>
              <p>Real-time calculation of net operational balance, pending receipts, and automated profit & loss reports.</p>
            </div>
            <div class="landing-feature-card">
              <div class="stat-icon bg-primary-subtle" style="margin-bottom: 1rem;"><i class="fas fa-file-invoice-dollar text-primary"></i></div>
              <h3 style="margin-bottom: 0.5rem;">GST Invoice Generator</h3>
              <p>Create itemized invoices, calculate taxes, and export branded, printable PDF receipts in seconds.</p>
            </div>
            <div class="landing-feature-card">
              <div class="stat-icon bg-info-subtle" style="margin-bottom: 1rem;"><i class="fas fa-user-shield text-info"></i></div>
              <h3 style="margin-bottom: 0.5rem;">Role-Based Security</h3>
              <p>Granular access control for Super Admins, Accountants, and Staff members with complete audit logging.</p>
            </div>
          </section>
        </div>
      `;
    } else if (view === "login") {
      container.innerHTML = `
        <div class="auth-wrapper">
          <div class="auth-split-card">
            <div class="auth-side-brand">
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;">
                  <div class="brand-icon"><i class="fas fa-coins"></i></div>
                  <div class="brand-name" style="font-size: 1.5rem;">Apex<span>Ledger</span></div>
                </div>
                <h2 style="font-size: 2rem; color: #FFFFFF; line-height: 1.2; margin-bottom: 1rem;">
                  Manage your office finances smarter.
                </h2>
                <p style="color: #CBD5E1; font-size: 0.95rem; line-height: 1.6;">
                  Track every rupee, automate invoicing, and gain real-time visibility into your business cash flow.
                </p>
              </div>
              <div style="display: flex; gap: 1.5rem; color: #94A3B8; font-size: 0.85rem;">
                <span><i class="fas fa-shield-check text-profit"></i> Enterprise Encrypted</span>
                <span><i class="fas fa-bolt text-cyan"></i> Instant Sync</span>
              </div>
            </div>

            <div class="auth-form-side">
              <div class="auth-header">
                <h2 class="auth-title">Welcome Back</h2>
                <p class="auth-desc">Enter your credentials to access the accounting portal.</p>
              </div>

              <form onsubmit="App.handleLoginSubmit(event)">
                <div class="form-group">
                  <label class="form-label">Email or Username <span class="required">*</span></label>
                  <div class="input-with-icon">
                    <i class="fas fa-envelope"></i>
                    <input type="text" id="loginEmail" class="form-input" placeholder="admin@apexledger.com" required>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span>Password <span class="required">*</span></span>
                    <a href="javascript:void(0)" onclick="alert('Demo password is: admin123 (or use Quick Demo Login below)')" style="font-size: 0.75rem;">Forgot Password?</a>
                  </label>
                  <div class="input-with-icon">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="loginPassword" class="form-input" placeholder="••••••••" required>
                    <button type="button" class="btn-password-toggle" onclick="App.togglePasswordVisibility('loginPassword', this)">
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                  <label class="form-check">
                    <input type="checkbox" id="loginRemember" checked>
                    <span>Remember Me</span>
                  </label>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem;">
                  <i class="fas fa-arrow-right-to-bracket"></i> Sign In to Portal
                </button>
              </form>

              <div class="auth-demo-bar">
                <small style="color: var(--text-tertiary); font-weight: 600; text-transform: uppercase;">One-Click Demo Accounts:</small>
                <div class="auth-demo-btns">
                  <button class="btn btn-secondary btn-sm" onclick="App.loginDemoAndRedirect('admin')">Super Admin</button>
                  <button class="btn btn-secondary btn-sm" onclick="App.loginDemoAndRedirect('accountant')">Accountant</button>
                  <button class="btn btn-secondary btn-sm" onclick="App.loginDemoAndRedirect('staff')">Staff Member</button>
                </div>
              </div>

              <div style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem;">
                <span style="color: var(--text-secondary);">Don't have an account?</span>
                <a href="#register" style="font-weight: 700;"> Register here</a>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (view === "admin-login") {
      container.innerHTML = `
        <div class="auth-wrapper">
          <div class="admin-auth-card">
            <div class="admin-shield-icon">
              <i class="fas fa-shield-halved"></i>
            </div>
            <div style="text-align: center; margin-bottom: 2rem;">
              <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem;">Administrator Access</h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">Secured privileged management console</p>
            </div>

            <form onsubmit="App.handleAdminLoginSubmit(event)">
              <div class="form-group">
                <label class="form-label">Administrator ID / Email</label>
                <div class="input-with-icon">
                  <i class="fas fa-user-shield"></i>
                  <input type="text" id="adminLoginId" class="form-input" placeholder="admin@apexledger.com" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Security Master Password</label>
                <div class="input-with-icon">
                  <i class="fas fa-key"></i>
                  <input type="password" id="adminLoginPassword" class="form-input" placeholder="••••••••" required>
                  <button type="button" class="btn-password-toggle" onclick="App.togglePasswordVisibility('adminLoginPassword', this)">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; margin-top: 1rem;">
                <i class="fas fa-lock-open"></i> Secure Administrator Login
              </button>

              <div style="margin-top: 1.5rem; text-align: center;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="App.loginDemoAndRedirect('admin')">
                  <i class="fas fa-fingerprint"></i> Quick Admin Access
                </button>
              </div>

              <div style="text-align: center; margin-top: 1.5rem;">
                <a href="#login" style="font-size: 0.85rem;"><i class="fas fa-arrow-left"></i> Back to User Login</a>
              </div>
            </form>
          </div>
        </div>
      `;
    } else if (view === "register") {
      container.innerHTML = `
        <div class="auth-wrapper">
          <div class="card" style="max-width: 580px; width: 100%; padding: 2.5rem;">
            <div style="margin-bottom: 2rem; text-align: center;">
              <div class="brand-icon" style="margin: 0 auto 1rem;"><i class="fas fa-coins"></i></div>
              <h2 style="font-size: 1.6rem; font-weight: 800;">Create Enterprise Account</h2>
              <p style="font-size: 0.875rem; color: var(--text-secondary);">Join ApexLedger to manage office accounts</p>
            </div>

            <form onsubmit="App.handleRegisterSubmit(event)">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Full Name <span class="required">*</span></label>
                  <input type="text" id="regName" class="form-input" placeholder="Rahul Mehra" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Mobile Number</label>
                  <input type="text" id="regPhone" class="form-input" placeholder="+91 98000 00000">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Corporate Email Address <span class="required">*</span></label>
                <input type="email" id="regEmail" class="form-input" placeholder="rahul@company.com" required>
              </div>

              <div class="form-group">
                <label class="form-label">Account Role <span class="required">*</span></label>
                <select id="regRole" class="form-select">
                  <option value="Staff">Staff Member</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Admin">Administrator</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Password <span class="required">*</span></label>
                  <input type="password" id="regPassword" class="form-input" placeholder="••••••••" oninput="App.handlePasswordStrength(this.value)" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm Password <span class="required">*</span></label>
                  <input type="password" id="regConfirmPassword" class="form-input" placeholder="••••••••" required>
                </div>
              </div>

              <div style="margin-bottom: 1.25rem;">
                <div class="password-meter">
                  <div class="password-meter-fill" id="regMeterFill"></div>
                </div>
                <div class="password-strength-label" id="regStrengthLabel">Password Strength: Empty</div>
              </div>

              <label class="form-check" style="margin-bottom: 1.5rem;">
                <input type="checkbox" id="regTerms" required>
                <span>I agree to the Terms of Service & Privacy Policy</span>
              </label>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem;">
                <i class="fas fa-user-plus"></i> Create Account
              </button>

              <div style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem;">
                <span>Already have an account?</span>
                <a href="#login" style="font-weight: 700;"> Login here</a>
              </div>
            </form>
          </div>
        </div>
      `;
    }
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const pwd = document.getElementById("loginPassword").value;
    const res = Auth.login(email, pwd);

    if (res.success) {
      UI.showToast("Welcome Back!", `Logged in as ${res.user.name}`, "success");
      this.navigate("dashboard");
    } else {
      UI.showToast("Login Failed", res.message, "error");
    }
  },

  handleAdminLoginSubmit(e) {
    e.preventDefault();
    const adminId = document.getElementById("adminLoginId").value;
    const pwd = document.getElementById("adminLoginPassword").value;
    const res = Auth.adminLogin(adminId, pwd);

    if (res.success) {
      UI.showToast("Administrator Verified", `Elevated access granted for ${res.user.name}`, "success");
      this.navigate("dashboard");
    } else {
      UI.showToast("Access Denied", res.message, "error");
    }
  },

  handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const phone = document.getElementById("regPhone").value;
    const role = document.getElementById("regRole").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    const res = Auth.register({ name, email, phone, role, password, confirmPassword });
    if (res.success) {
      UI.showToast("Account Created", "Your enterprise account is ready.", "success");
      this.navigate("dashboard");
    } else {
      UI.showToast("Registration Error", res.message, "error");
    }
  },

  handlePasswordStrength(val) {
    const meter = document.getElementById("regMeterFill");
    const label = document.getElementById("regStrengthLabel");
    if (!meter || !label) return;

    const res = Auth.evaluatePasswordStrength(val);
    meter.style.width = res.percent + "%";
    meter.style.backgroundColor = res.color;
    label.textContent = `Password Strength: ${res.label}`;
    label.style.color = res.color;
  },

  loginDemoAndRedirect(roleKey) {
    const user = Auth.loginAsDemo(roleKey);
    UI.showToast("Demo Active", `Switched session to ${user.name} (${user.role})`, "success");
    this.navigate("dashboard");
  },

  quickRoleSwitchPrompt() {
    const roles = ["admin", "accountant", "staff", "viewer"];
    const current = Auth.getCurrentUser();
    const nextRole = prompt(`Current Role: ${current.role}\nType one of: admin, accountant, staff, viewer to switch demo role:`, "accountant");
    if (nextRole && roles.includes(nextRole.toLowerCase())) {
      this.loginDemoAndRedirect(nextRole.toLowerCase());
    }
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      input.type = "password";
      btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  },

  /* --------------------------------------------------------------------------
     11. Error & State Views (403, 404)
     -------------------------------------------------------------------------- */
  renderUnauthorized() {
    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return;

    contentArea.innerHTML = `
      <div class="empty-state" style="padding: 5rem 1.5rem;">
        <div class="empty-state-icon" style="background: rgba(244, 63, 94, 0.15); color: var(--expense-500); width: 80px; height: 80px; font-size: 2.2rem;">
          <i class="fas fa-lock"></i>
        </div>
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem;">403 — Unauthorized Access</h2>
        <p class="empty-state-desc">You do not possess the required administrator privileges to view this section. Please contact your system administrator.</p>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary" onclick="App.navigate('dashboard')">
            <i class="fas fa-house"></i> Return to Dashboard
          </button>
          <button class="btn btn-secondary" onclick="App.loginDemoAndRedirect('admin')">
            <i class="fas fa-shield-halved"></i> Switch to Super Admin
          </button>
        </div>
      </div>
    `;
  },

  render404(contentArea) {
    contentArea.innerHTML = `
      <div class="empty-state" style="padding: 5rem 1.5rem;">
        <div class="empty-state-icon" style="width: 80px; height: 80px; font-size: 2.2rem;">
          <i class="fas fa-circle-question"></i>
        </div>
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem;">404 — Page Not Found</h2>
        <p class="empty-state-desc">The requested accounting module or resource could not be found.</p>
        <button class="btn btn-primary" onclick="App.navigate('dashboard')">
          <i class="fas fa-house"></i> Go to Dashboard
        </button>
      </div>
    `;
  },

  /* --------------------------------------------------------------------------
     12. Global Form Handlers & Modal Submissions
     -------------------------------------------------------------------------- */
  setupEventListeners() {
    // Add Income Form Submission
    const addIncomeForm = document.getElementById("addIncomeForm");
    if (addIncomeForm) {
      addIncomeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const date = document.getElementById("incDate").value;
        const description = document.getElementById("incSource").value;
        const category = document.getElementById("incCategory").value;
        const amount = Number(document.getElementById("incAmount").value);
        const paymentMethod = document.getElementById("incPaymentMethod").value;
        const reference = document.getElementById("incReference").value;
        const notes = document.getElementById("incNotes").value;

        Store.addTransaction({
          date,
          description,
          category,
          type: "Income",
          amount,
          paymentMethod,
          reference,
          status: "Completed",
          notes
        });

        UI.closeModal("addIncomeModal");
        addIncomeForm.reset();
        UI.showToast("Income Added", `Recorded ₹ ${amount.toLocaleString('en-IN')} successfully.`, "success");
        this.navigate(this.currentView);
      });
    }

    // Add Expense Form Submission
    const addExpenseForm = document.getElementById("addExpenseForm");
    if (addExpenseForm) {
      addExpenseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const date = document.getElementById("expDate").value;
        const description = document.getElementById("expDesc").value;
        const category = document.getElementById("expCategory").value;
        const amount = Number(document.getElementById("expAmount").value);
        const paymentMethod = document.getElementById("expPaymentMethod").value;
        const reference = document.getElementById("expInvoiceNo").value;
        const notes = document.getElementById("expNotes").value;

        Store.addTransaction({
          date,
          description,
          category,
          type: "Expense",
          amount,
          paymentMethod,
          reference,
          status: "Completed",
          notes
        });

        UI.closeModal("addExpenseModal");
        addExpenseForm.reset();
        UI.showToast("Expense Recorded", `Recorded ₹ ${amount.toLocaleString('en-IN')} expense.`, "success");
        this.navigate(this.currentView);
      });
    }

    // Create Invoice Form Submission
    const createInvoiceForm = document.getElementById("createInvoiceForm");
    if (createInvoiceForm) {
      createInvoiceForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const customerName = document.getElementById("invClientName").value;
        const customerEmail = document.getElementById("invClientEmail").value;
        const customerAddress = document.getElementById("invClientAddress").value;
        const dueDate = document.getElementById("invDueDate").value;
        const taxRate = Number(document.getElementById("invTaxRate").value) || 18;
        const discountRate = Number(document.getElementById("invDiscountRate").value) || 0;
        const notes = document.getElementById("invNotes").value;

        // Collect item rows
        const itemRows = document.querySelectorAll("#invoiceItemsBody tr");
        const items = [];
        itemRows.forEach(row => {
          const desc = row.querySelector(".item-desc")?.value;
          const qty = Number(row.querySelector(".item-qty")?.value) || 1;
          const price = Number(row.querySelector(".item-price")?.value) || 0;
          if (desc && price > 0) {
            items.push({ description: desc, quantity: qty, price: price });
          }
        });

        if (items.length === 0) {
          UI.showToast("Error", "Please add at least one line item.", "warning");
          return;
        }

        const newInv = Store.addInvoice({
          customerName,
          customerEmail,
          customerAddress,
          dueDate,
          taxRate,
          discountRate,
          notes,
          items
        });

        UI.closeModal("createInvoiceModal");
        createInvoiceForm.reset();
        UI.showToast("Invoice Created", `Invoice ${newInv.id} generated successfully.`, "success");
        this.navigate("invoices");
      });
    }

    // Add User Form Submission
    const addUserForm = document.getElementById("addUserForm");
    if (addUserForm) {
      addUserForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("addUserName").value;
        const email = document.getElementById("addUserEmail").value;
        const role = document.getElementById("addUserRole").value;
        const phone = document.getElementById("addUserPhone").value;

        Store.addUser({ name, email, role, phone });
        UI.closeModal("addUserModal");
        addUserForm.reset();
        UI.showToast("User Created", `${name} added successfully.`, "success");
        if (this.currentView === "users") {
          this.renderUsers(document.getElementById("contentArea"));
        }
      });
    }
  },

  addInvoiceItemRow() {
    const tbody = document.getElementById("invoiceItemsBody");
    if (!tbody) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" class="form-input item-desc" placeholder="Service / Product Description" required></td>
      <td><input type="number" class="form-input item-qty" value="1" min="1" style="width: 70px;" oninput="App.calculateInvoiceModalTotals()" required></td>
      <td><input type="number" class="form-input item-price" placeholder="Price" style="width: 110px;" oninput="App.calculateInvoiceModalTotals()" required></td>
      <td style="text-align: right;"><button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove(); App.calculateInvoiceModalTotals();">&times;</button></td>
    `;
    tbody.appendChild(tr);
  },

  calculateInvoiceModalTotals() {
    const itemRows = document.querySelectorAll("#invoiceItemsBody tr");
    let subtotal = 0;
    itemRows.forEach(row => {
      const qty = Number(row.querySelector(".item-qty")?.value) || 0;
      const price = Number(row.querySelector(".item-price")?.value) || 0;
      subtotal += (qty * price);
    });

    const taxRate = Number(document.getElementById("invTaxRate")?.value) || 0;
    const discountRate = Number(document.getElementById("invDiscountRate")?.value) || 0;

    const discountAmt = (subtotal * discountRate) / 100;
    const taxable = subtotal - discountAmt;
    const taxAmt = (taxable * taxRate) / 100;
    const grandTotal = Math.round(taxable + taxAmt);

    const subElem = document.getElementById("invModalSubtotal");
    const taxElem = document.getElementById("invModalTax");
    const totalElem = document.getElementById("invModalGrandTotal");

    if (subElem) subElem.textContent = "₹ " + subtotal.toLocaleString('en-IN');
    if (taxElem) taxElem.textContent = "+ ₹ " + Math.round(taxAmt).toLocaleString('en-IN');
    if (totalElem) totalElem.textContent = "₹ " + grandTotal.toLocaleString('en-IN');
  },

  calculateGST() {
    const amount = Number(document.getElementById("gstCalcAmount")?.value) || 0;
    const rate = Number(document.getElementById("gstCalcRate")?.value) || 18;
    const mode = document.getElementById("gstCalcMode")?.value || "exclusive";

    let base = 0;
    let totalTax = 0;
    let grandTotal = 0;

    if (mode === "exclusive") {
      base = amount;
      totalTax = (amount * rate) / 100;
      grandTotal = base + totalTax;
    } else {
      base = amount / (1 + rate / 100);
      totalTax = amount - base;
      grandTotal = amount;
    }

    const halfTax = totalTax / 2;

    const baseEl = document.getElementById("gstResBase");
    const cgstEl = document.getElementById("gstResCGST");
    const sgstEl = document.getElementById("gstResSGST");
    const totalEl = document.getElementById("gstResTotal");

    if (baseEl) baseEl.textContent = "₹ " + Math.round(base).toLocaleString('en-IN');
    if (cgstEl) cgstEl.textContent = "₹ " + Math.round(halfTax).toLocaleString('en-IN');
    if (sgstEl) sgstEl.textContent = "₹ " + Math.round(halfTax).toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = "₹ " + Math.round(grandTotal).toLocaleString('en-IN');
  }
};

// Initialize App once DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
