const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

router.post('/auth/signup', (req, res) => {
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
            role: "client"
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
            res.status(500).send({ message: error });
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

router.post('/auth/signin', (req, res) => {
  User.findOne({ username: req.body.username })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken: token
      });
    })
    .catch(err => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
    })
})

router.get('/auth/validate', [authJwt.verifyToken], (req, res) => {
  res.status(200).send({ tokenValid: true });
})

router.get('/auth/isAdmin', [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
  res.status(200).send({ tokenValid: true, isAdmin: true });
})

router.get('/auth/isClient', [authJwt.verifyToken, authJwt.isClient], (req, res) => {
  res.status(200).send({ tokenValid: true, isClient: true });
})

module.exports = router;
