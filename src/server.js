// src/server.js
import "dotenv/config";
import app from "./app.js";
import { connectPostgres } from "./config/db.js";
import { connectMongo } from "./config/mongo.js";
import cors from "cors";
import cron from "node-cron";
import { importParisData } from "./services/ingestionService.js";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    app.use(cors({
      origin: "*", // À remplacer par l'URL du frontend en production
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }));

    await connectMongo();
    await connectPostgres();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}` );
    });

    // Planifie l'ingestion des données tous les jours à 2h du matin.
    cron.schedule('0 2 * * *', async () => {
      console.log("--- [CRON JOB] Starting scheduled data ingestion ---");
      try {
        await importParisData();
        console.log("--- [CRON JOB] Scheduled data ingestion finished successfully ---");
      } catch (error) {
        console.error("--- [CRON JOB] An error occurred during scheduled ingestion ---", error);
      }
    }, {
      scheduled: true,
      timezone: "Europe/Paris"
    });

  } catch (err) {
    console.error("Failed to start the server:", err);
    process.exit(1);
  }
}

startServer();
