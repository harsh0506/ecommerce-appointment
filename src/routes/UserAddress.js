const express = require("express");
const mongoose = require("mongoose");
const { Product, User, Address, Wishlist, Cart } = require("../Models");

const app = express.Router();

app.get("/addresses", async (req, res) => {
  try {
    const addresses = await Address.find();
    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/:userId/address", async (req, res) => {
  try {
    // Check if the user exists
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate the request body
    const { street, city, state, zip } = req.body;
    if (!street || !city || !state || !zip) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new address object
    const address = new Address({
      street,
      city,
      state,
      zip,
    });

    await address.save();

    // Save the address to the user's profile
    user.address = address;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//put request to update the adress
app.put("/:userId/address", async (req, res) => {
  try {
    // Find the user and address
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const address = await Address.findById(user.address);
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Validate the request body
    const { street, city, state, zip } = req.body;
    if (!street || !city || !state || !zip) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update the address
    address.street = street;
    address.city = city;
    address.state = state;
    address.zip = zip;
    await address.save();

    // Update the user's address reference
    user.address = address;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = app;
