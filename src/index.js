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


// home route
app.get("/", (req, res) => {
  res.send("hello");
});


// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
