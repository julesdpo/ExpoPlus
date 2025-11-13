// src/models/log.model.js
import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  level: { type: String, enum: ["info", "error"], required: true },
  message: { type: String, required: true },
  method: String,
  url: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
});

export const Log = mongoose.model("Log", logSchema);
