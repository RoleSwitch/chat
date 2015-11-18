"use strict";
// app/controller.js

var props = require('../config/properties');


module.exports = function(mongoose, passport) {

    // MODELS ==================================
    var Account = require('./models/account')(mongoose), // user database
        Profile = require('./models/profile')(mongoose),
        Token = require('./models/token')(mongoose), // store database
        Role = require('./models/role')(mongoose), // chat database
        Session = require('./models/session')(mongoose);

    // SERVICES ================================
    // enable passport service
    require('./services/passport')(passport, Account, Profile, Token, props);

    // DATA ACCESS ==============================
    return {

        // ========================================== AUTH

        auth: passport, // authentication service

        // route middleware to make sure a user is logged in
        isLoggedIn: function(req, res, next) {
            // if user is authenticated in the session, carry on
            if (req.isAuthenticated()) return next();
            console.log("AUTH> Access restricted! :" + req.isAuthenticated() + " - " + JSON.stringify(req.user));

            // if they aren't
            res.status(401)
                .format({
                    '*/*': function() {
                        res.end();
                    },

                    'text/plain': function() {
                        res.send('401');
                    },

                    'application/json': function() {
                        res.json(null);
                    },

                    'text/html': function() {
                        res.redirect('/');
                    }
                });
        },

        // route middleware to check if apikey is valid for logged-in user
        isApiKeyValid: function(req, res, next) {
            var apikey = req.headers['x-api-key'] || req.headers.apikey;
            if (!apikey) return res.status(400).end("400 Bad Request");

            Account.findOne({
                'apikey': apikey
            }, function(err, user) {
                if (err) return next(err);
                if (!user) return res.status(401).end();
                user.updateApiKey(function(err, user) {
                    if (err) next(err);
                    if (user.id !== req.user.account.id)
                        res.status(401).end();
                    req.user.account.apikey = user.apikey;
                    next();
                });
            });
        },

        // create rememberme token for user id
        setRememberMeToken: function(uid, fn) {
            var token = new Token({
                'uid': uid
            });
            token.save(fn);
        },
        // remove rememberme token
        clearRememberMeToken: function(tokenid, fn) {
            if (tokenid)
                Token.findOneAndRemove({
                    '_id': tokenid
                }, function(err, token) {
                    if (err) throw err;
                    fn(token);
                });
            else fn(null);
        },

        // ========================================== API METHODS

        // @return: Roles list
        getRoles: function(fn) {
            Role.find().lean().exec(fn);
        },
        // @return: Profile by User Account ID
        getProfile: function(uid, fn) {
            Profile.findOne({
                "uid": uid
            }, fn);
        },

        // @return: Account by Username
        checkUsername: function(username, fn) {
            Account.findOne({
                'local.username': username
            }, fn);
        }

    } //end return

};