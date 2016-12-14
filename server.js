// require express and path
var express = require("express");
var path = require("path");
// create the express app
var app = express();
// static content
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// root route to render the index.ejs view
app.get('/', function(req, res) {
    res.render("index");
})
// tell the express app to listen on port 8000
// app.listen(8000, function() {
//  console.log("listening on port 8000");
// })

// this selects our port and listens
// note that we're now storing our app.listen within
// a variable called server. this is important!!
var server = app.listen(8000, function() {
    console.log("listening on port 8000");
});
// this is a new line we're adding AFTER our server listener
// take special note how we're passing the server
// variable. unless we have the server variable, this line will not work!!
var io = require('socket.io').listen(server)

// Whenever a connection event happens (the connection event is built in) run the following code
var users = {};
var messages = [];
io.sockets.on('connection', function(socket) {
    //  EMIT:
    // socket.emit('my_emit_event');
    //  BROADCAST:
    // socket.broadcast.emit("my_broadcast_event");
    //  FULL BROADCAST:
    // io.emit("my_full_broadcast_event");


    //all the socket code goes in here!
    socket.on('new_user', function(data){
        var name = data.name;
        users[socket.id] = name;
        socket.broadcast.emit('new_message', {user: `${name} has joined the chat`, message: ''});
        socket.emit('all_messages', {messages: messages})
    });

    socket.on("send_clicked", function(data) {
        var message = data.message;
        messages.push({name:users[socket.id], message:message});
        socket.emit('new_message', {user: 'You', message:message});
        socket.broadcast.emit('new_message', {user: users[socket.id], message:message})
    });

    socket.on('disconnect', function() {
        name = users[socket.id];
        delete users[socket.id];
        socket.broadcast.emit('new_message', {user: `${name} has left the chat`, message: ''});
    });
})
