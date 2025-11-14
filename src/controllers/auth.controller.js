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

export async function register(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "Email et mot de passe (6+ caractères) requis." });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash });

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });
    await storeRefreshToken(user.id, refreshToken);

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    logError("Register error: " + err.message, req);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }
    
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
    logError("Login error: " + err.message, req);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

export async function refresh(req, res) {
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
    logError("Refresh error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function logout(req, res) {
  try {
    await deleteAllUserTokens(req.user.id);
    res.json({ message: "Déconnecté" });
  } catch (err) {
    logError("Logout error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
