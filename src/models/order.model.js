const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new Schema(
  {
    userId: { type: Number, required: true },
    /**
     * checkout: {
     *  totalPrice,
     *  totalApplyDiscount,
     *  feeShip
     * }
     */
    checkout: { type: Object, default: {} },
    /**
     * street,
     * city,
     * state,
     * country
     */
    shipping: { type: Object, default: {} },
    payment: { type: Object, default: {} },
    products: { type: Array, required: true },
    tracking_number: { type: String, default: "#000123062024" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "cancelled", "delivered"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, orderSchema);
