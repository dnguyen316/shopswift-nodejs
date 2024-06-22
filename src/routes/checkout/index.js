"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const checkoutController = require("../../controllers/checkout.controller");

// router.use(authentication);
router.post("/review", asyncHandler(checkoutController.checkoutReview));

module.exports = router;
