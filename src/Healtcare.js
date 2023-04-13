const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  area: {
    type: String,
  },
  hospitalId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
  ],
  specialities: [
    {
      type: String,
    },
  ],
  education: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
  },
  rates: {
    newPatient: {
      type: Number,
    },
    routinePatient: {
      type: Number,
    },
  },
  rating: {
    type: Number,
    default: 0,
  },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
});

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  employedAt: { type: Boolean, default: true },
  image: { type: String },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
});

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
    time: { type: Date, required: true },
    end: { type: Date },
    note: { type: String },
    visitType: {
      type: String,
      enum: ["home", "hospital"],
      required: true,
      default: "home",
    },
    review: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    slotTime: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  monday: {
    working: {
      type: Boolean,
      default: false,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
  tuesday: {
    working: {
      type: Boolean,
      default: false,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
  wednesday: {
    working: {
      type: Boolean,
      default: false,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
  thursday: {
    working: {
      type: Boolean,
      default: false,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
  friday: {
    working: {
      type: Boolean,
      default: false,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
  saturday: {
    working: {
      type: Boolean,
      default: false,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
  sunday: {
    working: {
      type: Boolean,
      default: false,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
  },
});

module.exports.Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports.Hospital = mongoose.model("Hospital", hospitalSchema);
module.exports.Doctor = mongoose.model("Doctor", doctorSchema);
module.exports.Appointment = mongoose.model("Appointment", appointmentSchema);
