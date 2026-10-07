/**
 * ApexLedger - Reactive LocalStorage Data Store
 * Provides full state management, CRUD, metric recalculations, and persistence
 */

const Store = {
  KEYS: {
    METRICS: "apex_metrics",
    TRANSACTIONS: "apex_transactions",
    INVOICES: "apex_invoices",
    USERS: "apex_users",
    NOTIFICATIONS: "apex_notifications",
    AUDIT_LOGS: "apex_audit_logs",
    SETTINGS: "apex_settings",
    CURRENT_USER: "apex_current_user",
    BUDGETS: "apex_budgets"
  },

  init() {
    if (!localStorage.getItem(this.KEYS.TRANSACTIONS)) {
      this.resetToDefaults();
    }
  },

  resetToDefaults() {
    localStorage.setItem(this.KEYS.METRICS, JSON.stringify(INITIAL_FINANCIAL_METRICS));
    localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(DEFAULT_INVOICES));
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(this.KEYS.AUDIT_LOGS, JSON.stringify(DEFAULT_AUDIT_LOGS));
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
    localStorage.setItem(this.KEYS.BUDGETS, JSON.stringify(DEFAULT_CATEGORY_BUDGETS));
    this.recalculateMetrics();
  },

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Store read error for key", key, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Store write error for key", key, e);
    }
  },

  /* --- Financial Metrics Engine --- */
  getMetrics() {
    return this.get(this.KEYS.METRICS) || INITIAL_FINANCIAL_METRICS;
  },

  recalculateMetrics() {
    const transactions = this.getTransactions();
    const invoices = this.getInvoices();

    let totalIncome = 0;
    let totalExpenses = 0;
    let pendingTxnAmount = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    let todayIncome = 0;
    let todayExpenses = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.status === "Completed") {
        if (t.type === "Income") {
          totalIncome += amt;
          if (t.date === todayStr) todayIncome += amt;
        } else if (t.type === "Expense") {
          totalExpenses += amt;
          if (t.date === todayStr) todayExpenses += amt;
        }
      } else if (t.status === "Pending") {
        pendingTxnAmount += amt;
      }
    });

    let pendingInvoiceAmount = 0;
    invoices.forEach(inv => {
      if (inv.status === "Pending" || inv.status === "Overdue") {
        const subtotal = inv.items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);
        const discount = (subtotal * (Number(inv.discountRate) || 0)) / 100;
        const taxable = subtotal - discount;
        const tax = (taxable * (Number(inv.taxRate) || 0)) / 100;
        pendingInvoiceAmount += (taxable + tax);
      }
    });

    const netBalance = totalIncome - totalExpenses;
    const totalPending = pendingTxnAmount > 0 ? pendingTxnAmount : Math.round(pendingInvoiceAmount);

    const metrics = {
      totalIncome,
      totalExpenses,
      netBalance,
      pendingPayments: totalPending,
      todayIncome,
      todayExpenses,
      monthGrowth: "+14.2%",
      incomeRatio: totalIncome > 0 ? `${((totalIncome / (totalIncome + totalExpenses)) * 100).toFixed(1)}%` : "0%",
      expenseRatio: totalExpenses > 0 ? `${((totalExpenses / (totalIncome + totalExpenses)) * 100).toFixed(1)}%` : "0%",
      totalAssets: netBalance + 930000,
      totalLiabilities: Math.round(totalExpenses * 0.45)
    };

    this.set(this.KEYS.METRICS, metrics);
    return metrics;
  },

  /* --- Transactions CRUD --- */
  getTransactions() {
    return this.get(this.KEYS.TRANSACTIONS) || [];
  },

  addTransaction(txn) {
    const list = this.getTransactions();
    const newTxn = {
      id: txn.id || `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: txn.date || new Date().toISOString().split("T")[0],
      description: txn.description || "Office Transaction",
      category: txn.category || "Other",
      type: txn.type || "Expense",
      amount: Number(txn.amount) || 0,
      paymentMethod: txn.paymentMethod || "Bank Transfer",
      reference: txn.reference || "N/A",
      status: txn.status || "Completed",
      notes: txn.notes || ""
    };
    list.unshift(newTxn);
    this.set(this.KEYS.TRANSACTIONS, list);
    this.recalculateMetrics();

    this.addAuditLog(
      `${newTxn.type} Added`,
      `${newTxn.id} (${newTxn.category}) - ₹ ${newTxn.amount.toLocaleString('en-IN')}`
    );

    return newTxn;
  },

  deleteTransaction(id) {
    let list = this.getTransactions();
    const found = list.find(t => t.id === id);
    list = list.filter(t => t.id !== id);
    this.set(this.KEYS.TRANSACTIONS, list);
    this.recalculateMetrics();

    if (found) {
      this.addAuditLog("Transaction Deleted", `Removed ${found.id} - ${found.description}`);
    }
  },

  /* --- Invoices CRUD --- */
  getInvoices() {
    return this.get(this.KEYS.INVOICES) || [];
  },

  addInvoice(inv) {
    const list = this.getInvoices();
    const newInv = {
      id: inv.id || `INV-2026-${String(list.length + 1).padStart(3, "0")}`,
      customerName: inv.customerName,
      customerEmail: inv.customerEmail,
      customerAddress: inv.customerAddress || "Commercial Complex, Bengaluru",
      date: inv.date || new Date().toISOString().split("T")[0],
      dueDate: inv.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      status: inv.status || "Pending",
      items: inv.items && inv.items.length ? inv.items : [{ description: "Consulting Service", quantity: 1, price: 10000 }],
      taxRate: Number(inv.taxRate) || 18,
      discountRate: Number(inv.discountRate) || 0,
      notes: inv.notes || "Thank you for doing business with ApexLedger."
    };
    list.unshift(newInv);
    this.set(this.KEYS.INVOICES, list);
    this.recalculateMetrics();

    this.addAuditLog("Invoice Generated", `Created ${newInv.id} for ${newInv.customerName}`);
    return newInv;
  },

  updateInvoiceStatus(id, newStatus) {
    const list = this.getInvoices();
    const inv = list.find(i => i.id === id);
    if (inv) {
      inv.status = newStatus;
      this.set(this.KEYS.INVOICES, list);
      this.recalculateMetrics();
      this.addAuditLog("Invoice Updated", `Marked ${id} as ${newStatus}`);
    }
  },

  deleteInvoice(id) {
    let list = this.getInvoices();
    list = list.filter(i => i.id !== id);
    this.set(this.KEYS.INVOICES, list);
    this.recalculateMetrics();
    this.addAuditLog("Invoice Deleted", `Removed invoice ${id}`);
  },

  /* --- Users CRUD --- */
  getUsers() {
    return this.get(this.KEYS.USERS) || [];
  },

  addUser(usr) {
    const list = this.getUsers();
    const initials = usr.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const newUser = {
      id: `usr-${String(list.length + 1).padStart(2, "0")}`,
      name: usr.name,
      username: usr.username || usr.email.split("@")[0],
      email: usr.email,
      role: usr.role || "Staff",
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0],
      phone: usr.phone || "+91 98000 00000",
      avatar: initials || "AP"
    };
    list.push(newUser);
    this.set(this.KEYS.USERS, list);
    this.addAuditLog("User Created", `Registered ${newUser.name} with role ${newUser.role}`);
    return newUser;
  },

  toggleUserStatus(id) {
    const list = this.getUsers();
    const usr = list.find(u => u.id === id);
    if (usr) {
      usr.status = usr.status === "Active" ? "Inactive" : "Active";
      this.set(this.KEYS.USERS, list);
      this.addAuditLog("User Status Changed", `${usr.name} status is now ${usr.status}`);
      return usr.status;
    }
  },

  changeUserRole(id, newRole) {
    const list = this.getUsers();
    const usr = list.find(u => u.id === id);
    if (usr) {
      usr.role = newRole;
      this.set(this.KEYS.USERS, list);
      this.addAuditLog("User Role Updated", `Changed ${usr.name} role to ${newRole}`);
    }
  },

  deleteUser(id) {
    let list = this.getUsers();
    const usr = list.find(u => u.id === id);
    list = list.filter(u => u.id !== id);
    this.set(this.KEYS.USERS, list);
    if (usr) {
      this.addAuditLog("User Removed", `Deleted user account for ${usr.name}`);
    }
  },

  /* --- Notifications & Audit Logs --- */
  getNotifications() {
    return this.get(this.KEYS.NOTIFICATIONS) || [];
  },

  markAllNotificationsRead() {
    const list = this.getNotifications();
    list.forEach(n => n.read = true);
    this.set(this.KEYS.NOTIFICATIONS, list);
  },

  getAuditLogs() {
    return this.get(this.KEYS.AUDIT_LOGS) || [];
  },

  addAuditLog(action, details) {
    const logs = this.getAuditLogs();
    const currentUser = Auth.getCurrentUser();
    const date = new Date();
    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = date.toISOString().split("T")[0];

    const newLog = {
      id: `log-${Date.now()}`,
      user: currentUser ? currentUser.name : "System",
      role: currentUser ? currentUser.role : "Super Admin",
      action: action,
      details: details,
      timestamp: `${dateFormatted} ${timeFormatted}`,
      ip: "192.168.1." + Math.floor(100 + Math.random() * 50),
      status: "Success"
    };

    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    this.set(this.KEYS.AUDIT_LOGS, logs);
  },

  /* --- Settings --- */
  getSettings() {
    return this.get(this.KEYS.SETTINGS) || DEFAULT_SYSTEM_SETTINGS;
  },

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    this.set(this.KEYS.SETTINGS, updated);
    this.addAuditLog("Settings Updated", "System preferences and company profile modified");
    return updated;
  },

  /* --- Budgets & Variance Analysis --- */
  getBudgets() {
    const budgets = this.get(this.KEYS.BUDGETS) || DEFAULT_CATEGORY_BUDGETS;
    const transactions = this.getTransactions();

    // Dynamically calculate spent amount from actual transactions
    return budgets.map(b => {
      const actualSpent = transactions
        .filter(t => t.type === "Expense" && t.category === b.category && t.status === "Completed")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      const spent = actualSpent > 0 ? actualSpent : b.spent;
      const variance = b.monthlyBudget - spent;
      const percentage = Math.round((spent / b.monthlyBudget) * 100);

      return {
        ...b,
        spent,
        variance,
        percentage,
        isOverBudget: spent > b.monthlyBudget
      };
    });
  },

  /* --- GST / Tax Compliance Computation --- */
  getGSTReport() {
    const invoices = this.getInvoices();
    const transactions = this.getTransactions();

    let grossTaxableSales = 0;
    let totalOutputGST = 0;

    invoices.forEach(inv => {
      const subtotal = inv.items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);
      const discount = (subtotal * (Number(inv.discountRate) || 0)) / 100;
      const taxable = subtotal - discount;
      const tax = (taxable * (Number(inv.taxRate) || 18)) / 100;

      grossTaxableSales += taxable;
      totalOutputGST += tax;
    });

    // Eligible Input Tax Credit (ITC) from verified business expenses
    let eligibleITC = 0;
    transactions.forEach(t => {
      if (t.type === "Expense" && t.status === "Completed") {
        if (["Equipment", "Internet", "Electricity", "Office Supplies"].includes(t.category)) {
          // 18% GST element embedded in commercial bills
          eligibleITC += Math.round(Number(t.amount) * 0.18 / 1.18);
        }
      }
    });

    const netGSTPayable = Math.max(0, Math.round(totalOutputGST - eligibleITC));

    return {
      grossTaxableSales: Math.round(grossTaxableSales),
      totalOutputGST: Math.round(totalOutputGST),
      cgstOutput: Math.round(totalOutputGST / 2),
      sgstOutput: Math.round(totalOutputGST / 2),
      eligibleITC,
      netGSTPayable
    };
  },

  /* --- Accounts Receivable Aging Analysis --- */
  getReceivablesAging() {
    const invoices = this.getInvoices().filter(i => i.status === "Pending" || i.status === "Overdue");
    const today = new Date();

    const buckets = {
      current: { label: "0-15 Days (Current)", items: [], total: 0 },
      overdue1: { label: "16-30 Days", items: [], total: 0 },
      overdue2: { label: "31-60 Days", items: [], total: 0 },
      critical: { label: "60+ Days (Critical)", items: [], total: 0 }
    };

    invoices.forEach(inv => {
      const subtotal = inv.items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity)), 0);
      const discount = (subtotal * (Number(inv.discountRate) || 0)) / 100;
      const total = Math.round((subtotal - discount) * (1 + (Number(inv.taxRate) || 18) / 100));

      const due = new Date(inv.dueDate);
      const diffDays = Math.round((today - due) / (1000 * 60 * 60 * 24));

      const invData = { ...inv, total, daysDiff: diffDays };

      if (diffDays <= 15) {
        buckets.current.items.push(invData);
        buckets.current.total += total;
      } else if (diffDays <= 30) {
        buckets.overdue1.items.push(invData);
        buckets.overdue1.total += total;
      } else if (diffDays <= 60) {
        buckets.overdue2.items.push(invData);
        buckets.overdue2.total += total;
      } else {
        buckets.critical.items.push(invData);
        buckets.critical.total += total;
      }
    });

    return buckets;
  }
};

// Initialize default data if fresh
Store.init();
