//Author: Colin
//Review: Max, Lexie

import express from "express";

import reviewsRoute from "./routes/reviews.js";
import posRoute from "./routes/pos.js";
import inventoryRoute from "./routes/inventory.js";
import ghostDiagnosticsRoute from "./routes/ghostDiagnostics.js";

import dotenv from "dotenv";
import { pool } from "./config/db.js";
import { sendResponse } from "./utils/sendResponse.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/reviews",           reviewsRoute(pool, sendResponse));
app.use("/api/pos",               posRoute(pool, sendResponse));
app.use("/api/inventory",         inventoryRoute(pool, sendResponse));
app.use("/api/ghostDiagnostics",  ghostDiagnosticsRoute(pool, sendResponse));

/* ======================
TODO
Role authorization currently checks everything as the server - not the people making requests
-use jsonwebtoken + jwks-rsa libraries to verify tokens of users?
-configure .env
-add new middleware
OR
-create secrets for each group
-require secrets to be part of the json request?
OR 
-allow access based on filepath or module request location/source?

MOVE ON WITHOUT AUTHENTICATION - PROBABLY DIFFICULT FOR FINAL PRODUCT

DONT FORGET DOCUMENTATION
====================== */

/* ======================
   TEST & SERVER START
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
  console.log(`Server running at http://localhost:${PORT}`);
});
