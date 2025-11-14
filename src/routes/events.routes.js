/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Gestion des événements (exhibitions importés depuis OpenData Paris)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         title:
 *           type: string
 *           example: "Exposition Musée d’Art Moderne"
 *         description:
 *           type: string
 *           example: "Une exposition exceptionnelle sur l’art contemporain."
 *         address:
 *           type: string
 *           example: "12 rue de Rivoli, 75001 Paris"
 *         category:
 *           type: string
 *           example: "Exposition"
 *         start_date:
 *           type: string
 *           format: date
 *           example: "2025-01-12"
 *         end_date:
 *           type: string
 *           format: date
 *           example: "2025-03-02"
 *         venue_id:
 *           type: integer
 *           example: 5
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Liste tous les événements
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/events/import/paris:
 *   post:
 *     summary: Importe les données OpenData Paris (lieux + événements)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Importation réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 venuesInserted:
 *                   type: integer
 *                 eventsInserted:
 *                   type: integer
 *       500:
 *         description: Erreur lors de l’import
 */


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
