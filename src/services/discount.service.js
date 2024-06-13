"use strict";
const { BadRequestError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodeUnSelect,
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
    if (new Date() < new Date(start_date) || new Date() < new Date(end_date)) {
      throw new BadRequestError("Discount code has expired");
    }

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
}

module.exports = DiscountService;

/** Delete Discount Code [Shop | Admin] */
/** Cancel Discount Code [ User ] */
/** Get all discount codes [User | Shop] */
/** Generator discount amount [ User ] */
/** Verify discount code [ User ] */
