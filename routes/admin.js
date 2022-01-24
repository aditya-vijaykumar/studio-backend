const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware");
const db = require("../models");
const User = db.user;
const Project = db.project;
const Payment = db.payment;

//Get All client profiles
router.get('/all-clients', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  User.find({ role: "client" })
    .then((users) => {
      res.status(200).send({
        clients: users,
        client_count: users.length
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Get a specific Client Details
router.get('/get-client/:email', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  User.find({ role: "client", email: req.params.email })
    .then((user) => {
      res.status(200).send({
        client: user,
        email: req.params.email
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Get a specific Project details
router.get('/project/:id', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  Project.findById(req.params.id)
    .then((project) => {
      res.status(200).send({
        projec: project,
        id: req.params.id
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Fetch All Payments

//Fetch All Client Active Projects

//Fetch All Client Past Projects

//Update Prompt as Reviewed

//Update Prompt as Addressed

//Create new Draft Design

//Create new Final Design 

//Update Project Details with payment details

//Update Project Details and mark as complete

//Create new client Payment

module.exports = router;
