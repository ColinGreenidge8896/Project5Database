import express from 'express';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import { execSync } from 'child_process';
import os from 'os';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

//check if linux user is in the linux group
function userInGroup(groupName) {
  const user = os.userInfo().username;
  const groups = execSync(`groups ${user}`).toString();
  return groups.split(/\s+/).includes(groupName);
}

//if user is in group (use in routes)
function authorize(requiredGroup) {
  return (req, res, next) => {
    if (userInGroup(requiredGroup)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
  };
}

//example route
app.get('/inventory', authorize('inventory'), (req, res) => {
  res.send('Welcome, inventory user!');
});

// Example protected route
app.get(
  "/api/inventory/items",
  loadUserRole,                   // Loads user and role from DB
  authorize(["inventory_manager"]), // Only inventory managers can pass
  (req, res) => {
    res.json({
      message: `Hello ${req.user.role}, here’s your inventory data.`,
      items: [
        { id: 1, name: "Ecto-Detector", quantity: 5 },
        { id: 2, name: "Ghost Trap", quantity: 12 },
      ],
    });
  }
);

//test route to confirm DB connection
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime;');
    res.json({ success: true, currentTime: rows[0].currentTime });
  } catch (error) {
    console.error('DB connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Register new customer account ---
app.post("/register", async (req, res) => {
  try {
    const { email, username, password, status } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    const [result] = await db.execute(
      "INSERT INTO CustomerAccount (Email, Username, Password, Status) VALUES (?, ?, ?, ?)",
      [email, username, hashedPassword, status || "active"]
    );

    res.status(201).json({
      message: "Customer account registered successfully.",
      accountID: result.insertId
    });
  } catch (err) {
    console.error("Error registering account:", err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Email or username already exists." });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
});

//example route
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT AccountID, Email, Username, Status FROM CustomerAccount;');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//always last, put routes above this
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
