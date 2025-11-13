import { Router } from "express";
import { getAllVenues } from "../controllers/venues.controller.js";

const router = Router();

router.get("/", getAllVenues);

export default router;
