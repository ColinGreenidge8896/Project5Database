//Author:   Vin, Colin
//Review:   Max, Lexie

import bcrypt from "bcrypt";
import express from "express";

const router = express.Router();

export default (pool, sendResponse) => {

    /*
    POS Team requests all routes be created using POST
    and route names are designed as: api/customers/login, api/customers/register, etc
    CREATE login, register (register is first /customers route, but can be renamed if they want)
    */

    // Create a new customer account - rename to /register?
    router.post("/register", async (req, res) => {
    try {
        const { email, username, password, status } = req.body;
        if (!email || !username || !password)
        return sendResponse(res, false, "Missing required fields.");

        //are we receiving password already hashed or hasing it ourselves?
        const hashed = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
        "INSERT INTO CustomerAccount (Email, Username, PasswordHash, Status) VALUES (?, ?, ?, ?)",
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
    router.get("/customers", async (req, res) => {
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
    router.get("/customers/:id", async (req, res) => {
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

    // Update customer account
    router.patch("/customers/:id", async (req, res) => {
    try {
        const { email, username, password, status } = req.body;
        const { id } = req.params;

        // Check that at least one field is provided
        if (!email && !username && !password && !status) {
            return sendResponse(res, false, "No fields provided to update.");
        }

        const updates = [];
        const values = [];

        if (email) {
            updates.push("Email = ?");
            values.push(email);
        }
        if (username) {
            updates.push("Username = ?");
            values.push(username);
        }
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updates.push("PasswordHash = ?");
            values.push(hashed);
        }
        if (status) {
            updates.push("Status = ?");
            values.push(status);
        }

        values.push(id); // For WHERE clause

        const [result] = await pool.query(
            `UPDATE CustomerAccount SET ${updates.join(", ")} WHERE AccountID = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return sendResponse(res, false, "Customer not found.");
        }

        sendResponse(res, true, "Customer account updated.");
        } catch (err) {
        console.error("Error updating customer:", err);
        if (err.code === "ER_DUP_ENTRY") {
            sendResponse(res, false, "Email or username already exists.");
        } else {
            sendResponse(res, false, "Internal server error.");
        }
    }
    });

    // Delete customer
    router.delete("/customers/:id", async (req, res) => {
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

    // Login route -/customers/login or just /login
    router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return sendResponse(res, false, "Missing email or password.");
        }

        const [rows] = await pool.query(
            "SELECT AccountID, Email, Username, PasswordHash, Status FROM CustomerAccount WHERE Username = ?;",
            [username]
        );

        if (rows.length === 0) {
            return sendResponse(res, false, "Invalid username or password.");
        }

        const user = rows[0];

        // Compare password correctly
        const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!passwordMatch) {
            return sendResponse(res, false, "Invalid username or password.");
        }

        if (user.Status !== "active") {
            return sendResponse(res, false, "Account is not active.");
        }

        // Remove hashed password from output
        delete user.PasswordHash;

        sendResponse(res, true, "Login successful.", { user });
    } catch (err) {
        console.error("Error during login:", err);
        sendResponse(res, false, "Internal server error.");
    }
    });

    /* ======================
    Payment Route
    ====================== */

    // Create a new payment  -- dont store CVV!
    router.post("/payments", async (req, res) => {
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
    router.get("/payments", async (req, res) => {
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
    router.post("/item-transactions", async (req, res) => {
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
    router.get("/item-transactions", async (req, res) => {
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
    router.post("/service-transactions", async (req, res) => {
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
    router.get("/service-transactions", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM ServiceTransaction;");
        sendResponse(res, true, "Service transactions retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });
    

    /* ======================
    Customer Address Route
    ====================== */

    

    return router;
};