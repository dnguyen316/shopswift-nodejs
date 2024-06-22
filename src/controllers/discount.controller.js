const DiscountService = require("../services/discount.service");
const { SuccessResponse } = require("../core/success.response");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Create Discount Code successful",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodesForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Discount Codes success",
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
      }),
    }).send(res);
  };

  getAllDiscountCodesForUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Discount Codes success",
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Discount Codes success",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
