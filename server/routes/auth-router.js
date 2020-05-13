const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user-model');
const nodemailer = require('nodemailer');
const keys = require('../config/keys');
const expressSession = require('express-session');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require("node-fetch");

const poolData = {
  UserPoolId: keys.cognito.userPoolId,
  ClientId: keys.cognito.clientId
}

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

let sess;

router.post('/signup', (req,res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phoneNo = req.body.phoneNo;

  const emailData = {
    Name: 'email',
    Value: email
  };

  const phoneData = {
    Name: 'phone_number',
    Value: phoneNo
  };

  const nameData = {
    Name: 'given_name',
    Value: name
  };

  const emailAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(emailData);
  const phoneAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(phoneData);
  const nameAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(nameData);

  userPool.signUp(email, password, [ emailAttribute, phoneAttribute, nameAttribute ], null, (err,data) => {
    if(err) {
      return console.log(err);
    }
    const userID = data.userSub;
    const phone = phoneNo;
    const newUser = new User({
      email,
      phone,
      userID
    })
    newUser
    .save()
    .then((user) => {
        res.send({user: user, data: data.user});
    })
    .catch(err => console.log(err)) 
  })
});

router.post('/login', (req,res) => {
  const LoginData = {
    Username: req.body.username,
    Password: req.body.password
  }
  const AuthenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(LoginData);

  const UserData = {
    Username: req.body.username,
    Pool: userPool
  }

  req.session['login-errors'] = [];
  
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(UserData);
  cognitoUser.authenticateUser(AuthenticationDetails, {
    onSuccess: data => {
      res.send(data);
    },
    onFailure: err => {
      req.session['login-errors'].push(err.message)
      res.send(err.code);
    }
  })
})

  router.post('/forgotPassword', (req,res) => {
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: req.body.email,
      Pool: userPool
    });
    cognitoUser.forgotPassword({
      onSuccess: function(result) {
        res.send({status: "Success",  res: result});
      },
      onFailure: function(err) {
        res.send({status: "Error", error: err});
      }
    });
  });

  router.post('/confirmFPassword', (req,res) => {
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: req.body.email,
      Pool: userPool
    });
    const verificationCode = req.body.code;
    const newPassword = req.body.password;
    cognitoUser.confirmPassword(verificationCode,newPassword, {
      onSuccess: function(result) {
        res.send({status: "Success",  res: result});
      },
      onFailure: function(err) {
        res.send({status: "Error", error: err});
      }
    })
  })

  router.post('/confirmEmail', (req,res) => {
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: req.body.email,
      Pool: userPool
    })
    const confirmationCode = req.body.code;
    cognitoUser.confirmRegistration(confirmationCode, true, function(err,result){
      if(err) {
        res.send({status: "Error", error: err});
      }
      res.send({status: "Success", res: result});
    })
  })

  router.post('/completeProfile/:id', (req,res) => {
    let id = req.params.id;
    let user = {};
    
    if (req.body.name) user.name = req.body.name;
    if (req.body.addresses) user.addresses = req.body.addresses;
    
    user = { $set: user }

    User.update({userID: id}, user).then(()=> {
      res.send(user);
    }).catch((err) => {
      console.log(err);
    })
  })

  router.post('/updateProfile/:id', (req,res) => {
    let id = req.params.id;
    let accessToken = req.body.accessToken;
    let user = {};
    let oldMail = "";

    if (req.body.name) user.name = req.body.name;
    if (req.body.addresses) user.addresses = req.body.addresses;
    if (req.body.email) {
      user.email = req.body.email;
      User.findOne({userID: id})
      .then(user => {
        res.send(user);
      })
      .catch(err => console.log(err));
    }


  })

  router.get('/logout', (req,res) => {
    res.send({status: "Success"});
  })
module.exports = router;