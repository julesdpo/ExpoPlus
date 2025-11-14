/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & User Session
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 example: azerty123
 *     responses:
 *       200:
 *         description: Tokens générés (access + refresh)
 *       401:
 *         description: Identifiants invalides
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       409:
 *         description: Email déjà utilisé
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupère les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 *       401:
 *         description: Token invalide ou expiré
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nouveaux accessToken + refreshToken
 *       400:
 *         description: refreshToken manquant
 *       401:
 *         description: Refresh token invalide
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur (supprime tous ses refresh tokens)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnecté avec succès
 */

import { Router } from "express";
import { register, login, me, refresh, logout } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";
import { loginRateLimiter } from "../middlewares/ratelimit.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", loginRateLimiter, login);

router.post("/refresh", refresh);
router.post("/logout", authRequired, logout);

router.get("/me", authRequired, me);

export default router;
