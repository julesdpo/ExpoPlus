// src/models/refreshToken.model.js
import { pool } from "../config/db.js";

export async function storeRefreshToken(userId, token) {
  console.log("📌 Inserting refresh token into DB...");
  const query = `
    INSERT INTO refresh_tokens (user_id, token)
    VALUES ($1, $2)
  `;
  await pool.query(query, [userId, token]);
}

export async function findRefreshToken(userId, token) {
  console.log("📌 Searching refresh token...");
  const query = `
    SELECT * FROM refresh_tokens
    WHERE user_id = $1 AND token = $2
  `;
  const { rows } = await pool.query(query, [userId, token]);
  return rows[0];
}

export async function deleteRefreshToken(userId, token) {
  console.log("📌 Deleting refresh token...");
  const query = `
    DELETE FROM refresh_tokens
    WHERE user_id = $1 AND token = $2
  `;
  await pool.query(query, [userId, token]);
}

export async function deleteAllUserTokens(userId) {
  console.log("📌 Deleting ALL refresh tokens for user:", userId);
  const query = `
    DELETE FROM refresh_tokens
    WHERE user_id = $1
  `;
  await pool.query(query, [userId]);
}
