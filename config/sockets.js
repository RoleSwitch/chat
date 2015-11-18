"use strict";
// config/sockets.js

var gravatar = require('gravatar'),
    passportSocketIo = require("passport.socketio");

var props = require('./properties');


module.exports = function(io, express, sessionStore) {

    // AUTHORIZATION =======================================================

    io.set('authorization', passportSocketIo.authorize({
        cookieParser: express.cookieParser,
        key: 'rs.sid', // the name of the cookie where express/connect stores its session_id
        secret: props.SECRET, // the session_secret to parse the cookie
        store: sessionStore, // we NEED to use a sessionstore. no memorystore please
        success: onAuthorizeSuccess, // *optional* callback on success - read more below
        fail: onAuthorizeFail, // *optional* callback on fail/error - read more below
    }));

    function onAuthorizeSuccess(data, accept) {
        console.log('SOCKET> successful connection to socket.io');
        console.log('SOCKET> data: ' + JSON.stringify(data));

        // The accept-callback still allows us to decide whether to
        // accept the connection or not.
        accept(null, true);
    }

    function onAuthorizeFail(data, message, error, accept) {
        if (error) return accept(error); //throw new Error(message);
        console.log('SOCKET> failed connection to socket.io: ', message);
        console.log('SOCKET> data: ' + JSON.stringify(data));

        // We use this callback to log all of our failed connections.
        accept(null, false);
    }


    // CONFIGURATION =======================================================

    if (props['ENV'] === "development") { // development only
        io.set('log level', 3);
        io.set('transports', ['websocket']);
    } else { // production only
        io.enable('browser client minification'); // send minified client
        io.enable('browser client etag'); // apply etag caching logic based on version number
        io.enable('browser client gzip'); // gzip the file
        io.set('log level', 1); // reduce logging

        // enable all transports
        io.set('transports', [
            'websocket'
            /*, 'flashsocket'
			, 'htmlfile'
			, 'xhr-polling'
			, 'jsonp-polling'*/
        ]);
    }


    // IMPLEMENTATION =======================================================

    var clients = {};

    var test_chat = io.of('/socket/test');
    test_chat.on('connection', function(socket) {
        console.log("SOCKET> connection open");
        var userName;

        socket.on('connection name', function(user) {
            console.log("SOCKET> user joined: " + user.name);
            userName = user.name;
            clients[user.name] = socket;
            test_chat.emit('new user', user.name + " has joined.");
        });

        socket.on('message', function(msg) {
            console.log("SOCKET> message: " + msg);
            test_chat.emit('message', msg);
        });

        socket.on('private message', function(msg) {
            console.log("SOCKET> " + userName + " to " + msg.to + ": " + msg.txt);
            var fromMsg = {
                from: userName,
                txt: msg.txt
            }
            clients[msg.to].emit('private message', fromMsg);
        });

        socket.on('disconnect', function() {
            console.log("SOCKET> disconnected client: " + userName);
            delete clients[userName];
        });

    });


    // Initialize a new socket.io application, named 'chat'
    var chat = io.of('/socket/private');
    chat.on('connection', function(socket) {

        // When the client emits the 'load' event, reply with the 
        // number of people in this chat room

        console.log("SOCKET> Connection to /socket/private initiated.");

        socket.on('load', function(data) {

            if (chat.clients(data).length === 0) {

                socket.emit('peopleinchat', {
                    number: 0
                });
            } else if (chat.clients(data).length === 1) {

                socket.emit('peopleinchat', {
                    number: 1,
                    user: chat.clients(data)[0].username,
                    avatar: chat.clients(data)[0].avatar,
                    id: data
                });
            } else if (chat.clients(data).length >= 2) {

                chat.emit('tooMany', {
                    boolean: true
                });
            }
        });

        // When the client emits 'login', save his name and avatar,
        // and add them to the room
        socket.on('login', function(data) {

            // Only two people per room are allowed
            if (chat.clients(data.id).length < 2) {

                // Use the socket object to store data. Each client gets
                // their own unique socket object

                socket.username = data.user;
                socket.room = data.id;
                socket.avatar = gravatar.url(data.avatar, {
                    s: '140',
                    r: 'x',
                    d: 'mm'
                });

                // Tell the person what he should use for an avatar
                socket.emit('img', socket.avatar);


                // Add the client to the room
                socket.join(data.id);

                if (chat.clients(data.id).length == 2) {

                    var usernames = [],
                        avatars = [];

                    usernames.push(chat.clients(data.id)[0].username);
                    usernames.push(chat.clients(data.id)[1].username);

                    avatars.push(chat.clients(data.id)[0].avatar);
                    avatars.push(chat.clients(data.id)[1].avatar);

                    // Send the startChat event to all the people in the
                    // room, along with a list of people that are in it.

                    chat. in (data.id).emit('startChat', {
                        boolean: true,
                        id: data.id,
                        users: usernames,
                        avatars: avatars
                    });
                }

            } else {
                socket.emit('tooMany', {
                    boolean: true
                });
            }
        });

        // Somebody left the chat
        socket.on('disconnect', function() {

            // Notify the other person in the chat room
            // that his partner has left

            socket.broadcast.to(this.room).emit('leave', {
                boolean: true,
                room: this.room,
                user: this.username,
                avatar: this.avatar
            });

            // leave the room
            socket.leave(socket.room);
        });


        // Handle the sending of messages
        socket.on('msg', function(data) {

            // When the server receives a message, it sends it to the other person in the room.
            socket.broadcast.to(socket.room).emit('receive', {
                msg: data.msg,
                user: data.user,
                img: data.img
            });
        });
    });

    // =======================================================
};