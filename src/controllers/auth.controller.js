// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken
} from "../services/jwt.service.js";

import {
  createUser,
  findUserByEmail,
  findUserById
} from "../models/users.model.js";

import {
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens
} from "../models/refreshToken.model.js";

import { logInfo, logError } from "../utils/logger.js";

// ----------------------------
// REGISTER
// ----------------------------
export async function register(req, res) {
  try {
    logInfo("Register attempt", req);

    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash });

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email
    });

    await storeRefreshToken(user.id, refreshToken);

    res.status(201).json({
      user,
      accessToken,
      refreshToken
    });

  } catch (err) {
    logError("Register error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// ----------------------------
// LOGIN
// ----------------------------
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    logInfo("Login attempt for " + email, req);

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Identifiants invalides" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: "Identifiants invalides" });

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email
    });

    await storeRefreshToken(user.id, refreshToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      accessToken,
      refreshToken
    });

  } catch (err) {
    logError("Login error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// ----------------------------
// REFRESH TOKEN
// ----------------------------
export async function refresh(req, res) {
  try {
    logInfo("Refresh token attempt", req);

    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ error: "refreshToken manquant" });

    // On décode uniquement pour récupérer l'id
    const decoded = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());
    const userId = decoded.id;

    const stored = await findRefreshToken(userId, refreshToken);
    if (!stored) {
      return res.status(401).json({ error: "Refresh token invalide" });
    }

    // Rotation : supprimer l'ancien
    await deleteRefreshToken(userId, refreshToken);

    // Générer nouveaux tokens
    const newAccessToken = generateAccessToken({ id: userId });
    const newRefreshToken = generateRefreshToken({ id: userId });

    await storeRefreshToken(userId, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    logError("Refresh error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// ----------------------------
// LOGOUT (requires auth)
// ----------------------------
export async function logout(req, res) {
  try {
    logInfo("Logout", req);

    await deleteAllUserTokens(req.user.id);
    res.json({ message: "Déconnecté" });
  } catch (err) {
    logError("Logout error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// ----------------------------
// ME
// ----------------------------
export async function me(req, res) {
  res.json({ user: req.user });
}
