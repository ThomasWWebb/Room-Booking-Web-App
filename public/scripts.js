//https://trevelyan-booking-system.herokuapp.com/

var person = new Object();
var event = new Object();
var access_token = "concertina";

function getPeople(){ 
    $.get("/people",
        function (data){
            console.log(data);
        }, "json");
    return false;      
};

function checkUsername(username){
    $.post("/checkusername", {"username" : username},
        function (data){
            if (data.result == "taken") {
                document.getElementById('sign-up-username').style.borderColor = "red";
                document.getElementById('sign-up-username-error').style.display = "inline";
            } else {
                document.getElementById('sign-up-username').style.borderColor = "transparent";
                document.getElementById('sign-up-username-error').style.display = "none";
                $("#sign-up-form-first").fadeOut("slow",  function () {
                $("#sign-up-form-second").fadeIn("slow");
            }); 
            }
        },"json");
    return false;  
}

function getPerson(username){ 
    $.get("/people/:username",
        function (data){
            console.log(data);
        }, "json");
    return false;      
};

function logIn(details){ 
$.post("/login", details,
    function (data){
        if (data.token) {
            loggedIn();
        }
    }, "json");
return false;      
};

function logOut(){ 
    $.get("/logout",
        function (data){
        }, "json");
    return false;      
};


function postNewPerson(newPerson){
    newPerson.access_token = access_token;
    $.post("/people", newPerson,
        function (data){
        }, "json"); 
};

function addEvent(event){
    event.access_token = access_token;
    $.post("/event", event,
        function (data){
            console.log(data);
            if (data.result == "clash"){
                timeError();
            } else {
                document.getElementById('start-time').style.borderColor = "transparent";
                document.getElementById('end-time').style.borderColor = "transparent";
                document.getElementById('start-time-error').style.display = "none";
                document.getElementById('end-time-error').style.display = "none";
                closeNewBooking();
                $('#calendar').fullCalendar( 'refetchEvents' );
            }
        }, "json"); 
    return false;
};

function timeError() {
    document.getElementById('start-time').style.borderColor = "red";
    document.getElementById('end-time').style.borderColor = "red";
    document.getElementById('start-time-error').style.display = "inline";
    document.getElementById('end-time-error').style.display = "inline"
}

