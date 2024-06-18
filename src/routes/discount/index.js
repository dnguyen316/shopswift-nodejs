"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const discountController = require("../../controllers/discount.controller");
// router.post('/')

router.use(authentication);
router.post("", asyncHandler(discountController.createDiscountCode));

module.exports = router;
