"use strict";

const cartModel = require("../cart.model");
const { convertToObjectIdMongoDB } = require("../../utils/");

const findCartById = async (cartId) => {
  return await cartModel
    .findOne({ _id: convertToObjectIdMongoDB(cartId), state: "active" })
    .lean();
};

module.exports = {
  findCartById,
};
