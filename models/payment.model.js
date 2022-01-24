const mongoose = require("mongoose");

const Payment = mongoose.model(
  "Payment",
  new mongoose.Schema({
    c_email: String,
    status: Boolean,
    paid: Boolean,
    service: String,
    amount_due: Number,
    amount_paid: Number,
    bill_date: String,
    payment_date: String,
    ref_id: String,
    p_id: String,
  })
);

module.exports = Payment;