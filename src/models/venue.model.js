// src/models/venue.model.js
import { pool } from "../config/db.js";

export async function upsertVenue(venue) {
  const query = `
    INSERT INTO venues (id, name, address, city, zipcode, lat, lon, source, source_id, updated_at)
    VALUES (COALESCE($1, uuid_generate_v4()), $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (source_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      zipcode = EXCLUDED.zipcode,
      lat = EXCLUDED.lat,
      lon = EXCLUDED.lon,
      source = EXCLUDED.source,
      updated_at = NOW()
    RETURNING *;
  `;
  const values = [
    venue.id || null,
    venue.name,
    venue.address,
    venue.city,
    venue.zipcode,
    venue.lat,
    venue.lon,
    venue.source,
    venue.source_id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function getVenueById(id) {
  const { rows } = await pool.query("SELECT * FROM venues WHERE id = $1", [id]);
  return rows[0] || null;
}
