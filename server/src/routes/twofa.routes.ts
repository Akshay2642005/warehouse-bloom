import { Router } from "express";
import { authenticate } from "../middlewares/requireAuth";
import {
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FA,
  get2FAStatus,
} from "../controllers/twofa.controller";

const router = Router();

// All 2FA routes require authentication
router.use(authenticate);

router.get("/status", get2FAStatus);
router.post("/setup", setup2FA);
router.post("/enable", enable2FA);
router.post("/disable", disable2FA);
router.post("/verify", verify2FA);

export { router as twofaRouter };
export default router;
