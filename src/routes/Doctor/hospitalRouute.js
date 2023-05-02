const express = require("express");

const hospitalController = require("../../controllers/DoctorController/hospitalController");
const app = express.Router();

app.post("/hospitals", hospitalController.Create);

app.get("/hospitals/all", hospitalController.GetAll);

app.get("/hospitals/:id", hospitalController.GetwithId);

app.put("/hospitals/:id", hospitalController.Update);

module.exports = app;
