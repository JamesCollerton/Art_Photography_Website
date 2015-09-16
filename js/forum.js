"use strict"

// --------- Setting up all parts of the HTML page that need to be used. -------- //

// Declare the socket we listen to.

var socket = io.connect('http://localhost:3020');

// List of all of the components we need to listen to from the forum page. The first list
// is the text entry/ send components. The second list are the icons related fields such
// as the icons we click on to choose them and the list of icons we update for the user.

var username_send = document.getElementById("username_send");
var username_text = document.getElementById("username_text");
var username_list = document.getElementById("username_list");
var message_send = document.getElementById("message_send");
var message_text = document.getElementById("message_text");
var message_list = document.getElementById("message_list");
var icon_list = document.getElementById("icon_list");

var star_icon = document.getElementById("star_icon");
var camera_icon = document.getElementById("camera_icon");
var pen_icon = document.getElementById("pen_icon");
var icon_svg_one = document.getElementById("icon_svg_one");
var icon_svg_two = document.getElementById("icon_svg_two");
var icon_svg_three = document.getElementById("icon_svg_three");
var icon_text = document.getElementById("icon_text");

// These are to do with the workings of the .js file. We have three possible icons, each
// of which is assigned a number. When the user chooses one it assigns this number to the
// user and when messages are recieved, associates this number with an SVG and draws it to
// screen. The number of messages is as every 20 messages we erase them all to prevent
// them running down the screen.

var username = "";

var STAR = 1, CAMERA = 2, PEN = 3;
var icon_type = 0;

var num_messages = 0;
var MESSAGES_LIM = 20;

// When the user clicks send to send a message it gathers his, username, icon number,
// and the body of the text and sends it back to the server. It then resets the message
// to blank.

function forum_message() {

  	addEventListener('load', start);

	function start() {
		message_send.addEventListener('click', get_message);
	}

	function get_message() {
		var info = { message_body : message_text.value,
					 message_username : username,
					 message_icon : icon_type }
		socket.emit('new message', { new_message : info });
		message_text.value = "";
	}

}

// When the user types in their username and clicks send, as long
// as it's not empty the username component fades out and the
// message component fades in. A timeout is used so that once the
// message has faded out the username bar becomes hidden.

function forum_username() {

  	addEventListener('load', start);

	function start() {
		username_send.addEventListener('click', get_message);
	}

	function get_message() {
		if(username_text.value != ""){

			message_text.className = "fade-in one input_line";
			message_send.className = "fade-in one send_button";
			username_text.className = "fade-out input_line";
			username_send.className = "fade-out send_button";
			username = username_text.value

			setTimeout( function() {

				username_text.style.visibility = "hidden";
				username_send.style.visibility = "hidden";

			}
			, 2000);
		}
	}

}

// This is used to control the choosing of the forum icon. When one
// is clicked the relevant function sets their username value. Then
// it fades out all of the icon components and hides them after the
// timeout.

function forum_icon() {

  	addEventListener('load', start);

	function start() {
		star_icon.addEventListener('click', set_star_icon);
		camera_icon.addEventListener('click', set_camera_icon);
		pen_icon.addEventListener('click', set_pen_icon);
	}

	function set_star_icon() {
		set_icon()
		icon_type = STAR
	}

	function set_camera_icon() {
		set_icon()
		icon_type = CAMERA
	}

	function set_pen_icon() {
		set_icon()
		icon_type = PEN
	}

	function set_icon() {

		username_text.className = "fade-in one input_line";
		username_send.className = "fade-in one send_button";
		camera_icon.className = "fade-out icon_button";
		pen_icon.className = "fade-out icon_button";
		star_icon.className = "fade-out icon_button";
		icon_svg_one.className = "fade-out user_icon_choice"
		icon_svg_two.className = "fade-out user_icon_choice"
		icon_svg_three.className = "fade-out user_icon_choice"
		icon_text.className = "fade-out forum_intro_text"

		setTimeout( function() {

			camera_icon.style.visibility = "hidden";
			pen_icon.style.visibility = "hidden";
			star_icon.style.visibility = "hidden";
			icon_svg_one.style.visibility = "hidden";
			icon_svg_two.style.visibility = "hidden";
			icon_svg_three.style.visibility = "hidden";
			icon_text.style.visibility = "hidden";

		}
		, 2000);
	}


}

// This is used to react to messages from the server. When one is recieved
// it increases the number of messages on the screen, and if there are twenty
// it erases them and adds the new message.

socket.on('chat message', function(message){

	num_messages += 1
	if(num_messages == MESSAGES_LIM){ erase_messages(); }

	create_list_item(message['new_message']['message_body'], message_list);
	create_list_item(message['new_message']['message_username'], username_list);
	add_user_icon(message);
});

// This is used in adding the usernames and the message contents to the list
// of items.

function create_list_item(contents, list) {

	var entry = document.createElement('li');
	entry.appendChild(document.createTextNode(contents));
	list.appendChild(entry);

}

// This is used to add the user icon to the list of forum entries. Finds the
// user's icon and then adds it to the list.

function add_user_icon(message){

	var entry = document.createElement('li');
	var icon = document.createElement('object');

	if(message['new_message']['message_icon'] == PEN){ 
		icon.setAttribute("data", "icons/pen.svg"); 
	}
	else if(message['new_message']['message_icon'] == CAMERA){ 
		icon.setAttribute("data", "icons/photography.svg"); 
	}
	if(message['new_message']['message_icon'] == STAR){ 
		icon.setAttribute("data", "icons/models.svg"); 
	}

	icon.setAttribute("type", "image/svg+xml");
	icon.setAttribute("class", "tiny_icon")
	entry.appendChild(icon);
	icon_list.appendChild(entry);

}

// Short function that erases the lists when they reach a certain point.

function erase_messages(){

	message_list.innerHTML = "";
	icon_list.innerHTML = "";
	username_list.innerHTML = "";

	num_messages = 0

}

// Sets everything running.
forum_message();
forum_username();
forum_icon();
