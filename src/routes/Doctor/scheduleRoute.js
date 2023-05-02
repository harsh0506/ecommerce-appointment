const express = require("express");

const scheduleController = require("../../controllers/DoctorController/scheduleController");
const app = express.Router();

app.post("/schedules", scheduleController.Create);

app.get("/schedule/all", scheduleController.GetAll);

app.get("/schedules/:scheduleId", scheduleController.GetById);

app.get("/schedules/doctor/:doctorId", scheduleController.GetScheduleOfDoctor);

app.put("/schedules/:id", scheduleController.Update);

app.get(
  "/doctors-workinghours/:doctorId/:day",
  scheduleController.GetDoctorsSpecificDaySchedule
);

module.exports = app;
