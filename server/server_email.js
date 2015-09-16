// --------- Requirements, Setting up Nodemailer, Setting up Express -------- //

var express = require('express');
var nodemailer = require("nodemailer");
var mg = require('nodemailer-mailgun-transport');
var validator = require('validator');

var app = express();

var io_server = require('http').createServer(app);
var io = require('socket.io').listen(io_server);

// ------------ Authorisation for Mailgun and Email Client ------------------ //

var auth = {
  auth: {
    api_key: 'key-17a8bba64262bd0139ac29b6d77e6f58',
    domain: 'sandbox03d7770e45654ce5a58c47f7f8a49647.mailgun.org'
  }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

// -------------------------- Testing Socket IO. ---------------------------- //

// Set the Socket IO server to listen at port 8080.
exports.email_server = io_server.listen(8080);

// When we connect we start checking for emails. If we get a request we validate
// it and then tell the request whether it works or not.
exports.email_listening = io.on('connection', function (socket) {
							  socket.on('email check', function (data) {
							    if( validator.isEmail(data['email']) ) { 
							    	socket.emit('eval result', { valid: 'y' }); 
							    }
							    else { socket.emit('eval result', { valid: 'n' }); }
							  });
							});

// ----------- Functions for the Email Client Part of the Server. ----------- //

// This is called from the JQuery for the Email client. It uses nodemailer
// and the information from the form to send an email out.
exports.email_send = app.get('/send',function(req,res){

						  nodemailerMailgun.sendMail({

						    from: req.query.sender_email,
						    to: 'jc1175@my.bristol.ac.uk',
						    subject: 'Email from: ' + req.query.sender_email,
						    html: req.query.text,

						  }, function (err, info) {

						    if (err) { console.log('Error: ' + err); }
						    else { console.log('Email sent.'); }

						  });

						});