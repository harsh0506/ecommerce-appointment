const express = require("express");

const doctorcontroller = require("../../controllers/DoctorController/doctorController");
const app = express.Router();

app.post("/doctor", doctorcontroller.createDoctor);

app.get("/doctor/all", doctorcontroller.GetALlDoctor);

app.get("/doctor/:id", doctorcontroller.GetWithId);

app.get("/doctor/text/:searchTerm", doctorcontroller.TextSEarch);

app.put("/doctor/:id", doctorcontroller.Update);

module.exports = app;
