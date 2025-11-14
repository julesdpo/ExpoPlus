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

// =========================================================
// REGISTER
// =========================================================
export async function register(req, res) {
  console.log("[REGISTER] Request body =", req.body);

  try {
    const { email, password } = req.body;
    console.log("[REGISTER] email =", email, "password =", password);

    if (!email || !password || password.length < 6) {
      console.log("[REGISTER] Invalid fields");
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const existing = await findUserByEmail(email);
    console.log("[REGISTER] existing =", existing);

    if (existing) {
      console.log("[REGISTER] Email déjà utilisé");
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    console.log("[REGISTER] Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("[REGISTER] passwordHash =", passwordHash);

    console.log("[REGISTER] Creating user in DB...");
    const user = await createUser({ email, passwordHash });
    console.log("[REGISTER] register => user created =", user);

    // JWT Tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email
    });

    console.log("[REGISTER] Storing refresh token...");
    await storeRefreshToken(user.id, refreshToken);
    console.log("[REGISTER] Refresh token stored");

    res.status(201).json({
      user,
      accessToken,
      refreshToken
    });

  } catch (err) {
    console.log("[REGISTER ERROR] =", err);
    logError("Register error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// =========================================================
// LOGIN
// =========================================================
export async function login(req, res) {
  console.log("[LOGIN] Request body =", req.body);

  try {
    const { email, password } = req.body;
    console.log("[LOGIN] email =", email, "password =", password);

    const user = await findUserByEmail(email);
    console.log("[LOGIN] findUserByEmail =>", user);

    if (!user) {
      console.log("[LOGIN] User NOT found");
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    console.log("[LOGIN] Comparing passwords...");
    console.log("[LOGIN] hash in DB =", user.password_hash);

    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log("[LOGIN] password match =", isValid);

    if (!isValid) {
      console.log("[LOGIN] Invalid password");
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email
    });

    console.log("[LOGIN] Storing refresh token...");
    await storeRefreshToken(user.id, refreshToken);
    console.log("[LOGIN] Refresh token stored");

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      accessToken,
      refreshToken
    });

  } catch (err) {
    console.log("[LOGIN ERROR] =", err);
    logError("Login error: " + err.message, req);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// =========================================================
// REFRESH TOKEN
// =========================================================
export async function refresh(req, res) {
  console.log("[REFRESH] body =", req.body);

  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ error: "refreshToken manquant" });

    console.log("[REFRESH] Decoding refresh token...");
    const decoded = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());
    console.log("[REFRESH] decoded =", decoded);

    const userId = decoded.id;

    const stored = await findRefreshToken(userId, refreshToken);
    console.log("[REFRESH] stored refresh token =", stored);

    if (!stored) {
      console.log("[REFRESH] Invalid stored token");
      return res.status(401).json({ error: "Refresh token invalide" });
    }

    await deleteRefreshToken(userId, refreshToken);

    const newAccessToken = generateAccessToken({ id: userId });
    const newRefreshToken = generateRefreshToken({ id: userId });

    await storeRefreshToken(userId, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

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
