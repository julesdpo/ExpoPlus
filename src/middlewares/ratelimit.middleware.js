// src/middlewares/ratelimit.middleware.js
import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000,          // 1 minute
  max: 10,                      // 10 req / minute
  message: { error: "Trop de tentatives, réessayez plus tard." },
  standardHeaders: true,        // Retourne les infos de rate limit standard
  legacyHeaders: false
});
