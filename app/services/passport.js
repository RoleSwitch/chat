"use strict";
// app/passport.js

var LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    RememberMeStrategy = require('passport-remember-me').Strategy;


// expose this function to our app using module.exports
module.exports = function(passport, Account, Profile, Token, props) {

    var env = (props.ENV === 'development' ? props['DEV'] : props['PROD']);

    // create profile for an account user id
    function createProfile(uid, fn) {
        var profile = new Profile({
            'uid': uid
        });

        profile.save(fn);
    };

    // passport session setup ==================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    // the user object is saved to req.user
    // it contains both user.account and user.profile
    passport.deserializeUser(function(id, done) {
        var user = {};

        Account.findById(id, function(err, account) {
            if (err) return done(err);
            // hide password hash for security
            account.local.password = "~hidden~";
            user.account = account;

            Profile.findOne({
                'uid': id
            }, function(err, profile) {
                if (err) return done(err);
                console.log("AUTH> Deserialized user: " + id);
                // save profile for easy session access
                user.profile = profile;

                done(null, user);
            });
        });
    });

    // LOCAL SIGNUP ============================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            email = email.toLowerCase();
            var username = req.body.username.replace(" ", ""); //remove blank from username

            // asynchronous
            // Account.findOne wont fire unless data is sent back
            process.nextTick(function() {
                // we are checking to see if the user trying to login already exists
                //  '$or': [{'local.email':email},{'local.username':username}]

                // check for unique user email
                Account.findOne({
                        'local.email': email
                    },
                    function(err, user) {
                        // if there are any errors, return the error
                        if (err) return done(err);

                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'That email is already used.'));
                        } else {
                            // Check for unique username
                            Account.findOne({
                                    'local.username': username
                                },
                                function(err, user) {
                                    // if there are any errors, return the error
                                    if (err) return done(err);

                                    // check to see if theres already a user with that email
                                    if (user) {
                                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                                    } else {
                                        // if there is no user with that email
                                        // create the user
                                        var newUser = new Account();

                                        // set the user's local credentials
                                        newUser.local.username = username;
                                        newUser.local.email = email;
                                        newUser.local.password = Account.generateHash(password);

                                        // set user API key and save
                                        newUser.updateApiKey(function(err, user) {
                                            if (err) return done(err);

                                            createProfile(user.id, function(err, profile) {
                                                if (err) return done(err);
                                                console.log("AUTH> New profile '" + profile.id + "' linked to new account: " + user.id);
                                                req.session.profile = profile;
                                            });

                                            return done(null, user);
                                        });
                                    }
                                }
                            );
                        }
                    });
            });
        }));

    // LOCAL LOGIN =============================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, email, password, done) { // callback with email and password from our form
        email = email.toLowerCase();

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        Account.findOne({
            'local.email': email
        }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.'));

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

            // all is well, return successful user
            console.log("AUTH> user '" + user.id + "' logged in");

            user.lastLogged = new Date(); // update last time logged in
            user.save(function(err) {
                if (err) return done(err);
                // if successful, return the new user
                return done(null, user);
            });
        });
    }));

    // REMEMBER ME =============================================================
    // This strategy consumes a remember me token, supplying the user the token was originally issued to.
    // The token is single-use, so a new token is then issued to replace it.
    passport.use(new RememberMeStrategy({
            key: props.COOKIES['token'], // token cookie name
            cookie: {
                path: '/',
                httpOnly: true,
                signed: true,
                maxAge: 30 * 86400000 // 30 days
            }
        },
        function(tokenId, done) {
            Token.findOne(tokenId, function(err, token) {
                if (err) return done(err);
                if (!token) return done(new Error('No token returned for id: ' + JSON.stringify(tokenId)));

                token.consume(function(err, uid) {
                    if (err) return done(err);

                    Account.findById(uid, function(err, user) {
                        if (err) return done(err);
                        if (!user) return done(null, false);
                        return done(null, user);
                    });
                });
            });
        },
        function(user, done) {
            var token = new Token({
                'uid': user.id
            });
            token.save(function(err, token) {
                if (err) return done(err);
                return done(null, token.id);
            });
        }
    ));

    // SOCIAL PLATFORMS ========================================================

    // FACEBOOK =================
    passport.use(new FacebookStrategy({
            // pull in our app id and secret from our properties.js file
            clientID: env['facebook'].clientID,
            clientSecret: env['facebook'].clientSecret,
            callbackURL: env['facebook'].callbackUrl
        },
        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                Account.findOne({
                    '$or': [{
                        'local.email': profile.emails[0].value
                    }, {
                        'facebook.id': profile.id
                    }]
                }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err) return done(err);

                    // if the user is found, then log them in
                    if (user && user.facebook.id === profile.id) {
                        // update last time logged in
                        user.lastLogged = new Date();
                        user.save(function(err) {
                            if (err) return done(err);
                            // if successful, return the new user
                            return done(null, user);
                        });
                    } else if (user) {
                        // if user's email is already registered, fill facebook data in
                        user.facebook.id = profile.id;
                        user.facebook.token = token;
                        user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        user.facebook.email = profile.emails[0].value;

                        // update last time logged in
                        user.lastLogged = new Date();

                        // save our user to the database
                        user.save(function(err) {
                            if (err) return done(err);

                            // if successful, return the updated user
                            return done(null, user);
                        });
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser = new Account();

                        // set all of the facebook information in our user model
                        newUser.facebook.id = profile.id; // set the users facebook id	                
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user	                
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        // copy information to local
                        newUser.local.username = (profile.name.givenName + profile.name.familyName).replace(" ", ""); //remove blank from username
                        newUser.local.email = profile.emails[0].value;

                        // save our user to the database
                        newUser.save(function(err, user) {
                            if (err) return done(err);
                            console.log("AUTH> Social facebook signup succeeded for user: " + user.id);
                            createProfile(user.id, function(err, profile) {
                                if (err) return done(err);
                                console.log("AUTH> New profile '" + profile.id + "' linked to account: " + user.id);
                            });

                            // if successful, return the new user
                            return done(null, user);
                        });
                    }

                });
            });
        }));


    // GOOGLE =================
    passport.use(new GoogleStrategy({
            clientID: env['google'].clientID,
            clientSecret: env['google'].clientSecret,
            callbackURL: env['google'].callbackURL
        },
        function(token, refreshToken, profile, done) {
            // make the code asynchronous
            // Account.findOne won't fire until we have all our data back from Google
            process.nextTick(function() {

                // try to find the user based on their google id
                Account.findOne({
                    '$or': [{
                        'local.email': profile.emails[0].value
                    }, {
                        'google.id': profile.id
                    }]
                }, function(err, user) {
                    if (err) return done(err);

                    // if a user is found, log them in
                    if (user && user.google.id === profile.id) {
                        // update last time logged in
                        user.lastLogged = new Date();
                        user.save(function(err) {
                            if (err) return done(err);
                            // if successful, return the new user
                            return done(null, user);
                        });
                    } else if (user) {
                        // if user's email is already registered, fill google data in
                        user.google.id = profile.id;
                        user.google.token = token;
                        user.google.name = profile.displayName;
                        user.google.email = profile.emails[0].value;

                        // update last time logged in
                        user.lastLogged = new Date();

                        // save our user to the database
                        user.save(function(err) {
                            if (err) return done(err);

                            // if successful, return the updated user
                            return done(null, user);
                        });
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser = new Account();

                        // set all of the relevant information
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        // copy information to local
                        newUser.local.username = profile.displayName.replace(" ", ""); //remove blank from username
                        newUser.local.email = profile.emails[0].value;

                        // save the user
                        newUser.save(function(err, user) {
                            if (err) return done(err);
                            console.log("AUTH> Social google signup succeeded for user: " + user.id);
                            createProfile(user.id, function(err, profile) {
                                if (err) return done(err);
                                console.log("AUTH> New profile '" + profile.id + "' linked to account: " + user.id);
                            });

                            // if successful, return the new user
                            return done(null, user);
                        });
                    }
                });
            })
        }));
};