// src/services/ingestionService.js
import "dotenv/config";
import { pool } from "../config/db.js";
import IngestionRun from "../models/ingestionRun.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Node 22 => fetch global dispo, pas besoin de node-fetch
const API_URL =
  "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records?limit=100";

export async function importParisData() {
  const started_at = new Date();
  let fetched = 0;
  let venuesInserted = 0;
  let exhibitionsInserted = 0;

  try {
    console.log("📥 Fetching data from OpenData Paris...");
    const res = await fetch(API_URL);
    const data = await res.json();

    const records = data.results || data.records || [];
    fetched = records.length;
    console.log(`📦 ${fetched} events fetched`);

    for (const ev of records) {
      const venueId = await upsertVenue(ev);
      const expoId = await upsertExhibition(ev, venueId);
      if (venueId) venuesInserted++;
      if (expoId) exhibitionsInserted++;
    }

    await IngestionRun.create({
      source: "paris-opendata",
      fetched,
      venuesInserted,
      exhibitionsInserted,
      success: true,
      started_at,
      finished_at: new Date(),
    });

    console.log("✅ Ingestion completed");
  } catch (err) {
    console.error("❌ Error during ingestion:", err);

    await IngestionRun.create({
      source: "paris-opendata",
      fetched,
      venuesInserted,
      exhibitionsInserted,
      success: false,
      error: err.message,
      started_at,
      finished_at: new Date(),
    });

    throw err;
  }
}

// ---------- helpers SQL ----------

async function upsertVenue(ev) {
  const lat = ev.lat_lon?.lat ?? null;
  const lon = ev.lat_lon?.lon ?? null;

  const query = `
    INSERT INTO venues (name, address, city, zipcode, lat, lon, source, source_id)
    VALUES ($1,$2,$3,$4,$5,$6,'paris-opendata',$7)
    ON CONFLICT (source, source_id)
    DO UPDATE SET
      name    = EXCLUDED.name,
      address = EXCLUDED.address,
      city    = EXCLUDED.city,
      zipcode = EXCLUDED.zipcode,
      lat     = EXCLUDED.lat,
      lon     = EXCLUDED.lon,
      updated_at = NOW()
    RETURNING id;
`;

  const values = [
    ev.address_name || ev.title || "Sans nom",
    ev.address_street || null,
    ev.address_city || null,
    ev.address_zipcode || null,
    lat,
    lon,
    ev.id, // identifiant unique OpenData
  ];

  const { rows } = await pool.query(query, values);
  return rows[0]?.id || null;
}

async function upsertExhibition(ev, venueId) {
  const query = `
    INSERT INTO exhibitions (
      venue_id, title, description,
      start_date, end_date,
      price_min, price_max, currency,
      url, image_url, tags,
      source, source_id, status
    ) VALUES (
      $1,$2,$3,
      $4,$5,
      $6,$7,$8,
      $9,$10,$11,
      'paris-opendata',$12,$13
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
    RETURNING id;
  `;

  const status = computeStatus(ev.date_start, ev.date_end);

  const values = [
    venueId,
    ev.title,
    ev.description || null,
    ev.date_start || null,
    ev.date_end || null,
    ev.price_type === "gratuit" ? 0 : null,
    null,
    ev.price_type || null,
    ev.url || null,
    ev.cover_url || null,
    Array.isArray(ev.tags) ? ev.tags.join(",") : null,
    ev.id,
    status,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0]?.id || null;
}

function computeStatus(start, end) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (!start && !end) return "scheduled";
  if (start && today < start) return "scheduled";
  if (end && today > end) return "finished";
  return "ongoing";
}

// Lancement direct du script si exécuté depuis Node
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  (async () => {
    console.log("📥 Lancement de l’ingestion des données Paris...");
    await importParisData();
    console.log("🏁 Ingestion terminée !");
    process.exit(0);
  })();
}
