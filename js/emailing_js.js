// Script used for sending the email information back to the server.

// Connect to the necessary port.
var socket = io.connect('http://localhost:8080');
var valid;

// When the server tells us the email address is valid we set this parameter
// to be true.
socket.on('eval result', function (data) {
    if(data['valid'] = 'y') valid = true;
    else valid = false;
});

// The nodemailer library needs this bit of JQuery to function. Gets the
// necessary parts from the HTML page and then uses socket.io to feed them
// back to the nodemailer and mailgun component.
$(document).ready(function(){

    var from, to, subject, text;

    $("#send_email").click(function(){

        sender_email = $("#sender_email").val();
        text = $("#content").val();

        valid = validate_email(sender_email);
        socket.emit('email check', { email: sender_email });

        if(valid){
            $.get("http://localhost:8080/send",
            	  {sender_email : sender_email, text : text},
            	  function(data){ });

            $("#message").text("Email sent!");
        }else{ $("#message").text("Hmm, try checking your email address..."); }

    });
});

// Short function to make sure that the entered email address is of a valid
// form. We check this both client and server side.
function validate_email(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}