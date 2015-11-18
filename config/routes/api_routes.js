"use strict";
// config/routes/api_routes.js

var cors = require('cors');

/*
API Nomenclature:
-----------------
/api/[VERSION]/[MODEL]/[ACTION]

CSRF Protection:
----------------
1.Ensure that the 'safe' HTTP operations, such as GET, HEAD and OPTIONS cannot be used to alter any server-side state.
2.Ensure that any 'unsafe' HTTP operations, such as POST, PUT, PATCH and DELETE, always require a valid CSRF token.
( in our case, "X-API-Key" is the CSRF token.It 's consumed and updated at every use)
*/


module.exports = function(server, ctrl) {

    // ================= CORS

    var whitelist = ['http://www.roleswitch.com', 'http://chat.roleswitch.com'];
    var corsOptionsDelegate = function(req, callback) {
        var corsOptions;
        if (whitelist.indexOf(req.header('Origin')) !== -1) {
            corsOptions = {
                origin: true
            }; // reflect (enable) the requested origin in the CORS response
        } else {
            corsOptions = {
                origin: false
            }; // disable CORS for this request
        }
        callback(null, corsOptions); // callback expects two parameters: error and options
    };

    server.all('/api/*', cors(corsOptionsDelegate));


    // ================= GET

    // Get user information (including apikey)
    server.get('/api/v1/user', ctrl.isLoggedIn, function(req, res, next) {
        var user = req.user.account.toObject();
        user.username = user.local.username;
        delete user._id;
        delete user.local;
        delete user.facebook;
        delete user.google;

        user.profile = req.user.profile.toObject();
        delete user.profile._id;
        delete user.profile.uid;

        return res.json(user);
    });

    // Get roles JSON format
    server.get('/api/v1/roles', ctrl.isLoggedIn, function(req, res, next) {
        ctrl.getRoles(function(err, data) {
            if (err) return next(err);
            return res.json(data);
        });
    });

    // ================= POST
    // all POST requests must verify the apikey, consume it and return new one

    // Update username
    server.post('/api/v1/user/updateUsername',
        ctrl.isLoggedIn,
        ctrl.isApiKeyValid,
        function(req, res, next) {
            var account = req.user.account,
                newUsername = req.body.username,
                password = req.body.password;

            // check if username available
            ctrl.checkUsername(newUsername, function(err, user) {
                if (err) return next(err);
                if (user) {
                    console.log('username taken');
                    return res.json({
                        ok: false,
                        apikey: req.user.account.apikey,
                        message: "The new username is already taken!"
                    });
                } // username already used
                else {

                    ctrl.checkUsername(account.local.username, function(err, oldUser) {
                        // username not user and correct password
                        if (oldUser.validPassword(password)) {
                            // update username
                            console.log('username updated');
                            oldUser.local.username = newUsername;
                            oldUser.save(function(err) {
                                if (err) return next(err);
                                return res.json({
                                    ok: true,
                                    apikey: req.user.account.apikey,
                                    message: "Username updated succefully."
                                });
                            });
                            // return res.json({
                            //     ok: true
                            // });
                        } else { // wrong password
                            return res.json({
                                ok: false,
                                apikey: req.user.account.apikey,
                                message: "Your password is not correct!"
                            });
                            console.log('wrong password');
                        }
                    });

                } // username available
            });
        }
    );

    // Set FirstLogin boolean to false to disable First Time Login Message display
    server.post('/api/v1/user/firstLogin',
        ctrl.isLoggedIn,
        ctrl.isApiKeyValid,
        function(req, res, next) {
            var profile = req.user.profile;

            profile.firstTime = false;
            profile.save(function(err) {
                if (err) return next(err);
                return res.json({
                    err: 0,
                    apikey: req.user.account.apikey
                });
            })
        }
    );

    // Set live option to true or false
    // @param: enable = on, off
    server.post('/api/v1/user/live',
        ctrl.isLoggedIn,
        ctrl.isApiKeyValid,
        function(req, res, next) {
            var profile = req.user.profile,
                enable = req.body;

            profile.role.live = (enable === "on" ? true : false);
            profile.save(function(err) {
                if (err) return next(err);
                return res.json({
                    err: 0,
                    apikey: req.user.account.apikey
                });
            });
        }
    );

};