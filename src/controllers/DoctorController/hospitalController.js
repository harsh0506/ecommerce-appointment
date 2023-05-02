const { Doctor, Hospital, Appointment, Schedule } = require("../../Healtcare");
const { User } = require("../../Models");
var validator = require("validator");
const Joi = require("joi");
const moment = require("moment");
const Moment_timezone = require("moment-timezone");
exports.Create = async (req, res) => {
  const { name, address, phoneNumber, email, doctors } = req.body;

  // Check if hospital with same name and email already exists
  const existingHospital = await Hospital.findOne({
    $or: [{ name }, { email }],
  });
  if (existingHospital) {
    return res.status(400).json({ message: "Hospital already exists" });
  }

  if (!name || !address || !phoneNumber || !email) {
    return res.status(400).json({
      message: "Name, address, phone number, and email are required",
    });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate phone number format
  if (!validator.isMobilePhone(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  // Create new hospital
  const hospital = new Hospital({ name, address, phoneNumber, email });

  // Add doctors to hospital
  if (doctors && doctors.length > 0) {
    // Get array of unique doctor IDs
    const uniqueDoctorIds = [...new Set(doctors)];

    // Check if each doctor ID exists and add to hospital
    for (const doctorId of uniqueDoctorIds) {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res
          .status(400)
          .json({ message: `Doctor with ID ${doctorId} does not exist` });
      }
      if (!doctor.hospitalId.includes(hospital._id)) {
        doctor.hospitalId.push(hospital._id);
        await doctor.save();
      }
      if (!hospital.doctors.includes(doctor._id)) {
        hospital.doctors.push(doctor._id);
      }
    }
  }

  // Save hospital to database
  try {
    await hospital.save();
    return res
      .status(201)
      .json({ message: "Hospital created successfully", hospital });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error creating hospital", error: err });
  }
};

exports.GetAll = async (req, res) => {
  try {
    // Retrieve all hospitals from database
    const hospitals = await Hospital.find();

    // Send response with hospitals data
    res.status(200).json(hospitals);
  } catch (err) {
    // Send error response if there's an error in retrieving hospitals data
    res.status(500).json({ message: err.message });
  }
};

exports.GetwithId = async (req, res) => {
  try {
    // Find the hospital by ID
    const hospital = await Hospital.findById(req.params.id).populate("doctors");

    // If hospital is not found, return an error
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Return the hospital and connected doctors
    return res.json(hospital);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.Update = async (req, res) => {
  const { name, address, phoneNumber, email, employedAt, doctors } = req.body;
  const hospitalId = req.params.id;

  try {
    // Validate request data
    if (!name || !address || !phoneNumber || !email) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Check if hospital with the given ID exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Check if hospital with the same name and email already exists
    const existingHospital = await Hospital.findOne({
      $or: [{ name }, { email }],
    });
    if (existingHospital && existingHospital._id.toString() !== hospitalId) {
      return res.status(409).json({ message: "Hospital already exists" });
    }

    // Update hospital fields
    hospital.name = name;
    hospital.address = address;
    hospital.phoneNumber = phoneNumber;
    hospital.email = email;
    hospital.employedAt = employedAt;

    // Update doctors associated with the hospital
    if (doctors && Array.isArray(doctors)) {
      // Add new doctors to the hospital
      const newDoctors = doctors.filter(
        (doctorId) => !hospital.doctors.includes(doctorId)
      );
      hospital.doctors.push(...newDoctors);

      // Update doctors with the new hospital ID
      await Doctor.updateMany(
        { _id: { $in: newDoctors } },
        { $set: { hospital: hospital._id } }
      );

      // Remove doctors from the hospital
      const removedDoctors = hospital.doctors.filter(
        (doctorId) => !doctors.includes(doctorId)
      );
      hospital.doctors.pull(...removedDoctors);

      // Update doctors with no hospital ID
      await Doctor.updateMany(
        { _id: { $in: removedDoctors }, hospital: hospital._id },
        { $unset: { hospital: "" } }
      );
    }

    // Save updated hospital to database
    await hospital.save();

    // Return updated hospital
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
