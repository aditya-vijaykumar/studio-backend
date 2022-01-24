const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware");
const db = require("../models");
const User = db.user;
const Project = db.project;
const Payment = db.payment;

//Fetch All client profiles
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
router.get('/get-client/:id', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      res.status(200).send({
        client: user,
        cid: req.params.id
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
        project: project,
        id: req.params.id
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Fetch All Payments
router.get('/all-payments', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  Payment.find({ paid: false })
    .then((paymentsDue) => {
      Payment.find({ paid: true })
        .then((paymentsMade) => {
          res.status(200).send({
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

//Fetch All Client Active Projects
router.get('/active-projects', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  Project.find({ active_status: true })
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

//Fetch All Client Past Projects
router.get('/past-projects', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  Project.find({ active_status: false })
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

//Update Prompt as Reviewed
router.post('/prompt/reviewed/:id/:pid', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  Project.findById(req.params.id)
    .then((project) => {
      //Create object
      const prompts = project.prompts
      prompts[req.params.pid - 1].reviewed = true

      //Add and update
      const updates = { prompts }
      Project.findByIdAndUpdate(req.params.id, updates)
        .then((projectUpdated) => {
          res.status(200).send({
            p_id: req.params.id,
            message: "Prompt successfully marked as reviewed!",
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

//Update Prompt as Addressed
router.post('/prompt/addressed/:id/:pid', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  Project.findById(req.params.id)
    .then((project) => {
      //Create object
      const prompts = project.prompts
      prompts[req.params.pid - 1].addressed = true

      //Add and update
      const updates = { prompts }
      Project.findByIdAndUpdate(req.params.id, updates)
        .then((projectUpdated) => {
          res.status(200).send({
            p_id: req.params.id,
            message: "Prompt successfully marked as addressed!",
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

//Create new Draft Design
router.post('/new-draft-design/:id', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  Project.findById(req.params.id)
    .then((project) => {
      //Create object
      const drafts = project.drafts
      let n_id = drafts.length + 1 ?? 1

      const new_dd = {
        _id_: n_id,
        text: req.body.text ?? "",
        img_link: req.body.img_link ?? "",
        img: req.body.img ?? "",
        s_date: req.body.s_date ?? "",
      }
      drafts.push(new_dd)

      //Add and update
      const updates = { drafts }
      Project.findByIdAndUpdate(req.params.id, updates)
        .then((projectUpdated) => {
          res.status(200).send({
            p_id: req.params.id,
            message: "New Draft successfully added!",
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

//Create new Final Design 
router.post('/new-final-design/:id', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  Project.findById(req.params.id)
    .then((project) => {
      //Create object
      const finalized = project.finalized
      let n_id = finalized.length + 1 ?? 1

      const new_fd = {
        _id_: n_id,
        filename: req.body.filename ?? "",
        f_date: req.body.f_date ?? "",
        link: req.body.link ?? "",
      }
      finalized.push(new_fd)

      //Add and update
      const updates = { finalized }
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

//Update Project Details with payment details and image
router.post('/project/update-specifics/:id', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {

  //Mark objects
  const fees_billable = req.body.fees_billable
  const fees_due = req.body.fees_due
  const image = req.body.image

  //Update
  const updates = { fees_billable, fees_due, image }
  Project.findByIdAndUpdate(req.params.id, updates)
    .then((projectUpdated) => {
      res.status(200).send({
        p_id: req.params.id,
        message: "Project Specifics successfully updated!",
        projectUpdated
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })

})

//Update Project Details and mark as complete
router.post('/project/mark-complete/:id', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  const active_status = false
  const complete_date = req.body.complete_date
  //Update
  const updates = { active_status, complete_date }
  Project.findByIdAndUpdate(req.params.id, updates)
    .then((projectUpdated) => {
      res.status(200).send({
        p_id: req.params.id,
        message: "Project successfully marked complete!",
        projectUpdated
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Create new client Payment
router.post('/new-payment', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  const newProject = new Project({
    c_id: req.body.cid,
    status: false,
    paid: false,
    service: req.body.project_title,
    project_title: req.body.project_title,
    amount_due: req.body.amount_due,
    amount_paid: 0,
    bill_date: req.body.bill_date,
    payment_date: "",
    ref_id: "",
    p_id: req.body.pid,
  })
  return newProject.save()
    .then((proj) => {
      res.status(200).send({ message: "New Payment was created successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    })
})

//Register a new client
router.post('/new-client', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  //Check if there are any accounts registered with the same username
  User.findOne({ username: req.body.username })
    .then(user => {
      if (user) {
        res.status(400).send({ message: "Failed! Username is already in use!" });
        return;
      }
      //Check if there are any accounts with the same email
      User.findOne({ email: req.body.email })
        .then(acc => {
          if (acc) {
            res.status(400).send({ message: "Failed! Email is already in use!" });
            return;
          }

          //No matches, so we can sign up the user
          const userAcc = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            role: "client",
            address: req.body.address,
            contact: req.body.contact,
            industry: req.body.industry,
            name: req.body.name,
            photo: req.body.photo,
            poc: req.body.poc,
            since: req.body.since
          });

          userAcc.save((err, user) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send({ message: "User was registered successfully!" });
          });
        })
        .catch(error => {
          if (error) {
            res.status(500).send({ message: err });
            return;
          }
        })
    })
    .catch(err => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    })
})

module.exports = router;
