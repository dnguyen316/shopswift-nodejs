"use strict";
const { BadRequestError, NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { userId, state: "active" },
      updateOrInsert = {
        $addToSet: {
          products: product,
        },
      },
      option = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, option);
  }

  static async addToCart({ userId, product = {} }) {
    //check user
    const userCart = await cartModel.findOne({ userId });
    if (!userCart) {
      return await this.createUserCart({ userId, product });
    }

    //check if cart is empty
    if (!userCart.products.length) {
      userCart.products = [product];
      return await userCart.save();
    }

    //case: Cart already has products, update quantity
    return await this.updateUserCartQuantity({ userId, product });
  }

  // update cart
  /**
   * shop_order_ids: [
   *  {
   *    shopId,
   *    item_products: [
   *      {
   *        quantity,
   *        price,
   *        shopId,
   *        old_quantity,
   *        productId
   *      }
   *    ],
   *    version
   *  }
   * ]
   */
  static async updateUserCart({ userId, shop_order_ids = [] }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    //check product exists
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("Product not exist!");

    //compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
      throw new NotFoundError("Product does not belong to the shop");

    //delete product when quantity === 0
    if (quantity === 0) {
      //delete execution
      return await this.deleteUserCartItem({ userId, productId });
    }

    return await this.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;

    const query = { userId, "products.productId": productId, state: "active" },
      updateSet = {
        $inc: {
          "products.$.quantity": quantity, // $ present for the this product
        },
      },
      option = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateSet, option);
  }

  static async deleteUserCartItem({ userId, productId }) {
    const query = { userId, state: "active" },
      updateSet = {
        $pull: {
          products: {
            productId,
          },
        },
      };

    const deleteCart = await cartModel.updateOne(query, updateSet);

    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        userId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
