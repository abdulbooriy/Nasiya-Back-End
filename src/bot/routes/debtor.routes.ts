import express, { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import debtorController from "../../dashboard/controllers/debtor.controller";

const router: Router = express.Router();

/**
 * Mijoz bo'yicha qarzdorlarni olish (bot)
 * GET /api/bot/debts/customer/:customerId?filter=overdue|pending|normal|all
 */
router.get("/customer/:customerId", authenticate, (req, res, next) =>
  debtorController.getDebtsForCustomer(req, res, next),
);

export default router;
