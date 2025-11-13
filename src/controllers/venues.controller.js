import { pool } from "../config/db.js";

export async function getAllVenues(req, res) {
  try {
    const result = await pool.query("SELECT * FROM venues ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
