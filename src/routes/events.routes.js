import { Router } from "express";
import { pool } from "../config/db.js";  // ← CORRECT
import { importParisData } from "../services/ingestionService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM exhibitions LIMIT 20");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/import/paris", async (req, res) => {
  try {
    const { venuesInserted, eventsInserted } = await importParisData();
    res.json({
      success: true,
      venuesInserted,
      eventsInserted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
