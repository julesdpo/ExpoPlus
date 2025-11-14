// src/models/refreshToken.model.js

import { pool } from "../config/db.js";

// =========================================================
// MODIFIÉ POUR CORRESPONDRE AU SCHÉMA
// =========================================================
export async function storeRefreshToken(userId, refreshToken) {
  console.log("  [DB/Token] 15a. Exécution de INSERT INTO refresh_tokens...");
  try {
    const result = await pool.query(
      `
        -- ✅ CORRECTION : On utilise "token_hash" comme dans votre schema.sql
        INSERT INTO refresh_tokens (user_id, token_hash)
        VALUES ($1, $2)
        RETURNING id
      `,
      [userId, refreshToken]
    );
    console.log("  [DB/Token] 15b. Requête INSERT terminée. ID du token:", result.rows[0].id);
    return result.rows[0];
  } catch (dbError) {
    console.error("  [DB/Token] ❌ ERREUR lors de storeRefreshToken:", dbError);
    throw dbError;
  }
}

// =========================================================
// MODIFIÉ POUR CORRESPONDRE AU SCHÉMA
// =========================================================
export async function findRefreshToken(userId, refreshToken) {
  const result = await pool.query(
    // ✅ CORRECTION : On utilise "token_hash" ici aussi
    "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2",
    [userId, refreshToken]
  );
  return result.rows[0];
}

// =========================================================
// MODIFIÉ POUR CORRESPONDRE AU SCHÉMA
// =========================================================
export async function deleteRefreshToken(userId, refreshToken) {
  await pool.query(
    // ✅ CORRECTION : On utilise "token_hash" ici aussi
    "DELETE FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2",
    [userId, refreshToken]
  );
}

export async function deleteAllUserTokens(userId) {
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
}
