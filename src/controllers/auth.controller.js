// src/controllers/auth.controller.js

import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/jwt.service.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/users.model.js";
import {
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
} from "../models/refreshToken.model.js";
import { logError } from "../utils/logger.js";

// =========================================================
// REGISTER (AVEC DÉBOGAGE)
// =========================================================
export async function register(req, res) {
  console.log("\n--- [REGISTER START] ---");
  console.log("1. Requête reçue sur /register. Body:", req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      console.log("❌ ERREUR : Champs invalides.");
      return res.status(400).json({ error: "Email et mot de passe (6+ caractères) requis." });
    }
    console.log("2. Champs validés. Email:", email);

    console.log("3. Appel de findUserByEmail pour vérifier l'existence...");
    const existing = await findUserByEmail(email);
    console.log("4. findUserByEmail a retourné:", existing);

    if (existing) {
      console.log("❌ ERREUR : L'email existe déjà.");
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }
    console.log("5. L'utilisateur n'existe pas, continuation...");

    console.log("6. Hashage du mot de passe...");
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("7. Mot de passe hashé avec succès.");

    console.log("8. Appel de createUser...");
    const user = await createUser({ email, passwordHash });
    console.log("9. createUser a retourné:", user);

    if (!user || !user.id) {
        console.log("❌ ERREUR CRITIQUE : createUser n'a pas retourné un utilisateur valide.");
        throw new Error("La création de l'utilisateur a échoué sans erreur explicite.");
    }
    console.log("10. Utilisateur créé avec succès en base de données.");

    console.log("11. Génération du Access Token...");
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    console.log("12. Access Token généré.");

    console.log("13. Génération du Refresh Token...");
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });
    console.log("14. Refresh Token généré.");

    console.log("15. Appel de storeRefreshToken...");
    await storeRefreshToken(user.id, refreshToken);
    console.log("16. Refresh Token stocké avec succès.");

    console.log("17. Envoi de la réponse 201 (Created).");
    console.log("--- [REGISTER SUCCESS] ---");
    res.status(201).json({ user, accessToken, refreshToken });

  } catch (err) {
    console.error("\n💥💥💥 [REGISTER CATCH ERROR] 💥💥💥");
    console.error("L'erreur est survenue après le dernier log numéroté.");
    console.error("Erreur complète:", err);
    console.error("--- [REGISTER END WITH FAILURE] ---\n");
    logError("Register error: " + err.message, req);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// =========================================================
// LOGIN
// =========================================================
export async function login(req, res) {
  console.log("[LOGIN] Requête reçue :", req.body);
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      console.log("[LOGIN] Utilisateur non trouvé.");
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      console.log("[LOGIN] Mot de passe incorrect.");
      return res.status(401).json({ error: "Identifiants invalides." });
    }
    
    console.log("[LOGIN] Connexion réussie pour :", user.email);
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    await deleteAllUserTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);

    res.json({
      user: { id: user.id, email: user.email, role: user.role, created_at: user.created_at },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    logError("Login error: " + err.message, req);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

// =========================================================
// REFRESH TOKEN
// =========================================================
export async function refresh(req, res) {
  console.log("[REFRESH] body =", req.body);
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "refreshToken manquant" });

    const decoded = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());
    const userId = decoded.id;
    const stored = await findRefreshToken(userId, refreshToken);

    if (!stored) return res.status(401).json({ error: "Refresh token invalide" });

    await deleteRefreshToken(userId, refreshToken);
    const newAccessToken = generateAccessToken({ id: userId });
    const newRefreshToken = generateRefreshToken({ id: userId });
    await storeRefreshToken(userId, newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.log("[REFRESH ERROR] =", err);
    logError("Refresh error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// =========================================================
// LOGOUT
// =========================================================
export async function logout(req, res) {
  try {
    console.log("[LOGOUT] user id =", req.user.id);
    await deleteAllUserTokens(req.user.id);
    res.json({ message: "Déconnecté" });
  } catch (err) {
    console.log("[LOGOUT ERROR] =", err);
    logError("Logout error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// =========================================================
// ME
// =========================================================
export async function me(req, res) {
  console.log("[ME] user =", req.user);
  res.json({ user: req.user });
}
