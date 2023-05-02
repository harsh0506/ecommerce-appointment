const { Doctor, Hospital, Appointment, Schedule } = require("../../Healtcare");
const { User } = require("../../Models");
<<<<<<< HEAD
var validator = require("validator");
const Joi = require("joi");
const moment = require("moment");
const Moment_timezone = require("moment-timezone");
=======

>>>>>>> 789a79c29c3014b621610736dc195fb049cb81d1
exports.createDoctor = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // If email does not exist, proceed with creating the doctor
    const doctor = new Doctor(req.body);
    await doctor.save();

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.GetALlDoctor = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.GetWithId = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findById(id).populate("hospitalId");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.TextSEarch = async (req, res, next) => {
  try {
    const { searchTerm } = req.params;
    if (!searchTerm) {
      return res.status(400).send({ message: "Search term is required" });
    }

    const pipeline = [
      {
        $search: {
          index: "doctor",
          text: {
            query: searchTerm,
            path: {
              wildcard: "*",
            },
            fuzzy: {},
          },
        },
      },
    ];
    const results = await Doctor.aggregate(pipeline);

    if (results.length === 0) {
      return res.status(404).send({ message: "No products found" });
    }

    return res.status(200).send({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Server error" });
  }
};

exports.Update = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }

    const newSpeciality = req.body.speciality;
    const currentSpeciality = doctor.specialities;
    if (newSpeciality && !currentSpeciality.includes(newSpeciality)) {
      doctor.specialities.push(newSpeciality);
    }

    const newEducation = req.body.education;
    const currentEducation = doctor.education;
    if (newEducation && !currentEducation.includes(newEducation)) {
      doctor.education.push(newEducation);
    }

    const newhospitalId = req.body.hospitalId;
    const currenthospitalId = doctor.hospitalId;
    if (newhospitalId && !currenthospitalId.includes(newhospitalId)) {
      doctor.hospitalId.push(newhospitalId);
    }

    doctor.name = req.body.name || doctor.name;
    doctor.email = req.body.email || doctor.email;
    doctor.phone = req.body.phone || doctor.phone;
    doctor.area = req.body.area || doctor.area;
    doctor.description = req.body.description || doctor.description;
    doctor.rating = req.body.rating || doctor.rating;

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};