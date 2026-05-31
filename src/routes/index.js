import { Router } from "express";
import { healthCheck } from "../controllers/healthController.js";
import { shorten } from "../controllers/shortenController.js";
import { redirect } from "../controllers/redirectController.js";

const router = Router();

router.get("/health",healthCheck);
router.post("/api/shorten",shorten);
router.get("/:code",redirect);

export default router;
