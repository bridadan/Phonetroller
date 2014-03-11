---Install---
1. $ npm install
2. edit the following line in public/javascripts/scripts.js:
	var socket = io.connect('http://10.0.0.3');

	replace 'http://10.0.0.3' with the local IP address of your host machine. save.
3. $ gcc controller_interface.c -o gamepad-interface
4. $ sudo node app.js
5. connect smartphone to same WiFi network, navigate to above IP address in the browser