const ProductService = require("../services/product.service");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    const product_type = req.body.product_type;

    new SuccessResponse({
      message: "Create new Product success!",
      metadata: await ProductService.createProduct(product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product by Shop success!",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product by Shop success!",
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    const product_type = req.body.product_type;
    const product_id = req.params.product_id;

    new SuccessResponse({
      message: "update product success!",
      metadata: await ProductService.updateProduct(product_type, product_id, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // QUERY
  /**
   * @desc Get all Drafts for shop
   * @param {String} product_shop
   * @param {Number} limit
   * @param {Number} skip
   * @returns { JSON }
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list Draft success!",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list Published success!",
      metadata: await ProductService.findAllPublishedForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list product success!",
      metadata: await ProductService.searchProducts(req.params),
    }).send(res);
  };

  getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all product success!",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  getProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product success!",
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  // END QUERY
}

module.exports = new ProductController();
