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
  deleteRefreshToken,
  findRefreshToken,
} from "../models/refreshToken.model.js";

import jwt from "jsonwebtoken";

/* -------------------------------- REGISTER -------------------------------- */

export async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({
        error: "Email et mot de passe (min 6 caractères) sont requis",
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash });

    // 🔥 Création des tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    // 🔐 Stockage sécurisé du refresh token
    await storeRefreshToken(user.id, refreshToken);

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/* ---------------------------------- LOGIN --------------------------------- */

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // 🔥 Génération access + refresh token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    // 🔐 Sauvegarde du refresh token (rotation future)
    await storeRefreshToken(user.id, refreshToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/* ------------------------------- REFRESH TOKEN ------------------------------ */

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken manquant" });
    }

    // 1️⃣ Vérifier la validité du refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Refresh token invalide" });
    }

    const userId = payload.id;

    // 2️⃣ Vérifier que le token existe encore en DB (anti-vol)
    const stored = await findRefreshToken(userId, refreshToken);
    if (!stored) {
      return res.status(401).json({ error: "Refresh token non reconnu" });
    }

    // 3️⃣ Rotation : supprimer l’ancien
    await deleteRefreshToken(userId, refreshToken);

    // 4️⃣ Générer les nouveaux tokens
    const newAccessToken = generateAccessToken({ id: userId });
    const newRefreshToken = generateRefreshToken({ id: userId });

    // 5️⃣ Stocker le nouveau refresh token
    await storeRefreshToken(userId, newRefreshToken);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("refresh error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
