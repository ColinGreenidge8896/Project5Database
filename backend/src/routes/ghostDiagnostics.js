//Author:   Colin
//Review:   Max, Lexie

import express from "express";

const router = express.Router();

export default (pool, sendResponse) => {

    //create inquiryform
    router.post("/api/inquiry-forms", async (req, res) => {
    try {
        const { accountID, description } = req.body;

        if (!accountID)
        return sendResponse(res, false, "Missing accountID.");

        const [result] = await pool.query(
        `INSERT INTO InquiryForm (AccountID, Description)
        VALUES (?, ?)`,
        [accountID, description || null]
        );

        sendResponse(res, true, "Inquiry form created.", { inquiryFormID: result.insertId });
    } catch (err) {
        console.error(err);
        sendResponse(res, false, "Internal server error.");
    }
    });

    //get all inquiryforms
    router.get("/api/inquiry-forms", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM InquiryForm;");
        sendResponse(res, true, "Inquiry forms retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //get inquiryform by ID
    router.get("/api/inquiry-forms/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM InquiryForm WHERE InquiryFormID = ?",
        [req.params.id]
        );

        if (rows.length === 0)
        return sendResponse(res, false, "Inquiry form not found.");

        sendResponse(res, true, "Inquiry form retrieved.", rows[0]);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //update inquiryform
    router.patch("/api/inquiry-forms/:id", async (req, res) => {
    try {
        const { description } = req.body;

        const [result] = await pool.query(
        `UPDATE InquiryForm
        SET Description = COALESCE(?, Description)
        WHERE InquiryFormID = ?`,
        [description, req.params.id]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Inquiry form not found.");

        sendResponse(res, true, "Inquiry form updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //delete inquiryform 
    router.delete("/api/inquiry-forms/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
        "DELETE FROM InquiryForm WHERE InquiryFormID = ?",
        [req.params.id]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Inquiry form not found.");

        sendResponse(res, true, "Inquiry form deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //create inquiryformresponse
    router.post("/api/inquiry-form-responses", async (req, res) => {
    try {
        const { inquiryFormID, ghostID, description } = req.body;

        if (!inquiryFormID || !ghostID)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        `INSERT INTO InquiryFormResponse (InquiryFormID, GhostID, Description)
        VALUES (?, ?, ?)`,
        [inquiryFormID, ghostID, description || null]
        );

        sendResponse(res, true, "Response created.", { inquiryFormResponseID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //get all inquiryformresponse
    router.get("/api/inquiry-form-responses", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM InquiryFormResponse;");
        sendResponse(res, true, "Responses retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //get resposneform by id
    router.get("/api/inquiry-form-responses/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM InquiryFormResponse WHERE InquiryFormResponseID = ?",
        [req.params.id]
        );

        if (rows.length === 0)
        return sendResponse(res, false, "Response not found.");

        sendResponse(res, true, "Response retrieved.", rows[0]);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //update response form
    router.patch("/api/inquiry-form-responses/:id", async (req, res) => {
    try {
        const { description, ghostID } = req.body;

        const [result] = await pool.query(
        `UPDATE InquiryFormResponse
        SET Description = COALESCE(?, Description),
            GhostID = COALESCE(?, GhostID)
        WHERE InquiryFormResponseID = ?`,
        [description, ghostID, req.params.id]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Response not found.");

        sendResponse(res, true, "Response updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //delete responseform
    router.delete("/api/inquiry-form-responses/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
        "DELETE FROM InquiryFormResponse WHERE InquiryFormResponseID = ?",
        [req.params.id]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Response not found.");

        sendResponse(res, true, "Response deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //create chosentrait
    router.post("/api/chosen-traits", async (req, res) => {
    try {
        const { inquiryFormID, traitID } = req.body;

        if (!inquiryFormID || !traitID)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        `INSERT INTO ChosenTrait (InquiryFormID, TraitID)
        VALUES (?, ?)`,
        [inquiryFormID, traitID]
        );

        sendResponse(res, true, "Chosen trait added.", { chosenTraitID: result.insertId });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY")
        return sendResponse(res, false, "Trait already chosen for this form.");
        sendResponse(res, false, err.message);
    }
    });

    //get all chosentraits from a form
    router.get("/api/chosen-traits/form/:id", async (req, res) => {
    try {
        //get all chosentrait data from a chosen inquiryform
        const [rows] = await pool.query(
        `SELECT ct.*, t.TraitName, t.TraitType
        FROM ChosenTrait ct
        JOIN Trait t ON ct.TraitID = t.TraitID
        WHERE ct.InquiryFormID = ?`,
        [req.params.id]
        );

        sendResponse(res, true, "Chosen traits retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //delete chosentrait
    router.delete("/api/chosen-traits", async (req, res) => {
    try {
        const { inquiryFormID, traitID } = req.body;

        const [result] = await pool.query(
        "DELETE FROM ChosenTrait WHERE InquiryFormID = ? AND TraitID = ?",
        [inquiryFormID, traitID]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Chosen trait not found.");

        sendResponse(res, true, "Chosen trait removed.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //add identifyingtrait to ghost
    router.post("/api/identifying-traits", async (req, res) => {
    try {
        const { ghostID, traitID } = req.body;

        if (!ghostID || !traitID)
        return sendResponse(res, false, "Missing fields.");

        await pool.query(
        `INSERT INTO IdentifyingTrait (GhostID, TraitID)
        VALUES (?, ?)`,
        [ghostID, traitID]
        );

        sendResponse(res, true, "Identifying trait added.");
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY")
        return sendResponse(res, false, "Trait already exists for ghost.");
        sendResponse(res, false, err.message);
    }
    });

    //get all traits for a ghost
    router.get("/api/identifying-traits/ghost/:id", async (req, res) => {
    try {
        //for every identifyingtrait row for a ghost, join to trait table 
        // and get the full trait details from trait
        //returns all traits linked to a ghost ID
        const [rows] = await pool.query( 
        `SELECT it.*, t.TraitName, t.TraitType
        FROM IdentifyingTrait it
        JOIN Trait t ON it.TraitID = t.TraitID
        WHERE it.GhostID = ?`,
        [req.params.id]
        );

        sendResponse(res, true, "Identifying traits retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //delete identifyingtrait
    router.delete("/api/identifying-traits", async (req, res) => {
    try {
        const { ghostID, traitID } = req.body;

        const [result] = await pool.query(
        "DELETE FROM IdentifyingTrait WHERE GhostID = ? AND TraitID = ?",
        [ghostID, traitID]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Trait not found for ghost.");

        sendResponse(res, true, "Identifying trait removed.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    return router;
};