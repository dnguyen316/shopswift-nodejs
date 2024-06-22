const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

const CartSchema = new Schema(
  {
    state: {
      type: String,
      require: true,
      enum: ["active", "completed", "failed", "pending"],
      default: "active",
    },
    products: {
      type: Array,
      require: true,
      default: [],
    },
    count_product: { type: Number, default: 0 },
    userId: { type: Number, require: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, CartSchema);
