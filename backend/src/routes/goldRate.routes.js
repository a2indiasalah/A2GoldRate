const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { getGoldRates } = require("../controllers/goldRate.controller");

router.get("/", asyncHandler(getGoldRates));

module.exports = router;
