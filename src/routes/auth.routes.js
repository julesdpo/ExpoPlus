import { Router } from "express";
import {
  register,
  login,
  me,
  refresh,
  logout
} from "../controllers/auth.controller.js";

import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// refresh token
router.post("/refresh", refresh);

// logout — nécessite d'être connecté
router.post("/logout", authRequired, logout);

// route protégée
router.get("/me", authRequired, me);

export default router;
