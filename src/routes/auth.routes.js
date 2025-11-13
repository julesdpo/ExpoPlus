// src/routes/auth.routes.js
import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, me);

export default router;
