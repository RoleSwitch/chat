"use strict";
// server.js

// Set up server modules
var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    app = express(),
    server = http.createServer(app);


// Configure server, sockets and databases
require('./config/databases')( // connect to databases
    function(mongoose) {

        require('./config/settings')(express, app, mongoose, passport, // server settings
            function(express, sessionStore) { // sockets settings
                var io = require('socket.io').listen(server);
                require('./config/sockets')(io, express, sessionStore);
            });

        var ctrl = require('./app/controller')(mongoose, passport); // app controller
        require('./config/routes')(app, ctrl); // routes

        // Start server
        server.listen(app.get('port'), function() {
            console.log('SERVER> listening on port ' + app.get('port') + '...');
        });
    }
);