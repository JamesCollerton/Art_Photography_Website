# Art & Photography Website

Website written in HTML5, CSS3, Javascript (Node.js) with D3.

This was written as part of my university course on web technologies. Included is:

- A full, polished website written using the Twitter Bootstrap framework.
- Frontend JavaScript to create scrolling panoramas, animations and modals.
- Backend JavaScript to create an automatic emailing system.
- A data gathering service written in JavaScript attached to a MySQL backend with a D3 front end for viewing the data.

<br />

Screen	                   | Description  
:-------------------------:|:-------------------------:
![alt text](/README_Images/Home_Screen.png  "Home_Screem")  | This is the home screen. It has a panorama
of a photo I took that pans in the background behind the entry box implemented in JavaScript.
![alt text](/README_Images/Landing_Page.png  "Landing_Page")  | The landing page uses a lot of the bootstrap elements in order to make it responsive and to style it.
![alt text](/README_Images/Art_Page.png  "Art_Page")  | This is an example of one of the other pages that demonstrates some more of the BootStrap features.
![alt text](/README_Images/Email_Modal.png  "Email_Modal")  | This demonstrates the email modal I implemented from scratch. It uses JavaScript/ CSS to control the modal appearance. It communicates back to the node server that has a module to email using a MailGun client.
![alt text](/README_Images/D3_Statistics_Page.png  "D3_Statistics_Page")  | This collects data from the frontend using JavaScript and feeds it back to the node server which stores it in a SQLite DB. Then in the statistics page we retrieve that information from the DB and feed it to the D3 visualisation.

