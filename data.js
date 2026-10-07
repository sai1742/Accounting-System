/**
 * ApexLedger - Default Initial Data Model
 * Realistic Office Accounting Sample Data matching Indian Rupee (₹) requirements
 */

const INITIAL_FINANCIAL_METRICS = {
  totalIncome: 845000,
  totalExpenses: 325000,
  netBalance: 520000,
  pendingPayments: 78500,
  todayIncome: 35000,
  todayExpenses: 8500,
  monthGrowth: "+14.2%",
  incomeRatio: "72.2%",
  expenseRatio: "27.8%",
  totalAssets: 1450000,
  totalLiabilities: 185000
};

const EXPENSE_CATEGORIES = [
  "Rent",
  "Salary",
  "Electricity",
  "Internet",
  "Office Supplies",
  "Travel",
  "Maintenance",
  "Equipment",
  "Marketing",
  "Other"
];

const INCOME_CATEGORIES = [
  "Client Retainer",
  "Software Consulting",
  "Web Development",
  "Product License",
  "Maintenance Contract",
  "Other"
];

const PAYMENT_METHODS = [
  "UPI",
  "Bank Transfer",
  "Cash",
  "Card",
  "Cheque"
];

const USER_ROLES = [
  "Super Admin",
  "Admin",
  "Accountant",
  "Staff",
  "Viewer"
];

const DEFAULT_USERS = [
  {
    id: "usr-01",
    name: "Rajesh Sharma",
    username: "admin",
    email: "admin@apexledger.com",
    role: "Super Admin",
    status: "Active",
    joinedDate: "2025-01-10",
    phone: "+91 98200 12345",
    avatar: "RS"
  },
  {
    id: "usr-02",
    name: "Priya Patel",
    username: "priya_acc",
    email: "accountant@apexledger.com",
    role: "Accountant",
    status: "Active",
    joinedDate: "2025-03-15",
    phone: "+91 98450 67890",
    avatar: "PP"
  },
  {
    id: "usr-03",
    name: "Amit Verma",
    username: "amit_ops",
    email: "staff@apexledger.com",
    role: "Staff",
    status: "Active",
    joinedDate: "2025-06-20",
    phone: "+91 98765 43210",
    avatar: "AV"
  },
  {
    id: "usr-04",
    name: "Sneha Rao",
    username: "sneha_r",
    email: "viewer@apexledger.com",
    role: "Viewer",
    status: "Active",
    joinedDate: "2025-09-01",
    phone: "+91 99123 45678",
    avatar: "SR"
  }
];

