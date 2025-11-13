// src/models/ingestionRun.model.js
import mongoose from "mongoose";

const ingestionRunSchema = new mongoose.Schema({
  source: { type: String, required: true },              // "paris-opendata"
  fetched: { type: Number },                             // nb d'événements récupérés
  venuesInserted: { type: Number, default: 0 },
  exhibitionsInserted: { type: Number, default: 0 },
  success: { type: Boolean, default: false },
  error: { type: String },
  started_at: { type: Date, default: Date.now },
  finished_at: { type: Date },
});

const IngestionRun = mongoose.model("IngestionRun", ingestionRunSchema);
export default IngestionRun;
