const CartService = require("../services/cart.service");
const { SuccessResponse } = require("../core/success.response");

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Add to Cart success",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Update Cart success",
      metadata: await CartService.updateUserCart(req.body),
    }).send(res);
  };

  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete Cart success",
      metadata: await CartService.deleteUserCartItem(req.body),
    }).send(res);
  };

  listToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Get List Cart success",
      metadata: await CartService.getListUserCart(req.query),
    }).send(res);
  };
}

module.exports = new CartController();
