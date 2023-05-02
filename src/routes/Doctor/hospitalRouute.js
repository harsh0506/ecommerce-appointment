const express = require("express");

const hospitalController = require("../../controllers/DoctorController/hospitalController");
const app = express.Router();

app.post("/hospitals", hospitalController.Create);

module.exports = app;
