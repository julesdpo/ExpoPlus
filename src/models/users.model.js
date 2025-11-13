// src/models/users.model.js
import { pool } from "../config/db.js";

// 🔍 Trouver un utilisateur par email
export async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

// 🔍 Trouver un utilisateur par ID
export async function findUserById(id) {
  const result = await pool.query(
    "SELECT id, email, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

// ➕ Créer un utilisateur
export async function createUser({ email, passwordHash, role = "user" }) {
  const result = await pool.query(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
    `,
    [email, passwordHash, role]
  );
  return result.rows[0];
}

// 📄 Lister tous les utilisateurs
export async function getAllUsers() {
  const result = await pool.query(
    "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  return result.rows;
}

// ❌ Supprimer un utilisateur
export async function deleteUser(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id, email, role",
    [id]
  );
  return result.rows[0] || null;
}

// 🔁 Modifier le rôle d’un utilisateur
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
