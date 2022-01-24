const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware");
const db = require("../models");
const User = db.user;
const Project = db.project;
const Payment = db.payment;


//Fetch Client Active Projects
router.get('/active-projects', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  Project.find({ active_status: true, c_id: req.userId })
    .then((projects) => {
      console.log(req.userId)
      res.status(200).send({
        projects: projects,
        projects_count: projects.length,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Fetch client past projects
router.get('/past-projects', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  Project.find({ active_status: false, c_id: req.userId })
    .then((projects) => {
      res.status(200).send({
        projects: projects,
        projects_count: projects.length,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Update Client Profile Details
router.post('/update-profile', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  const updates = {
    address: req.body.address ?? "",
    contact: req.body.contact ?? 0,
    industry: req.body.industry ?? "",
    photo: req.body.photo ?? "",
    poc: req.body.poc ?? "",
  }
  User.findByIdAndUpdate(req.userId, updates)
    .then((userUpdated) => {
      res.status(200).send({ message: "User Profile was updated successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Fetch Profile
router.get('/profile', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  User.findById(req.userId)
    .then((user) => {
      res.status(200).send({
        user: user,
        userId: req.userId,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Fetch Payments both paid and unpaid
router.get('/payments', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  Payment.find({ paid: false, c_id: req.userId })
    .then((paymentsDue) => {
      Payment.find({ paid: true, c_id: req.userId })
        .then((paymentsMade) => {
          res.status(200).send({
            id: req.userId,
            paymentsDue: paymentsDue ?? [],
            paymentsMade: paymentsMade ?? [],
          });
        })
        .catch((err) => {
          res.status(500).send({ message: err });
        })
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Fetch Details of a specific project
router.get('/project/:id', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  Project.findById(req.params.id)
    .then((project) => {
      res.status(200).send({
        p_id: req.params.id,
        project
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Create new Project
router.post('/new-project', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  const newProject = new Project({
    c_id: req.userId,
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
      res.status(200).send({ message: "Project was created successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Create new Prompt 
router.post('/new-prompt/:id', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  Project.findById(req.params.id)
    .then((project) => {
      //Create object
      const prompts = project.prompts
      let n_id = prompts.length + 1 ?? 1
      const new_prompt = {
        _id_: n_id,
        prompt_title: req.body.prompt_title ?? "",
        prompt_message: req.body.prompt_message ?? "",
        refs: req.body.refs ?? "",
        c_date: req.body.c_date ?? "",
        addressed: false,
        reviewed: false
      }
      prompts.push(new_prompt)

      //Add and update
      const updates = { prompts }
      Project.findByIdAndUpdate(req.params.id, updates)
        .then((projectUpdated) => {
          res.status(200).send({
            p_id: req.params.id,
            message: "New Prompt successfully added!",
            projectUpdated
          });
        })
        .catch((err) => {
          res.status(500).send({ message: err });
        })
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

module.exports = router;
