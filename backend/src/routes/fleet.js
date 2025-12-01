//Author:   Lexie           November 30 2025

import express from "express";

const router = express.Router();

export default (pool, sendResponse) => {

    /* ======================
    EQUIPMENT / FLEET ROUTES
    ====================== */

    // Create new equipment
    router.post("/equipment", async (req, res) => {
    try {
        const { equipmentcode, name, description, value, category, type, trackingid, availability } = req.body;
        if (!equipmentcode || !name || !value || !category || !type)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        `INSERT INTO Equipment (EquipmentCode, 
                                EquipmentName, EquipmentDescription, 
                                EquipmentValue, EquipmentCategory, EquipmentType, 
                                EquipmentTrackingID, EquipmentAvailability) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [equipmentcode, name, description || "", value, category, type, trackingid, availability || "Available"]
        );
        sendResponse(res, true, "Equipment created.", { equipmentID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all from equipment
    router.get("/equipment", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Equipment;"
        );
        sendResponse(res, true, "Equipment retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update equipment records complete
    router.patch("/equipment/:id", async (req, res) => {
    try {
        const { equipmentcode, productid, description, category, type, trackingid, availability } = req.body;
        const [result] = await pool.query(
        `UPDATE Equipment SET EquipmentCode = COALESCE(?, EquipmentCode), EquipmentName = COALESCE(?, EquipmentName), 
                            EquipmentDescription = COALESCE(?, EquipmentDescription), EquipmentValue = COALESCE(?, EquipmentValue),
                            EquipmentCategory = COALESCE(?, EquipmentCategory), EquipmentType = COALESCE(?, EquipmentType), 
                            EquipmentTrackingId = COALESCE(?, EquipmentTrackingId), 
                            EquipmentAvailability = COALESCE(?, EquipmentAvailability)
        WHERE EquipmentID = ?`,
        [equipmentcode, productid, description || "", category, type, trackingid, availability || "Available", req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Equipment not found.");
        sendResponse(res, true, "Equipment updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get one equipment
    router.get("/equipment/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Equipment WHERE EquipmentID = ?;",
        [req.params.id]
        );
        sendResponse(res, true, "Equipment retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete equipment
    router.delete("/equipment/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM Equipment WHERE EquipmentID = ?", [
        req.params.id,
        ]);
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Equipment not found.");
        sendResponse(res, true, "Equipment deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    /* ======================
    RENTED-EQUIPMENT / FLEET ROUTES
    ====================== */

    // Create new rented equipment
    router.post("/rented-equipment", async (req, res) => {
    try {
        const { rentalid, equipmentid } = req.body;
        if (!rentalid || !equipmentid)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        `INSERT INTO RentedEquipment (RentalID, EquipmentID) VALUES (?, ?)`,
        [rentalid, equipmentid]
        );
        sendResponse(res, true, "Rented Equipment record created.", { rentedEquipmentID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all from rented equipment
    router.get("/rented-equipment", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM RentedEquipment;"
        );
        sendResponse(res, true, "Rented Equipment retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update rented equipment complete
    router.patch("/rented-equipment/:id", async (req, res) => {
    try {
        const { rentalid, equipmentid } = req.body;
        const [result] = await pool.query(
        `UPDATE RentedEquipment SET RentalID = COALESCE(?, RentalID), EquipmentID = COALESCE(?, EquipmentID)
        WHERE RentedEquipmentID = ?`,
        [rentalid, equipmentid, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Rented Equipment not found.");
        sendResponse(res, true, "Rented Equipment updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get one equipment
    router.get("/rented-equipment/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM RentedEquipment WHERE RentedEquipmentID = ?;",
        [req.params.id]
        );
        sendResponse(res, true, "Rented Equipment retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete equipment
    router.delete("/rented-equipment/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM RentedEquipment WHERE RentedEquipmentID = ?", [
        req.params.id,
        ]);
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Rented Equipment not found.");
        sendResponse(res, true, "Rented Equipment deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    /* ======================
    RENTAL / FLEET ROUTES
    ====================== */

    // Create new rental
    router.post("/rental", async (req, res) => {
    try {
        const { rentalcode, accountid, start, end, status, notes, scope } = req.body;
        if (!rentalcode || !accountid || !start || !end)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        `INSERT INTO Rental (RentalCode, AccountID, StartDate, EndDate, RentalStatus, Notes, Scope) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [rentalcode, accountid, start, end, status || "Reserved", notes || "", scope || "Internal"]
        );
        sendResponse(res, true, "Rental created.", { rentalID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all from rental
    router.get("/rental", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Rental;"
        );
        sendResponse(res, true, "Rentals retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update rental complete
    router.patch("/rental/:id", async (req, res) => {
    try {
        const { rentalcode, accountid, start, end, status, notes, scope } = req.body;
        const [result] = await pool.query(
        `UPDATE Rental SET RentalCode = COALESCE(?, RentalCode), AccountID = COALESCE(?, AccountID),
                            StartDate = COALESCE(?, StartDate), EndDate = COALESCE(?, EndDate),
                            RentalStatus = COALESCE(?, RentalStatus), Notes = COALESCE(?, Notes),
                            Scope = COALESCE(?, Scope)
        WHERE RentalID = ?`,
        [rentalcode, accountid, start, end, status, notes, scope, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Rented Equipment not found.");
        sendResponse(res, true, "Rented Equipment updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get one rental
    router.get("/rental/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Rental WHERE RentalID = ?;",
        [req.params.id]
        );
        sendResponse(res, true, "Rental retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete equipment
    router.delete("/rental/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM Rental WHERE RentalID = ?", [
        req.params.id,
        ]);
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Rental not found.");
        sendResponse(res, true, "Rental deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update rental status
    router.patch("/rental/rental-status/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const [result] = await pool.query(
        `UPDATE Rental SET RentalStatus = COALESCE(?, RentalStatus)
        WHERE RentalID = ?`,
        [status, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Rented Equipment not found.");
        sendResponse(res, true, "Rented Equipment updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    /* ======================
    MAINTENANCE / FLEET ROUTES
    ====================== */

    // Create new maintenance
    router.post("/maintenance", async (req, res) => {
    try {
        const { maintenancecode, equipmentid, rentalid, lastservice, nextservice, status, opened, closed, outcome, technician, notes } = req.body;
        if (!maintenancecode || !equipmentid || !opened)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        `INSERT INTO Maintenance (MaintenanceCode, EquipmentID, RentalID, 
                                LastServiceDate, NextServiceDate, 
                                MaintenanceStatus, 
                                OpenedAt, ClosedAt, 
                                Outcome, Technician, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [maintenancecode, equipmentid, rentalid, lastservice || NULL, nextservice || NULL, status || "open", opened, closed || NULL, outcome || "Working", technician || "", notes || ""]
        );
        sendResponse(res, true, "Maintenance record created.", { maintenanceID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all maintenance
    router.get("/maintenance", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Maintenance;"
        );
        sendResponse(res, true, "Maintenance records retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update maintenance records complete
    router.patch("/maintenance/:id", async (req, res) => {
    try {
        const { maintenancecode, equipmentid, rentalid, lastservice, nextservice, status, opened, closed, outcome, technician, notes } = req.body;
        const [result] = await pool.query(
        `UPDATE Maintenance SET MaintenanceCode = COALESCE(?, MaintenanceCode), 
                            EquipmentID = COALESCE(?, EquipmentID), RentalID = COALESCE(?, RentalID), 
                            LastServiceDate = COALESCE(?, LastServiceDate), NextServiceDate = COALESCE(?, NextServiceDate), 
                            MaintenanceStatus = COALESCE(?, MaintenanceStatus), 
                            OpenedAt = COALESCE(?, OpenedAt), ClosedAt = COALESCE(?, ClosedAt), 
                            Outcome = COALESCE(?, Outcome), Technician = COALESCE(?, Technician), 
                            Notes = COALESCE(?, Notes) 
        WHERE MaintenanceID = ?`,
        [maintenancecode, equipmentid, rentalid, lastservice, nextservice, status, opened, closed, outcome, technician, notes, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Maintenance records not found.");
        sendResponse(res, true, "Maintenance records updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get one maintenance
    router.get("/maintenance/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Maintenance WHERE MaintenanceID = ?;",
        [req.params.id]
        );
        sendResponse(res, true, "Maintenance records retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete maintenance records
    router.delete("/maintenance/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM Maintenance WHERE MaintenanceID = ?", [
        req.params.id,
        ]);
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Maintenance records not found.");
        sendResponse(res, true, "Maintenance records deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    /* ======================
    EMPLOYEE / FLEET ROUTES
    ====================== */

    // Create new employee
    router.post("/employee", async (req, res) => {
    try {
        const { name, username, password } = req.body;
        if (!name || !username || !password)
        return sendResponse(res, false, "Missing required fields.");

        const [result] = await pool.query(
        `INSERT INTO Employee (EmployeeName, Username, Password) VALUES (?, ?, ?)`,
        [name, username, password]
        );
        sendResponse(res, true, "Employee created.", { employeeID: result.insertId });
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get all employees
    router.get("/employee", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Employee;"
        );
        sendResponse(res, true, "Employees retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update employee complete
    router.patch("/employee/:id", async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const [result] = await pool.query(
        `UPDATE Rental SET EmployeeName = COALESCE(?, EmployeeName),
                            Username = COALESCE(?, Username), Password = COALESCE(?, Password)
        WHERE EmployeeID = ?`,
        [name, username, password, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Employee not found.");
        sendResponse(res, true, "Employee updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Get one employee
    router.get("/employee/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
        "SELECT * FROM Employee WHERE EmployeeID = ?;",
        [req.params.id]
        );
        sendResponse(res, true, "Employee retrieved.", rows);
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Delete employee
    router.delete("/employee/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM Employee WHERE EmployeeID = ?", [
        req.params.id,
        ]);
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Employee not found.");
        sendResponse(res, true, "Employee deleted.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update employee name
    router.patch("/employee/name/:id", async (req, res) => {
    try {
        const { name } = req.body;
        const [result] = await pool.query(
        `UPDATE Employee SET EmployeeName = COALESCE(?, EmployeeName)
        WHERE EmployeeID = ?`,
        [name, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Employee not found.");
        sendResponse(res, true, "Employee name updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update employee username
    router.patch("/employee/username/:id", async (req, res) => {
    try {
        const { username } = req.body;
        const [result] = await pool.query(
        `UPDATE Employee SET Username = COALESCE(?, Username)
        WHERE EmployeeID = ?`,
        [username, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Employee not found.");
        sendResponse(res, true, "Employee username updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    // Update employee password
    router.patch("/employee/password/:id", async (req, res) => {
    try {
        const { password } = req.body;
        const [result] = await pool.query(
        `UPDATE Employee SET Password = COALESCE(?, Password)
        WHERE EmployeeID = ?`,
        [password, req.params.id]
        );
        if (result.affectedRows === 0)
        return sendResponse(res, false, "Employee not found.");
        sendResponse(res, true, "Employee password updated.");
    } catch (err) {
        sendResponse(res, false, err.message);
    }
    });

    return router;
};