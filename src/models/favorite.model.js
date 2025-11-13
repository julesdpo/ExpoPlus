// src/models/favorite.model.js
import { pool } from "../config/db.js";

export async function addFavorite(userId, exhibitionId) {
  const query = `
    INSERT INTO favorites (user_id, exhibition_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, exhibition_id) DO NOTHING
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [userId, exhibitionId]);
  return rows[0] || null; // null si déjà favori
}

export async function removeFavorite(userId, exhibitionId) {
  const { rowCount } = await pool.query(
    "DELETE FROM favorites WHERE user_id = $1 AND exhibition_id = $2",
    [userId, exhibitionId]
  );
  return rowCount > 0;
}

export async function listFavoritesByUser(userId) {
  const { rows } = await pool.query(
    `SELECT e.*, v.name AS venue_name, v.city, v.lat, v.lon
     FROM favorites f
     JOIN exhibitions e ON f.exhibition_id = e.id
     LEFT JOIN venues v ON e.venue_id = v.id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}
