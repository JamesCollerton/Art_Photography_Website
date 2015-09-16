"use strict"

// Runs the modal sequence.
modal_seq();

function modal_seq() {

	// Gets elements by their HTML ids.
	var email_modal = document.getElementById("my_email_modal");
	var em_mod_overlay = document.getElementById("email_modal_overlay");
	var x_button = document.getElementById("close");

	// Waits for load to start.
  	addEventListener('load', start);

  	// This is used to detect which browser we're on and listen for the
  	// correct animation end depending.
  	function choose_animation_end(){

    var t;
    var temp_elem = document.createElement('temp_element');

    var transitions = {
      'MozAnimation':'animationend',
      'WebkitAnimation':'webkitAnimationEnd'
    }

    for(t in transitions){
        if( temp_elem.style[t] !== undefined ){
            return transitions[t];
        	}
    	}
	}

  	// Waits for click on modal button.
	function start() {

		email_modal.addEventListener('click', open_modal);

	}

	// Changes the modal to visible and makes it fade in. Waits
	// for the animation to end before carrying on.
	function open_modal() {

		x_button.addEventListener('click', close_modal);
		em_mod_overlay.style.visibility = "visible";
		em_mod_overlay.className = "fade-in one"

		var transition_end = choose_animation_end();
		em_mod_overlay.addEventListener(transition_end);

	}

	// This waits for a click on the X in the corner and then closes the
	// dialog box. Adding another event listener here confuses the functions
	// as it registers the previous event of fading in and then closes the
	// window straight away. Therefore a timer was the next best option.
	function close_modal() {

		email_modal.addEventListener('click', open_modal);
		em_mod_overlay.className = "fade-out";

		setTimeout( function() {

			em_mod_overlay.style.visibility = "hidden";
			document.getElementById("message").innerHTML="";

		}
		, 2000);

	}

}