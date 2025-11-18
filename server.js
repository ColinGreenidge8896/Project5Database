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
TODO
Role authorization currently checks everything as the server - not the people making requests
Correct Authentication Flow
1. Client logs in using school SSO
2. Client sends their identity to backend
3. Backend checks groups based on provided identity
Not based on os.userInfo().
URGENT: find solution

-use jsonwebtoken + jwks-rsa libraries to verify tokens of users?
-configure .env
-add new middleware
OR
-create secrets for each group
-require secrets to be part of the json request?
OR 
-allow access based on filepath or module request location/source?

MOVE ON WITHOUT AUTHENTICATION - PROBABLY DIFFICULT FOR FINAL PRODUCT

REMOVE AUTH FROM ROUTES FOR NOW

DONT FORGET DOCUMENTATION

====================== */


/* ROUTES TO BE MADE ======
- POS TEAM
  -update account
  -transaction routes

- REVIEW TEAM
  -product, rental and team reviews - create, read, update, delete

- GHOST DIAGNOSTICS TEAM
  -hardcoded values for ghost and trait tables
  -InquiryForm and InquiryFormResponse CRUD routes
  -ChosenTrait and IdentifyingTrait 

- FLEET MANAGEMENT TEAM / INVENTORY TEAM
  -vehicle, equipment, maintenanceEvent
  -rentedEquipment, 

 ========================= */


/* ======================
   LINUX AUTH HELPERS
====================== */
/*
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
}*/

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

//update customer account

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

// Create a new payment  -- dont store CVV!
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
   Item Transaction Route
====================== */

