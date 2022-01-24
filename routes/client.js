const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware");
const db = require("../models");
const User = db.user;
const Project = db.project;
const Payment = db.payment;


//Fetch Client Active Projects
router.get('/client/active-projects/:email', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  Project.find({ active_status: true, c_email: req.params.email })
    .then((projects) => {
      res.status(200).send({
        email: req.params.email,
        projects: projects,
        projects_count: projects.length,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Fetch client past projects
router.get('/client/past-projects/:email', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  Project.find({ active_status: false, c_email: req.params.email })
    .then((projects) => {
      res.status(200).send({
        email: req.params.email,
        projects: projects,
        projects_count: projects.length,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Update Client Profile Details

//Fetch Payments both paid and unpaid

//Fetch Details of a specific project

//Create new Project
router.post('/new-project', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  const newProject = new Project({
    c_email: req.body.c_email,
    project_title: req.body.project_title,
    image: req.body.image,
    summary: req.body.summary,
    service_type: req.body.service_type,
    launch_date: req.body.launch_date,
    complete_date: req.body.complete_date,
    prompts: [],
    drafts: [],
    finalized: [],
    budget: req.body.budget,
    fees_billable: 0,
    fees_due: 0,
    active_status: true,
  })
  return newProject.save()
    .then((proj) => {
      res.send({ message: "Project was created successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Create new Prompt 

module.exports = router;
