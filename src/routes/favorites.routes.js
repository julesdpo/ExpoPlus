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
