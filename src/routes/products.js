const express = require("express");

const ProdController = require("../controllers/products");
const app = express.Router();

app.get("/products", ProdController.GetAllProducts);

app.get("/products/:id", ProdController.GetProdId);

app.post("/products/Text", ProdController.Textsearch);

app.put("/products/:id", ProdController.Update);

app.delete("/products/:id", ProdController.Delete);

app.post("/products", ProdController.Add);

module.exports = app;
