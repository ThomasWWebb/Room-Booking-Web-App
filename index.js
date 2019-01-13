"use strict";
var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));

var people = {"doctorwhocomposer" : {"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire"}}
function createPerson(personDetails){
  var person = new Object();
  person.forename = personDetails.forename;
  person.surname = personDetails.surname;
  person.username = personDetails.username;
  person.email = personDetails.email;
  return person;
}

app.get('/people', function(req, resp){
    const pack = JSON.stringify(people);
    resp.send(pack);
})


app.post('/adduser', function(req, resp){
  console.log(req.body);
  var newPerson = req.body;
  people[newPerson.username]=newPerson;
  const result = JSON.stringify("new person added" + newPerson.username);
  resp.send(result);
});

app.listen(8090);