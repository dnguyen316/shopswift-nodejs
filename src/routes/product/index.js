"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProduct)
);

router.get("/:product_id", asyncHandler(productController.getProduct));

router.get("", asyncHandler(productController.getAllProducts));

// authentication //
router.use(authentication);

// routers
router.post("", asyncHandler(productController.createProduct));

router.post(
  "/publish/:id",
  asyncHandler(productController.publishProductByShop)
);

router.post(
  "/unpublish/:id",
  asyncHandler(productController.unPublishProductByShop)
);

router.patch("/:product_id", asyncHandler(productController.updateProduct));

// query
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));

router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishedForShop)
);

module.exports = router;
