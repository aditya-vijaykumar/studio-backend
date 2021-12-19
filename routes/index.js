const express = require('express');
const router = express.Router();
const { verifySignUp } = require("../middleware");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

router.get('/', (req, res) => {
  res.send("Initial Setup for Backend")
})


module.exports = router;
