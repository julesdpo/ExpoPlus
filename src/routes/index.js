import express from "express";
import authRoutes from "./auth.routes.js";
import favoritesRoutes from "./favorites.routes.js";
import eventsRoutes from "./events.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/favorites", favoritesRoutes);
router.use("/events", eventsRoutes);

export default router;
