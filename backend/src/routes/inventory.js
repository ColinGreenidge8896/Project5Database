//Author:   Nonso
//Review:   Max, Lexie      November 17 2025
//Review:   Lexie           November 29 2025

import express from "express";

const router = express.Router();

export default (pool, sendResponse) => {

    /* ======================
    PRODUCT / INVENTORY ROUTES
    ====================== */

    // Create new product
    router.post("/product", async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || !price)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        "INSERT INTO Product (ProductName, ProductDescription, Price) VALUES (?, ?, ?)",
        [name, description || "", price]
        );

        sendResponse(res, true, "Product created.", { productID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all products
    router.get("/product", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Product;"
        );
        sendResponse(res, true, "Products retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update product stock or details
    router.patch("/product/:id", async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const [result] = await pool.query(
        "UPDATE Product SET ProductName = COALESCE(?, ProductName), ProductDescription = COALESCE(?, ProductDescription), Price = COALESCE(?, Price) WHERE ProductID = ?",
        [name, description, price, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Product not found.");
        sendResponse(res, true, "Product updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete product
    router.delete("/product/:id", async (req, res) => {
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

    //Author:     Lexie Haveman
    //Date:       November 29 2025

    /* ======================
    PRODUCTSTOCK / INVENTORY ROUTES
    ====================== */

    //create new product stock
    router.post("/product-stock", async (req, res) => {
    try {
        const { productid, qty, restock, lastrestock } = req.body;
        if (!productid || !qty || !restock)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        "INSERT INTO ProductStock (ProductID, QuantityAvailable, RestockThreshold, LastRestockDate) VALUES (?, ?, ?, ?)",
        [productid, qty || 0, restock || 0, lastrestock]
        );

        sendResponse(res, true, "Product Stock created.", { productID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all product stock
    router.get("/product-stock", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT ProductStock.ProductID, Product.ProductName, ProductStock.QuantityAvailable, ProductStock.RestockThreshold, ProductStock.LastRestockDate FROM ProductStock INNER JOIN Product ON ProductStock.ProductID = Product.ProductID;"
        );
        sendResponse(res, true, "Product stock retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update product stock or details
    router.patch("/product-stock/:id", async (req, res) => {
    try {
        const { productid, qty, restock, lastrestock } = req.body;
        const [result] = await pool.query(
        "UPDATE ProductStock SET ProductID = COALESCE(?, ProductID), QuantityAvailable = COALESCE(?, QuantityAvailable), RestockThreshold = COALESCE(?, RestockThreshold), LastRestockDate = COALESCE(?, LastRestockDate) WHERE ProductID = ?",
        [productid, qty, restock, lastrestock, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Product not found.");
        sendResponse(res, true, "Product stock updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete product
    router.delete("/product-stock/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM ProductStock WHERE ProductID = ?", [
        req.params.id,
        ]);
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Product not found.");
        sendResponse(res, true, "Product deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //Author:     Lexie Haveman
    //Date:       November 29 2025

    /* ======================
    STOCKORDER / INVENTORY ROUTES
    ====================== */

    // Create new order
    router.post("/stock-order", async (req, res) => {
    try {
        const receivedAtValue = received || null; // NULL if not provided
        const { productid, qty, suppliername, ordered, received } = req.body;
        if (!productid || !qty || !suppliername)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        "INSERT INTO StockOrder (ProductID, QuantityOrdered, SupplierName, OrderedAt, ReceivedAt) VALUES (?, ?, ?, ?, ?)",
        [productid, qty, suppliername, ordered, received || ""]
        );

        sendResponse(res, true, "Order created.", { productID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all orders
    router.get("/stock-order", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM StockOrder;"
        );
        sendResponse(res, true, "Orders retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update order complete
    router.patch("/stock-order/:id", async (req, res) => {
    try {
        const { productid, qty, suppliername, ordered, received } = req.body;
        const [result] = await pool.query(
        "UPDATE StockOrder SET ProductID = COALESCE(?, ProductID), QuantityOrdered = COALESCE(?, QuantityOrdered), SupplierName = COALESCE(?, SupplierName), OrderedAt = COALESCE(?, OrderedAt), ReceivedAt = COALESCE(?, ReceivedAt) WHERE StockOrderID = ?",
        [productid, qty, suppliername, ordered, received, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Order not found.");
        sendResponse(res, true, "Stock order updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update stock order only received
    router.patch("/stock-order/received/:id", async (req, res) => {
    try {
        const { received } = req.body;
        const [result] = await pool.query(
        "UPDATE StockOrder SET ReceivedAt = COALESCE(?, ReceivedAt) WHERE StockOrderID = ?",
        [received, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Order not found.");
        sendResponse(res, true, "Order updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete order
    router.delete("/stock-order/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM StockOrder WHERE StockOrderID = ?", [
        req.params.id,
        ]);
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Order not found.");
        sendResponse(res, true, "Order deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    return router;
};