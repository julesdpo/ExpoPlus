/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Liste des favoris de l'utilisateur connecté
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/favorites/{eventId}:
 *   post:
 *     summary: Ajouter un event aux favoris
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
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
