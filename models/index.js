const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.project = require("./project.model");
db.payment = require("./payment.model");

db.ROLES = ["user", "admin"];

module.exports = db;