$(document).ready(function() {
    //JS open source calendar used to display JSON events from https://fullcalendar.io/
    //All $('#calendar').fullCalendar.. functions are from this calendar
    $('#calendar').fullCalendar({
        columnFormat: 'ddd D/M',
        defaultView: 'agendaWeek',
        height: 440,
        contentHeight:420,
        header: {
            left: 'title',
            center: 'myCustomButton',
            right: 'prev,next today '
        },
        titleFormat: '',
        allDaySlot: false,
        businessHours:
            {
                    start: '08:00',
                    end:   '22:30',
                    dow: [ 0, 1, 2, 3, 4, 5, 6]
            },
        events: {
            url: "/events/dowrick",
        },
        eventBackgroundColor: "rgb(7, 33, 95)",
        eventTextColor: "white",
        eventBorderColor:"rgb(7, 33, 95)"
    })
    var bookBtn = $('#book-btn')
    $('.fc-right').append(bookBtn);

    var calendarTitle = $('#calendar-title')
    $('.fc-left').append(calendarTitle);

    $(document).on('click', '#log-in-btn', function() {
        var details = new Object();
        details.username =  document.getElementById('log-in-username').value;
        details.password = document.getElementById('log-in-password').value;
        logIn(details);
        return false;
    });

    $(document).on('submit', '#sign-up-form-first', function() {
        person.username = document.getElementById('sign-up-username').value;
        person.password = document.getElementById('sign-up-password').value;
        if (!(person.password == document.getElementById('sign-up-re-enter-password').value)) {
            document.getElementById('sign-up-password').style.borderColor = "red";
            document.getElementById('sign-up-re-enter-password').style.borderColor = "red";
            document.getElementById('sign-up-re-enter-password-error').style.display = "inline";
            document.getElementById('sign-up-password-error').style.display = "inline"
        } else {
            document.getElementById('sign-up-password').style.borderColor = "transparent";
            document.getElementById('sign-up-re-enter-password').style.borderColor = "transparent";
            document.getElementById('sign-up-re-enter-password-error').style.display = "none";
            document.getElementById('sign-up-password-error').style.display = "none"
            checkUsername(person.username);
        }
        
        return false;
    });
    
    $(document).on('submit', '#sign-up-form-second', function() {
        person.email= document.getElementById('sign-up-email').value;
        person.forename = document.getElementById('sign-up-forename').value;
        person.surname = document.getElementById('sign-up-surname').value;
        $("#sign-up-form-second").fadeOut("slow",  function () {
            logIn(person);
            closeSignUp();
        });
        postNewPerson(person);
        return false;
    });

    function changeRooms(room) {
        var prevRoom = $('.fc-left h3').text();
        $(".fc-left h3").html(room);
        prevRoom = prevRoom.toLowerCase();
        room = room.toLowerCase();
        var removeSource = '/events/' + prevRoom;
        var newSource = '/events/' + room;
        $('#calendar').fullCalendar( 'removeEventSource', removeSource )
        $("#calendar").fullCalendar('addEventSource', newSource);
        $('#calendar').fullCalendar( 'refetchEvents' );
        closeRooms();
    }

    $(document).on('click', '#Dowrick-btn', function() {
        changeRooms("Dowrick");
        currentRoom = "[Dowrick]";
    })

    $(document).on('click', '#Mash-btn', function() {
        changeRooms("Mash");
        currentRoom = "[Mash]";
    })

    $(document).on('click', '#Gym-btn', function() {
        changeRooms("Gym");
        currentRoom = "[Gym]";
    })

    $('.carousel').carousel({
        interval: false
    }); 

    $(document).on('mouseenter', '#Dowrick-btn', function() {
        $('#rooms-carousel').carousel(0);
    });

    $(document).on('mouseenter', '#Mash-btn', function() {
        $('#rooms-carousel').carousel(1);
    });

    $(document).on('mouseenter', '#Gym-btn', function() {
        $('#rooms-carousel').carousel(2);
    });

    $(document).on('submit', '#new-booking-form', function() {
        event.title = document.getElementById('display-name').value;
        var chosenDate = moment(document.getElementById('date').value, "DD/MM/YYYY");
        event.start = document.getElementById('date').value + "T" + document.getElementById('start-time').value;
        event.end = document.getElementById('date').value + "T" + document.getElementById('end-time').value;
        event.room = $('.fc-left h3').text();
        event.room = event.room.toLowerCase();
        addEvent(event);
        return false;
    });
});

function loggedIn(){
    closeLogIn();
    document.getElementById('nav-button-log-in').style.display = "none";
    document.getElementById('nav-button-sign-up').style.display = "none";
    document.getElementById('nav-button-log-out').style.display = "block";
    document.getElementById('book-btn').style.display = "block";
}

function loggedOut(){
    logOut()
    document.getElementById('nav-button-log-in').style.display = "block";
    document.getElementById('nav-button-sign-up').style.display = "block";
    document.getElementById('nav-button-log-out').style.display = "none";
    document.getElementById('book-btn').style.display = "none";
}

function openSignUp() {
    document.getElementById("sign-up-form-second").style.display = "none";
    document.getElementById("sign-up-form-first").style.display = "block";
    document.getElementById("sign-up").style.width = "100%";
}

function closeSignUp() {
    document.getElementById("sign-up").style.width = "0%";
}

function openLogIn() {
    document.getElementById("log-in").style.width = "100%";
}

function closeLogIn() {
    document.getElementById("log-in").style.width = "0%";
}

function openRooms() {
    document.getElementById("rooms").style.width = "100%";
}

function closeRooms() {
    document.getElementById("rooms").style.width = "0%";
}

 function openNewBooking() {
    document.getElementById("new-booking").style.width = "100%";
    document.getElementById("book-btn").disabled = true;
}

function closeNewBooking() {
    document.getElementById("new-booking").style.width = "0%";
    document.getElementById("book-btn").disabled = false;
}


