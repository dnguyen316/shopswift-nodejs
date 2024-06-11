const { model, Types, Schema } = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

//Declare the Schema of Discount Model
const discountSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, default: "fixed_amount" }, //percentage
    value: { type: Number, required: true }, //10.000, 10
    code: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    max_applied: { type: Number, required: true }, // max number of discount was applied
    max_use_per_user: { type: Number, required: true }, //max number could be used per user
    users_used: { type: Array, default: [] }, // user used record
    used_count: { type: Number, required: true }, //number discount was used
    min_order_value: { type: Number, required: true },
    shopId: { type: Types.ObjectId, ref: "Shop" },
    is_active: { type: Boolean, default: true },
    applies_to: { type: String, required: true, enum: ["all", "specific"] },
    applied_products: { type: Array, default: [] },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, discountSchema);
