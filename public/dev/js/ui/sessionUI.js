"use strict";

define(['semantic'], function() {

    /*/ connect to the socket
	var socket = io.connect('/socket/private');

	// on connection to server get the id of person's room
	socket.on('connect', function(){
		socket.emit('load', id);
	});*/

    $('.Session.modal .avatar.image')
        .popup({
            inline: true,
            position: "bottom left",
            offset: 10,
            content: "bonjour my friend!" // set the content of the popup
        });

});