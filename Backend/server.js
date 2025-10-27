import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

//test route to confirm DB connection
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime;');
    res.json({ success: true, currentTime: rows[0].currentTime });
  } catch (error) {
    console.error('DB connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//example route
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT AccountID, Email, Username, Status FROM CustomerAccount;');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//always last, put routes above this
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
