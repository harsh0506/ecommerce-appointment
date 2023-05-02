const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const { Doctor, Hospital, Appointment, Schedule } = require("./Healtcare");
const { User } = require("./Models");
var validator = require("validator");
const userRoute = require("./routes/userRoutes");
const UserAddress = require("./routes/UserAddress");
const ProductRoutes = require("./routes/products");
const CartRoutes = require("./routes/cart");
const OrderRoutes = require("./routes/order");
const Joi = require("joi");
const moment = require("moment");
const Moment_timezone = require("moment-timezone");
// Create the Express application
const app = express();

// Set up the middleware
app.use(bodyParser.json());

const url =
  "mongodb+srv://harshj0506:65RcGlQmfk6EDFnU@cluster0.dussn.mongodb.net/?retryWrites=true&w=majority";
// Connect to the MongoDB database using Mongoose
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Define the routes

//user Personal routes
app.use("/user", userRoute);

//user Address routes
app.use("/Address_USer", UserAddress);

app.use("/", ProductRoutes);
app.use("/", CartRoutes);
app.use("/", OrderRoutes);

// home route
app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/doctor", async (req, res) => {
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
});

app.get("/doctor/all", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/doctor/:id", async (req, res) => {
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
});

app.get("/doctor/text/:searchTerm", async (req, res, next) => {
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
});

app.put("/doctor/:id", async (req, res) => {
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
});

app.post("/hospitals", async (req, res) => {
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
});

app.get("/hospitals/all", async (req, res) => {
  try {
    // Retrieve all hospitals from database
    const hospitals = await Hospital.find();

    // Send response with hospitals data
    res.status(200).json(hospitals);
  } catch (err) {
    // Send error response if there's an error in retrieving hospitals data
    res.status(500).json({ message: err.message });
  }
});

app.get("/hospitals/:id", async (req, res) => {
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
});

app.put("/hospitals/:id", async (req, res) => {
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
});

//appointment api calls

//bug to fix , it is creating appointment at end time of schedule of a doctor , fix it

