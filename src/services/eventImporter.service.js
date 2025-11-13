// src/services/eventImporter.service.js
import axios from "axios";
import { pool } from "../config/db.js";

// ========================
// FETCH PARIS API
// ========================
export async function importParisEvents() {
  try {
    console.log("📡 Fetching Paris OpenData...");

    const url =
      "https://opendata.paris.fr/api/records/1.0/search/?dataset=que-faire-a-paris-&rows=200";

    const { data } = await axios.get(url);

    const records = data.records || [];
    console.log(`➡️ ${records.length} events fetched`);

    let venuesInserted = 0;
    let eventsInserted = 0;

    for (const r of records) {
      const f = r.fields;
      if (!f) continue;

      // -----------------------------
      //  INSERT VENUE
      // -----------------------------
      const venueQuery = `
        INSERT INTO venues (name, address, city, zipcode, lat, lon, source, source_id) 
        VALUES ($1, $2, $3, $4, $5, $6, 'paris', $7)
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
        f.address_name || "Lieu non renseigné",
        f.address_street || null,
        f.address_city || "Paris",
        f.address_zipcode || null,
        f.lat_lon ? f.lat_lon[0] : 0,
        f.lat_lon ? f.lat_lon[1] : 0,
        r.recordid,
      ];

      const venueResult = await pool.query(venueQuery, venueValues);
      const venueId = venueResult.rows[0].id;
      venuesInserted++;

      // -----------------------------
      //  INSERT EXHIBITION
      // -----------------------------
      const eventQuery = `
        INSERT INTO exhibitions (venue_id, title, description, start_date, end_date, 
          price_min, price_max, currency, url, image_url, tags, source, source_id, status)
        VALUES ($1, $2, $3, $4, $5, NULL, NULL, 'EUR', $6, $7, $8, 'paris', $9, 'scheduled')
        ON CONFLICT (source, source_id)
        DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          url = EXCLUDED.url,
          image_url = EXCLUDED.image_url,
          tags = EXCLUDED.tags,
          updated_at = NOW()
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
        (f.tags || []).join(", "),
        r.recordid,
      ];

      await pool.query(eventQuery, eventValues);
      eventsInserted++;
    }

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
