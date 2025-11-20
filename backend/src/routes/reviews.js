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
        Team Reviews
    ====================== */

    // Create team review
    router.post("/teams", async(req, res) => {
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
    router.get("/teams", async(req, res) => {
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
    router.get("/teams/:id", async(req, res) =>{
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
    router.patch("/teams/:id", async(req, res) => {
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
    router.delete("/teams/:id", async(req, res) => {
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

    return router;
};