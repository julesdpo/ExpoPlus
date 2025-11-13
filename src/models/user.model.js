// src/models/user.model.js
import { pool } from "../config/db.js";

export async function createUser({ email, passwordHash, role = "user" }) {
  const query = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role, created_at;
  `;
  const values = [email, passwordHash, role];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, email, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}
