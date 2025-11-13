// src/config/db.js
import pg from "pg";
const { Pool } = pg;

console.log("db.js LOADED"); // DEBUG

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

export async function connectPostgres() {
  try {
    await pool.connect();
    console.log("🐘 Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err);
  }
}
