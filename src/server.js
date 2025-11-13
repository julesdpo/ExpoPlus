import "dotenv/config";
import app from "./app.js";
import { connectPostgres } from "./config/db.js";
import { connectMongo } from "./config/mongo.js";
import cors from "cors";

/**
 * CORS sécurisé + propre
 */
app.use(cors({
  origin: "*", // tu peux mettre l’URL de ton front si nécessaire
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectMongo();
    await connectPostgres();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Impossible de démarrer le serveur :", err);
    process.exit(1);
  }
}

start();
