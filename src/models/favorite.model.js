// src/models/favorite.model.js
import { pool } from "../config/db.js";

/**
 * Ajoute un favori pour un user et une expo (exhibition).
 * Si déjà existant → ne crée pas de doublon.
 */
export async function addFavorite(userId, exhibitionId) {
  const result = await pool.query(
    `
      INSERT INTO favorites (user_id, exhibition_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, exhibition_id) DO NOTHING
      RETURNING *
    `,
    [userId, exhibitionId]
  );
  return result.rows[0] || null; // null si déjà en favoris
}

/**
 * Supprime un favori
 */
export async function removeFavorite(userId, exhibitionId) {
  const result = await pool.query(
    `
      DELETE FROM favorites
      WHERE user_id = $1 AND exhibition_id = $2
      RETURNING *
    `,
    [userId, exhibitionId]
  );
  return result.rows[0] || null;
}

/**
 * Liste les favoris d'un user, avec les infos d'exposition
 */
export async function getFavoritesByUser(userId) {
  const result = await pool.query(
    `
      SELECT
        f.id AS favorite_id,
        e.*
      FROM favorites f
      JOIN exhibitions e ON e.id = f.exhibition_id
      WHERE f.user_id = $1
      ORDER BY e.start_date NULLS LAST, e.title
    `,
    [userId]
  );
  return result.rows;
}
