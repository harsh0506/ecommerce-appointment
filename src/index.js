const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");

const userRoute = require("./routes/userRoutes");
const UserAddress = require("./routes/UserAddress");
const ProductRoutes = require("./routes/products");
const CartRoutes = require("./routes/cart");
const OrderRoutes = require("./routes/order");

const DoctorRoutes = require("./routes/Doctor/doctorRoutes")
const appoitnementRoute = require("./routes/Doctor/appoitnementRoute")
const hospitalRouute = require("./routes/Doctor/hospitalRouute")
const scheduleRoute = require("./routes/Doctor/scheduleRoute")

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


app.use("/", DoctorRoutes);
app.use("/", appoitnementRoute);
app.use("/", hospitalRouute);
app.use("/", scheduleRoute);


<<<<<<< HEAD
// home route
app.get("/", (req, res) => {
  res.send("hello");
=======
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

<<<<<<< HEAD
=======
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

>>>>>>> fe99779 (partitioned code)
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
>>>>>>> 789a79c29c3014b621610736dc195fb049cb81d1
});


// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
