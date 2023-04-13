const express = require("express");

const OrderController = require("../controllers/order");
const app = express.Router();

app.post("/orders", OrderController.Create);

app.put("/order/:id", OrderController.Put);

app.get("/:userId/orders", OrderController.GetUsingId);

app.get("/:orderId", OrderController.SingleORder);

app.put("/deleteProduct/:id", OrderController.DelPRod);

module.exports = app;
