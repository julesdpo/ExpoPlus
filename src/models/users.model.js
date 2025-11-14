// src/models/users.model.js

import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export async function findUserByEmail(email) {
  console.log("  [DB/User] 3a. Exécution de SELECT * FROM users WHERE email = $1");
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    console.log("  [DB/User] 3b. Requête SELECT terminée. Nombre de lignes:", result.rowCount);
    return result.rows[0] || null;
  } catch (dbError) {
    console.error("  [DB/User] ❌ ERREUR lors de findUserByEmail:", dbError);
    throw dbError;
  }
}

export async function createUser({ email, passwordHash, role = "user" }) {
  console.log("  [DB/User] 8a. Exécution de INSERT INTO users...");
  try {
    const result = await pool.query(
      `
        INSERT INTO users (id, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, role, created_at
      `,
      [uuidv4(), email, passwordHash, role]
    );
    console.log("  [DB/User] 8b. Requête INSERT terminée. Ligne insérée:", result.rows[0]);
    return result.rows[0];
  } catch (dbError) {
    console.error("  [DB/User] ❌ ERREUR lors de createUser:", dbError);
    throw dbError;
  }
}

export async function findUserById(id) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function getAllUsers() {
  const result = await pool.query("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC");
  return result.rows;
}

export async function deleteUser(id) {
  const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id, email, role", [id]);
  return result.rows[0] || null;
}

export async function updateUserRole(id, role) {
  const result = await pool.query(
    `
      UPDATE users
      SET role = $2
      WHERE id = $1
      RETURNING id, email, role, created_at
    `,
    [id, role]
  );
  return result.rows[0] || null;
}
