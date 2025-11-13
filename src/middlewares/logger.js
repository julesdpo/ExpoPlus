import { Log } from "../models/log.model.js";

export async function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    Log.create({
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      userId: req.user?.id || null,
    });
  });

  next();
}
