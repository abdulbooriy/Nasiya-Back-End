/**
 * Zapas Tarihi (Prepaid Records) Routes
 */

import express, { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import prepaidController from "../controllers/prepaid.controller";

const router: Router = express.Router();

/**
 * Mijozning zapas tarihini olish
 * GET /api/dashboard/prepaid/history/:customerId
 */
router.get("/history/:customerId", authenticate, (req, res) =>
  prepaidController.getPrepaidHistory(req, res),
);

/**
 * Shartnoma bo'yicha zapas tarihini olish
 * GET /api/dashboard/prepaid/contract/:contractId
 */
router.get("/contract/:contractId", authenticate, (req, res) =>
  prepaidController.getPrepaidByContract(req, res),
);

/**
 * Jami zapas statistikasi
 * GET /api/dashboard/prepaid/stats/:customerId
 */
router.get("/stats/:customerId", authenticate, (req, res) =>
  prepaidController.getPrepaidStats(req, res),
);

/**
 * Barcha prepaid record'larni olish (admin uchun)
 * GET /api/dashboard/prepaid/all
 */
router.get("/all", authenticate, (req, res) =>
  prepaidController.getAllPrepaidRecords(req, res),
);

/**
 * Prepaid record'ni yangilash
 * PATCH /api/dashboard/prepaid/:recordId
 */
router.patch("/:recordId", authenticate, (req, res) =>
  prepaidController.updatePrepaidRecord(req, res),
);

/**
 * Prepaid record'ni o'chirish (admin uchun)
 * DELETE /api/dashboard/prepaid/:recordId
 */
router.delete("/:recordId", authenticate, (req, res) =>
  prepaidController.deletePrepaidRecord(req, res),
);

export default router;
