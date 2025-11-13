// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../services/jwt.service.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/users.model.js";

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

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      user,
      accessToken,
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

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

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      accessToken,
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
