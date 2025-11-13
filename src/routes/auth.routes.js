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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens générés
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription utilisateur
 *     tags: [Auth]
 */


import { Router } from "express";
import { register, login, me, refresh, logout } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";
import { loginRateLimiter } from "../middlewares/ratelimit.middleware.js";

const router = Router();

router.post("/register", register);

// ⛔ Limiter les tentatives de login
router.post("/login", loginRateLimiter, login);

router.post("/refresh", refresh);
router.post("/logout", authRequired, logout);

router.get("/me", authRequired, me);

export default router;
