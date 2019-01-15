"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));

var people = {"doctorwhocomposer" : {"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire", "password":"password", "email": "doctor@who.com"}}

app.get('/people', function(req, resp){
    resp.send(JSON.stringify(people));
})

app.get('/logIn', function(req, resp){
  console.log(req.body);
})

app.post('/adduser', function(req, resp){
  console.log(req.body);
  var newPerson = req.body;
  people[newPerson.username]=newPerson;
  const result = JSON.stringify("new person added" + newPerson.username);
  resp.send(result);
});

app.listen(8090);