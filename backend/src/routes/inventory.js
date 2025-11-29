//Author:   Nonso
//Review:   Max, Lexie

import express from "express";

const router = express.Router();

export default (pool, sendResponse) => {

    // Create new product
    router.post("/products", async (req, res) => {
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
    router.get("/products", async (req, res) => {
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
    router.patch("/products/:id", async (req, res) => {
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
    router.delete("/products/:id", async (req, res) => {
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
    CATEGORY / INVENTORY ROUTES
    ====================== */

    router.post("/categories", async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name)
        return sendResponse(res, false, "Missing required field: name.");

        const [result] = await pool.query(
        `INSERT INTO Category (Name, Description)
        VALUES (?, ?)`,
        [name, description || ""]
        );

        sendResponse(res, true, "Category created.", { categoryID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    router.get("/categories", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT CategoryID, Name, Description FROM Category;"
        );
        sendResponse(res, true, "Categories retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    router.get("/categories/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT CategoryID, Name, Description FROM Category WHERE CategoryID = ?;",
        [req.params.id]
        );

        if (rows.length === 0)
        return sendResponse(res, false, "Category not found.");

        sendResponse(res, true, "Category retrieved.", rows[0]);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    router.patch("/categories/:id", async (req, res) => {
    try {
        const { name, description } = req.body;

        const [result] = await pool.query(
        `UPDATE Category
        SET Name = COALESCE(?, Name),
            Description = COALESCE(?, Description)
        WHERE CategoryID = ?`,
        [name, description, req.params.id]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Category not found.");

        sendResponse(res, true, "Category updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    router.delete("/categories/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
        "DELETE FROM Category WHERE CategoryID = ?",
        [req.params.id]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Category not found.");

        sendResponse(res, true, "Category deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    return router;
};