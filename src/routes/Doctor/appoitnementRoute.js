const express = require("express");

const appoitnementController = require("../../controllers/DoctorController/appoitnementController");
const app = express.Router();

app.post("/appointments", appoitnementController.Create);

app.get("/appointments/:userId", appoitnementController.GetwithPatientId);

app.get(
  "/appointments/doctor/:doctorId",
  appoitnementController.GetWithDoctorId
);

app.get(
  "/appointments/doctor/:doctorId/status/:status",
  appoitnementController.GetDoctorappointmentWithStatus
);

app.get(
  "/appointments/doctor/:id/today",
  appoitnementController.TodaysAppointment
);

app.get(
  "/appointments/upcoming/:doctor",
  appoitnementController.UpcomingAppointments
);

app.put("/appointments/:id", appoitnementController.Update);

app.delete("/appointments/:id", appoitnementController.Delete);

module.exports = app;
