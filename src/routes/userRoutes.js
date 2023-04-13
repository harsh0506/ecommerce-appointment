const express = require("express");
const mongoose = require("mongoose");
const { Product, User, Address, Wishlist, Cart } = require("../Models");

const app = express.Router()

//user route
app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(409)
        .json({ message: "Email already exists, please use another email." });
    }

    // Create a new user
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Retrieve all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Retrieve a specific user by ID
app.get("/users/:id", async (req, res) => {
  try {
     const user = await User.findById(req.params.id).populate('address');
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update a user by ID
app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Delete a user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Retrieve a user's cart by ID
app.get("/users/:id/cart", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("cart");
    if (!user) return res.status(404).send("User not found");
    res.json(user.cart);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
module.exports = app