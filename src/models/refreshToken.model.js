// src/models/refreshToken.model.js

import { pool } from "../config/db.js";

export async function storeRefreshToken(userId, refreshToken) {
  const result = await pool.query(
    `
      INSERT INTO refresh_tokens (user_id, token_hash)
      VALUES ($1, $2)
      RETURNING id
    `,
    [userId, refreshToken]
  );
  return result.rows[0];
}

export async function findRefreshToken(userId, refreshToken) {
  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2",
    [userId, refreshToken]
  );
  return result.rows[0];
}

export async function deleteRefreshToken(userId, refreshToken) {
  await pool.query(
    "DELETE FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2",
    [userId, refreshToken]
  );
}

export async function deleteAllUserTokens(userId) {
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
}
