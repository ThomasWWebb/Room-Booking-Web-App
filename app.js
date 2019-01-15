"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));

var people = {"doctorwhocomposer" : {"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire", "password":"password", "email": "doctor@who.com"}}

app.get('/people', function(req, resp){
    resp.send(people);
})

app.get('/logIn', function(req, resp){
  console.log(req.body);
})

app.post('/adduser', function(req, resp){
  console.log(req.body);
  var newPerson = req.body;
  var result = JSON.stringify("new person hasn't been added");
  if(newPerson.access_token == "concertina"){
    delete newPerson.access_token;
    people[newPerson.username]=newPerson;
    result = JSON.stringify("new person added" + newPerson.username);
  }
  resp.send(result);
});

module.exports = app;

