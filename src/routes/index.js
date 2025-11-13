import { Router } from "express";
import authRoutes from "./auth.routes.js";
import eventsRoutes from "./events.routes.js";
import favoritesRoutes from "./favorites.routes.js";
import venuesRoutes from "./venues.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventsRoutes);
router.use("/favorites", favoritesRoutes);
router.use("/venues", venuesRoutes);

export default router;
