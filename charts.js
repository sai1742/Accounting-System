/**
 * ApexLedger - Interactive Financial Visualizations Engine
 * Integrates Chart.js with dynamic theme switching and live store syncing
 */

const ChartsManager = {
  instances: {},

  getThemeColors() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      textColor: isDark ? "#94A3B8" : "#64748B",
      gridColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(226, 232, 240, 0.8)",
      tooltipBg: isDark ? "#1E293B" : "#FFFFFF",
      tooltipTitle: isDark ? "#F8FAFC" : "#0F172A",
      tooltipText: isDark ? "#CBD5E1" : "#475569",
      tooltipBorder: isDark ? "#334155" : "#E2E8F0"
    };
  },

  destroy(chartKey) {
    if (this.instances[chartKey]) {
      this.instances[chartKey].destroy();
      delete this.instances[chartKey];
    }
  },

  destroyAll() {
    Object.keys(this.instances).forEach(key => this.destroy(key));
  },

  /**
   * Monthly Income vs Expense Comparison Chart
   */
  renderIncomeExpenseChart(canvasId = "incomeExpenseChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    this.destroy("incomeExpense");
    const colors = this.getThemeColors();

    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const incomeData = [620000, 710000, 680000, 790000, 810000, 845000];
    const expenseData = [290000, 310000, 305000, 340000, 315000, 325000];

    this.instances.incomeExpense = new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Income (₹)",
            data: incomeData,
            backgroundColor: "rgba(16, 185, 129, 0.85)",
            borderColor: "#10B981",
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.65
          },
          {
            label: "Expenses (₹)",
            data: expenseData,
            backgroundColor: "rgba(244, 63, 94, 0.85)",
            borderColor: "#F43F5E",
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.65
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              color: colors.textColor,
              usePointStyle: true,
              pointStyle: "circle",
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: "600" }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipTitle,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ₹ ${context.parsed.y.toLocaleString('en-IN')}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: function (val) {
                return "₹" + (val / 1000) + "k";
              }
            }
          }
        }
      }
    });
  },

  /**
   * Expense Distribution Donut Chart
   */
  renderExpenseDonutChart(canvasId = "expenseDonutChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    this.destroy("expenseDonut");
    const colors = this.getThemeColors();

    const categories = ["Salaries", "Rent", "Equipment", "Marketing", "Electricity", "Internet", "Travel", "Supplies"];
    const amounts = [145000, 85000, 32000, 24000, 18500, 7500, 6500, 6500];

    const chartColors = [
      "#6366F1", // Indigo
      "#0EA5E9", // Cyan
      "#F59E0B", // Amber
      "#EC4899", // Pink
      "#8B5CF6", // Purple
      "#10B981", // Emerald
      "#3B82F6", // Blue
      "#64748B"  // Slate
    ];

    this.instances.expenseDonut = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categories,
        datasets: [
          {
            data: amounts,
            backgroundColor: chartColors,
            borderColor: document.documentElement.getAttribute("data-theme") === "dark" ? "#111827" : "#FFFFFF",
            borderWidth: 3,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors.textColor,
              boxWidth: 10,
              usePointStyle: true,
              pointStyle: "circle",
              padding: 14,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: "500" }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipTitle,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.parsed;
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${context.label}: ₹ ${val.toLocaleString('en-IN')} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  /**
   * Monthly Cash Flow Timeline Area Chart
   */
  renderCashFlowChart(canvasId = "cashFlowChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    this.destroy("cashFlow");
    const colors = this.getThemeColors();

    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const netCashFlow = [330000, 400000, 375000, 450000, 495000, 520000];

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.45)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.01)");

    this.instances.cashFlow = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Net Cash Flow (₹)",
            data: netCashFlow,
            borderColor: "#6366F1",
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#6366F1",
            pointBorderColor: "#FFFFFF",
            pointHoverRadius: 6,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipTitle,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (context) {
                return ` Net Cash: ₹ ${context.parsed.y.toLocaleString('en-IN')}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: function (val) {
                return "₹" + (val / 1000) + "k";
              }
            }
          }
        }
      }
    });
  },

  /**
   * Re-render all active charts when theme changes
   */
  updateTheme() {
    if (this.instances.incomeExpense) this.renderIncomeExpenseChart();
    if (this.instances.expenseDonut) this.renderExpenseDonutChart();
    if (this.instances.cashFlow) this.renderCashFlowChart();
  }
};
