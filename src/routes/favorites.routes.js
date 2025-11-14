/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Gestion des favoris utilisateur
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: "810fe980-9049-4390-856b-6ae28c9ab17b"
 *         eventId:
 *           type: string
 *           example: "12345"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-11-14T12:45:39.749Z"
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Liste des favoris de l'utilisateur connecté
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements favoris
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Token invalide ou expiré
 */

/**
 * @swagger
 * /api/favorites/{eventId}:
 *   post:
 *     summary: Ajouter un événement aux favoris
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement à ajouter aux favoris
 *     responses:
 *       201:
 *         description: Événement ajouté aux favoris
 *       400:
 *         description: Paramètre manquant ou invalide
 *       401:
 *         description: Token invalide ou expiré
 *       409:
 *         description: L'événement est déjà dans les favoris
 */

/**
 * @swagger
 * /api/favorites/{eventId}:
 *   delete:
 *     summary: Supprime un événement des favoris
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement à retirer des favoris
 *     responses:
 *       200:
 *         description: Favori retiré avec succès
 *       404:
 *         description: Favori introuvable pour cet utilisateur
 *       401:
 *         description: Token invalide ou expiré
 */


// src/routes/favorites.routes.js
import { Router } from "express";
import {
  listFavorites,
  addFavoriteController,
  removeFavoriteController,
} from "../controllers/favorites.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/favorites → mes favoris
router.get("/", authRequired, listFavorites);

// POST /api/favorites/:eventId → ajoute en favoris
router.post("/:eventId", authRequired, addFavoriteController);

// DELETE /api/favorites/:eventId → retire des favoris
router.delete("/:eventId", authRequired, removeFavoriteController);

export default router;
