import { pool } from "../config/db.js";
import { importParisData } from "../services/ingestionService.js";

export async function getAllEvents(req, res) {
  try {
    const result = await pool.query(`
      SELECT e.*, v.name AS venue_name, v.city, v.lat, v.lon
      FROM exhibitions e
      LEFT JOIN venues v ON v.id = e.venue_id
      ORDER BY start_date ASC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function importParis(req, res) {
  try {
    const { venuesInserted, eventsInserted } = await importParisData();
    res.json({ success: true, venuesInserted, eventsInserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
