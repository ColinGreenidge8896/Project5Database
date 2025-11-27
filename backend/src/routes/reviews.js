//Author:   Max

import express from "express";

const router = express.Router();

export default (pool, sendResponse) => {
    /* ======================
        Product Reviews
    ====================== */

    // Create product review
    router.post("/products", async(req, res) => {
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
    router.get("/products", async(req, res) => {
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
    router.get("/products/:id", async(req, res) =>{
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
    router.patch("/products/:id", async(req, res) => {
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
    router.delete("/products/:id", async(req, res) => {
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
        Rental Reviews
    ====================== */

    // Create a rental review
    router.post("/rentals", async(req, res) => {
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
    router.get("/rentals", async(req, res) => {
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
    router.get("/rentals/:id", async(req, res) =>{
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
    router.patch("/rentals/:id", async(req, res) => {
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
    router.delete("/rentals/:id", async(req, res) => {
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
        Service Reviews
    ====================== */

    // Create service review
    router.post("/services", async(req, res) => {
    try {
        const { serviceID, accountID, rating, comment } = req.body;
        if (!serviceID || !accountID) {
        return sendResponse(res, false, "Missing required fields");
        }
        if (rating < 1 || rating > 5) {
        return sendResponse(res, false, "Invalid rating value, must be 1-5");
        }

        const [result] = await pool.query(
        "INSERT INTO ServiceReview (RentalID, AccountID, Rating, Comment) VALUES (?, ?, ?, ?)",
        [serviceID, accountID, rating, comment || ""]
        );

        sendResponse(res, true, "Service Review created.", {ReviewID: result.insertId});
    }
    catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all service reviews
    router.get("/services", async(req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT ServiceID, AccountID, Rating, Comment FROM ServiceReview;"
        );
        sendResponse(res, true, "Service Reviews retrieved.", rows);
    } 
    catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get service review by ID
    router.get("/services/:id", async(req, res) =>{
    try {
        const [rows] = await pool.query(
        "SELECT ServiceID, AccountID, Rating, Comment FROM ServiceReview WHERE ReviewID = ?;",
        [req.params.id]
        );
        if (rows.length === 0)
        return sendResponse(res, false, "Service Review not found.");
        sendResponse(res, true, "Service Review retrieved.", rows[0]);
    } 
    catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update service review rating and/or comment by id
    router.patch("/services/:id", async(req, res) => {
    try {
        const { rating, comment } = req.body;
        const [result] = await pool.query(
        "UPDATE ServiceReview SET Rating = COALESCE(?, Rating), Comment = COALESCE(?, Comment) WHERE ReviewID = ?",
        [rating, comment, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Service Review not found.");
        sendResponse(res, true, "Service Review updated.");
    } 
    catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete service review by id
    router.delete("/services/:id", async(req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM ServiceReview WHERE ReviewID = ?", [
        req.params.id,
        ]);
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Service Review not found.");
        sendResponse(res, true, "Service Review deleted.");
    } 
    catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    return router;
};