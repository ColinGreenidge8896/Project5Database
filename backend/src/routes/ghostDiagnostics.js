//Author:   Colin
//Review:   Max, Lexie

import express from "express";

const router = express.Router();

export default (pool, sendResponse) => {

    //create inquiryform
    router.post("/inquiry-form", async (req, res) => {
    try {
        const { accountID, description } = req.body;

        if (!accountID)
        return sendResponse(res, false, "Missing accountID.");

        const [result] = await pool.query(
        `INSERT INTO InquiryForm (AccountID, InquiryFormDescription)
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
    router.get("/inquiry-form", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM InquiryForm;");
        sendResponse(res, true, "Inquiry forms retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //get inquiryform by ID
    router.get("/inquiry-form/:id", async (req, res) => {
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
    router.patch("/inquiry-form/:id", async (req, res) => {
    try {
        const { description } = req.body;

        const [result] = await pool.query(
        `UPDATE InquiryForm
        SET InquiryFormDescription = COALESCE(?, InquiryFormDescription)
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
    router.delete("/inquiry-form/:id", async (req, res) => {
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
    router.post("/inquiry-form-response", async (req, res) => {
    try {
        const { inquiryFormID, ghostID, description } = req.body;

        if (!inquiryFormID || !ghostID)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        `INSERT INTO InquiryFormResponse (InquiryFormID, GhostID, InquiryFormResponseDescription)
        VALUES (?, ?, ?)`,
        [inquiryFormID, ghostID, description || null]
        );

        sendResponse(res, true, "Response created.", { inquiryFormResponseID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //get all inquiryformresponse
    router.get("/inquiry-form-response", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM InquiryFormResponse;");
        sendResponse(res, true, "Responses retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //get resposneform by id
    router.get("/inquiry-form-response/:id", async (req, res) => {
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
    router.patch("/inquiry-form-response/:id", async (req, res) => {
    try {
        const { description, ghostID } = req.body;

        const [result] = await pool.query(
        `UPDATE InquiryFormResponse
        SET InquiryFormResponseDescription = COALESCE(?, InquiryFormResponseDescription),
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
    router.delete("/inquiry-form-response/:id", async (req, res) => {
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
    router.post("/chosen-trait", async (req, res) => {
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
    router.get("/chosen-trait/form/:id", async (req, res) => {
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
    router.delete("/chosen-trait", async (req, res) => {
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
    router.post("/identifying-trait", async (req, res) => {
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
    router.get("/identifying-trait/ghost/:id", async (req, res) => {
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
    router.delete("/identifying-trait", async (req, res) => {
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

    /* ======================
     Item Req Route
    ====================== */



    /* ======================
    Service Route
    ====================== */

    //create service
    router.post("/service", async (req, res) => {
    try {
        const { servicename, description, rate } = req.body;

        if (!servicename || !rate)
        return sendResponse(res, false, "Missing fields.");

        const [result] = await pool.query(
        `INSERT INTO Service (ServiceName, ServiceDescription, BaseRate)
        VALUES (?, ?, ?)`,
        [servicename, description || "", rate]
        );

        sendResponse(res, true, "Service created.", { inquiryFormID: result.insertId });
    } catch (err) {
        console.error(err);
        sendResponse(res, false, "Internal server error.");
    }
    });

    //get all service
    router.get("/service", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Service;");
        sendResponse(res, true, "Service records retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //get service by id
    router.get("/service/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Service WHERE ServiceID = ?",
        [req.params.id]
        );

        if (rows.length === 0)
        return sendResponse(res, false, "Service not found.");

        sendResponse(res, true, "Service retrieved.", rows[0]);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //update service form
    router.patch("/service/:id", async (req, res) => {
    try {
        const { servicename, description, rate } = req.body;

        const [result] = await pool.query(
        `UPDATE Service
        SET ServiceName = COALESCE(?, ServiceName),
            ServiceDescription = COALESCE(?, ServiceDescription),
            BaseRate = COALESCE(?, BaseRate)
        WHERE ServiceID = ?`,
        [servicename, description, rate, req.params.id]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Service not found.");

        sendResponse(res, true, "Service updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    //delete service by id
    router.delete("/service/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
        "DELETE FROM Service WHERE Service = ?",
        [req.params.id]
        );

        if (result.affectedRows === 0)
        return sendResponse(res, false, "Service not found.");

        sendResponse(res, true, "Service deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    /* ======================
    Customer Service Route
    ====================== */
    
    

    return router;
};