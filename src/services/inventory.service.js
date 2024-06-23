"use strict";

const { BadRequestError } = require("../core/error.response");
const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "",
  }) {
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new BadRequestError("Product does not exists");

    const query = { shopId, productId },
      updateSet = {
        $inc: {
          stock,
        },
        $set: {
          location,
        },
      },
      option = {
        upsert: true,
        new: true,
      };
    return await inventory.findOneAndUpdate(query, updateSet, option);
  }
}

module.exports = InventoryService;
