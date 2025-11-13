// src/middlewares/auth.middleware.js
import { verifyToken } from "../services/jwt.service.js";
import { findUserById } from "../models/users.model.js";

export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Token manquant ou invalide" });
    }

    const decoded = verifyToken(token);

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    // On met le user dans la requête
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
