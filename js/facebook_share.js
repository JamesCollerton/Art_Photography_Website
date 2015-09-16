// ----------------------- Setting up Facebook ------------------------------ //

// Sets up the site to work with the facebook app I made.
  window.fbAsyncInit = function() {
						    FB.init({
						      appId      : '1593802754200013',
						      xfbml      : true,
						      version    : 'v2.3'
						    });

						   };

						  (function(d, s, id){
						     var js, fjs = d.getElementsByTagName(s)[0];
						     if (d.getElementById(id)) {return;}
						     js = d.createElement(s); js.id = id;
						     js.src = "//connect.facebook.net/en_US/sdk.js";
						     fjs.parentNode.insertBefore(js, fjs);
						   }(document, 'script', 'facebook-jssdk'));