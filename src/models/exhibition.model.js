// src/models/exhibition.model.js
import { pool } from "../config/db.js";

export async function upsertExhibition(expo) {
  const query = `
    INSERT INTO exhibitions (
      id, venue_id, title, description,
      start_date, end_date,
      price_min, price_max, currency,
      url, image_url, tags,
      source, source_id, status, updated_at
    ) VALUES (
      COALESCE($1, uuid_generate_v4()), $2, $3, $4,
      $5, $6,
      $7, $8, $9,
      $10, $11, $12,
      $13, $14, $15, NOW()
    )
    ON CONFLICT (source, source_id)
    DO UPDATE SET
      venue_id   = EXCLUDED.venue_id,
      title      = EXCLUDED.title,
      description= EXCLUDED.description,
      start_date = EXCLUDED.start_date,
      end_date   = EXCLUDED.end_date,
      price_min  = EXCLUDED.price_min,
      price_max  = EXCLUDED.price_max,
      currency   = EXCLUDED.currency,
      url        = EXCLUDED.url,
      image_url  = EXCLUDED.image_url,
      tags       = EXCLUDED.tags,
      status     = EXCLUDED.status,
      updated_at = NOW()
    RETURNING *;
  `;

  const values = [
    expo.id || null,
    expo.venue_id,
    expo.title,
    expo.description,
    expo.start_date,
    expo.end_date,
    expo.price_min,
    expo.price_max,
    expo.currency,
    expo.url,
    expo.image_url,
    expo.tags || null,
    expo.source,
    expo.source_id,
    expo.status,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function listExhibitions() {
  const { rows } = await pool.query(
    `SELECT e.*, v.name AS venue_name, v.city, v.lat, v.lon
     FROM exhibitions e
     LEFT JOIN venues v ON e.venue_id = v.id
     ORDER BY e.start_date NULLS LAST;`
  );
  return rows;
}

export async function getExhibitionById(id) {
  const { rows } = await pool.query(
    `SELECT e.*, v.name AS venue_name, v.city, v.lat, v.lon
     FROM exhibitions e
     LEFT JOIN venues v ON e.venue_id = v.id
     WHERE e.id = $1`,
    [id]
  );
  return rows[0] || null;
}
