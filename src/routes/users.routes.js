/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestion des utilisateurs (réservé admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "810fe980-9049-4390-856b-6ae28c9ab17b"
 *         email:
 *           type: string
 *           example: "test@test.com"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: "admin"
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Liste des utilisateurs (admin uniquement)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Administrateur requis
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       404:
 *         description: Utilisateur introuvable
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       404:
 *         description: Utilisateur introuvable
 */

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Modifier le rôle d'un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *       400:
 *         description: Rôle invalide
 *       404:
 *         description: Utilisateur introuvable
 */


import { Router } from "express";
import {
  listUsers,
  getUser,
  removeUser,
  changeUserRole,
} from "../controllers/users.controller.js";

import { authRequired } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

const router = Router();

// Toutes les routes Users → protégées par adminOnly

router.get("/", authRequired, adminOnly, listUsers);
router.get("/:id", authRequired, adminOnly, getUser);
router.delete("/:id", authRequired, adminOnly, removeUser);
router.patch("/:id", authRequired, adminOnly, changeUserRole);

export default router;
