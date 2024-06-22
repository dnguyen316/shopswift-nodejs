"use strict";

const { findCartById } = require("../models/repositories/cart.repo");
const { BadRequestError } = require("../core/error.response");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");

class CheckoutService {
  //login and without login

  /**
   *  payload
   *  {
   *    cartId,
   *    userId,
   *    shop_order_ids: [
   *      {
   *        shopId,
   *        shop_discounts: [
   *          {
   *            shop_id,
   *            discountId,
   *            codeId
   *          }
   *        ],
   *        item_products: [
   *          {
   *            price,
   *            quantity,
   *            productId
   *          }
   *        ]
   *      }
   *    ]
   *  }
   *
   *
   * @param {*} param0
   */

  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    //check cartId exist

    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError("Cart does not exist");

    const checkout_order = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0,
    };

    const new_shop_order_ids = [];

    for (const {
      shopId,
      shop_discounts = [],
      item_products = [],
    } of shop_order_ids) {
      const checkProductServer = await checkProductByServer(item_products);
      console.log("checkProductServer::", checkProductServer);
      if (!checkProductServer[0]) throw new BadRequestError("Wrong Order");

      // total checkout price
      const checkoutPrice = checkProductServer.reduce((acc, cur_product) => {
        return acc + cur_product.quantity * cur_product.price;
      }, 0);

      //total price before process
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, //price before discount
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      //check shop_discounts exist and greater > 0.
      if (shop_discounts.length > 0) {
        // Case: just one discount
        // get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });

        //total discount
        checkout_order.totalDiscount += discount;
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      //total final checkout
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      new_shop_order_ids.push(itemCheckout);
    }

    return {
      shop_order_ids,
      new_shop_order_ids,
      checkout_order,
    };
  }
}

module.exports = CheckoutService;
