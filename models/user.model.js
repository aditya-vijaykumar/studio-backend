const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    address: String,
    contact: Number,
    industry: String,
    name: String,
    photo: String,
    poc: String,
    since: String
  })
);

module.exports = User;