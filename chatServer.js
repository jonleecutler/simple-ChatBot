/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8001;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function(){// we wait until the client has loaded and contacted us that it is ready to go.

  socket.emit('answer',"Hey, hello I'm Timey, the count down chat bot."); //We start with the introduction;
  setTimeout(timedQuestion, 2500, socket,"What is your Name?"); // Wait a moment and respond with a question.

});
  socket.on('message', (data)=>{ // If we get a new message from the client we process it;
        console.log(data);
        questionNum= bot(data,socket,questionNum);	// run the bot function with the new message
      });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//----------------------------------------------------------------------------//


//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data,socket,questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

  // These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer= 'Hello ' + input + ' :-)'; // output response
    waitTime =2000;
    question = 'How many seconds should I count?'; // load next question
  }
  else if (questionNum == 1) {
    var seconds = parseInt(input);
    answer= 'Ok T minus ' + seconds + ' seconds ;)'; // output response  
    waitTime =2000;
    question = ''; // load next question
    setTimeout(timerOutput, 2500, socket, seconds);
  }
  else{
    answer= 'I have nothing more to say!';// output response
    waitTime =0;
    question = '';
  }

  // We take the changed data and distribute it across the required objects.
  socket.emit('answer',answer);
  setTimeout(timedQuestion, waitTime,socket,question);
  return (questionNum + 1);
}

function timedQuestion(socket,question) {
  if(question!=''){
    socket.emit('question',question);
  }
}

function timerOutput(socket,count) {
  socket.emit('question',count);  
  
  if(count > 0){
    setTimeout(timerOutput, 1000, socket, count - 1);
  }
  else{
    setTimeout(finishedOutput, 500, socket, 100);
  }
}

function finishedOutput(socket,count) {
  var colors
  
  socket.emit('question','TIMES UP!');  
  socket.emit('changeBG','#'+(Math.random()*0xFFFFFF<<0).toString(16));  
  
  if(count > 0){
    setTimeout(finishedOutput, 100, socket, count - 1);
  }
}
//----------------------------------------------------------------------------//
