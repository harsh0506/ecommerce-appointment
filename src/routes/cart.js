const express = require("express");
const { body, param, validationResult } = require("express-validator");
const CartController = require("../controllers/cart");
const app = express.Router();

app.post("/cart/:userId", CartController.Create);

app.get(
  "/cart/:userId",
  [
    param("userId")
      .exists()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ID"),
  ],
  CartController.GetOrder
);

app.delete("/cart/:cartId/product/:productId", CartController.Delete)

module.exports = app;
