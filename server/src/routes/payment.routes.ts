import { Router } from "express";
import { authenticate } from "../middlewares/requireAuth";
import {
  handlePaymentSuccess,
  handleWebhook,
  createPayment,
  getPaymentStatus,
} from "../controllers/payment.controller";

const router = Router();

// Public routes
router.post("/webhook", handleWebhook);
router.get("/success", handlePaymentSuccess);

// Protected routes
router.use(authenticate);
router.post("/", createPayment);
router.get("/:paymentId/status", getPaymentStatus);

export { router as paymentRouter };
export default router;
