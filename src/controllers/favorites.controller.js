// src/controllers/favorites.controller.js
import {
  addFavorite,
  removeFavorite,
  getFavoritesByUser,
} from "../models/favorite.model.js";
import { logInfo, logError } from "../utils/logger.js";

export async function listFavorites(req, res) {
  try {
    const userId = req.user.id;
    logInfo("List favorites", req);
    const favorites = await getFavoritesByUser(userId);
    res.json(favorites);
  } catch (err) {
    logError("Favorites controller error: " + err.message, req);
    console.error("listFavorites error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function addFavoriteController(req, res) {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ error: "eventId manquant" });
    }

    logInfo("Add favorite: " + eventId, req);
    const fav = await addFavorite(userId, eventId);

    res.status(201).json({
      added: !!fav,
      message: fav
        ? "Ajouté aux favoris"
        : "Déjà présent dans les favoris",
    });
  } catch (err) {
    logError("Favorites controller error: " + err.message, req);
    console.error("addFavorite error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function removeFavoriteController(req, res) {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    logInfo("Remove favorite: " + eventId, req);
    const removed = await removeFavorite(userId, eventId);

    res.json({
      removed: !!removed,
      message: removed ? "Retiré des favoris" : "N'était pas en favoris",
    });
  } catch (err) {
    logError("Favorites controller error: " + err.message, req);
    console.error("removeFavorite error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
