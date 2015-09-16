"use strict"

// Gets the title from the current page in order to identify the stats that
// it's gathering.

var page_title = document.title;

// This holds all of the different statistics and is added to.

var stats = {
	page : page_title,
	time_on_page : 0,
	clicks_on_page : 0,
	hits : 0,
	author_contacts: 0,
};

// We connect on the server side to the port we want to listen to for sending
// over the stats.

var socket = io.connect('http://localhost:8090');

// Every second we increment the counter for time spent on the page and send
// a report back to the database. We also reset all of the counters so that
// they count from fresh for the next part.

function visit_time() {

	function tick() {
		++stats['time_on_page'];
		socket.emit('stat update', { new_stats : stats });
		stats['time_on_page'] = 0;
		stats['clicks_on_page'] = 0;
		stats['hits'] = 0;
		stats['author_contacts'] = 0;
	}

	setInterval(tick, 1000);
  	
}

// Attach a counter to the body of the page measuring how many clicks have gone
// by.

function measure_clicks() {

	addEventListener('load', start);

	function start() {
		document.body.addEventListener('click', add_click);
	}

	function add_click() {
		++stats['clicks_on_page'];
	}

}

// Attach a counter to the send button of the email modal to see how many times
// people have attempted to contact the author.

function measure_contacts() {

	addEventListener('load', start);

	function start() {
		var email_button = document.getElementById("send_email");
		email_button.addEventListener('click', add_contact_attempt);
	}

	function add_contact_attempt() {
		++stats['author_contacts'];
	}

}

// Every time the page is visited a hit is added.

function add_hit() {
	++stats['hits'];
}

// Run functions.
visit_time();
measure_clicks();
measure_contacts();
add_hit();