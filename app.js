"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var randomstring = require("randomstring");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));


var logInTokens = {}
var people = {"doctorwhocomposer" : {"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire", "password":"password", "email": "doctor@who.com"}}

app.get('/people', function(req, resp){
    resp.send(people);
})

app.get('/people/:username', function(req, resp){
  resp.send(people[req.params.username]);
})

app.post('/people', function(req, resp){
  var newPerson = req.body;
  var result = JSON.stringify("new person hasn't been added");
  resp.statusCode = 403;
  if(newPerson.access_token == 'concertina'){
    if(!(newPerson.username in people)){
      delete newPerson.access_token;
      people[newPerson.username]=newPerson;
      result = JSON.stringify("new person added" + newPerson.username);
      resp.statusCode = 200;
    } else {
      resp.statusCode = 400;
    }
  } else if (req.headers.access_token == 'concertina') {
    newPerson = {"username":req.headers.username, "forename":req.headers.forename, "surename":req.headers.surname, "password":req.headers.password, "email": req.headers.email}
    if(!(newPerson.username in people)){
      people[req.headers.username]=newPerson;
      result = JSON.stringify("new person added" + newPerson.username);
      resp.statusCode = 200;
    } else {
      resp.statusCode = 400;
    }
  }
  resp.send(result);
});

app.post('/logOn', function(req, resp){
  var result = {"message":"", "token":""}
  if (req.body.username in people){
    if (people[req.body.username].password == req.body.password) {
      result.message = "success";
      result.token = randomstring.generate(12);
      logInTokens[req.body.username] = result.token
    } else {
      result.message = "incorrect password";
    }
  } else {
    result.message = "incorrect username"
  }
  resp.send(result);
});

module.exports = app;

