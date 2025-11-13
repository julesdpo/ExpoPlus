// src/utils/logger.js
import { Log } from "../models/log.model.js";

export async function logInfo(message, req = null) {
  const data = {
    level: "info",
    message,
    method: req?.method,
    url: req?.originalUrl,
    userId: req?.user?.id || null,
  };
  await Log.create(data);
}

export async function logError(message, req = null) {
  const data = {
    level: "error",
    message,
    method: req?.method,
    url: req?.originalUrl,
    userId: req?.user?.id || null,
  };
  await Log.create(data);
}
