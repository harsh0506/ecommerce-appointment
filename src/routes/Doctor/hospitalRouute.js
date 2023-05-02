const express = require("express");

const hospitalController = require("../../controllers/DoctorController/hospitalController");
const app = express.Router();

app.post("/hospitals", hospitalController.Create);

<<<<<<< HEAD
app.get("/hospitals/all", hospitalController.GetAll);

app.get("/hospitals/:id", hospitalController.GetwithId);

app.put("/hospitals/:id", hospitalController.Update);

=======
>>>>>>> 789a79c29c3014b621610736dc195fb049cb81d1
module.exports = app;
