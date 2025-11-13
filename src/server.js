import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectMongo } from "./config/mongo.js";
import { connectPostgres } from "./config/db.js";

const port = process.env.PORT || 4000;

async function start() {
  await connectMongo();
  await connectPostgres();

  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

start();