const DEFAULT_TRANSACTIONS = [
  {
    id: "TXN-8091",
    date: "2026-10-02",
    description: "Enterprise Cloud ERP Retainer Q3",
    category: "Software Consulting",
    type: "Income",
    amount: 175000,
    paymentMethod: "Bank Transfer",
    reference: "HDFC-N987211",
    status: "Completed",
    notes: "Quarterly retainer payment from Infosys Global"
  },
  {
    id: "TXN-8090",
    date: "2026-10-01",
    description: "Office Space Monthly Lease - Floor 4",
    category: "Rent",
    type: "Expense",
    amount: 85000,
    paymentMethod: "Bank Transfer",
    reference: "NEFT-B776102",
    status: "Completed",
    notes: "Commercial office rent paid to DLF CyberCity Properties"
  },
  {
    id: "TXN-8089",
    date: "2026-10-01",
    description: "Executive & Engineering Staff Payroll Sept",
    category: "Salary",
    type: "Expense",
    amount: 145000,
    paymentMethod: "Bank Transfer",
    reference: "CMS-SAL-202609",
    status: "Completed",
    notes: "Net salaries disbursed for office staff"
  },
  {
    id: "TXN-8088",
    date: "2026-09-28",
    description: "Fintech Mobile App UI/UX Milestone 2",
    category: "Web Development",
    type: "Income",
    amount: 120000,
    paymentMethod: "UPI",
    reference: "UPI-9012384761",
    status: "Completed",
    notes: "Milestone payment from BharatPay"
  },
  {
    id: "TXN-8087",
    date: "2026-09-26",
    description: "Commercial Electricity Bill - Aug/Sept",
    category: "Electricity",
    type: "Expense",
    amount: 18500,
    paymentMethod: "UPI",
    reference: "BESCOM-991204",
    status: "Completed",
    notes: "State power grid consumption charges"
  },
  {
    id: "TXN-8086",
    date: "2026-09-24",
    description: "Dedicated 1Gbps Leased Line Fiber Internet",
    category: "Internet",
    type: "Expense",
    amount: 7500,
    paymentMethod: "Card",
    reference: "AIRTEL-CORP-44",
    status: "Completed",
    notes: "Monthly enterprise internet and static IPs"
  },
  {
    id: "TXN-8085",
    date: "2026-09-22",
    description: "SaaS Accounting Custom Module Integration",
    category: "Client Retainer",
    type: "Income",
    amount: 210000,
    paymentMethod: "Bank Transfer",
    reference: "ICICI-RTGS-5510",
    status: "Completed",
    notes: "Full advance for backend data connector setup"
  },
  {
    id: "TXN-8084",
    date: "2026-09-18",
    description: "Ergonomic Chairs & Dual Monitor Stands",
    category: "Equipment",
    type: "Expense",
    amount: 32000,
    paymentMethod: "Card",
    reference: "INV-FEATHER-89",
    status: "Completed",
    notes: "Purchased from Featherlite Office Systems"
  },
  {
    id: "TXN-8083",
    date: "2026-09-15",
    description: "Monthly Digital Marketing & Lead Campaign",
    category: "Marketing",
    type: "Expense",
    amount: 24000,
    paymentMethod: "Card",
    reference: "GOOGLE-ADS-991",
    status: "Completed",
    notes: "B2B LinkedIn & Google Search campaigns"
  },
  {
    id: "TXN-8082",
    date: "2026-09-12",
    description: "Annual Annual Maintenance Contract (AMC)",
    category: "Maintenance Contract",
    type: "Income",
    amount: 90000,
    paymentMethod: "Cheque",
    reference: "CHQ-002819",
    status: "Completed",
    notes: "Clearing completed via Axis Bank"
  },
  {
    id: "TXN-8081",
    date: "2026-09-08",
    description: "Office Pantry Supplies & Coffee Machine Refills",
    category: "Office Supplies",
    type: "Expense",
    amount: 6500,
    paymentMethod: "UPI",
    reference: "METRO-CASH-710",
    status: "Completed",
    notes: "Monthly beverage and stationery supplies"
  },
  {
    id: "TXN-8080",
    date: "2026-09-05",
    description: "Client On-site Workshop & Flight Tickets",
    category: "Travel",
    type: "Expense",
    amount: 6500,
    paymentMethod: "Card",
    reference: "INDIGO-P6710",
    status: "Completed",
    notes: "Mumbai to Delhi site visit"
  },
  {
    id: "TXN-8079",
    date: "2026-09-02",
    description: "Web Portal Security Audit & Pen-testing",
    category: "Software Consulting",
    type: "Income",
    amount: 250000,
    paymentMethod: "Bank Transfer",
    reference: "HDFC-NEFT-6712",
    status: "Completed",
    notes: "Security compliance certification deliverable"
  },
  {
    id: "TXN-8078",
    date: "2026-10-03",
    description: "Consultancy Retainer Invoice #INV-2026-042",
    category: "Client Retainer",
    type: "Income",
    amount: 78500,
    paymentMethod: "Bank Transfer",
    reference: "PENDING-APPROVAL",
    status: "Pending",
    notes: "Pending client accounts verification"
  }
];

