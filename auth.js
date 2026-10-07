/**
 * ApexLedger - Authentication & Role-Based Access Control
 * Manages sessions, permissions, password strength, and demo credentials
 */

const Auth = {
  SESSION_KEY: "apex_active_session",

  // Default demo user logins
  DEMO_CREDENTIALS: {
    admin: { email: "admin@apexledger.com", name: "Rajesh Sharma", role: "Super Admin", avatar: "RS" },
    accountant: { email: "accountant@apexledger.com", name: "Priya Patel", role: "Accountant", avatar: "PP" },
    staff: { email: "staff@apexledger.com", name: "Amit Verma", role: "Staff", avatar: "AV" },
    viewer: { email: "viewer@apexledger.com", name: "Sneha Rao", role: "Viewer", avatar: "SR" }
  },

  getCurrentUser() {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (session) {
        return JSON.parse(session);
      }
    } catch (e) {
      console.error("Auth session read error", e);
    }
    // Default to Super Admin so initial dashboard is fully alive
    return this.DEMO_CREDENTIALS.admin;
  },

  setCurrentUser(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  },

  login(email, password, remember = true) {
    if (!email || !password) {
      return { success: false, message: "Please fill in both email and password." };
    }

    const users = Store.getUsers();
    const userMatch = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (userMatch) {
      if (userMatch.status === "Inactive") {
        return { success: false, message: "This account has been deactivated. Please contact an administrator." };
      }

      this.setCurrentUser(userMatch);
      Store.addAuditLog("User Login", `${userMatch.name} (${userMatch.role}) logged in successfully.`);
      return { success: true, user: userMatch };
    }

    // Allow flexible demo login
    const demoUser = {
      id: "usr-" + Math.floor(100 + Math.random() * 900),
      name: email.split("@")[0].replace(".", " ").toUpperCase(),
      email: email,
      role: "Staff",
      status: "Active",
      avatar: "DU"
    };
    this.setCurrentUser(demoUser);
    Store.addAuditLog("Demo Login", `${demoUser.name} logged in.`);
    return { success: true, user: demoUser };
  },

  adminLogin(adminId, password) {
    if (!adminId || !password) {
      return { success: false, message: "Admin ID / Email and password are required." };
    }

    // Check if user has admin privileges
    const users = Store.getUsers();
    const user = users.find(u =>
      (u.email.toLowerCase() === adminId.toLowerCase() || u.username.toLowerCase() === adminId.toLowerCase()) &&
      (u.role === "Super Admin" || u.role === "Admin")
    );

    if (user) {
      this.setCurrentUser(user);
      Store.addAuditLog("Admin Login", `Administrator ${user.name} logged in to secure panel.`);
      return { success: true, user };
    }

    // If typing admin@apexledger.com or admin
    if (adminId.toLowerCase().includes("admin")) {
      const superAdmin = this.DEMO_CREDENTIALS.admin;
      this.setCurrentUser(superAdmin);
      Store.addAuditLog("Admin Login", "Super Admin accessed elevated management console.");
      return { success: true, user: superAdmin };
    }

    return {
      success: false,
      message: "Access Denied: The specified credentials do not possess Administrator privileges."
    };
  },

  register(userData) {
    const { name, email, password, confirmPassword, role } = userData;

    if (!name || !email || !password || !confirmPassword) {
      return { success: false, message: "All required fields must be completed." };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    const strength = this.evaluatePasswordStrength(password);
    if (strength.score < 1) {
      return { success: false, message: "Password is too weak. Please include at least 6 characters with mixed characters." };
    }

    const users = Store.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "An account with this email address already exists." };
    }

    const newUser = Store.addUser({
      name,
      email,
      role: role || "Staff",
      phone: userData.phone || "+91 98000 00000"
    });

    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      Store.addAuditLog("User Logout", `${user.name} logged out.`);
    }
    // We can clear or reset to null
    localStorage.removeItem(this.SESSION_KEY);
  },

  loginAsDemo(roleKey) {
    const user = this.DEMO_CREDENTIALS[roleKey] || this.DEMO_CREDENTIALS.admin;
    this.setCurrentUser(user);
    Store.addAuditLog("Demo Role Switched", `Switched active session to ${user.name} (${user.role})`);
    return user;
  },

  evaluatePasswordStrength(pwd) {
    if (!pwd) return { score: 0, label: "Empty", percent: 0, color: "var(--border-subtle)" };

    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) {
      return { score: 1, label: "Weak", percent: 25, color: "var(--expense-500)" };
    } else if (score <= 3) {
      return { score: 2, label: "Medium", percent: 65, color: "var(--warning-500)" };
    } else {
      return { score: 3, label: "Strong", percent: 100, color: "var(--profit-500)" };
    }
  },

  canAccess(view) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super Admin & Admin have unrestricted access
    if (user.role === "Super Admin" || user.role === "Admin") {
      return true;
    }

    // Role-based restrictions
    if (view === "users" || view === "audit") {
      return false; // Only Admins can manage users and audit logs
    }

    if (user.role === "Viewer") {
      // Viewers can only view Dashboard and Reports
      return ["dashboard", "reports", "profile", "settings"].includes(view);
    }

    return true;
  }
};
