"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var randomstring = require("randomstring");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jwt-simple');
const BearerStrategy = require('passport-http-bearer').Strategy;
const SECRET = 'mysecret';

var loginDetails = {"admin" : "password", "doctorwhocomposer" : "12345678"};
var people = {"doctorwhocomposer" : {"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire", "password":"12345678", "email": "doctor@who.com"}}

var dowrickEvents = [{
  title: 'Event Title1',
  start: '2019-01-21T13:13:55.008',
  end: '2019-01-21T14:14:55.008'
  },
  {
  title: 'Event Title2',
  start: '2019-01-21T15:13:55',
  end: '2019-01-21T16:13:55'
  }];

var mashEvents = [{
  title: 'Band',
  start: '2019-01-21T13:13:55.008',
  end: '2019-01-21T14:14:55.008'
}];
var events = {"dowrick" : dowrickEvents, "mash" : mashEvents}

app.get('/events/:room', function(req, resp){
    resp.send(events[req.params.room]);
}) 

passport.use(new LocalStrategy((username, password, done) => {
  if (username in people && password === people[username].password) {
    done(null, jwt.encode({ username }, SECRET));
    return;
  }
  done(null, false);
}));

passport.use(new BearerStrategy((token, done) => {
  try {
    const { username } = jwt.decode(token, SECRET);
    if (username in loginDetails) {
      done(null, username);
      return;
    }
    done(null, false);
  } catch (error) {
    done(null, false);
  }
}));

app.post('/login', passport.authenticate('local', { session: false }),
  (req, res) => {
    console.log(req.body);
    res.send({
      token: req.user,
    });
  },
);

app.get('/logout', function(req, res){
  req.logout();
});

app.post('/event', function(req,resp){
  var room = req.body.room; 
  var event = req.body;
  delete event.room;
  events[room].push(event);
  resp.send(events[room]);
});

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

module.exports = app;