const DEFAULT_INVOICES = [
  {
    id: "INV-2026-001",
    customerName: "Tata Consultancy Services",
    customerEmail: "billing@tcs.corp",
    customerAddress: "Tech Park, Whitefield, Bengaluru - 560066",
    date: "2026-09-15",
    dueDate: "2026-10-15",
    status: "Paid",
    items: [
      { description: "Office Cloud Infrastructure Architecture", quantity: 1, price: 120000 },
      { description: "Database Clustering & Replication Setup", quantity: 1, price: 55000 }
    ],
    taxRate: 18,
    discountRate: 5,
    notes: "Payment received via Wire Transfer. Thank you for your partnership."
  },
  {
    id: "INV-2026-002",
    customerName: "Reliance Retail Digital",
    customerEmail: "accounts.fin@reliance.in",
    customerAddress: "Reliance Corporate Park, Navi Mumbai - 400701",
    date: "2026-09-20",
    dueDate: "2026-10-10",
    status: "Pending",
    items: [
      { description: "Custom Inventory & Accounting Sync Module", quantity: 1, price: 70000 },
      { description: "API Integration & Testing", quantity: 1, price: 8500 }
    ],
    taxRate: 18,
    discountRate: 0,
    notes: "Payment terms: Net 20 days."
  },
  {
    id: "INV-2026-003",
    customerName: "Zomato Logistics Tech",
    customerEmail: "finance@zomatotech.com",
    customerAddress: "DLF Cyber City, Phase 2, Gurugram - 122002",
    date: "2026-08-25",
    dueDate: "2026-09-25",
    status: "Overdue",
    items: [
      { description: "Real-time Expense Settlement Pipeline", quantity: 1, price: 95000 },
      { description: "User Training Workshop (2 Sessions)", quantity: 2, price: 15000 }
    ],
    taxRate: 18,
    discountRate: 2,
    notes: "Second notice issued. Kindly clear the outstanding invoice."
  },
  {
    id: "INV-2026-004",
    customerName: "Wipro Digital Solutions",
    customerEmail: "procure@wipro.com",
    customerAddress: "Sarjapur Road, Doddakannelli, Bengaluru - 560035",
    date: "2026-09-28",
    dueDate: "2026-10-28",
    status: "Paid",
    items: [
      { description: "Quarterly Financial Compliance Automation", quantity: 1, price: 150000 }
    ],
    taxRate: 18,
    discountRate: 0,
    notes: "Payment settled on 2026-09-30."
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-01",
    title: "Payment Received",
    message: "HDFC Bank credited ₹ 1,75,000 for Enterprise Cloud ERP Retainer Q3.",
    time: "10 minutes ago",
    type: "success",
    read: false
  },
  {
    id: "notif-02",
    title: "Pending Payment Alert",
    message: "Invoice #INV-2026-002 for ₹ 78,500 due on Oct 10 from Reliance Retail.",
    time: "2 hours ago",
    type: "warning",
    read: false
  },
  {
    id: "notif-03",
    title: "Invoice Overdue",
    message: "Invoice #INV-2026-003 for Zomato Logistics is overdue by 8 days.",
    time: "1 day ago",
    type: "danger",
    read: false
  },
  {
    id: "notif-04",
    title: "Monthly Payroll Disbursed",
    message: "September staff payroll of ₹ 1,45,000 was successfully processed.",
    time: "2 days ago",
    type: "info",
    read: true
  }
];

const DEFAULT_AUDIT_LOGS = [
  {
    id: "log-01",
    user: "Rajesh Sharma",
    role: "Super Admin",
    action: "System Login",
    details: "Logged in via Multi-Factor Authentication",
    timestamp: "2026-10-03 10:45 AM",
    ip: "192.168.1.104",
    status: "Success"
  },
  {
    id: "log-02",
    user: "Priya Patel",
    role: "Accountant",
    action: "Income Added",
    details: "Added TXN-8091 (₹ 1,75,000) for Software Consulting",
    timestamp: "2026-10-02 04:15 PM",
    ip: "192.168.1.112",
    status: "Success"
  },
  {
    id: "log-03",
    user: "Rajesh Sharma",
    role: "Super Admin",
    action: "Invoice Created",
    details: "Created INV-2026-002 for Reliance Retail Digital",
    timestamp: "2026-09-20 11:30 AM",
    ip: "192.168.1.104",
    status: "Success"
  },
  {
    id: "log-04",
    user: "Amit Verma",
    role: "Staff",
    action: "Expense Submitted",
    details: "Submitted TXN-8080 (₹ 6,500) Travel reimbursement",
    timestamp: "2026-09-05 02:40 PM",
    ip: "192.168.1.120",
    status: "Success"
  },
  {
    id: "log-05",
    user: "Priya Patel",
    role: "Accountant",
    action: "Tax Report Export",
    details: "Generated and exported Q2 GST summary report",
    timestamp: "2026-09-01 05:00 PM",
    ip: "192.168.1.112",
    status: "Success"
  }
];

const DEFAULT_CATEGORY_BUDGETS = [
  { category: "Salary", monthlyBudget: 150000, spent: 145000 },
  { category: "Rent", monthlyBudget: 85000, spent: 85000 },
  { category: "Equipment", monthlyBudget: 40000, spent: 32000 },
  { category: "Marketing", monthlyBudget: 30000, spent: 24000 },
  { category: "Electricity", monthlyBudget: 15000, spent: 18500 },
  { category: "Internet", monthlyBudget: 10000, spent: 7500 },
  { category: "Travel", monthlyBudget: 12000, spent: 6500 },
  { category: "Office Supplies", monthlyBudget: 8000, spent: 6500 }
];

const DEFAULT_SYSTEM_SETTINGS = {
  currency: "INR",
  currencySymbol: "₹",
  dateFormat: "DD/MM/YYYY",
  companyName: "Apex Technologies & Office Solutions Ltd.",
  companyGSTIN: "29AABCU9603R1ZX",
  companyEmail: "accounts@apexledger.com",
  companyPhone: "+91 (080) 4123-8899",
  companyAddress: "Level 8, Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka - 560103",
  defaultTaxRate: 18,
  fiscalYearStart: "April",
  theme: "dark"
};
