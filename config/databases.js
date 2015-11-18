"use strict";
// config/databases.js

var mongoose = require('mongoose'),
    props = require('./properties');


module.exports = function(callback) {

    var DB = {
        user: (props['ENV'] === "development" ? props.DEV.DB['user'] : props.PROD.DB['user']),
        store: (props['ENV'] === "development" ? props.DEV.DB['store'] : props.PROD.DB['store']),
        chat: (props['ENV'] === "development" ? props.DEV.DB['chat'] : props.PROD.DB['chat'])
    }

    // mongoose connection options
    var options = {
        db: {
            native_parser: true
        },
        server: {
            poolSize: 8,
            auto_reconnect: true
        }
    };

    // user DATABASE
    function initDb1(callback) {
        var conn = mongoose.createConnection(process.env.DB_URI || DB['user'], options);
        // CONNECTION EVENTS
        // When successfully connected
        conn.on('connected', function() {
            console.log('DB> Mongoose "user" connection open to ' + DB['user']);

            if (callback) callback();
        });

        // If the connection throws an error
        conn.on('error', function(err) {
            console.log('DB> Mongoose "user" connection error: ' + err);
        });

        // When the connection is disconnected
        conn.on('disconnected', function() {
            console.log('DB> Mongoose "user" connection disconnected');
        });
        mongoose.set('user', conn);
    }

    // store DATABASE
    function initDb2(callback) {
        initDb1(function() {
            var conn = mongoose.createConnection(process.env.DB_URI || DB['store'], options);
            // CONNECTION EVENTS
            // When successfully connected
            conn.on('connected', function() {
                console.log('DB> Mongoose "store" connection open to ' + DB['store']);

                if (callback) callback();
            });

            // If the connection throws an error
            conn.on('error', function(err) {
                console.log('DB> Mongoose "store" connection error: ' + err);
            });

            // When the connection is disconnected
            conn.on('disconnected', function() {
                console.log('DB> Mongoose "store" connection disconnected');
            });
            mongoose.set('store', conn);
        });
    }

    // chat DATABASE
    function initDb3(callback) {
        initDb2(function() {
            var conn = mongoose.createConnection(process.env.DB_URI || DB['chat'], options);
            // CONNECTION EVENTS
            // When successfully connected
            conn.on('connected', function() {
                console.log('DB> Mongoose "chat" connection open to ' + DB['chat']);

                if (callback) callback(mongoose);
            });

            // If the connection throws an error
            conn.on('error', function(err) {
                console.log('DB> Mongoose "chat" connection error: ' + err);
            });

            // When the connection is disconnected
            conn.on('disconnected', function() {
                console.log('DB> Mongoose "chat" connection disconnected');
            });
            mongoose.set('chat', conn);
        })
    }

    // Synchronous Database Initialize
    initDb3(callback);

};