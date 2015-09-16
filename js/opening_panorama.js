"use strict";

// Gets the panorama by the ID.
var panorama = document.getElementById("opening_panorama"),
    ctx = panorama.getContext("2d");

// Brings in the panorama image to be drawn to screen.
var panorama_img = new Image();
    panorama_img.src = 'images/opening_page/opening_panorama.png';

// Finds the dimensions of the window so the panorama is full screen.
var w = window,
    win_width = w.innerWidth, 
    win_height = w.innerHeight;

// Gives these dimensions to the panorama image.
panorama.height = win_height; 
panorama.width = win_width;

// As taken from the image itself.
var image_width = 6016;
var image_height = 2067;
var image_clip = 2000;

var clearX;
var clearY;

// We start at the LHS, hence pan_pos = 1, and each frame we want
// to move by one pixel.
var image_increment = 1;
var pan_pos = 0;

// Don't want to travel backwards yet and so backwards is set to false.
var backwards = false;

start_panorama();

function start_panorama()
{

  addEventListener('load', start);

  // Draws panorama at starting position and then continues on panorama.
  function start (){

    ctx.drawImage(panorama_img, pan_pos, 0, image_width - image_clip, 
                  image_height, 0, 0, win_width, win_height);
    setInterval(draw_new, 30);

  }

}

// Draws the new panorama image every interval until it gets to the edge and then
// draws it backwards.
function draw_new()
{
  ctx.clearRect(0,0,clearX,clearY);
  
  // Moves forward until reaches image edge.
  if(pan_pos < image_clip && backwards == false){
  	pan_pos += 1;
  }
  // Then moves backwards until reaches the other edge and moves forward. 
  else{
  	backwards = true;
  	pan_pos -= 1;
  	if(pan_pos == 0){
  		backwards = false;
  	}
  }

  ctx.drawImage(panorama_img, pan_pos, 0, image_width - image_clip, 
                image_height, 0, 0, win_width, win_height);
}