// Create an item transaction
app.post("/api/item-transactions", authorize(["pos", "admin"]), async (req, res) => {
  try {
    const { paymentID, productID, quantity, subtotal } = req.body;
    if (!paymentID || !productID || !subtotal)
      return sendResponse(res, false, "Missing required fields.");

    const [result] = await pool.query(
      `INSERT INTO ItemTransaction (PaymentID, ProductID, Quantity, Subtotal)
       VALUES (?, ?, ?, ?)`,
      [paymentID, productID, quantity || 1, subtotal]
    );

    sendResponse(res, true, "Item transaction recorded.", { itemTransactionID: result.insertId });
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get all item transactions
app.get("/api/item-transactions", authorize(["admin"]), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ItemTransaction;");
    sendResponse(res, true, "Item transactions retrieved.", rows);
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

/* ======================
   Service Transaction Route
====================== */

// Create a service transaction
app.post("/api/service-transactions", authorize(["pos", "admin"]), async (req, res) => {
  try {
    const { paymentID, serviceID, hoursWorked, subtotal } = req.body;
    if (!paymentID || !serviceID || !subtotal)
      return sendResponse(res, false, "Missing required fields.");

    const [result] = await pool.query(
      `INSERT INTO ServiceTransaction (PaymentID, ServiceID, HoursWorked, Subtotal)
       VALUES (?, ?, ?, ?)`,
      [paymentID, serviceID, hoursWorked || 0, subtotal]
    );

    sendResponse(res, true, "Service transaction recorded.", { serviceTransactionID: result.insertId });
  } catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get all service transactions
app.get("/api/service-transactions", authorize(["admin"]), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ServiceTransaction;");
    sendResponse(res, true, "Service transactions retrieved.", rows);
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
      REVIEW ROUTES
====================== */

/* ======================
      PRODUCT REVIEWS
====================== */

// Create product review
app.post("/api/reviews/products", async(req, res) => {
  try {
    const { productID, accountID, rating, comment } = req.body;
    if (!productID || !accountID) {
      return sendResponse(res, false, "Missing required fields");
    }
    if (rating < 1 || rating > 5) {
      return sendResponse(res, false, "Invalid rating value, must be 1-5");
    }

    const [result] = await pool.query(
      "INSERT INTO ProductReview (ProductID, AccountID, Rating, Comment) VALUES (?, ?, ?, ?)",
      [productID, accountID, rating, comment || ""]
    );

    sendResponse(res, true, "Product Review created.", {ReviewID: result.insertId});
  }
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get all product reviews
app.get("/api/reviews/products", async(req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT ProductID, AccountID, Rating, Comment FROM ProductReview;"
    );
    sendResponse(res, true, "Product Reviews retrieved.", rows);
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get product review by ID
app.get("/api/reviews/products/:id", async(req, res) =>{
  try {
    const [rows] = await pool.query(
      "SELECT ProductID, AccountID, Rating, Comment FROM ProductReview WHERE ReviewID = ?;",
      [req.params.id]
    );
    if (rows.length === 0)
      return sendResponse(res, false, "Product Review not found.");
    sendResponse(res, true, "Product Review retrieved.", rows[0]);
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Update product review rating and/or comment by id
app.patch("/api/reviews/products/:id", async(req, res) => {
  try {
    const { rating, comment } = req.body;
    const [result] = await pool.query(
      "UPDATE ProductReview SET Rating = COALESCE(?, Rating), Comment = COALESCE(?, Comment) WHERE ReviewID = ?",
      [rating, comment, req.params.id]
    );
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Product Review not found.");
    sendResponse(res, true, "Product Review updated.");
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Delete product review by id
app.delete("/api/reviews/products/:id", async(req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM ProductReview WHERE ReviewID = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Product Review not found.");
    sendResponse(res, true, "Product Review deleted.");
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

/* ======================
      RENTAL REVIEWS
====================== */

// Create a rental review
app.post("/api/reviews/rentals", async(req, res) => {
  try {
    const { rentalID, accountID, rating, comment } = req.body;
    if (!rentalID || !accountID) {
      return sendResponse(res, false, "Missing required fields");
    }
    if (rating < 1 || rating > 5) {
      return sendResponse(res, false, "Invalid rating value, must be 1-5");
    }

    const [result] = await pool.query(
      "INSERT INTO RentalReview (RentalID, AccountID, Rating, Comment) VALUES (?, ?, ?, ?)",
      [rentalID, accountID, rating, comment || ""]
    );

    sendResponse(res, true, "Rental Review created.", {ReviewID: result.insertId});
  }
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get all rental reviews
app.get("/api/reviews/rentals", async(req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT RentalID, AccountID, Rating, Comment FROM RentalReview;"
    );
    sendResponse(res, true, "Rental Reviews retrieved.", rows);
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get rental review by ID
app.get("/api/reviews/rentals/:id", async(req, res) =>{
  try {
    const [rows] = await pool.query(
      "SELECT RentalID, AccountID, Rating, Comment FROM RentalReview WHERE ReviewID = ?;",
      [req.params.id]
    );
    if (rows.length === 0)
      return sendResponse(res, false, "Rental Review not found.");
    sendResponse(res, true, "Rental Review retrieved.", rows[0]);
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Update rental review rating and/or comment by id
app.patch("/api/reviews/rentals/:id", async(req, res) => {
  try {
    const { rating, comment } = req.body;
    const [result] = await pool.query(
      "UPDATE RentalReview SET Rating = COALESCE(?, Rating), Comment = COALESCE(?, Comment) WHERE ReviewID = ?",
      [rating, comment, req.params.id]
    );
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Rental Review not found.");
    sendResponse(res, true, "Rental Review updated.");
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Delete rental review by id
app.delete("/api/reviews/rentals/:id", async(req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM RentalReview WHERE ReviewID = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Rental Review not found.");
    sendResponse(res, true, "Rental Review deleted.");
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

/* ======================
      TEAM REVIEWS
====================== */

// Create team review
app.post("/api/reviews/teams", async(req, res) => {
  try {
    const { teamID, accountID, rating, comment } = req.body;
    if (!teamID || !accountID) {
      return sendResponse(res, false, "Missing required fields");
    }
    if (rating < 1 || rating > 5) {
      return sendResponse(res, false, "Invalid rating value, must be 1-5");
    }

    const [result] = await pool.query(
      "INSERT INTO TeamReview (RentalID, AccountID, Rating, Comment) VALUES (?, ?, ?, ?)",
      [teamID, accountID, rating, comment || ""]
    );

    sendResponse(res, true, "Team Review created.", {ReviewID: result.insertId});
  }
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get all team reviews
app.get("/api/reviews/teams", async(req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT TeamID, AccountID, Rating, Comment FROM TeamReview;"
    );
    sendResponse(res, true, "Team Reviews retrieved.", rows);
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Get team review by ID
app.get("/api/reviews/teams/:id", async(req, res) =>{
  try {
    const [rows] = await pool.query(
      "SELECT TeamID, AccountID, Rating, Comment FROM TeamReview WHERE ReviewID = ?;",
      [req.params.id]
    );
    if (rows.length === 0)
      return sendResponse(res, false, "Team Review not found.");
    sendResponse(res, true, "Team Review retrieved.", rows[0]);
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Update team review rating and/or comment by id
app.patch("/api/reviews/teams/:id", async(req, res) => {
  try {
    const { rating, comment } = req.body;
    const [result] = await pool.query(
      "UPDATE TeamReview SET Rating = COALESCE(?, Rating), Comment = COALESCE(?, Comment) WHERE ReviewID = ?",
      [rating, comment, req.params.id]
    );
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Team Review not found.");
    sendResponse(res, true, "Team Review updated.");
  } 
  catch (err) {
    sendResponse(res, false, err.message);
  }
});

// Delete team review by id
app.delete("/api/reviews/teams/:id", async(req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM TeamReview WHERE ReviewID = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return sendResponse(res, false, "Team Review not found.");
    sendResponse(res, true, "Team Review deleted.");
  } 
  catch (err) {
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
