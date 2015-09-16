"use strict";

// This is the code for controlling the bouncing ball on the about
// page.

// Finds the canvas from the page.
var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");

// Creates a new icon image.
var icon = new Image();
	icon.src = 'images/about_page/about_icon.png';

// Defines the width of the canvas. Decided to be fixed as the
// ball is of a fixed width.
var W = 310;

// To find the height of a window so the ball bounces correctly.
// 200 is space for tool bars.
var w = window,
    win_height = w.innerHeight - 200;

// Sets the dimensions of the canvas as necessary.
canvas.height = win_height; 
canvas.width = W;

// We create a ball and define quantities for the ball so that
// the bouncing is realistic.
var ball = {},
	gravity = 0.2,
	bounce = 0.7;

ball = {
	x: 10,
	y: 0,
	
	radius: 300,
	bounce_counter: 0,
	
	// Don't want the ball to move sideways.
	vx: 0,
	vy: 1,
	
	// Give the ball its own draw function to be called.
	draw: function() {
		ctx.drawImage(icon, 0, 0, ball.radius, ball.radius, 
								  this.x, this.y, ball.radius, ball.radius);
	}
};

// Canvas is cleared after every movement to create animation.
function clearCanvas() {
	ctx.clearRect(0, 0, W, win_height);
}

function display_ball()
{
	addEventListener('load', draw_first);

  	function draw_first(){
    ctx.drawImage(icon, 0, 0, ball.radius, ball.radius, ball.x, ball.y, ball.radius, ball.radius);
  }

}

// The actual function calls to the objects.
display_ball();
about_me();

function about_me() {

  	addEventListener('load', start);

  	// Gets the ball icon to wait for the click.
	function start() {
		var ball_icon = document.getElementById("about_me_js");
		ball_icon.addEventListener('click', theFunction);
	}

	function theFunction () 
	{
		// Gets each class by its name and then changes it so it fades in
		// once clicked.
	    document.getElementById("make_appear_1").className = "fade-in one";
	    document.getElementById("make_appear_2").className = "fade-in one";
	    document.getElementById("make_appear_3").className = "fade-in two";
	    document.getElementById("make_appear_4").className = "fade-in two";
	    document.getElementById("make_appear_5").className = "fade-in three";
	    document.getElementById("make_appear_6").className = "fade-in three";
	    document.getElementById("remove_img_wrap").className = "";

	    // So this makes the ball bounce and then stops it after a certain time.
	    // Although I could have used a for loop this would involve me sleeping
	    // the thread. Instead it made more sense to keep running the interval
	    // and stopping the movement after the ball had held still.
		function update() {

			clearCanvas();
			ball.draw();

			if(ball.bounce_counter < 450){

				++ball.bounce_counter;
								
				ball.y += ball.vy;
				ball.vy += gravity;

				if(ball.y + ball.radius > win_height) {

					ball.y = win_height - ball.radius;
					ball.vy *= -bounce;
					
				}

			}
		}

		// Updates the ball position at each time.
		setInterval(update, 1000/60);

	}

}