import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import { execSync } from "child_process";
import os from "os";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ======================
   LINUX AUTH HELPERS
====================== */

// Returns true if the current Linux user is in the given group
function userInGroup(groupName) {
  try {
    const user = os.userInfo().username;
    const groups = execSync(`groups ${user}`).toString();
    return groups.split(/\s+/).includes(groupName);
  } catch (err) {
    console.error("Error checking Linux group:", err);
    return false;
  }
}

// Middleware: only allow users in the required group(s)
function authorize(groups) {
  return (req, res, next) => {
    const requiredGroups = Array.isArray(groups) ? groups : [groups];
    const allowed = requiredGroups.some(g => userInGroup(g));
    if (allowed) next();
    else res.status(403).json({ success: false, message: "Access denied: insufficient permissions" });
  };
}

/* ======================
   HELPER FUNCTIONS
====================== */

function sendResponse(res, success, message, data = null) {
  res.json({ success, message, data });
}

/* ======================
   CUSTOMER ACCOUNT ROUTES (POS Team)
====================== */

// Create a new customer account
app.post("/api/customers", authorize(["pos", "admin"]), async (req, res) => {
  try {
    const { email, username, password, status } = req.body;
    if (!email || !username || !password)
      return sendResponse(res, false, "Missing required fields.");

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO CustomerAccount (Email, Username, Password, Status) VALUES (?, ?, ?, ?)",
      [email, username, hashed, status || "active"]
    );

    sendResponse(res, true, "Customer account created.", { accountID: result.insertId });
  } catch (err) {
    console.error("Error creating customer:", err);
    if (err.code === "ER_DUP_ENTRY")
      sendResponse(res, false, "Email or username already exists.");
    else sendResponse(res, false, "Internal server error.");
  }
});

// Read all customer accounts
app.get("/api/customers", authorize(["pos", "admin"]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT AccountID, Email, Username, Status FROM CustomerAccount;"
    );
    sendResponse(res, true, "Customer accounts retrieved.", rows);
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Read single customer by ID
app.get("/api/customers/:id", authorize(["pos", "admin"]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT AccountID, Email, Username, Status FROM CustomerAccount WHERE AccountID = ?;",
      [req.params.id]
    );
    if (rows.length === 0)
      return sendResponse(res, false, "Customer not found.");
    sendResponse(res, true, "Customer retrieved.", rows[0]);
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Delete customer
app.delete("/api/customers/:id", authorize(["pos", "admin"]), async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM CustomerAccount WHERE AccountID = ?;",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Customer not found.");
    sendResponse(res, true, "Customer deleted.");
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

/* ======================
   Payment Route
====================== */

// Create a new payment
app.post("/api/payments", authorize(["pos", "admin"]), async (req, res) => {
  try {
    const { accountID, cardNo, cvv, expiryDate, serviceAddress, deliveryAddress } = req.body;
    if (!accountID || !cardNo || !cvv || !expiryDate)
      return sendResponse(res, false, "Missing required fields.");

    const [result] = await pool.query(
      "INSERT INTO Payment (AccountID, CardNo, CVV, ExpiryDate, ServiceAddress, DeliveryAddress) VALUES (?, ?, ?, ?, ?, ?)",
      [accountID, cardNo, cvv, expiryDate, serviceAddress || "", deliveryAddress || ""]
    );

    sendResponse(res, true, "Payment recorded.", { paymentID: result.insertId });
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get all payments
app.get("/api/payments", authorize(["admin"]), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Payment;");
    sendResponse(res, true, "Payments retrieved.", rows);
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

/* ======================
   PRODUCT / INVENTORY ROUTES
====================== */

// Create new product
app.post("/api/products", authorize(["inventory", "admin"]), async (req, res) => {
  try {
    const { name, description, price, stock, status } = req.body;
    if (!name || !price)
      return sendResponse(res, false, "Missing required fields.");

    const [result] = await pool.query(
      "INSERT INTO Product (Name, Description, Price, Stock, Status) VALUES (?, ?, ?, ?, ?)",
      [name, description || "", price, stock || 0, status || "active"]
    );

    sendResponse(res, true, "Product created.", { productID: result.insertId });
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get all products
app.get("/api/products", authorize(["inventory", "admin", "pos"]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT ProductID, Name, Description, Price, Stock, Status FROM Product;"
    );
    sendResponse(res, true, "Products retrieved.", rows);
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Update product stock or details
app.patch("/api/products/:id", authorize(["inventory", "admin"]), async (req, res) => {
  try {
    const { name, description, price, stock, status } = req.body;
    const [result] = await pool.query(
      "UPDATE Product SET Name = COALESCE(?, Name), Description = COALESCE(?, Description), Price = COALESCE(?, Price), Stock = COALESCE(?, Stock), Status = COALESCE(?, Status) WHERE ProductID = ?",
      [name, description, price, stock, status, req.params.id]
    );
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Product not found.");
    sendResponse(res, true, "Product updated.");
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Delete product
app.delete("/api/products/:id", authorize(["admin"]), async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM Product WHERE ProductID = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Product not found.");
    sendResponse(res, true, "Product deleted.");
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

/* ======================
   🧪 TEST & SERVER START
====================== */

app.get("/api/test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS currentTime;");
    sendResponse(res, true, "DB connection OK.", { currentTime: rows[0].currentTime });
  } catch (err) {
    sendResponse(res, false, "DB connection failed: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
