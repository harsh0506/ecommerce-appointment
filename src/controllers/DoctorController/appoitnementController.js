const { Doctor, Hospital, Appointment, Schedule } = require("../../Healtcare");
const { User } = require("../../Models");
var validator = require("validator");
const Joi = require("joi");
const moment = require("moment");
const Moment_timezone = require("moment-timezone");
//appointment api calls

//bug to fix , it is creating appointment at end time of schedule of a doctor , fix it

exports.Create = async (req, res) => {
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
};

exports.GetwithPatientId = async (req, res) => {
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
};

exports.GetWithDoctorId = async (req, res) => {
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
};

exports.GetDoctorappointmentWithStatus = async (req, res) => {
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
};

exports.TodaysAppointment = async (req, res) => {
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
};

exports.UpcomingAppointments = async (req, res) => {
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
};

//put request ,, **** you can't rescudule the appointment as of now 2-5-23
exports.Update = async (req, res) => {
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
};

exports.Delete = (req, res) => {
  const appointmentId = req.params.id;

  Appointment.findByIdAndDelete(appointmentId)
    .then((appointment) => {
      if (!appointment) {
        return res.status(404).send({ message: "Appointment not found" });
      }
      return res.send({ message: "Appointment deleted successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).send({ message: "Failed to delete appointment" });
    });
};
