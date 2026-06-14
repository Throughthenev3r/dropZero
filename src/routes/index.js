import { Router } from "express";
import { healthCheck } from "../controllers/healthController.js";
import { shorten } from "../controllers/shortenController.js";
import { redirect } from "../controllers/redirectController.js";
import { stats } from "../controllers/statsController.js";

const router = Router();

router.get("/health",healthCheck);
router.get("/api/stats/:code", stats);
router.post("/api/shorten",shorten);
router.get("/:code",redirect);

export default router;
