const { Schema, model, Types } = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

//Declare the Schema of Inventory
const inventorySchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product" },
    location: { type: String, default: "unknown" },
    stock: { type: Number, required: true },
    shopId: { type: Types.ObjectId, ref: "Shop" },
    reservations: { type: Array, default: [] },
    /** reservation field
     *  cardId: ...,
     *  stock: 1,
     *  createdAt: ...
     */
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = { inventory: model(DOCUMENT_NAME, inventorySchema) };
