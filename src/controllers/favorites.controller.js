// src/controllers/favorites.controller.js
import {
  addFavorite,
  removeFavorite,
  getFavoritesByUser,
} from "../models/favorite.model.js";

export async function listFavorites(req, res) {
  try {
    const userId = req.user.id;
    const favorites = await getFavoritesByUser(userId);
    res.json(favorites);
  } catch (err) {
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

    const fav = await addFavorite(userId, eventId);

    res.status(201).json({
      added: !!fav,
      message: fav
        ? "Ajouté aux favoris"
        : "Déjà présent dans les favoris",
    });
  } catch (err) {
    console.error("addFavorite error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function removeFavoriteController(req, res) {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const removed = await removeFavorite(userId, eventId);

    res.json({
      removed: !!removed,
      message: removed ? "Retiré des favoris" : "N'était pas en favoris",
    });
  } catch (err) {
    console.error("removeFavorite error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
