import app from "./app.js";
import dotenv from "dotenv";
import { connectMongo } from "./config/mongo.js";

dotenv.config();

const port = process.env.PORT || 4000;

connectMongo();

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
