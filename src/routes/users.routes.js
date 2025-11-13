/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Liste des utilisateurs (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