app.post("/appointments", async (req, res) => {
  try {
    const { doctor, patient, hospital, schedule, time, note, visitType } =
      req.body;

    const doctoR = await Doctor.findById(doctor);
    if (!doctoR) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Check if doctor's schedule is working on the day of the appointment
    const dayOfWeek = moment(time).format("dddd").toLowerCase();
    const doctorSchedule = await Schedule.findOne({ doctorId: doctor });
    if (!doctorSchedule[dayOfWeek].working) {
      return res
        .status(400)
        .json({ message: "Doctor is not working on this day", dayOfWeek });
    }

    const start =
      new Date(doctorSchedule[dayOfWeek].start).getMinutes() === 0
        ? Number(
            `${new Date(doctorSchedule[dayOfWeek].start).getHours()}` +
              `${new Date(doctorSchedule[dayOfWeek].start).getMinutes()}` +
              `${0}`
          )
        : Number(
            `${new Date(doctorSchedule[dayOfWeek].start).getHours()}` +
              `${new Date(doctorSchedule[dayOfWeek].start).getMinutes()}`
          );
    const end =
      new Date(doctorSchedule[dayOfWeek].end).getMinutes() === 0
        ? Number(
            `${new Date(doctorSchedule[dayOfWeek].end).getHours()}` +
              `${new Date(doctorSchedule[dayOfWeek].end).getMinutes()}` +
              `${0}`
          )
        : Number(
            `${new Date(doctorSchedule[dayOfWeek].end).getHours()}` +
              `${new Date(doctorSchedule[dayOfWeek].end).getMinutes()}`
          );

    const curHour = new Date(
      new Date(time).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    )
      .toLocaleString()
      .split(" ")[1]
      .split(":")[0];

    const curMinute = new Date(
      new Date(time).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    )
      .toLocaleString()
      .split(" ")[1]
      .split(":")[1];

    const cur = Number(String(curHour) + String(curMinute)) + 1200;
    // Check if the appointment time is within the doctor's working hours
    if (cur < start || cur > end) {
      return res.status(400).json({
        message: "Appointment is outside of working hours",
        start,
        end,
        cur,
      });
    }

    const startTime = new Date(time);
    const endTime = new Date(startTime.getTime() + 30 * 60000);
    const overlappingAppointment = await Appointment.findOne({
      doctor,
      time: { $lt: endTime },
      end: { $gt: startTime },
    });
    if (overlappingAppointment) {
      return res
        .status(400)
        .json({ error: "Doctor is not available at the given time" });
    }

    const appointment = new Appointment({
      doctor,
      patient,
      end: endTime,
      hospital,
      schedule,
      time: new Date(time).toISOString(),
      note,
      visitType,
    });

    await appointment.save();

    return res.status(200).json({
      message: "Appointment created successfully",
      appointment,
      start,
      end,
      endTime,
      startTime: new Date(startTime)
        .toLocaleString("en-US", { weekday: "long" })
        .toLowerCase(),
      cur,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/appointments/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const appointments = await Appointment.find({ patient: userId });

    const options = {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    const appointmentsIST = appointments.map((appointment) => {
      const date = new Date(appointment.time);
      const ISTOffset = 330 * 60 * 1000; // 5.5 hours in milliseconds
      const ISTTime = new Date(date.getTime() + ISTOffset);
      return {
        ...appointment.toObject(),
        time: ISTTime,
        end: new Date(appointment.end).toLocaleString("en-IN", options),
      };
    });
    

    return res.status(200).json({ appointments: appointmentsIST });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/appointments/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Find all appointments associated with the given doctor ID
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient")
      .exec();

    // Convert appointment time to Indian Standard Time (IST) before sending the response
    const ISTOffset = 330 * 60 * 1000; // UTC+5:30
    const ISTAppointments = appointments.map((appointment) => ({
      ...appointment.toObject(),
      time: new Date(appointment.time.getTime() - ISTOffset),
      end: new Date(appointment.end.getTime() - ISTOffset),
    }));

    res.status(200).json({ appointments: ISTAppointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/appointments/doctor/:doctorId/status/:status", async (req, res) => {
  try {
    const { doctorId, status } = req.params;

    // find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // find the appointments
    const appointments = await Appointment.find({
      doctor: doctorId,
      status,
    }).populate("patient");

    // convert appointment times to Indian Standard Time
    const appointmentsIST = appointments.map((appointment) => {
      const date = new Date(appointment.time);
      const ISTOffset = 330 * 60 * 1000; // 5.5 hours in milliseconds
      const ISTTime = new Date(date.getTime() + ISTOffset);
      return {
        ...appointment.toObject(),
        time: ISTTime,
        end: new Date(appointment.end).toLocaleString("en-IN", options),
      };
    });

    return res.status(200).json({ appointments: appointmentsIST });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/appointments/doctor/:id/today", async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: req.params.id,
      time: { $gte: todayStart, $lte: todayEnd },
    });

    // convert UTC time to Indian Standard Time
    const appointmentsIST = appointments.map((appointment) => {
      const timeIST = moment.utc(appointment.time).utcOffset("+05:30").format();
      return { ...appointment._doc, time: timeIST };
    });

    return res.status(200).json({ appointments: appointmentsIST });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/appointments/upcoming/:doctor", async (req, res) => {
  try {
    const { doctor } = req.params;
    const appointments = await Appointment.find({
      doctor,
      time: { $gte: new Date() },
    })
      .sort({ time: 1 })
      .limit(5);

    if (!appointments) {
      return res
        .status(404)
        .json({ message: "No upcoming appointments found" });
    }

    const appointmentsIST = appointments.map((appointment) => {
      const date = new Date(appointment.time);
      const ISTOffset = 330 * 60 * 1000; // 5.5 hours in milliseconds
      const ISTTime = new Date(date.getTime() + ISTOffset);
      return {
        ...appointment.toObject(),
        time: ISTTime,
        end: new Date(appointment.end).toLocaleString("en-IN", options),
      };
    });

    return res.status(200).json({ appointments: appointmentsIST });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

//put request ,, **** you can't rescudule the appointment as of now 2-5-23
app.put("/appointments/:id", async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const UpdatedAppoint = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        ...appointment.toObject(),
        ...req.body,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment: UpdatedAppoint,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.delete('/appointments/:id', (req, res) => {
  const appointmentId = req.params.id;

  Appointment.findByIdAndDelete(appointmentId)
    .then(appointment => {
      if (!appointment) {
        return res.status(404).send({ message: 'Appointment not found' });
      }
      return res.send({ message: 'Appointment deleted successfully' });
    })
    .catch(error => {
      console.error(error);
      return res.status(500).send({ message: 'Failed to delete appointment' });
    });
});


// schedule api calls

//POST request to create the schedule
app.post("/schedules", async (req, res) => {
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
});

app.get("/schedule/all", async (req, res) => {
  try {
    const schedule = await Schedule.find();

    res.status(200).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get schedule using schedule id
app.get("/schedules/:scheduleId", async (req, res) => {
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
});

//get schedule using doctor ID
app.get("/schedules/doctor/:doctorId", async (req, res) => {
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
});

//put call
app.put("/schedules/:id", async (req, res) => {
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
});

//get working hours of doctor on given day
app.get("/doctors-workinghours/:doctorId/:day", async (req, res) => {
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
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
