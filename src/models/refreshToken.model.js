import { pool } from "../config/db.js";
import crypto from "crypto";

/** Hash SHA-256 pour sécuriser le refresh token */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Enregistre ou remplace le refresh token d’un user */
export async function storeRefreshToken(userId, token) {
  const tokenHash = hashToken(token);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash)
     VALUES ($1, $2)`,
    [userId, tokenHash]
  );
}


/** Vérifie si le refresh token fourni correspond à celui stocké */
export async function findRefreshToken(userId, token) {
  const tokenHash = hashToken(token);

  const result = await pool.query(
    `
    SELECT * FROM refresh_tokens
    WHERE user_id = $1 AND token_hash = $2
    `,
    [userId, tokenHash]
  );

  return result.rows[0] || null;
}

/** Supprime UNIQUEMENT le refresh token donné */
export async function deleteRefreshToken(userId, token) {
  const tokenHash = hashToken(token);

  await pool.query(
    `
    DELETE FROM refresh_tokens
    WHERE user_id = $1 AND token_hash = $2
    `,
    [userId, tokenHash]
  );
}

/** Déconnecte totalement l'utilisateur (logout everywhere) */
export async function deleteAllUserTokens(userId) {
  await pool.query(
    `DELETE FROM refresh_tokens WHERE user_id = $1`,
    [userId]
  );
}
