"use strict";
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodeUnSelect,
  checkInstanceExists,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongoDB } = require("../utils");

/**
 * Discount Service
 */

class DiscountService {
  /** Generator Discount Code [Shop | Admin] */
  static async createDiscountCode(payload) {
    const {
      name,
      description,
      type,
      value,
      code,
      start_date,
      end_date,
      max_applied,
      max_use_per_user,
      users_used,
      used_count,
      min_order_value,
      shopId,
      is_active,
      applies_to,
      applied_products,
    } = payload;

    //Check valid start_date and end_date
    // if (new Date() < new Date(start_date) || new Date() < new Date(end_date)) {
    //   throw new BadRequestError("Discount code has expired");
    // }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start date must be before end_date");
    }

    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        code,
        shopId: convertToObjectIdMongoDB(shopId),
      })
      .lean();

    // check Discount code existed?
    if (foundDiscount && foundDiscount.is_active) {
      throw new BadRequestError("Discount Code existed");
    }

    const newDiscount = await discountModel.create({
      name,
      description,
      type,
      value,
      code,
      start_date,
      end_date,
      max_applied,
      max_use_per_user,
      users_used,
      used_count,
      min_order_value: min_order_value ?? 0,
      shopId,
      is_active,
      applies_to,
      applied_products: applies_to === "all" ? [] : applied_products,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {
    //...to be continue
  }

  /** Get all discount codes [User] */
  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        code,
        shopId: convertToObjectIdMongoDB(shopId),
      })
      .lean();

    // check Discount code existed?
    if (!foundDiscount && !foundDiscount.is_active) {
      throw new BadRequestError("Discount Code not existed");
    }

    const { applies_to, applied_products } = foundDiscount;
    let products;

    if (applies_to === "all") {
      //get all products
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongoDB(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (applies_to === "specific") {
      //get specific product ids
      products = await findAllProducts({
        filter: {
          _id: { $in: applied_products },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  /** Get all discount codes [Shop] */
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodeUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        shopId: convertToObjectIdMongoDB(shopId),
        is_active: true,
      },
      unSelect: ["__v", "shopId"],
      model: discountModel,
    });

    return discounts;
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkInstanceExists({
      model: discountModel,
      filter: {
        code: codeId,
        shopId: convertToObjectIdMongoDB(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError("Discount Code do not exist");

    const {
      is_active,
      max_applied,
      start_date,
      end_date,
      min_order_value,
      max_use_per_user,
      users_used,
      type: discount_type,
      value: discount_value,
    } = foundDiscount;

    if (!is_active) throw new BadRequestError("Discount expired");
    if (!max_applied) throw new BadRequestError("Discount are out!");

    // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
    //   throw new BadRequestError("Discount code has expired");
    // }

    //check
    let totalOrder = 0;
    if (min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < min_order_value) {
        throw new BadRequestError(
          `Discount require a minimum order value of ${min_order_value}!`
        );
      }
    }

    if (max_use_per_user > 0) {
      const isValidUser = users_used.find((user) => user.userId === userId);
      if (isValidUser) {
        //... Doing something
      }
    }

    //check discount was fixed_amount or percentage
    const discount_amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: discount_amount,
      totalPrice: totalOrder - amount,
    };
  }

  /**
   *  This delete discount code function just a mock function that delete directly to the DB.
   *  In real case, we mustn't do like that. Instead, store that key into another DB to keep track or reverse it
   *
   *  we have to check do it has any product use it or not.
   *
   */
  static async deleteDiscountCode({ shopId, codeId }) {
    //this step just simple handling. We have to firstly find the discount, then delete.
    //Because of some additional condition or checking required before we delete that discount code
    const deleted = await discountModel.findOneAndDelete({
      shopId: convertToObjectIdMongoDB(shopId),
      code: codeId,
    });

    return deleted;
  }

  /** Cancel Discount Code [ User ] */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkInstanceExists({
      model: discount,
      filter: {
        code: codeId,
        shopId: convertToObjectIdMongoDB(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError("Discount Code do not exist");

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        users_used: userId,
      },
      $inc: {
        max_applied: 1,
        used_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;

/** Delete Discount Code [Shop | Admin] */
/** Cancel Discount Code [ User ] */
/** Get all discount codes [User | Shop] */
/** Generator discount amount [ User ] */
/** Verify discount code [ User ] */
