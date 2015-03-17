var http = require('http');
var path = require('path');
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));

var rooms = ["Room0", "Room1", "Room2", "Room3"];
var roomTopics = ["politics", "investing", "golf", "snowboarding"];
var politicsHints = ["Practice and theory of influencing other people", "achieving and exercising positions of governance",
    "the study or practice of the distribution of power and resources within a given community"];
var investingHints = ["Expending money with the expectation of receiving a profit", 
    "provide or endow someone or something with"];
var golfHints = ["one of the few ball games that do not require a standardised playing area",
    "a modern game that originated in 15th-century Scotland", "Condor and Albatross are scoring names in this"];
var snowboardingHints = ["this joined the Winter Olympics in 1998", 
    "early stereotypes of its participants included lazy, grungy, punk, stoners, troublemakers",
    "the man who holds the X-Games records for gold medals and highest overall medal count participates in this"];
var hints =  [politicsHints, investingHints, golfHints, snowboardingHints];

io.sockets.on('connection', function(socket){

    socket.on("rooms", function(){

      socket.emit('welcome', {
        "rooms" : rooms  
      });
    });

    socket.emit('welcome', {
      "rooms" : rooms
    });
    
    socket.on('subscribe', function(room) { 
        console.log('joining room', room);
        socket.join(room);
        io.sockets.in(room).emit('message', {text: 'Guess the topic', room: room.text, name: "Alex Trebek"});
    })

    socket.on('unsubscribe', function(room) {  
        console.log('leaving room', room);
        socket.leave(room); 
    })

    socket.on('send', function(data) {
        console.log('sending message',data.room);
        io.sockets.in(data.room).emit('message', data);
        
        for(var i = 0; i < 4; i++) {
            if(data.room == rooms[i] && data.text.toLowerCase() == "what is " + 
              roomTopics[i] || data.text.toLowerCase() == "what is " + roomTopics[i] + "?") {
                io.sockets.in(data.room).emit('message', {text: 'The topic has been guessed!', 
                  room: data.room, name: 'Alex Trebek'});
                  break;
            } 
            else if (data.room == rooms[i] && data.text.toLowerCase() == roomTopics[i]) {
                io.sockets.in(data.room).emit('message', {text: 'The answer must be in the form of a question', 
                    room: data.room, name: 'Alex Trebek'});
                    break;
            }
            else if (data.room == rooms[i]){
                io.sockets.in(data.room).emit('message', 
                    {text: hints[i][Math.floor(Math.random()*hints[i].length)], 
                    room: data.room, name: 'Alex Trebek'});
            }
        }
        
    });

});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});