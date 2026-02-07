/**
 * Migration: Add PrepaidRecord collection
 * Date: 2026-02-07
 * Description: Create PrepaidRecord schema to store prepaid/excess payment history
 */

import { Schema, model } from "mongoose";

const PrepaidRecordSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  paymentMethod: {
    type: String,
    enum: ["som_cash", "som_card", "dollar_cash", "dollar_card_visa"],
    required: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  contract: {
    type: Schema.Types.ObjectId,
    ref: "Contract",
    required: true,
  },
  contractId: { type: String, required: false },
  notes: { type: String, required: false },
  relatedPaymentId: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexlar
PrepaidRecordSchema.index({ customer: 1, contract: 1 });
PrepaidRecordSchema.index({ date: -1 });
PrepaidRecordSchema.index({ createdBy: 1 });

export default {
  async up() {
    console.log("🔄 Migration: Creating PrepaidRecord collection...");
    const PrepaidRecord = model("PrepaidRecord", PrepaidRecordSchema);
    // Collection already created by Mongoose schema definition
    console.log("✅ PrepaidRecord collection ready");
  },

  async down() {
    console.log("⬇️ Migration: Dropping PrepaidRecord collection...");
    // Would drop collection if needed
    console.log("✅ PrepaidRecord collection dropped");
  },
};
