const { Doctor, Hospital, Appointment, Schedule } = require("../../Healtcare");
const { User } = require("../../Models");
var validator = require("validator");
const Joi = require("joi");
const moment = require("moment");
const Moment_timezone = require("moment-timezone");

// schedule api calls

//POST request to create the schedule
exports.Create = async (req, res) => {
  try {
    // Check if the doctor exists
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    // Check if a schedule for the doctor already exists
    const existingSchedule = await Schedule.findOne({
      doctorId: req.body.doctorId,
    });
    if (existingSchedule) {
      return res
        .status(400)
        .json({ error: "Schedule already exists for the doctor" });
    }

    // Create a new schedule
    const schedule = new Schedule({
      doctorId: req.body.doctorId,
      monday: req.body.monday,
      tuesday: req.body.tuesday,
      wednesday: req.body.wednesday,
      thursday: req.body.thursday,
      friday: req.body.friday,
      saturday: req.body.saturday,
      sunday: req.body.sunday,
    });
    await schedule.save();
    doctor.schedule = schedule._id;
    await doctor.save();

    res.status(201).json({ message: "Schedule created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.GetAll = async (req, res) => {
  try {
    const schedule = await Schedule.find();

    res.status(200).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//get schedule using schedule id
exports.GetById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.scheduleId).populate(
      "doctorId"
    );

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.status(200).json({ schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//get schedule using doctor ID
exports.GetScheduleOfDoctor = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      doctorId: req.params.doctorId,
    }).populate("doctorId");

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.status(200).json({ schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//put call
exports.Update = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Merge the existing schedule with the new data from the request body
    const updatedSchedule = Object.assign(schedule, req.body);

    // Save the updated schedule
    await updatedSchedule.save();

    res.status(200).json({ message: "Schedule updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//get working hours of doctor on given day
exports.GetDoctorsSpecificDaySchedule = async (req, res) => {
  try {
    // Check if the doctor exists
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    // Get the schedule for the doctor
    const schedule = await Schedule.findOne({ doctorId: req.params.doctorId });
    if (!schedule) {
      return res
        .status(400)
        .json({ error: "Schedule not found for the doctor" });
    }

    // Get the working hours for the day
    const day = req.params.day.toLowerCase();
    const workingHours = schedule[day];
    if (!workingHours.working) {
      return res
        .status(400)
        .json({ error: "Doctor does not work on the selected day" });
    }
    const startTime = workingHours.start
      ? new Date(workingHours.start).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not set";
    const endTime = workingHours.end
      ? new Date(workingHours.end).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not set";
    const duration =
      workingHours.start && workingHours.end
        ? Math.abs(workingHours.end - workingHours.start) / 36e5
        : 0;

    // Send the response
    res.status(200).json({ startTime, endTime, duration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
