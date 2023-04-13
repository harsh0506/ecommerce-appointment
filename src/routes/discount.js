const express = require("express");

const DiscountController = require("../controllers/discount");
const app = express.Router();

app.post("/discount", DiscountController.Create);

app.get("/products/:id/discounts", DiscountController.GetProdDiscount);

app.get("/discounts/:id", DiscountController.GetDiscount);

app.get("/discounts/:code/:productId", DiscountController.GetDiscountUsingCode);

app.put("/discounts/:id", DiscountController.ChangeDiscount);

app.delete("/discounts/:id", DiscountController.DeleteDiscount);

module.exports = app;
