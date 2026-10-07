/**
 * ApexLedger - UI Micro-Interactions, Toasts, Modals, Search & Theme Controller
 */

const UI = {
  init() {
    this.initTheme();
    this.setupGlobalShortcuts();
    this.setupGlobalListeners();
  },

  /* --------------------------------------------------------------------------
     Theme Management
     -------------------------------------------------------------------------- */
  initTheme() {
    const savedTheme = localStorage.getItem("apex_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeIcons(savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("apex_theme", next);
    this.updateThemeIcons(next);

    if (window.ChartsManager) {
      ChartsManager.updateTheme();
    }

    this.showToast("Theme Updated", `Switched to ${next} mode.`, "info", 2000);
  },

  updateThemeIcons(theme) {
    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
      btn.innerHTML = theme === "dark"
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
      btn.setAttribute("title", `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`);
    }
  },

  /* --------------------------------------------------------------------------
     Toast System
     -------------------------------------------------------------------------- */
  showToast(title, message, type = "info", duration = 3500) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "fa-info-circle text-info";
    if (type === "success") icon = "fa-check-circle text-profit";
    if (type === "error" || type === "danger") icon = "fa-exclamation-circle text-expense";
    if (type === "warning") icon = "fa-triangle-exclamation text-warning";

    toast.innerHTML = `
      <i class="fas ${icon} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(30px)";
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  },

  /* --------------------------------------------------------------------------
     Modal Controllers
     -------------------------------------------------------------------------- */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      const firstInput = modal.querySelector("input:not([type=hidden]), select");
      if (firstInput) setTimeout(() => firstInput.focus(), 150);
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      if (!document.querySelector(".modal-overlay.active")) {
        document.body.style.overflow = "";
      }
    }
  },

  closeAllModals() {
    document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
    document.body.style.overflow = "";
  },

  /* --------------------------------------------------------------------------
     Sidebar Controllers
     -------------------------------------------------------------------------- */
  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("mobile-open");
    } else {
      sidebar.classList.toggle("collapsed");
    }
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("mobile-open");
  },

  /* --------------------------------------------------------------------------
     Global Shortcuts & Click Outside Handlers
     -------------------------------------------------------------------------- */
  setupGlobalShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Escape closes modals and dropdowns
      if (e.key === "Escape") {
        this.closeAllModals();
        this.closeAllDropdowns();
      }

      // Ctrl + K or Cmd + K triggers global search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.openGlobalSearch();
      }
    });
  },

  setupGlobalListeners() {
    // Backdrop click on modal overlay closes it
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.closeModal(e.target.id);
      }

      // Close dropdowns if clicking outside
      if (!e.target.closest(".dropdown")) {
        this.closeAllDropdowns();
      }
    });
  },

  toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    const isShowing = dropdown.classList.contains("active");
    this.closeAllDropdowns();
    if (!isShowing) {
      dropdown.classList.add("active");
    }
  },

  closeAllDropdowns() {
    document.querySelectorAll(".dropdown-menu.active").forEach(d => d.classList.remove("active"));
  },

  /* --------------------------------------------------------------------------
     Global Search Command Palette (Ctrl+K)
     -------------------------------------------------------------------------- */
  openGlobalSearch() {
    this.openModal("globalSearchModal");
    const input = document.getElementById("globalSearchInput");
    if (input) {
      input.value = "";
      this.executeGlobalSearch("");
      input.focus();
    }
  },

  executeGlobalSearch(query) {
    const resultsContainer = document.getElementById("globalSearchResults");
    if (!resultsContainer) return;

    const q = query.trim().toLowerCase();
    const transactions = Store.getTransactions();
    const invoices = Store.getInvoices();
    const users = Store.getUsers();

    if (!q) {
      resultsContainer.innerHTML = `
        <div class="cmd-group-title">Quick Actions</div>
        <div class="cmd-item" onclick="App.navigate('transactions'); UI.closeModal('globalSearchModal');">
          <span><i class="fas fa-receipt text-primary"></i> View All Transactions</span>
          <span class="cmd-badge">Shift + T</span>
        </div>
        <div class="cmd-item" onclick="App.navigate('invoices'); UI.closeModal('globalSearchModal');">
          <span><i class="fas fa-file-invoice-dollar text-warning"></i> View Invoices</span>
          <span class="cmd-badge">Shift + I</span>
        </div>
        <div class="cmd-item" onclick="App.navigate('reports'); UI.closeModal('globalSearchModal');">
          <span><i class="fas fa-chart-line text-profit"></i> Profit & Loss Report</span>
          <span class="cmd-badge">Shift + R</span>
        </div>
      `;
      return;
    }

    // Filter across records
    const matchedTxns = transactions.filter(t =>
      t.id.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedInvoices = invoices.filter(i =>
      i.id.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedUsers = users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    ).slice(0, 3);

    let html = "";

    if (matchedTxns.length > 0) {
      html += `<div class="cmd-group-title">Transactions (${matchedTxns.length})</div>`;
      matchedTxns.forEach(t => {
        html += `
          <div class="cmd-item" onclick="App.navigate('transactions'); UI.closeModal('globalSearchModal');">
            <span><strong>${t.id}</strong> — ${t.description}</span>
            <span class="cmd-badge ${t.type === 'Income' ? 'text-profit' : 'text-expense'}">₹ ${Number(t.amount).toLocaleString('en-IN')}</span>
          </div>
        `;
      });
    }

    if (matchedInvoices.length > 0) {
      html += `<div class="cmd-group-title">Invoices (${matchedInvoices.length})</div>`;
      matchedInvoices.forEach(i => {
        html += `
          <div class="cmd-item" onclick="App.viewInvoiceDetail('${i.id}'); UI.closeModal('globalSearchModal');">
            <span><strong>${i.id}</strong> — ${i.customerName}</span>
            <span class="cmd-badge">${i.status}</span>
          </div>
        `;
      });
    }

    if (matchedUsers.length > 0) {
      html += `<div class="cmd-group-title">Users (${matchedUsers.length})</div>`;
      matchedUsers.forEach(u => {
        html += `
          <div class="cmd-item" onclick="App.navigate('users'); UI.closeModal('globalSearchModal');">
            <span><strong>${u.name}</strong> (${u.email})</span>
            <span class="cmd-badge">${u.role}</span>
          </div>
        `;
      });
    }

    if (!html) {
      html = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <div class="empty-state-icon" style="width: 44px; height: 44px; font-size: 1.25rem;"><i class="fas fa-search"></i></div>
          <div class="empty-state-title" style="font-size: 1rem;">No matching financial records</div>
          <p class="empty-state-desc" style="font-size: 0.8rem;">Try searching for transaction descriptions, invoice numbers, or client names.</p>
        </div>
      `;
    }

    resultsContainer.innerHTML = html;
  },

  /* --------------------------------------------------------------------------
     Export Helpers (CSV / Print)
     -------------------------------------------------------------------------- */
  exportToCSV(filename, rows) {
    if (!rows || !rows.length) {
      this.showToast("Export Failed", "No records found to export.", "warning");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => headers.map(fieldName => {
        let val = row[fieldName] !== undefined ? String(row[fieldName]) : "";
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast("Export Success", `Downloaded ${filename} successfully.`, "success");
    Store.addAuditLog("CSV Export", `Exported ${filename}`);
  },

  printPage() {
    window.print();
  },

  /* --------------------------------------------------------------------------
     Currency & Number Formatting
     -------------------------------------------------------------------------- */
  formatINR(amount) {
    const num = Number(amount) || 0;
    return "₹ " + num.toLocaleString("en-IN");
  },

  animateCounter(element, targetValue, duration = 800) {
    if (!element) return;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const currentVal = Math.round(start + (targetValue - start) * ease);

      element.textContent = "₹ " + currentVal.toLocaleString("en-IN");

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = "₹ " + targetValue.toLocaleString("en-IN");
      }
    }

    requestAnimationFrame(update);
  }
};
