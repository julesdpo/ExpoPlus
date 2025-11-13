// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { findUserById } from "../models/users.model.js";

export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Token manquant ou invalide" });
    }

    // Vérifie le token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // On vérifie que l'utilisateur existe toujours
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    // Injection dans req.user
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("authRequired error:", err.message);
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}
