"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jwt-simple');
const BearerStrategy = require('passport-http-bearer').Strategy;
const SECRET = 'mysecret';

var loginDetails = {"admin" : "password", "testuser" : "password"};
var people = {"testuser" : {"username":"testuser", "forename":"Delia", "surname":"Derbyshire", "password":"password", "email": "test@user.com"}}

var dowrickEvents = [{
  title: 'Dowrick Event 1',
  start: '2019-01-31T13:00:00',
  end: '2019-01-31T14:14:00'
  },
  {
  title: 'Dowrick Event 2',
  start: '2019-01-31T15:15:00',
  end: '2019-01-31T16:30:00'
  }];

var mashEvents = [{
  title: 'Mash Event 1',
  start: '2019-02-01T08:45:00',
  end: '2019-02-01T12:00:00'
}];

var gymEvents = [{
  title: 'Gym Event 2',
  start: '2019-02-02T08:45:00',
  end: '2019-02-02T18:00:00'
},
{
  title: 'Gym Event 1',
  start: '2019-01-30T08:45:00',
  end: '2019-01-30T18:00:00'
}
];
var events = {"dowrick" : dowrickEvents, "mash" : mashEvents, "gym" : gymEvents}

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
    res.send({
      token: req.user,
    });
  },
);

app.post('/event', function(req,resp){
  var clash = false;
  var response = {};
  var room = req.body.room;
  const roomEvents = events[room];
  var event = req.body;
  delete event.room;
  if(req.body.access_token == 'concertina'){
    if (event.start >= event.end){
      clash = true;
    } else {
      roomEvents.forEach(function(element){
        if (element.start.substring(0,10) == event.start.substring(0,10)){
          if((event.start <= element.start && event.end > element.start) || (event.start < element.end && event.end >= element.end) || (event.start >= element.start && event.end <= element.end)) {
            clash = true;
          }
        }
      })
    }
     
    if (!clash) {
      events[room].push(event);
      response = { "result" : events[room]};
    } else {
      response = {"result" : "clash"};
    }
  } else {
    resp.statusCode = 403;
  }
  resp.send(response);
});

app.get('/people', function(req, resp){
    resp.send(people);
})

app.get('/people/:username', function(req, resp){
  resp.send(people[req.params.username]);
})

app.post('/checkusername', function(req, resp){
  var response = {"result" : "free"}
  if (req.body.username in people) {
    response.result = "taken";
  }
  resp.send(response);
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

