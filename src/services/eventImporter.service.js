// src/services/eventImporter.service.js
import axios from "axios";
import { pool } from "../config/db.js";

// ========================
//  Compute Event Status
// ========================
function computeStatus(start, end) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (!start && !end) return "scheduled";
  if (start && today < start) return "scheduled";
  if (end && today > end) return "finished";

  return "ongoing";
}

// ========================
//  IMPORT PARIS EVENTS
// ========================
export async function importParisEvents() {
  try {
    console.log("📡 Fetching Paris OpenData...");

    const url =
      "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records?limit=200";

    const { data } = await axios.get(url);

    const records = data.results || [];
    console.log(`➡️ ${records.length} events fetched`);

    let venuesInserted = 0;
    let eventsInserted = 0;

    for (const ev of records) {
      const f = ev;

      // -----------------------------
      // INSERT VENUE
      // -----------------------------
      const lat = f.lat_lon?.lat ?? 0;
      const lon = f.lat_lon?.lon ?? 0;

      const venueQuery = `
        INSERT INTO venues (name, address, city, zipcode, lat, lon, source, source_id)
        VALUES ($1,$2,$3,$4,$5,$6,'paris',$7)
        ON CONFLICT (source, source_id)
        DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          zipcode = EXCLUDED.zipcode,
          lat = EXCLUDED.lat,
          lon = EXCLUDED.lon,
          updated_at = NOW()
        RETURNING id;
      `;

      const venueValues = [
        f.address_name || f.title || "Lieu non renseigné",
        f.address_street || null,
        f.address_city || "Paris",
        f.address_zipcode || null,
        lat,
        lon,
        f.id, // unique OpenData ID
      ];

      const venueResult = await pool.query(venueQuery, venueValues);
      const venueId = venueResult.rows[0].id;
      venuesInserted++;

      // -----------------------------
      // INSERT EXHIBITION
      // -----------------------------

      const status = computeStatus(f.date_start, f.date_end);

      const eventQuery = `
        INSERT INTO exhibitions (
          venue_id, title, description, start_date, end_date,
          price_min, price_max, currency,
          url, image_url, tags,
          source, source_id, status
        )
        VALUES (
          $1,$2,$3,$4,$5,
          NULL,NULL,'EUR',
          $6,$7,$8,
          'paris',$9,$10
        )
        ON CONFLICT (source, source_id)
        DO UPDATE SET
          title       = EXCLUDED.title,
          description = EXCLUDED.description,
          start_date  = EXCLUDED.start_date,
          end_date    = EXCLUDED.end_date,
          url         = EXCLUDED.url,
          image_url   = EXCLUDED.image_url,
          tags        = EXCLUDED.tags,
          status      = EXCLUDED.status,
          updated_at  = NOW()
        RETURNING id;
      `;

      const eventValues = [
        venueId,
        f.title || "Sans titre",
        f.description || null,
        f.date_start || null,
        f.date_end || null,
        f.url || null,
        f.cover_url || null,
        Array.isArray(f.tags) ? f.tags.join(",") : null,
        f.id,
        status,
      ];

      await pool.query(eventQuery, eventValues);
      eventsInserted++;
    }

    console.log("✅ Import completed !");
    return {
      success: true,
      venuesInserted,
      eventsInserted,
    };
  } catch (err) {
    console.error("❌ Import error:", err);
    return { error: err.message };
  }
}

// ========================
//  RUN SCRIPT DIRECTLY
// ========================
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    console.log("📥 Starting Paris import...");
    const result = await importParisEvents();
    console.log("🏁 Import finished:", result);
    process.exit(0);
  })();
}
