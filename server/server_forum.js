// Note, need express@4.10.2

// -------------------- Requirements, Setting up Express -------------------- //

var express = require('express');

var app = express();

var io_server = require('http').createServer(app);
var io = require('socket.io').listen(io_server);

// -------------------------- Testing Socket IO. ---------------------------- //

// Set the Socket IO server to listen at port 3020.
exports.forum_server = io_server.listen(3020);

// When we connect we start listening for messages being sent in from the forum
// posts. When they arrive we redirect them back to every page on the server.
exports.forum_listening = io.on('connection', function (socket) {

							  socket.on('new message', function (data) {
                                io.emit('chat message', data)
                              });

							});