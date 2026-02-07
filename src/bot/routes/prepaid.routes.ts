/**
 * Bot Prepaid Routes
 * Zapas Tarixi uchun bot-specific routes
 */

import express, { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import prepaidController from "../../dashboard/controllers/prepaid.controller";

const router: Router = express.Router();

/**
 * Mijozning zapas tarihini olish
 * GET /api/bot/prepaid/history/:customerId
 */
router.get("/history/:customerId", authenticate, (req, res) =>
  prepaidController.getPrepaidHistory(req, res),
);

/**
 * Shartnoma bo'yicha zapas tarihini olish
 * GET /api/bot/prepaid/contract/:contractId
 */
router.get("/contract/:contractId", authenticate, (req, res) =>
  prepaidController.getPrepaidByContract(req, res),
);

/**
 * Jami zapas statistikasi
 * GET /api/bot/prepaid/stats/:customerId
 */
router.get("/stats/:customerId", authenticate, (req, res) =>
  prepaidController.getPrepaidStats(req, res),
);

export default router;
