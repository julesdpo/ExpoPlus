import "dotenv/config";
import app from "./app.js";
import { connectPostgres } from "./config/db.js";
import { connectMongo } from "./config/mongo.js";

const PORT = process.env.PORT || 4000;

async function start() {
  await connectMongo();
  await connectPostgres();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
